import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProductShowcase from '@/components/ProductShowcase'

const heroImage = 'https://images.unsplash.com/photo-1780853891031-b12cf3face8a?auto=format&fit=crop&w=1900&q=88'
const serviceImage = 'https://images.unsplash.com/photo-1769218401807-5495675a2eb1?auto=format&fit=crop&w=1600&q=86'

const quickLinks = [
  { label: 'A/C Compressors', query: 'compressor' },
  { label: 'Condensers', query: 'condenser' },
  { label: 'Blower Resistors', query: 'blower' },
  { label: 'Electrical Parts', query: 'wiring' }
]

export default function Home() {
  const router = useRouter()
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform()) {
      router.replace('/admin')
    }
  }, [router])

  const runSearch = (value = search) => {
    const term = value.trim()
    router.push(term ? `/products?search=${encodeURIComponent(term)}` : '/products')
  }

  return (
    <>
      <Head>
        <title>Empire Car A/C | Car A/C Parts & Automotive Components in Amravati</title>
        <meta
          name="description"
          content="Empire Car A/C supplies car air-conditioning spare parts and automotive electrical components in Amravati. Browse the catalogue, check availability and contact us for fitment guidance."
        />
        <meta name="keywords" content="car AC parts Amravati, car air conditioner parts, AC compressor, AC condenser, blower resistor, automotive electrical parts" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Empire Car A/C | Car A/C Parts in Amravati" />
        <meta property="og:description" content="Find car A/C spare parts and automotive components in Amravati." />
        <meta property="og:url" content="https://www.empirecarac.in/" />
        <meta property="og:site_name" content="Empire Car A/C" />
        <link rel="canonical" href="https://www.empirecarac.in/" />
      </Head>

      <Navbar />

      <main className="overflow-hidden bg-white">
        {/* Hero */}
        <section className="relative bg-[#10151c] text-white">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-45 animate-slow-pan"
            style={{ backgroundImage: `url("${heroImage}")` }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#10151c] via-[#10151c]/92 to-[#10151c]/55" aria-hidden="true" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(255,91,34,0.22),transparent_32%)]" aria-hidden="true" />

          <div className="site-shell relative py-16 sm:py-20 lg:py-24 xl:py-28">
            <div className="grid items-end gap-12 lg:grid-cols-[1.08fr_.92fr]">
              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-orange-200">
                  <span className="rounded-full border border-white/15 bg-white/[0.05] px-3 py-1.5 backdrop-blur">Amravati</span>
                  <span className="text-white/40">•</span>
                  <span>Car A/C Parts & Components</span>
                </div>

                <h1 className="mt-7 text-balance text-5xl font-black leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
                  Keep the cabin cool.
                  <span className="block text-[#ff7a4d]">Keep the drive moving.</span>
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  A focused source for car A/C spare parts and automotive electrical components — with practical guidance when you need to match a part to your vehicle.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/products" className="btn-primary w-full sm:w-auto">
                    Explore parts
                    <span aria-hidden="true">→</span>
                  </Link>
                  <a href="tel:+917741077666" className="btn-secondary w-full border-white/15 bg-white/[0.07] text-white hover:bg-white/[0.12] sm:w-auto">
                    Call +91 77410 77666
                  </a>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3 text-xs font-semibold text-slate-300">
                  <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#ff5b22]" />Parts catalogue</span>
                  <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-400" />Fitment guidance</span>
                  <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-white/60" />Amravati shop support</span>
                </div>
              </div>

              {/* Search panel */}
              <div className="lg:pb-2">
                <div className="rounded-[30px] border border-white/10 bg-white/[0.07] p-4 shadow-2xl backdrop-blur-xl sm:p-5">
                  <div className="rounded-[22px] bg-white p-5 text-slate-950 sm:p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ff5b22]">Find a part</p>
                        <h2 className="mt-2 text-2xl font-black tracking-[-0.035em]">Search by part, brand or vehicle</h2>
                      </div>
                      <div className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white sm:flex">⌕</div>
                    </div>

                    <form
                      className="mt-5 flex flex-col gap-3 sm:flex-row"
                      onSubmit={(event) => {
                        event.preventDefault()
                        runSearch()
                      }}
                    >
                      <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="e.g. Swift condenser, blower resistor…"
                        className="input-field min-w-0 flex-1"
                        aria-label="Search parts"
                      />
                      <button type="submit" className="btn-primary shrink-0">
                        Search
                      </button>
                    </form>

                    <div className="mt-5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Popular searches</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {quickLinks.map((item) => (
                          <button
                            key={item.query}
                            type="button"
                            onClick={() => runSearch(item.query)}
                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-white"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4 sm:grid-cols-4">
                    <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
                      <p className="text-xl font-black">01</p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Browse</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
                      <p className="text-xl font-black">02</p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Match</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
                      <p className="text-xl font-black">03</p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Confirm</p>
                    </div>
                    <div className="rounded-2xl border border-[#ff5b22]/30 bg-[#ff5b22]/10 p-3">
                      <p className="text-xl font-black text-[#ff9a78]">GO</p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-orange-100/70">Order</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-14 border-t border-white/10 pt-6">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ['01', 'A/C-focused range', 'Compressors, condensers, resistors and related components.'],
                  ['02', 'Vehicle-first help', 'Use your car model or old part details when asking for a match.'],
                  ['03', 'Local support', 'Visit the Empire Car A/C shop in Amravati for practical assistance.'],
                  ['04', 'Direct contact', 'Call or WhatsApp for availability, pricing and next steps.']
                ].map(([num, title, text]) => (
                  <div key={num} className="border-l border-white/15 pl-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#ff7a4d]">{num}</p>
                    <p className="mt-2 text-sm font-bold text-white">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Trust / stats rail */}
        <section className="border-b border-slate-200 bg-white">
          <div className="site-shell grid divide-y divide-slate-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
            {[
              ['Amravati', 'Local service & support'],
              ['A/C Parts', 'Focused product catalogue'],
              ['Direct', 'Call / WhatsApp assistance'],
              ['Practical', 'Fitment-first guidance']
            ].map(([value, label]) => (
              <div key={value} className="flex min-h-[108px] items-center gap-4 px-1 py-6 sm:px-6">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5b22]" />
                <div>
                  <p className="text-sm font-black tracking-tight text-slate-950">{value}</p>
                  <p className="mt-1 text-xs text-slate-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <ProductShowcase />

        {/* Service story */}
        <section className="bg-white py-16 sm:py-20 lg:py-24">
          <div className="site-shell">
            <div className="overflow-hidden rounded-[32px] bg-[#111820] text-white">
              <div className="grid lg:grid-cols-[.95fr_1.05fr]">
                <div className="relative min-h-[360px] overflow-hidden lg:min-h-[520px]">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url("${serviceImage}")` }}
                    aria-hidden="true"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111820] via-transparent to-transparent lg:bg-gradient-to-r" aria-hidden="true" />
                  <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
                    <div className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 backdrop-blur-md">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-200">Service mindset</p>
                      <p className="mt-1 text-sm font-bold">Inspect • Match • Confirm</p>
                    </div>
                  </div>
                </div>

                <div className="p-7 sm:p-9 lg:p-12">
                  <span className="eyebrow !text-[#ff8e68]">Beyond the catalogue</span>
                  <h2 className="mt-4 text-3xl font-black tracking-[-0.045em] sm:text-4xl lg:text-5xl">
                    The right part starts with the right information.
                  </h2>
                  <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                    For A/C and electrical components, small vehicle details can change the correct part. That’s why our enquiry flow is designed around the car, the component and the actual requirement — not just a product name.
                  </p>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {[
                      ['Vehicle details', 'Share model, variant or year when available.'],
                      ['Part details', 'Part name, old part number or a clear photo can help.'],
                      ['Availability', 'We can confirm current stock and practical alternatives.'],
                      ['Next step', 'Call, WhatsApp or visit the Amravati shop.']
                    ].map(([title, text]) => (
                      <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <h3 className="text-sm font-bold">{title}</h3>
                        <p className="mt-1 text-xs leading-5 text-slate-400">{text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link href="/contact" className="btn-primary">
                      Visit & contact
                      <span aria-hidden="true">→</span>
                    </Link>
                    <a href="https://wa.me/917741077666" target="_blank" rel="noopener noreferrer" className="btn-secondary border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.1]">
                      WhatsApp us
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Three-step workflow */}
        <section className="border-t border-slate-200 bg-[#f7f8fa] py-16 sm:py-20">
          <div className="site-shell">
            <div className="max-w-2xl">
              <span className="eyebrow">Simple buying flow</span>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
                From “I need this part” to the next step.
              </h2>
            </div>

            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {[
                ['01', 'Describe the requirement', 'Search the catalogue or share your vehicle and the part you need.'],
                ['02', 'Check the match', 'Open the part details and review brand, vehicle and description information.'],
                ['03', 'Talk to Empire', 'Use the cart, call or WhatsApp to confirm availability and pricing.']
              ].map(([number, title, text]) => (
                <div key={number} className="relative rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(16,21,28,0.04)]">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-xs font-black text-white">{number}</span>
                  <h3 className="mt-6 text-xl font-black tracking-[-0.03em]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-white py-16 sm:py-20 lg:py-24">
          <div className="site-shell">
            <div className="relative overflow-hidden rounded-[32px] bg-[#ff5b22] px-7 py-10 text-white sm:px-10 sm:py-14 lg:px-14">
              <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
              <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/70">Ready when you are</p>
                  <h2 className="mt-3 text-3xl font-black tracking-[-0.045em] sm:text-4xl lg:text-5xl">
                    Need a car A/C part in Amravati?
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
                    Browse the catalogue, call the shop or send a WhatsApp enquiry with your vehicle details.
                  </p>
                </div>
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[260px]">
                  <a href="tel:+917741077666" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-black text-[#dc4310] shadow-lg transition-transform hover:-translate-y-0.5">
                    Call +91 77410 77666
                  </a>
                  <Link href="/products" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3.5 text-sm font-bold text-white hover:bg-white/15">
                    Browse parts
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
