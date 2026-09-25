import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProductShowcase from '@/components/ProductShowcase'

const heroImage = 'https://images.unsplash.com/photo-1559727126-706acf5a8e07?auto=format&fit=crop&w=2400&q=90'
const workshopImage = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=2400&q=90'

const stories = [
  {
    number: '01',
    label: 'FIND',
    title: 'Start with the part.',
    body: 'Search by part name, brand or vehicle model. The catalogue is designed to move you from vague requirement to useful product detail quickly.',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=2000&q=88'
  },
  {
    number: '02',
    label: 'VERIFY',
    title: 'Then check the fit.',
    body: 'Open the component page, review the available vehicle and brand context, then use direct contact when the exact match needs confirmation.',
    image: heroImage
  },
  {
    number: '03',
    label: 'CONNECT',
    title: 'Finish with a real conversation.',
    body: 'For stock, pricing or a difficult identification, send the vehicle details or a photo of the old component directly to Empire.',
    image: workshopImage
  }
]

export default function Home() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [activeStory, setActiveStory] = useState(0)
  const storyRef = useRef(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform()) {
      router.replace('/admin')
    }
  }, [router])

  useEffect(() => {
    const root = storyRef.current
    if (!root) return

    const markers = Array.from(root.querySelectorAll('[data-story-index]'))
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveStory(Number(entry.target.getAttribute('data-story-index')))
        }
      })
    }, { threshold: 0.6 })

    markers.forEach((marker) => observer.observe(marker))
    return () => observer.disconnect()
  }, [])

  const runSearch = (value) => {
    const term = (value || '').trim()
    router.push(term ? '/products?search=' + encodeURIComponent(term) : '/products')
  }

  return (
    <>
      <Head>
        <title>Empire Car A/C | Car A/C Parts in Amravati</title>
        <meta name="description" content="Find car A/C spare parts and automotive components in Amravati. Search by part, brand or vehicle and contact Empire for fitment guidance." />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Empire Car A/C | Car A/C Parts in Amravati" />
        <meta property="og:description" content="Search car A/C parts by part, brand or vehicle and contact Empire in Amravati." />
        <meta property="og:url" content="https://www.empirecarac.in/" />
        <link rel="canonical" href="https://www.empirecarac.in/" />
      </Head>

      <Navbar />

      <main className="overflow-hidden bg-[#f4f2ee]">
        <section className="noise relative isolate flex min-h-[100svh] items-end overflow-hidden bg-[#0b0f13] text-white">
          <div className="absolute inset-0">
            <img src={heroImage} alt="" className="hero-float h-full w-full object-cover object-center opacity-[.68]" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,11,.96)_0%,rgba(5,8,11,.75)_40%,rgba(5,8,11,.22)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_32%,rgba(255,91,31,.22),transparent_28%)]" />
          </div>

          <div className="site-shell relative z-10 pb-16 pt-40 sm:pb-20 lg:pb-24">
            <div className="grid items-end gap-12 lg:grid-cols-[1.08fr_.92fr]">
              <div className="max-w-4xl">
                <div className="reveal in-view flex items-center gap-3 text-[10px] font-black uppercase tracking-[.22em] text-white/58">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ff5b1f]" />
                  Amravati · Car A/C parts & components
                </div>

                <h1 className="mt-6 text-[clamp(3.6rem,8vw,7.5rem)] font-black leading-[.88] tracking-[-.065em]">
                  <span className="clip-reveal in-view"><span>Cool air.</span></span>
                  <span className="clip-reveal in-view"><span className="text-[#ff7b45]">Correct parts.</span></span>
                  <span className="clip-reveal in-view"><span>Less guesswork.</span></span>
                </h1>

                <p className="reveal reveal-delay-2 in-view mt-7 max-w-2xl text-base leading-7 text-white/62 sm:text-lg">
                  A more deliberate way to find automotive A/C parts, inspect the component, and get direct help when fitment needs a human answer.
                </p>

                <div className="reveal reveal-delay-3 in-view mt-9 flex flex-col gap-3 sm:flex-row">
                  <Link href="/products" className="btn-primary magnetic">
                    Explore parts <span aria-hidden="true">↗</span>
                  </Link>
                  <Link href="/contact" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/18 bg-white/[.08] px-6 text-sm font-black text-white backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:bg-white/[.13]">
                    Visit the shop
                  </Link>
                </div>

                <div className="mt-9 flex flex-wrap gap-x-8 gap-y-3 text-xs font-bold text-white/48">
                  <span>Search</span>
                  <span>Fitment</span>
                  <span>WhatsApp</span>
                  <span>Amravati</span>
                </div>
              </div>

              <div className="reveal reveal-delay-2 in-view lg:pb-3">
                <div className="glass rounded-[34px] p-4">
                  <div className="rounded-[26px] bg-white p-5 text-[#0b0f13] sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[.2em] text-[#ff5b1f]">Part finder</p>
                        <h2 className="mt-2 text-2xl font-black leading-tight tracking-[-.035em] sm:text-3xl">What are you looking for?</h2>
                      </div>
                      <div className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-[#0b0f13] text-white sm:flex">⌕</div>
                    </div>

                    <form
                      className="mt-6"
                      onSubmit={(event) => {
                        event.preventDefault()
                        runSearch(search)
                      }}
                    >
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                          type="search"
                          value={search}
                          onChange={(event) => setSearch(event.target.value)}
                          placeholder="Condenser, compressor, Swift…"
                          className="input-field min-w-0 flex-1"
                          aria-label="Search car A/C parts"
                        />
                        <button type="submit" className="btn-primary magnetic shrink-0">Search</button>
                      </div>
                    </form>

                    <div className="mt-5">
                      <p className="text-[9px] font-black uppercase tracking-[.16em] text-[#9aa2ac]">Popular</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {['Compressor', 'Condenser', 'Blower resistor', 'Wiring socket'].map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => runSearch(term)}
                            className="rounded-full border border-black/10 bg-[#f4f2ee] px-3.5 py-2 text-xs font-black text-[#596472] transition-all duration-300 hover:-translate-y-0.5 hover:border-black/20 hover:bg-white hover:text-[#0b0f13]"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2 pt-3 sm:grid-cols-3">
                    {[
                      ['01', 'Search', 'Find the requirement'],
                      ['02', 'Verify', 'Review fitment'],
                      ['03', 'Connect', 'Confirm with Empire']
                    ].map(([number, title, text]) => (
                      <div key={number} className="rounded-2xl border border-white/10 bg-black/[.10] p-4">
                        <p className="text-[9px] font-black tracking-[.16em] text-[#ff8e68]">{number}</p>
                        <p className="mt-2 text-sm font-black text-white">{title}</p>
                        <p className="mt-1 text-[11px] leading-5 text-white/40">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-14 border-t border-white/10 pt-6">
              <div className="grid gap-5 sm:grid-cols-3">
                {[
                  ['Focused catalogue', 'A/C parts and automotive components'],
                  ['Vehicle-first', 'Model details before assumptions'],
                  ['Direct support', 'Call or WhatsApp the shop']
                ].map(([title, text]) => (
                  <div key={title} className="reveal reveal-delay-1 border-l border-white/12 pl-4">
                    <p className="text-sm font-black text-white">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-white/40">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-5 right-6 hidden items-center gap-3 text-[9px] font-black uppercase tracking-[.18em] text-white/45 lg:flex">
            Scroll to explore
            <span className="orbit-pulse h-2 w-2 rounded-full border border-[#ff8e68]" />
          </div>
        </section>

        <section className="border-b border-black/10 bg-white">
          <div className="site-shell grid divide-y divide-black/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
            {[
              ['01', 'Find', 'Search the catalogue'],
              ['02', 'Inspect', 'Open the component'],
              ['03', 'Confirm', 'Call or WhatsApp'],
              ['04', 'Visit', 'Amravati shop']
            ].map(([number, title, text]) => (
              <div key={number} className="reveal flex min-h-[120px] items-center gap-4 py-6 sm:px-6">
                <span className="text-[10px] font-black tracking-[.14em] text-[#ff5b1f]">{number}</span>
                <div>
                  <p className="text-sm font-black">{title}</p>
                  <p className="mt-1 text-xs text-[#68727f]">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="site-shell py-20 sm:py-28 lg:py-36">
          <div className="grid gap-12 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
            <div>
              <span className="eyebrow reveal">The Empire workflow</span>
              <h2 className="reveal reveal-delay-1 mt-5 max-w-xl text-4xl font-black leading-[.95] tracking-[-.055em] sm:text-5xl lg:text-6xl">
                Designed around the way people actually buy parts.
              </h2>
              <p className="reveal reveal-delay-2 mt-5 max-w-xl text-base leading-7 text-[#68727f]">
                Automotive parts are rarely a “pretty product” purchase. The detail that matters is whether the component is the correct one for the vehicle. The experience should make that decision easier.
              </p>
            </div>

            <div className="reveal reveal-delay-2 grid gap-3 sm:grid-cols-2">
              {[
                ['01', 'Start broad', 'Part name, brand or vehicle model can get you into the right category.'],
                ['02', 'Get specific', 'Product details surface the information available for the component.'],
                ['03', 'Reduce uncertainty', 'Ask Empire when the exact fit needs confirmation.'],
                ['04', 'Move offline', 'The shop remains one tap away for local support.']
              ].map(([number, title, text]) => (
                <div key={number} className="group rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_10px_30px_rgba(11,15,19,.04)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(11,15,19,.09)]">
                  <span className="text-[9px] font-black tracking-[.18em] text-[#ff5b1f]">{number}</span>
                  <h3 className="mt-5 text-xl font-black tracking-[-.03em]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#68727f]">{text}</p>
                  <div className="mt-6 h-px w-8 bg-[#ff5b1f] transition-all duration-500 group-hover:w-16" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section ref={storyRef} className="section-dark">
          <div className="site-shell grid lg:grid-cols-[.82fr_1.18fr]">
            <div className="hidden lg:block">
              <div className="sticky top-0 flex h-screen items-center py-10">
                <div className="relative h-[78vh] w-full overflow-hidden rounded-[36px] border border-white/10">
                  {stories.map((story, index) => (
                    <img
                      key={story.number}
                      src={story.image}
                      alt=""
                      className={
                        'absolute inset-0 h-full w-full object-cover transition-all duration-[1200ms] ' +
                        (activeStory === index ? 'scale-100 opacity-100' : 'scale-110 opacity-0')
                      }
                    />
                  ))}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f13] via-transparent to-black/5" />
                  <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-xl">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[.16em] text-white/35">Scroll story</p>
                      <p className="mt-1 text-sm font-black text-white">{stories[activeStory].label}</p>
                    </div>
                    <p className="text-xs font-black text-[#ff8e68]">{stories[activeStory].number} / 03</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              {stories.map((story, index) => (
                <article
                  key={story.number}
                  data-story-index={index}
                  className="flex min-h-[78vh] flex-col justify-center border-b border-white/10 py-20 last:border-0 lg:min-h-screen lg:px-12"
                >
                  <div className="image-reveal relative mb-8 aspect-[4/3] overflow-hidden rounded-[30px] lg:hidden">
                    <img src={story.image} alt="" className="h-full w-full object-cover" />
                  </div>

                  <span className="eyebrow !text-[#ff8e68] reveal">{story.number} / {story.label}</span>
                  <h2 className="reveal reveal-delay-1 mt-5 max-w-3xl text-5xl font-black leading-[.92] tracking-[-.055em] sm:text-6xl lg:text-7xl">{story.title}</h2>
                  <p className="reveal reveal-delay-2 mt-6 max-w-xl text-base leading-7 text-white/52 sm:text-lg">{story.body}</p>

                  <Link href={index === 2 ? '/contact' : '/products'} className="reveal reveal-delay-3 mt-8 inline-flex w-fit items-center gap-3 text-sm font-black text-white">
                    {index === 0 ? 'Browse parts' : index === 1 ? 'Check the catalogue' : 'Talk to Empire'}
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 transition-transform duration-500 hover:translate-x-1">→</span>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <ProductShowcase />

        <section className="bg-[#eae7df]">
          <div className="site-shell py-20 sm:py-28 lg:py-36">
            <div className="grid gap-10 lg:grid-cols-[.74fr_1.26fr] lg:items-end">
              <div>
                <span className="eyebrow reveal">Human support</span>
                <h2 className="reveal reveal-delay-1 mt-5 text-4xl font-black leading-[.95] tracking-[-.055em] sm:text-5xl lg:text-6xl">
                  When the catalogue ends, the conversation starts.
                </h2>
              </div>

              <div className="image-reveal reveal reveal-delay-2 overflow-hidden rounded-[36px] bg-[#0b0f13] text-white shadow-[0_28px_80px_rgba(11,15,19,.12)]">
                <div className="relative min-h-[460px]">
                  <img src={workshopImage} alt="" className="hero-float absolute inset-0 h-full w-full object-cover opacity-[.58]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f13] via-black/15 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-7 sm:p-9">
                    <p className="text-[9px] font-black uppercase tracking-[.18em] text-[#ff8e68]">Give us the context</p>
                    <h3 className="mt-3 max-w-2xl text-3xl font-black leading-tight tracking-[-.045em] sm:text-4xl">
                      Vehicle model. Part name. Old-part photo. That’s enough to make the enquiry useful.
                    </h3>
                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                      <a href="https://wa.me/917741077666" target="_blank" rel="noopener noreferrer" className="btn-primary">WhatsApp Empire ↗</a>
                      <a href="tel:+917741077666" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/[.06] px-6 text-sm font-black text-white backdrop-blur-md transition-all hover:bg-white/[.1]">Call +91 77410 77666</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#ff5b1f] text-white">
          <div className="site-shell py-16 sm:py-20 lg:py-24">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="reveal text-[10px] font-black uppercase tracking-[.2em] text-white/58">Ready when you are</p>
                <h2 className="reveal reveal-delay-1 mt-4 text-5xl font-black leading-[.9] tracking-[-.06em] sm:text-6xl lg:text-7xl">
                  Find the part.<br />
                  Confirm the fit.
                </h2>
              </div>
              <div className="reveal reveal-delay-2 flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link href="/products" className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-black text-[#dc4310] transition-all duration-500 hover:-translate-y-1">Explore parts ↗</Link>
                <Link href="/contact" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 bg-white/10 px-6 text-sm font-black text-white transition-all duration-500 hover:-translate-y-1 hover:bg-white/15">Contact Empire</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
