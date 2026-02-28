# Payment Card Scan API
## MobiCard ScanAPI

## Success Response Format

Both methods return the same success response format when card scanning is successful.
JSON Success Response
```json

{
    "status": "SUCCESS",
    "status_code": "200",
    "status_message": "SUCCESS",
    "card_scan_request_id": "18678121768809362",
    "mobicard_txn_reference": "327005622",
    "timestamp": "2026-01-19 07:56:02",
    "card_information": {
        "card_number": "5173350006475601",
        "card_number_masked": "5173********5601",
        "card_expiry_date": "12/19",
        "card_expiry_month": "12",
        "card_expiry_year": "19",
        "card_brand": "MASTERCARD",
        "card_category": "PREPAID",
        "card_holder_name": "JOHN DOE",
        "card_bank_name": "KCB BANK KENYA LIMITED",
        "card_confidence_score": "0.7700",
        "card_validation_checks": {
            "luhn_algorithm": true,
            "brand_prefix": false,
            "expiry_date": false
        },
        "card_token": "e39765d989fe7b1a5f45d68645364faf923d5c36125bb5ea2b6b4dbcbca6424d845d545955ff3cee4e71748252833c4049d0b6e7bef00511ab7a320f09eba7026"
    },
    "card_exif_information": {
        "card_exif_flag": 1,
        "card_exif_is_instant_photo_flag": 1,
        "card_exif_original_timestamp": "",
        "card_exif_file_datetime": "2026-01-19 07:56:02",
        "card_exif_file_datetime_digitized": "",
        "card_exif_device_model": "",
        "card_exif_device_make": ""
    },
    "card_risk_information": {
        "card_possible_screenshot_flag": 1,
        "card_possible_edited_flag": 0,
        "card_reencode_suspected_flag": 0,
        "card_deepfake_risk_flag": 0,
        "card_risk_score": "0.0900"
    },
    "card_biin_information": {
        "card_biin_flag": 1,
        "card_biin_number": "51733500",
        "card_biin_scheme": "MASTERCARD",
        "card_biin_prefix": "",
        "card_biin_type": "PREPAID",
        "card_biin_brand": "Mastercard Prepaid General Spend",
        "card_biin_prepaid": "Yes",
        "card_biin_bank_name": "KCB BANK KENYA LIMITED",
        "card_biin_bank_url": "",
        "card_biin_bank_city": "",
        "card_biin_bank_phone": "",
        "card_biin_bank_logo": "",
        "card_biin_country_two_letter_code": null,
        "card_biin_country_name": "KENYA",
        "card_biin_country_numeric": "404",
        "card_biin_risk_flag": 0
    },
    "addendum_data": "your_custom_data_here_will_be_returned_as_is in the addendum_data field"
}
```
### Response Fields Explanation:

    * card_validation_checks: Validates card number (Luhn algorithm), brand prefix, and expiry date
    * card_confidence_score: 0-1 score indicating OCR accuracy (X 100 for percentage)
    * card_risk_information: Fraud detection metrics including screenshot detection. Please note that the values provided serve as possibilities.
    * card_biin_information: Bank Identification Number details including bank name and country
    * card_exif_information: Image metadata for forensic analysis
    * card_token: Reduce your compliance burden (scope) by storing this token along with the masked card number, in place of actual card data. The token can be used in our Tokenization API (for detokenization) to gain access the actual card info from the vault whenever the card needs to be used.

### Error Response Format

Error responses have a simplified format with only 3 fields of essential information as shown below.

Use the "status" field to determine if any API request is successful of not and to determine which subsequent fields can be retrieved. The value for the "status" response parameter is always either "SUCCESS" or "FAILED" for this API.

JSON Error Response
```json

{
    "status": "FAILED",
    "status_code": "400",
    "status_message": "BAD REQUEST"
}
```
### Status Codes Reference

Complete list of status codes returned by the API.

| Status Code | Status | Status Message Interpretation | Action Required |
| :--- | :--- | :--- | :--- |
| `200` | **SUCCESS** | SUCCESS | Process the card data |
| `400` | **FAILED** | **BAD REQUEST** - Invalid parameters or malformed request | Check request parameters |
| `429` | **FAILED** | **TOO MANY REQUESTS** - Rate limit exceeded | Wait before making more requests |
| `250` | **FAILED** | **INSUFFICIENT TOKENS** - Token account balance insufficient | Top up your account |
| `500` | **FAILED** | **UNAVAILABLE** - Server error | Try again later or contact support |
| `430` | **FAILED** | **TIMEOUT** - Request timed out or Finalized | Issue new token/Refresh and retry |

### API Request Parameters Reference

Complete reference of all request parameters used in the API.

| Parameter | Required | Description | Example Value |
| :--- | :--- | :--- | :--- |
| `mobicard_version` | **Yes** | API version | `"2.0"` |
| `mobicard_mode` | **Yes** | Environment mode | `"TEST"` or `"LIVE"` |
| `mobicard_merchant_id` | **Yes** | Your merchant ID | `""` |
| `mobicard_api_key` | **Yes** | Your API key | `""` |
| `mobicard_secret_key` | **Yes** | Your secret key | `""` |
| `mobicard_service_id` | **Yes** | Scan Card service ID | `"20000"` |
| `mobicard_service_type` | **Yes** | Method type (1 for UI, 2 for Base64) | `"1"` or `"2"` |
| `mobicard_token_id` | **Yes** | Unique token identifier | `String/number` |
| `mobicard_txn_reference` | **Yes** | Your transaction reference | `String/number` |
| `mobicard_scan_card_photo_base64_string` | **Method 2 only** | Base64 encoded card image | `"/9j/4AAQSkZJRgABAQ..."` |
| `mobicard_extra_data` | **No** | Custom data returned in response | `Any string` |

### API Response Parameters Reference

Complete reference of all response parameters returned by the API.

The value for the "status" response parameter is always either "SUCCESS" or "FAILED" for this API. Use this to determine subsequent actions.

All flags are always returned and as either 0 or 1
### Response Parameters


| Parameter | Always Returned | Description | Example Value |
| :--- | :--- | :--- | :--- |
| `status` | **Yes** | Transaction status | `"SUCCESS"` or `"FAILED"` |
| `status_code` | **Yes** | HTTP status code | `"200"` |
| `status_message` | **Yes** | Status description | `"SUCCESS"` |
| `card_scan_request_id` | **Yes** | Unique scan request identifier | `"18678121768809362"` |
| `mobicard_txn_reference` | **Yes** | Your original transaction reference | `"327005622"` |
| `timestamp` | **Yes** | Response timestamp | `"2026-01-19 07:56:02"` |
| **card_information** | | | |
| `card_information.card_number` | **Yes** | Full card number | `"5173350006475601"` |
| `card_information.card_number_masked` | **Yes** | Masked card number (for display) | `"5173********5601"` |
| `card_information.card_expiry_date` | **Yes** | Card expiry in MM/YY format | `"12/19"` |
| `card_information.card_expiry_month` | **Yes** | Expiry month (2 digits) | `"12"` |
| `card_information.card_expiry_year` | **Yes** | Expiry year (2 digits) | `"19"` |
| `card_information.card_brand` | **Yes** | Card brand/scheme | `"MASTERCARD"` |
| `card_information.card_category` | Only when available | Card category/type | `"PREPAID"` |
| `card_information.card_holder_name` | Only when available | Card-holder name | `"JOHN DOE"` |
| `card_information.card_bank_name` | Only when available | Issuing bank name | `"KCB BANK KENYA LIMITED"` |
| `card_information.card_confidence_score` | **Yes** | OCR confidence score (0.0-1.0) | `"0.7700"` (77%) |
| `card_information.card_validation_checks.luhn_algorithm` | **Yes** | Luhn algorithm validation result | `true` |
| `card_information.card_validation_checks.brand_prefix` | **Yes** | Brand prefix validation result | `false` |
| `card_information.card_validation_checks.expiry_date` | **Yes** | Expiry date validation result | `false` |
| `card_information.card_token` | **Yes** | Hashed card token for reference | `"e39765...4faf"` |
| **card_exif_information** | | | |
| `card_exif_information.card_exif_flag` | **Yes** | EXIF data availability flag | `1` |
| `card_exif_information.card_exif_is_instant_photo_flag` | **Yes** | Instant photo detection flag | `1` |
| `card_exif_information.card_exif_original_timestamp` | Only when available | Original photo timestamp | `""` |
| `card_exif_information.card_exif_file_datetime` | Only when available | File datetime from EXIF | `"2026-01-19 07:56:02"` |
| `card_exif_information.card_exif_file_datetime_digitized` | Only when available | Digitized datetime from EXIF | `""` |
| `card_exif_information.card_exif_device_model` | Only when available | Camera device model | `""` |
| `card_exif_information.card_exif_device_make` | Only when available | Camera device manufacturer | `""` |
| **card_risk_information** | | | |
| `card_risk_information.card_possible_screenshot_flag` | **Yes** | Screenshot detection flag | `1` |
| `card_risk_information.card_possible_edited_flag` | **Yes** | Image editing detection flag | `0` |
| `card_risk_information.card_reencode_suspected_flag` | **Yes** | Re-encoding suspicion flag | `0` |
| `card_risk_information.card_deepfake_risk_flag` | **Yes** | Deepfake detection flag | `0` |
| `card_risk_information.card_risk_score` | **Yes** | Overall risk score (0.0-1.0) | `"0.0900"` (9%) |
| **card_biin_information** | | | |
| `card_biin_information.card_biin_flag` | **Yes** | BIIN data availability flag | `1` |
| `card_biin_information.card_biin_number` | Only when available | Bank Identification Number | `"51733500"` |
| `card_biin_information.card_biin_scheme` | Only when available | Card scheme from BIIN | `"MASTERCARD"` |
| `card_biin_information.card_biin_prefix` | Only when available | Card prefix | `""` |
| `card_biin_information.card_biin_type` | Only when available | Card type from BIIN | `"PREPAID"` |
| `card_biin_information.card_biin_brand` | Only when available | Card brand description | `"Mastercard Prepaid General Spend"` |
| `card_biin_information.card_biin_prepaid` | Only when available | Prepaid card indicator | `"Yes"` |
| `card_biin_information.card_biin_bank_name` | Only when available | Issuing bank name from BIIN | `"KCB BANK KENYA LIMITED"` |
| `card_biin_information.card_biin_bank_url` | Only when available | Bank website URL | `""` |
| `card_biin_information.card_biin_bank_city` | Only when available | Bank city | `""` |
| `card_biin_information.card_biin_bank_phone` | Only when available | Bank phone number | `""` |
| `card_biin_information.card_biin_bank_logo` | Only when available | Bank logo URL | `""` |
| `card_biin_information.card_biin_country_two_letter_code` | Only when available | Country ISO code | `null` |
| `card_biin_information.card_biin_country_name` | Only when available | Country name | `"KENYA"` |
| `card_biin_information.card_biin_country_numeric` | Only when available | Country numeric code | `"404"` |
| `card_biin_information.card_biin_risk_flag` | **Yes** | Fraud Control (Chargebacks) flag | `0` |
| `addendum_data` | Only when sent | Custom data echoed back | `"your_custom_data..."` |


### Best Practices & Tips
Image Quality Guidelines:

    Use well-lit conditions for scanning
    Ensure card is flat and not curved
    Avoid glare and reflections
    Position card completely within frame
    Minimum image resolution: 800x600 pixels
    Supported formats: jpg, png, gif, bmp, webp, tiff, ico, ico, heic, heif, jp2, jpx, jpm, pdf

Security Considerations:

 *   Never store raw card images
 *   You may store the masked card number along with the tokenized card info (card_token) and use it in the Tokenization API (for detokenization) when the card details need to be used from the vault.
 *   Store your 'api_key' and 'secret_key' in your .env file and do not expose it publicly.
 *   Implement proper PCI DSS compliance
 *   Use HTTPS for all API calls
 *   Validate all responses on server-side
 *   Implement rate limiting on your end
 *   Log all scan attempts for audit
 *   Turn all DEBUG_MODE to 'false' in Production Environment

Performance Tips:

 *   Implement client-side validation first
 *   Cache successful token responses
 *   Implement retry logic with exponential backoff
 *   Monitor card_confidence_score for quality control
 *   Use card_risk_information for fraud detection
 *   Handle error status codes appropriately especially 250 and 430 for smoother flow
