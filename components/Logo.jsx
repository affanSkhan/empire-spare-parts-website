import Image from 'next/image'

export default function Logo({ className = "", size = "normal", showText = true }) {
  const sizes = {
    small: {
      text: "text-base sm:text-[17px]",
      tagline: "text-[9px] sm:text-[10px]",
      logo: 40,
      logoClass: "w-10 h-10"
    },
    normal: {
      text: "text-lg sm:text-xl",
      tagline: "text-[10px] sm:text-xs",
      logo: 50,
      logoClass: "w-11 h-11 sm:w-12 sm:h-12"
    },
    large: {
      text: "text-2xl sm:text-3xl md:text-4xl",
      tagline: "text-xs sm:text-sm md:text-base",
      logo: 80,
      logoClass: "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
    }
  }

  const currentSize = sizes[size] || sizes.normal

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 ${className}`}>
      <div className={`${currentSize.logoClass} rounded-2xl overflow-hidden bg-slate-950 flex-shrink-0 shadow-[0_8px_20px_rgba(15,23,42,0.16)] ring-1 ring-slate-200`}>
        <Image
          src="/Empire Car Ac  Logo Design.jpg"
          alt="Empire Car A/C logo"
          width={currentSize.logo}
          height={currentSize.logo}
          className="w-full h-full object-cover"
          priority
        />
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
