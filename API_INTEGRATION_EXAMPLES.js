/**
 * WhatsApp Verification API - Integration Examples
 * 
 * This file contains code examples for integrating with various
 * WhatsApp and phone verification services
 */

// ============================================
// OPTION 1: Twilio Lookup API Integration
// ============================================

/**
 * Integrate Twilio Lookup API to verify:
 * - Phone number validity
 * - Carrier information
 * - Type of line (mobile, landline, etc.)
 * 
 * Installation: npm install twilio
 * 
 * Environment Variables:
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 */

// Example implementation for /api/verify/check-whatsapp.js:
/*
import twilio from 'twilio';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function checkWithTwilio(phoneNumber) {
  try {
    const phoneNumberData = await twilioClient.lookups.v2
      .phoneNumbers(phoneNumber)
      .fetch({
        fields: 'line_type,carrier_name,country_code'
      });

    // Check if it's a mobile number
    const isMobile = phoneNumberData.lineType === 'mobile';
    
    if (isMobile) {
      // Next step: check WhatsApp capability
      return {
        available: true,
        lineType: phoneNumberData.lineType,
        carrier: phoneNumberData.carrierName,
        countryCode: phoneNumberData.countryCode
      };
    } else {
      return {
        available: false,
        reason: 'not_mobile',
        message: 'WhatsApp is only available on mobile numbers'
      };
    }
  } catch (error) {
    if (error.code === 20404) {
      return {
        available: false,
        reason: 'invalid_number',
        message: 'Phone number does not exist'
      };
    }
    throw error;
  }
}
*/


// ============================================
// OPTION 2: WhatsApp Cloud API Integration
// ============================================

/**
 * Integrate WhatsApp Cloud API to verify actual WhatsApp availability
 * This is the OFFICIAL WhatsApp integration
 * 
 * Requires:
 * - Business Account Setup
 * - WhatsApp Business API Access
 * - Business Phone Number
 * 
 * Environment Variables:
 * - WHATSAPP_BUSINESS_TOKEN
 * - WHATSAPP_BUSINESS_ACCOUNT_ID
 * - WHATSAPP_BUSINESS_PHONE_ID
 */

/*
async function checkWithWhatsAppAPI(phoneNumber) {
  try {
    // Format phone number (must include country code)
    const formattedPhone = phoneNumber.replace(/\D/g, '');
    
    // Step 1: Request OTP
    const otpResponse = await fetch(
      `https://graph.instagram.com/v18.0/${process.env.WHATSAPP_BUSINESS_PHONE_ID}/request_code`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_BUSINESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code_method: 'SMS',
          language: 'en'
        })
      }
    );

    if (!otpResponse.ok) {
      return {
        available: false,
        reason: 'invalid_number',
        message: 'Phone number is not available on WhatsApp'
      };
    }

    return {
      available: true,
      message: 'Phone number is available on WhatsApp',
      requiresOTP: true
    };
  } catch (error) {
    console.error('WhatsApp API error:', error);
    throw error;
  }
}
*/


// ============================================
// OPTION 3: Hybrid Approach (Recommended)
// ============================================

/**
 * Combined approach:
 * 1. Use Twilio for phone validity
 * 2. Use WhatsApp API for actual availability
 * 3. Fall back to database check
 */

/*
async function checkPhoneNumber(phoneNumber) {
  // Step 1: Check database for duplicates (fast)
  const existingCustomer = await supabase
    .from('customers')
    .select('id')
    .eq('phone', phoneNumber)
    .single();

  if (existingCustomer) {
    return {
      available: false,
      reason: 'duplicate',
      message: 'This phone number is already registered'
    };
  }

  // Step 2: Validate with Twilio (if installed)
  if (process.env.TWILIO_ACCOUNT_SID) {
    const twilioCheck = await checkWithTwilio(phoneNumber);
    if (!twilioCheck.available) {
      return twilioCheck;
    }
  }

  // Step 3: Check WhatsApp availability
  if (process.env.WHATSAPP_BUSINESS_TOKEN) {
    const whatsappCheck = await checkWithWhatsAppAPI(phoneNumber);
    return whatsappCheck;
  }

  // Step 4: Default response
  return {
    available: true,
    message: 'Phone number is valid'
  };
}
*/


// ============================================
// OPTION 4: Firebase Phone Authentication
// ============================================

/**
 * Use Firebase Phone Authentication for verification
 * This is what's currently used for admin authentication
 * 
 * Pros:
 * - Built-in OTP verification
 * - Secure
 * - Free tier available
 * 
 * Cons:
 * - Requires migration from current system
 * - More complex setup
 */

/*
import * as admin from 'firebase-admin';

async function checkPhoneWithFirebase(phoneNumber) {
  try {
    // Firebase validates phone in format +[country_code][number]
    const formattedPhone = phoneNumber.startsWith('+') 
      ? phoneNumber 
      : '+' + phoneNumber.replace(/\D/g, '');

    // Check if phone number is already registered
    try {
      await admin.auth().getUser(formattedPhone);
      return {
        available: false,
        reason: 'duplicate',
        message: 'This phone number is already registered'
      };
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        return {
          available: true,
          message: 'Phone number is available',
          phoneNumber: formattedPhone
        };
      }
      throw error;
    }
  } catch (error) {
    console.error('Firebase check error:', error);
    return {
      available: false,
      reason: 'error',
      message: 'Could not verify phone number'
    };
  }
}
*/


// ============================================
// OPTION 5: Simple CSV/Database List Approach
// ============================================

/**
 * Maintain a list of known phone patterns that have WhatsApp
 * Use regex patterns for country-specific validation
 * 
 * This is a lightweight approach that works offline
 */

/*
const WHATSAPP_SUPPORTED_COUNTRIES = {
  '+1': { pattern: /^1\d{10}$/, minLength: 11, name: 'USA/Canada' },
  '+91': { pattern: /^91\d{10}$/, minLength: 12, name: 'India' },
  '+44': { pattern: /^44\d{10}$/, minLength: 12, name: 'UK' },
  '+971': { pattern: /^971\d{9}$/, minLength: 12, name: 'UAE' },
  // ... add more countries
};

async function checkPhoneLocalValidation(phoneNumber) {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Find country
  let countryCode = null;
  let isValid = false;
  
  for (const [code, rules] of Object.entries(WHATSAPP_SUPPORTED_COUNTRIES)) {
    if (cleaned.startsWith(code.replace(/\+/g, ''))) {
      countryCode = code;
      isValid = rules.pattern.test(cleaned);
      break;
    }
  }

  if (!isValid) {
    return {
      available: false,
      reason: 'invalid_format',
      message: 'Phone number format is invalid for your country'
    };
  }

  return {
    available: true,
    message: 'Phone number is valid',
    country: WHATSAPP_SUPPORTED_COUNTRIES[countryCode].name
  };
}
*/


// ============================================
// ENVIRONMENT VARIABLES TEMPLATE
// ============================================

/*
# .env.local

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here

# WhatsApp Cloud API
WHATSAPP_BUSINESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WHATSAPP_BUSINESS_ACCOUNT_ID=102xxxxxxxxxxxxxxxx
WHATSAPP_BUSINESS_PHONE_ID=118xxxxxxxxxxxxxxxx

# Firebase (if migrating)
FIREBASE_PROJECT_ID=empire-admin-6c57e
FIREBASE_API_KEY=AIzaxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
*/


// ============================================
// IMPLEMENTATION STEPS
// ============================================

/*

1. CHOOSE YOUR APPROACH:
   ✓ Current: Database check only (free, limited)
   → Option 1: Add Twilio (paid, detailed validation)
   → Option 2: Add WhatsApp API (free tier, official)
   → Option 3: Hybrid (best, but complex)

2. INSTALL DEPENDENCIES:
   npm install twilio  # For Twilio integration
   
3. UPDATE ENVIRONMENT VARIABLES:
   Add credentials to .env.local

4. IMPLEMENT CHOSEN METHOD:
   Copy code from this file
   Paste into pages/api/verify/check-whatsapp.js

5. TEST:
   curl -X POST http://localhost:3000/api/verify/check-whatsapp \
        -H "Content-Type: application/json" \
        -d '{"phone": "+911234567890"}'

6. DEPLOY:
   Add environment variables to production
   Test with real numbers

*/


// ============================================
// TESTING CODE SNIPPETS
// ============================================

/*
// Manual testing in Node REPL

// Test Twilio
const twilio = require('twilio');
const client = twilio('ACCOUNT_SID', 'AUTH_TOKEN');
const phone = await client.lookups.v2.phoneNumbers('+911234567890').fetch();

// Test WhatsApp API
fetch('https://graph.instagram.com/v18.0/PHONE_ID/request_code', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    code_method: 'SMS',
    language: 'en'
  })
});

// Test local API
fetch('/api/verify/check-whatsapp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phone: '+911234567890' })
}).then(r => r.json()).then(console.log);

*/


// ============================================
// COST ESTIMATES
// ============================================

/*

Twilio Lookup:
- $0.015 per lookup
- ~30,000 lookups per $1
- Recommended for validation

WhatsApp Cloud API:
- Free tier: 1,000 conversations/month
- Paid: ~$0.05 per message
- Includes all verification methods

Custom Database:
- Current approach
- Cost: $0 (database only)
- Limitation: Can't verify actual WhatsApp presence

*/


// ============================================
// MIGRATION PATH
// ============================================

/*

Current (Phase 1):
┌─────────────────────┐
│  Database Check     │
│  (Duplicates only)  │
└─────────────────────┘
         ↓
Recommended (Phase 2):
┌─────────────────────┐
│  Twilio Validation  │
│  (Phone validity)   │
└─────────────────────┘
         ↓
Production (Phase 3):
┌─────────────────────┐
│  WhatsApp API       │
│  (Actual WhatsApp)  │
└─────────────────────┘

No breaking changes needed!
Each phase is backward compatible.

*/

module.exports = {
  // This file is documentation only
  // No actual functions exported
};
