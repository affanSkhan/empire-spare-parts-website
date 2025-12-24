# WhatsApp Availability Verification

## Overview

The signup page now includes real-time WhatsApp availability verification. When a customer enters their phone number during signup, the system automatically checks if the number is available on WhatsApp.

## Features

✅ **Real-time Checking** - Verification happens automatically 1 second after the user stops typing  
✅ **User Feedback** - Clear status messages (checking, available, unavailable, error)  
✅ **Duplicate Detection** - Prevents registration of already-registered phone numbers  
✅ **Validation Blocking** - Form submission is blocked if phone number is unavailable  
✅ **Debounced Checks** - Optimized performance with 1-second debounce after user input  

## How It Works

### User Experience Flow

1. **User enters phone number** on `/auth/signup` page
2. **System waits 1 second** after user stops typing (debounce)
3. **API call is made** to `/api/verify/check-whatsapp` endpoint
4. **Status is displayed** in real-time:
   - 🔵 "Verifying..." (checking state)
   - ✅ "Phone number is valid and available" (available)
   - ⚠️ "This phone number is not available" (unavailable)
   - ❌ "Could not verify phone number" (error)

### Form Submission Validation

The signup form will only submit if:
- ✅ Name is provided
- ✅ Phone number passes WhatsApp verification (if check was performed)
- ✅ Password is at least 6 characters
- ✅ Passwords match

If a phone number fails verification, an error message is displayed:
> "Please enter a valid phone number that is available on WhatsApp"

## API Endpoint

### POST `/api/verify/check-whatsapp`

**Request:**
```json
{
  "phone": "+911234567890"
}
```

**Response (Available):**
```json
{
  "available": true,
  "message": "Phone number looks valid",
  "phone": "+911234567890",
  "timestamp": "2025-12-24T10:30:00Z"
}
```

**Response (Unavailable - Duplicate):**
```json
{
  "available": false,
  "message": "This phone number is already registered",
  "reason": "duplicate"
}
```

**Response (Error):**
```json
{
  "error": "Failed to verify phone number",
  "available": false,
  "details": "error message"
}
```

## Implementation Details

### PhoneInput Component Updates

**New Props:**
- `showWhatsAppCheck` (boolean) - Enable/disable WhatsApp verification UI
- `onWhatsAppStatus` (function) - Callback to notify parent of verification status

**States Managed:**
```javascript
whatsappStatus: null | 'checking' | 'available' | 'unavailable' | 'error'
whatsappMessage: string
checkTimeout: NodeJS.Timeout
```

### Signup Page Updates

**New State:**
```javascript
const [whatsappStatus, setWhatsappStatus] = useState(null)
```

**New Handler:**
```javascript
const handleWhatsAppStatus = (status) => {
  setWhatsappStatus(status)
}
```

**Validation in handleSubmit:**
```javascript
if (whatsappStatus && !whatsappStatus.available) {
  setError('Please enter a valid phone number that is available on WhatsApp')
  return
}
```

## Future Enhancements

### Integration with Twilio Lookup API

```javascript
// In /api/verify/check-whatsapp.js
const client = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

const phoneNumberData = await client.lookups.v1
  .phoneNumbers(phone)
  .fetch({
    fields: 'line_type,carrier_name'
  })
```

**Required Environment Variables:**
```
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
```

### Integration with WhatsApp Cloud API

```javascript
// Check WhatsApp capability through official API
const response = await fetch('https://graph.instagram.com/v18.0/phone_numbers', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.WHATSAPP_BUSINESS_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    phone_number: phone,
    type: 'WHATSAPP'
  })
})
```

**Required Environment Variables:**
```
WHATSAPP_BUSINESS_TOKEN=your_whatsapp_business_token
WHATSAPP_BUSINESS_ACCOUNT_ID=your_account_id
```

## Database Changes

No database schema changes required. The feature uses the existing `customers` table to check for duplicate phone numbers.

**Check Logic:**
```sql
SELECT id FROM customers WHERE phone = ?
```

## Testing

### Test Cases

1. **Valid New Number**
   - Input: Valid phone number not in database
   - Expected: ✅ "Phone number is valid and available"

2. **Duplicate Number**
   - Input: Phone number already registered
   - Expected: ⚠️ "This phone number is already registered"

3. **Invalid Format**
   - Input: Less than 7 digits
   - Expected: ⚠️ "Invalid phone number length"

4. **Network Error**
   - Expected: ❌ "Could not verify phone number"

### Manual Testing Steps

1. Navigate to `/auth/signup`
2. Enter a valid phone number
3. Wait 1 second to see verification status
4. Try to submit with:
   - ✅ Available number (should allow)
   - ❌ Unavailable number (should show error)

## Security Considerations

⚠️ **Current Implementation:**
- Basic validation (checks database for duplicates)
- No actual WhatsApp API integration yet

🔒 **Recommendations for Production:**

1. **Use Official WhatsApp API** - Don't rely on third-party services
2. **Rate Limiting** - Prevent abuse of verification endpoint
3. **CAPTCHA** - Add verification for public endpoints
4. **Logging** - Track all verification attempts
5. **Error Handling** - Don't leak sensitive information in error messages

## Configuration

### Enable/Disable per Page

```jsx
// Enable WhatsApp checking
<PhoneInput
  showWhatsAppCheck={true}
  onWhatsAppStatus={handleWhatsAppStatus}
/>

// Disable WhatsApp checking (use as regular phone input)
<PhoneInput
  showWhatsAppCheck={false}
/>
```

## Troubleshooting

### Verification not triggering
- Ensure phone number has at least 7 digits
- Check browser console for errors
- Verify API endpoint is reachable

### False negatives (valid numbers marked unavailable)
- Currently only checks database duplicates
- Once WhatsApp API is integrated, actual verification will work

### Performance issues
- Debounce is set to 1 second (adjustable)
- Multiple simultaneous checks are prevented by state management

## Files Modified

- `/components/PhoneInput.jsx` - Added WhatsApp checking logic and UI
- `/pages/auth/signup.jsx` - Integrated WhatsApp validation
- `/pages/api/verify/check-whatsapp.js` - New API endpoint
- `/WHATSAPP_VERIFICATION.md` - This documentation

## Related Files

- [useSimpleAuth Hook](../hooks/useSimpleAuth.js) - Customer authentication
- [Login Page](../pages/auth/login.jsx) - Customer login (no verification needed)
- [Admin Login](../pages/admin/login.jsx) - Admin login (different auth system)
