// service-worker.js
const CACHE_NAME = 'mobicard-scanner-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/mobicard-scanner.js',
  'https://code.jquery.com/jquery-3.7.1.min.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js'
];

// Install service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate service worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch strategy: cache first, then network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(response => {
          // Don't cache API calls
          if (event.request.url.includes('/api/')) {
            return response;
          }
          
          // Cache static assets
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }
          
          return response;
        });
      })
  );
});

// Background sync for offline scans
self.addEventListener('sync', event => {
  if (event.tag === 'sync-scans') {
    event.waitUntil(syncScans());
  }
});

async function syncScans() {
  const db = await openScansDatabase();
  const pendingScans = await db.getAll('pending');
  
  for (const scan of pendingScans) {
    try {
      const response = await fetch(scan.url, {
        method: 'POST',
        headers: scan.headers,
        body: scan.body
      });
      
      if (response.ok) {
        await db.delete('pending', scan.id);
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}

// manifest.json
{
  "name": "Mobicard Scanner",
  "short_name": "Card Scanner",
  "description": "Scan credit cards using your camera",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#000000",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/scanner-1.png",
      "sizes": "1080x1920",
      "type": "image/png",
      "form_factor": "narrow"
    },
    {
      "src": "/screenshots/scanner-2.png",
      "sizes": "1920x1080",
      "type": "image/png",
      "form_factor": "wide"
    }
  ],
  "categories": ["finance", "productivity"],
  "shortcuts": [
    {
      "name": "Scan Card",
      "short_name": "Scan",
      "description": "Open camera to scan a card",
      "url": "/scan"
    },
    {
      "name": "Upload Image",
      "short_name": "Upload",
      "description": "Upload card image from gallery",
      "url": "/upload"
    }
  ]
}

// PWA Scanner Component
class PWACardScanner extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.init();
  }

  async init() {
    // Check if PWA is installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isPWA = true;
    }

    // Check network status
    this.networkStatus = navigator.onLine ? 'online' : 'offline';
    window.addEventListener('online', () => this.handleNetworkChange('online'));
    window.addEventListener('offline', () => this.handleNetworkChange('offline'));

    // Request install prompt
    this.deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPrompt();
    });

    // Initialize scanner
    await this.loadScanner();
  }

  async loadScanner() {
    // Load scanner script if not already loaded
    if (!window.MobicardScanner) {
      await this.loadScript('https://code.jquery.com/jquery-3.7.1.min.js');
      await this.loadScript('/js/mobicard-scanner.js');
    }

    // Initialize with config
    const config = {
      scanCardUrl: this.getAttribute('scan-card-url'),
      transactionAccessToken: this.getAttribute('access-token'),
      tokenId: this.getAttribute('token-id')
    };

    window.MobicardScanner.init(config);

    // Set up offline handling
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        this.syncRegistration = registration;
      });
    }
  }

  handleNetworkChange(status) {
    this.networkStatus = status;
    
    if (status === 'online') {
      // Sync pending scans
      if (this.syncRegistration) {
        this.syncRegistration.sync.register('sync-scans');
      }
    }
  }

  showInstallPrompt() {
    if (this.deferredPrompt && !this.isPWA) {
      const installButton = document.createElement('button');
      installButton.className = 'install-prompt';
      installButton.innerHTML = '📱 Install App';
      installButton.onclick = () => this.installPWA();
      
      this.shadowRoot.appendChild(installButton);
    }
  }

  async installPWA() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA installed');
      }
      
      this.deferredPrompt = null;
    }
  }

  async saveForOffline(scanData) {
    if (!navigator.onLine) {
      const db = await this.openDatabase();
      await db.add('pending', {
        url: scanData.url,
        headers: scanData.headers,
        body: scanData.body,
        timestamp: Date.now()
      });

      // Register for sync when back online
      if (this.syncRegistration) {
        this.syncRegistration.sync.register('sync-scans');
      }

      return true;
    }
    return false;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: relative;
        }
        
        .scanner-wrapper {
          position: relative;
          width: 100%;
          height: 100vh;
          background: #000;
        }
        
        .offline-indicator {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #ff6b6b;
          color: white;
          padding: 5px 10px;
          border-radius: 15px;
          font-size: 12px;
          z-index: 1000;
        }
        
        .install-prompt {
          position: absolute;
          top: 10px;
          left: 10px;
          background: #4CAF50;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 20px;
          cursor: pointer;
          z-index: 1000;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        
        .pwa-features {
          position: absolute;
          bottom: 20px;
          left: 0;
          right: 0;
          text-align: center;
          color: white;
          font-size: 12px;
          opacity: 0.7;
        }
      </style>
      
      <div class="scanner-wrapper">
        ${this.networkStatus === 'offline' ? 
          '<div class="offline-indicator">Offline Mode</div>' : ''}
        
        <!-- Scanner will be injected here -->
        <div id="pwa-scanner-container"></div>
        
        <div class="pwa-features">
          Works offline • Install as app • No downloads required
        </div>
      </div>
    `;
  }

  connectedCallback() {
    this.render();
  }
}

// Register the custom element
customElements.define('pwa-card-scanner', PWACardScanner);

// Usage in HTML:
// <pwa-card-scanner
//   scan-card-url="https://api.mobicard.com/v1/scan"
//   access-token="your_token"
//   token-id="your_token_id"
// >
// </pwa-card-scanner>

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registered:', registration);
      })
      .catch(error => {
        console.error('ServiceWorker registration failed:', error);
      });
  });
}
