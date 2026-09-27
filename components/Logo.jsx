import Image from 'next/image'

export default function Logo({ className = "", size = "normal", showText = true, light = false }) {
  const sizes = {
    small: { mark: "h-10 w-10", text: "text-base sm:text-[17px]", tagline: "text-[9px] sm:text-[10px]" },
    normal: { mark: "h-11 w-11 sm:h-12 sm:w-12", text: "text-lg sm:text-xl", tagline: "text-[10px] sm:text-xs" },
    large: { mark: "h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24", text: "text-2xl sm:text-3xl md:text-4xl", tagline: "text-xs sm:text-sm md:text-base" }
  }

  const currentSize = sizes[size] || sizes.normal
  const titleColor = light ? 'text-white' : 'text-[#0b0f13]'
  const taglineColor = light ? 'text-white/60' : 'text-[#68727f]'

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 ${className}`}>
      <div className={`${currentSize.mark} relative flex-shrink-0 overflow-hidden rounded-2xl bg-[#0b0f13] shadow-[0_12px_28px_rgba(11,15,19,.18)] ring-1 ring-white/20`}>
        <Image
          src="/Empire Car Ac  Logo Design.jpg"
          alt="Empire Car A/C"
          fill
          priority
          sizes="48px"
          className="object-cover"
        />
      </div>

      {showText && (
        <div className="min-w-0">
          <div className={`${currentSize.text} whitespace-nowrap font-black leading-none tracking-[-0.035em] ${titleColor}`}>
            EMPIRE CAR <span className="text-[#ff5b1f]">A/C</span>
          </div>
          <div className={`${currentSize.tagline} mt-1 whitespace-nowrap font-semibold tracking-wide ${taglineColor}`}>
            Our Perfection. Your Satisfaction.
          </div>
        </div>
      )}
    </div>
  )
}
