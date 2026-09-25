import Link from 'next/link'
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
            <Logo
              size="small"
              className="[&_.text-slate-950]:!text-white [&_.text-slate-500]:!text-slate-400"
            />
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
            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-300">Talk to Empire</h3>
            <a
              href="tel:+917741077666"
              className="mt-5 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 transition-colors hover:bg-white/[0.08]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff5b22] text-white">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 011.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </span>
              <span>
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Call</span>
                <span className="mt-0.5 block text-base font-bold text-white">+91 77410 77666</span>
              </span>
            </a>
            <a href="mailto:Empirecarac@gmail.com" className="mt-3 inline-flex text-sm text-slate-400 hover:text-white">
              Empirecarac@gmail.com
            </a>
          </div>
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
