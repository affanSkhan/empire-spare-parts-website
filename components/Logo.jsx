/**
 * Logo Component for Empire Car A/C
 * Displays the business logo with tagline
 */
export default function Logo({ className = "", size = "normal" }) {
  const sizes = {
    small: {
      text: "text-lg sm:text-xl",
      tagline: "text-xs",
      icon: "w-6 h-6"
    },
    normal: {
      text: "text-xl sm:text-2xl",
      tagline: "text-xs sm:text-sm",
      icon: "w-8 h-8"
    },
    large: {
      text: "text-3xl sm:text-4xl md:text-5xl",
      tagline: "text-sm sm:text-base md:text-lg",
      icon: "w-12 h-12 sm:w-16 sm:h-16"
    }
  }

  const currentSize = sizes[size] || sizes.normal

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          {/* Wrench Icon */}
          <svg 
            className={`${currentSize.icon} text-primary-600`}
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
          </svg>
          <div>
            <div className={`${currentSize.text} font-bold leading-tight`}>
              <span className="text-gray-900">EMPIRE CAR </span>
              <span className="text-primary-600">A/C</span>
            </div>
            <div className={`${currentSize.tagline} text-primary-600 font-medium italic`}>
              Our Perfection Your Satisfaction
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
