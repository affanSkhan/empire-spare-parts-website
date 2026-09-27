import Link from 'next/link'
import Image from 'next/image'
import Logo from './Logo'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#10151c] text-white relative overflow-hidden">
      <div className="absolute -right-24 -top-32 h-72 w-72 rounded-full bg-[#ff5b22]/10 blur-3xl" />
      <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="site-shell relative py-14 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_.7fr_1fr]">
          <div>
            <Link href="/" aria-label="Empire Car A/C home" className="inline-flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-2xl bg-[#0b0f13] ring-1 ring-white/15">
                <Image src="/Empire Car Ac  Logo Design.jpg" alt="Empire Car A/C" fill sizes="40px" className="object-cover" />
              </div>
              <div>
                <div className="whitespace-nowrap text-[17px] font-black leading-none tracking-[-.035em] !text-white">
                  EMPIRE CAR <span className="!text-[#ff5b1f]">A/C</span>
                </div>
                <div className="mt-1 whitespace-nowrap text-[10px] font-semibold tracking-wide !text-white/60">
                  Our Perfection. Your Satisfaction.
                </div>
              </div>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
              Car A/C spare parts and specialist support in Amravati. Tell us the vehicle and part you need, and we’ll help you find the right fit.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-slate-300">A/C Parts</span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-slate-300">Vehicle Fitment</span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-slate-300">Amravati</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-300">Explore</h3>
            <div className="mt-5 grid gap-3 text-sm">
              <Link href="/" className="text-slate-400 transition-colors hover:text-white">Home</Link>
              <Link href="/products" className="text-slate-400 transition-colors hover:text-white">Parts Catalogue</Link>
              <Link href="/contact" className="text-slate-400 transition-colors hover:text-white">Visit & Contact</Link>
              <Link href="/auth/login" className="text-slate-400 transition-colors hover:text-white">Customer Login</Link>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-sm font-black uppercase tracking-[0.16em] text-slate-300">Talk to Empire</h3>
              <span className="rounded-full border border-[#25D366]/20 bg-[#25D366]/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[.14em] text-[#69e58f]">WhatsApp first</span>
            </div>

            <div className="mt-5 grid gap-2.5">
              <a
                href="https://wa.me/917741077666"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-2xl border border-[#25D366]/20 bg-[#25D366]/[.08] p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#25D366]/40 hover:bg-[#25D366]/[.12]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-[0_8px_20px_rgba(37,211,102,.2)]">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c0 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-black uppercase tracking-[.14em] text-[#69e58f]">WhatsApp</span>
                  <span className="mt-0.5 block truncate text-sm font-black text-white">Order or send an enquiry</span>
                  <span className="mt-0.5 block text-xs text-slate-400">+91 77410 77666</span>
                </span>
                <span className="ml-auto text-lg text-white/40 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white">→</span>
              </a>

              <a
                href="tel:+917741077666"
                className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.04] p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[.07]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ff5b22] text-white">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M3 5a2 2 0 012-2h3.28a1 1 0 011.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 16.72V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5Z" />
                  </svg>
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-black uppercase tracking-[.14em] text-slate-500">Phone</span>
                  <span className="mt-0.5 block text-sm font-black text-white">+91 77410 77666</span>
                  <span className="mt-0.5 block text-xs text-slate-500">Call for pricing and stock</span>
                </span>
              </a>

              <a
                href="mailto:Empirecarac@gmail.com"
                className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.04] p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[.07]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[.08] text-slate-200">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15A2.25 2.25 0 0 1 2.25 17.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-black uppercase tracking-[.14em] text-slate-500">Email</span>
                  <span className="mt-0.5 block truncate text-sm font-black text-white">Empirecarac@gmail.com</span>
                  <span className="mt-0.5 block text-xs text-slate-500">Send a detailed requirement</span>
                </span>
              </a>
            </div>
          </div></div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} Empire Car A/C. All rights reserved.</p>
          <p>
            Website by{' '}
            <a
              href="https://affan.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-slate-300 hover:text-white"
            >
              Affan.Tech
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
