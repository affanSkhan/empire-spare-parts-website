import Head from 'next/head'
import Link from 'next/link'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'

const businessInfo = {
  name: 'Empire Car A/C',
  phoneNumber: '+917741077666',
  whatsappNumber: '917741077666',
  email: 'Empirecarac@gmail.com',
  address: 'Shop Number 19, Usmaniya Masjid Complex, Bus Stand Road',
  city: 'Amravati',
  state: 'Maharashtra',
  zipCode: '444601',
  country: 'India',
  locationUrl: 'https://maps.app.goo.gl/WgWs6qW7dFqAkmPj9?g_st=aw',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3722.5!2d77.7544!3d21.0925!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd6a4a41388dbc7%3A0x3c28f1b3c39ea9f1!2sShop%20no%2019%2C%20Empire%20Car%20Ac%20Repairing%2C%20usmaniya%20masjid%20complex%2C%20bus%20stand%20road%2C%20Maltekdi%2C%20Amravati%2C%20Maharashtra%20444601!5e0!3m2!1sen!2sin!4v1733267890123!5m2!1sen!2sin'
}

const businessHours = [
  ['Monday – Friday', '8:00 AM – 6:00 PM'],
  ['Saturday', '9:00 AM – 4:00 PM'],
  ['Sunday', 'Closed']
]

export default function ContactPage() {
  const fullAddress = `${businessInfo.address}, ${businessInfo.city}, ${businessInfo.state} ${businessInfo.zipCode}, ${businessInfo.country}`

  const whatsappLink = `https://wa.me/${businessInfo.whatsappNumber}?text=${encodeURIComponent(
    'Hello Empire Car A/C, I would like to enquire about a car A/C part.'
  )}`

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'AutoPartsStore',
    name: businessInfo.name,
    url: 'https://www.empirecarac.in/contact',
    telephone: businessInfo.phoneNumber,
    email: businessInfo.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: businessInfo.address,
      addressLocality: businessInfo.city,
      addressRegion: businessInfo.state,
      postalCode: businessInfo.zipCode,
      addressCountry: 'IN'
    }
  }

  return (
    <>
      <Head>
        <title>Contact Empire Car A/C | Amravati Car A/C Parts & Support</title>
        <meta
          name="description"
          content="Call, WhatsApp or visit Empire Car A/C in Amravati for car air-conditioning parts, component enquiries and fitment guidance."
        />
        <meta name="keywords" content="Empire Car A/C contact, car AC parts Amravati, car AC shop Amravati, automotive spare parts Amravati" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Contact Empire Car A/C | Amravati" />
        <meta property="og:description" content="Call, WhatsApp or visit Empire Car A/C for car A/C parts in Amravati." />
        <meta property="og:url" content="https://www.empirecarac.in/contact" />
        <link rel="canonical" href="https://www.empirecarac.in/contact" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </Head>

      <Navbar />

      <main className="min-h-screen bg-white">
        <section className="bg-[#10151c] text-white">
          <div className="site-shell py-14 sm:py-18 lg:py-20">
            <div className="max-w-3xl">
              <span className="eyebrow !text-[#ff8e68]">Visit, call or message</span>
              <h1 className="mt-4 text-balance text-4xl font-black tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                Talk to Empire about the part you need.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                For a faster enquiry, share the vehicle model, the part name or number, and a clear photo of the old component when possible.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                  WhatsApp enquiry
                </a>
                <a
                  href={`tel:${businessInfo.phoneNumber}`}
                  className="btn-secondary border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.11]"
                >
                  Call the shop
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-[#f7f8fa]">
          <div className="site-shell grid divide-y divide-slate-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
            {[
              ['Call', '+91 77410 77666'],
              ['WhatsApp', 'Direct enquiry'],
              ['Visit', 'Bus Stand Road, Amravati'],
              ['Email', businessInfo.email]
            ].map(([label, value]) => (
              <div key={label} className="px-1 py-6 sm:px-6">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#dc4310]">{label}</p>
                <p className="mt-2 text-sm font-bold text-slate-950 break-words">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="site-shell py-12 sm:py-16 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
            <div>
              <span className="eyebrow">Contact details</span>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
                One place to ask, confirm and visit.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
                Use the channel that works for you. Calling is useful for quick stock questions; WhatsApp is useful when you want to send vehicle or part photos.
              </p>

              <div className="mt-8 space-y-4">
                <a
                  href={`tel:${businessInfo.phoneNumber}`}
                  className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(16,21,28,0.04)] transition-shadow hover:shadow-[0_14px_34px_rgba(16,21,28,0.08)]"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff1eb] text-[#dc4310]">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 011.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </span>
                  <span>
                    <span className="block text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Phone</span>
                    <span className="mt-1 block text-lg font-black text-slate-950 group-hover:text-[#dc4310]">{businessInfo.phoneNumber}</span>
                    <span className="mt-1 block text-sm text-slate-500">Call for pricing, stock or part guidance.</span>
                  </span>
                </a>

                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(16,21,28,0.04)] transition-shadow hover:shadow-[0_14px_34px_rgba(16,21,28,0.08)]"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eafaf0] text-[#25D366]">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c0 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </span>
                  <span>
                    <span className="block text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">WhatsApp</span>
                    <span className="mt-1 block text-lg font-black text-slate-950 group-hover:text-emerald-700">Send an enquiry</span>
                    <span className="mt-1 block text-sm text-slate-500">Useful for sharing vehicle and part photos.</span>
                  </span>
                </a>

                <a
                  href={`mailto:${businessInfo.email}`}
                  className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(16,21,28,0.04)] transition-shadow hover:shadow-[0_14px_34px_rgba(16,21,28,0.08)]"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15A2.25 2.25 0 0 1 2.25 17.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                  </span>
                  <span>
                    <span className="block text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Email</span>
                    <span className="mt-1 block break-all text-lg font-black text-slate-950 group-hover:text-[#dc4310]">{businessInfo.email}</span>
                    <span className="mt-1 block text-sm text-slate-500">Send a detailed requirement.</span>
                  </span>
                </a>
              </div>
            </div>

            <div className="overflow-hidden rounded-[30px] bg-[#10151c] text-white shadow-[0_18px_55px_rgba(16,21,28,0.1)]">
              <div className="p-7 sm:p-8">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <span className="eyebrow !text-[#ff8e68]">Shop location</span>
                    <h2 className="mt-3 text-2xl font-black tracking-[-0.035em] sm:text-3xl">Find us in Amravati.</h2>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">Visit</span>
                </div>

                <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">
                  {fullAddress}
                </p>
              </div>

              <div className="relative h-[330px] border-y border-white/10 bg-slate-900">
                <iframe
                  src={businessInfo.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Empire Car A/C location map"
                  className="h-full w-full grayscale-[0.1]"
                />
              </div>

              <div className="flex flex-col gap-3 p-5 sm:flex-row">
                <a
                  href={businessInfo.locationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex-1"
                >
                  Open in Google Maps
                  <span aria-hidden="true">↗</span>
                </a>
                <Link href="/products" className="btn-secondary flex-1 border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.1]">
                  Browse parts
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f7f8fa] py-12 sm:py-16">
          <div className="site-shell">
            <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
              <div>
                <span className="eyebrow">Opening hours</span>
                <h2 className="mt-4 text-2xl font-black tracking-[-0.035em] text-slate-950 sm:text-3xl">
                  Plan your visit.
                </h2>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {businessHours.map(([day, hours], index) => (
                  <div key={day} className={`grid grid-cols-2 gap-4 px-5 py-4 text-sm sm:px-6 ${index > 0 ? 'border-t border-slate-200' : ''}`}>
                    <span className="font-semibold text-slate-700">{day}</span>
                    <span className="text-right font-bold text-slate-950">{hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="site-shell py-14 sm:py-18 lg:py-20">
          <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_10px_30px_rgba(16,21,28,0.04)] sm:p-9">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <span className="eyebrow">Make your enquiry easier</span>
                <h2 className="mt-4 text-2xl font-black tracking-[-0.035em] text-slate-950 sm:text-3xl">
                  Have the vehicle details ready.
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Model, variant, year, part name, old part number or a clear photo can all help narrow down the right component.
                </p>
              </div>
              <Link href="/products" className="btn-primary">
                Search the catalogue
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
