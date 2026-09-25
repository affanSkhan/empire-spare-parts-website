export default function Logo({ className = "", size = "normal", showText = true }) {
  const sizes = {
    small: { mark: "h-10 w-10", text: "text-base sm:text-[17px]", tagline: "text-[9px] sm:text-[10px]" },
    normal: { mark: "h-11 w-11 sm:h-12 sm:w-12", text: "text-lg sm:text-xl", tagline: "text-[10px] sm:text-xs" },
    large: { mark: "h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24", text: "text-2xl sm:text-3xl md:text-4xl", tagline: "text-xs sm:text-sm md:text-base" }
  }
  const currentSize = sizes[size] || sizes.normal

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 ${className}`}>
      <div className={`${currentSize.mark} flex-shrink-0 overflow-hidden rounded-2xl bg-slate-950 shadow-[0_8px_20px_rgba(15,23,42,0.16)] ring-1 ring-slate-200`}>
        <svg viewBox="0 0 64 64" className="h-full w-full" role="img" aria-label="Empire Car A/C logo">
          <rect x="0" y="0" width="64" height="64" rx="16" fill="#10151c" />
          <circle cx="32" cy="32" r="16" fill="none" stroke="#ff5b22" strokeWidth="3.5" />
          <path d="M32 13v38M13 32h38M18.6 18.6l26.8 26.8M45.4 18.6L18.6 45.4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" opacity=".92" />
          <circle cx="32" cy="32" r="5.5" fill="#ff5b22" stroke="#fff" strokeWidth="2" />
        </svg>
      </div>

      {showText && (
        <div className="min-w-0 flex flex-col">
          <div className={`${currentSize.text} font-black tracking-[-0.03em] leading-none text-slate-950 whitespace-nowrap`}>
            EMPIRE CAR <span className="text-[#ff5b22]">A/C</span>
          </div>
          <div className={`${currentSize.tagline} text-slate-500 font-semibold tracking-wide leading-tight mt-1 whitespace-nowrap`}>
            Our Perfection. Your Satisfaction.
          </div>
        </div>
      )}
    </div>
  )
}
