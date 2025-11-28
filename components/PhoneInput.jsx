import { useState } from 'react'

/**
 * Phone Input Component with Country Code Selector
 * Combines country code dropdown with phone number input
 */
export default function PhoneInput({ 
  value = '', 
  onChange, 
  required = false,
  placeholder = '1234567890',
  id = 'phone',
  name = 'phone'
}) {
  // Common country codes
  const countryCodes = [
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
    { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
    { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
    { code: '+974', country: 'Qatar', flag: '🇶🇦' },
    { code: '+968', country: 'Oman', flag: '🇴🇲' },
    { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  ]

  // Parse existing value to separate country code and number
  const parsePhone = (phoneValue) => {
    if (!phoneValue) return { countryCode: '+91', number: '' }
    
    // Find matching country code
    for (const cc of countryCodes) {
      if (phoneValue.startsWith(cc.code)) {
        return {
          countryCode: cc.code,
          number: phoneValue.substring(cc.code.length)
        }
      }
    }
    
    // Default to India if no match
    return { countryCode: '+91', number: phoneValue }
  }

  const { countryCode: initialCode, number: initialNumber } = parsePhone(value)
  const [countryCode, setCountryCode] = useState(initialCode)
  const [phoneNumber, setPhoneNumber] = useState(initialNumber)

  const handleCountryCodeChange = (e) => {
    const newCode = e.target.value
    setCountryCode(newCode)
    // Call parent onChange with combined value
    onChange({ target: { name, value: newCode + phoneNumber } })
  }

  const handlePhoneNumberChange = (e) => {
    const newNumber = e.target.value.replace(/[^0-9]/g, '') // Only allow digits
    setPhoneNumber(newNumber)
    // Call parent onChange with combined value
    onChange({ target: { name, value: countryCode + newNumber } })
  }

  return (
    <div className="flex gap-2">
      {/* Country Code Selector */}
      <select
        value={countryCode}
        onChange={handleCountryCodeChange}
        className="input-field w-32 flex-shrink-0"
        aria-label="Country Code"
      >
        {countryCodes.map((cc) => (
          <option key={cc.code} value={cc.code}>
            {cc.flag} {cc.code}
          </option>
        ))}
      </select>

      {/* Phone Number Input */}
      <input
        type="tel"
        id={id}
        name={name}
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        className="input-field flex-1"
        placeholder={placeholder}
        required={required}
        pattern="[0-9]*"
        inputMode="numeric"
      />
    </div>
  )
}
