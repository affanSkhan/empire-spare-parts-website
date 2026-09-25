import Link from 'next/link'

const products = [
  {
    id: 1,
    title: 'Wiring Sockets',
    description: 'Reliable automotive electrical connectors for clean, secure connections.',
    imageUrl: '/showcase/wiring-socket.jpg',
    tag: 'Electrical'
  },
  {
    id: 2,
    title: 'Blower Resistors',
    description: 'Airflow control components for dependable cabin comfort.',
    imageUrl: '/showcase/blower-resistance.jpg',
    tag: 'Cabin A/C'
  },
  {
    id: 3,
    title: 'Radiator Fan Resistors',
    description: 'Cooling-system components built for consistent thermal performance.',
    imageUrl: '/showcase/radiator-fan.jpg',
    tag: 'Cooling'
  },
  {
    id: 4,
    title: 'Mirror Motor Gears',
    description: 'Precision drive components for powered folding mirror systems.',
    imageUrl: '/showcase/motor-gear.jpg',
    tag: 'Body Electronics'
  }
]

export default function ProductShowcase() {
  return (
    <section className="bg-[#f7f8fa] py-16 sm:py-20 lg:py-24">
      <div className="site-shell">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <span className="eyebrow">Parts spotlight</span>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-5xl">
              Built for the parts people actually ask for.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
              Explore a sample of our automotive electrical and A/C-related range. Availability changes, so contact us for the latest stock and fitment.
            </p>
          </div>
          <Link href="/products" className="btn-secondary w-fit">
            View full catalogue
            <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-12 lg:grid-rows-2">
          {products.map((product, index) => (
            <Link
              key={product.id}
              href="/products"
              className={`group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_38px_rgba(16,21,28,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_52px_rgba(16,21,28,0.11)] focus:outline-none focus:ring-4 focus:ring-blue-100 ${
                index === 0 ? 'lg:col-span-7 lg:row-span-2' : 'lg:col-span-5'
              }`}
            >
              <div className={`relative overflow-hidden ${index === 0 ? 'h-full min-h-[430px]' : 'h-56'}`}>
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-contain bg-slate-50 p-8 transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/5 to-transparent" />
                <span className="absolute left-5 top-5 rounded-full border border-white/20 bg-slate-950/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur">
                  {product.tag}
                </span>

                <div className="absolute inset-x-5 bottom-5">
                  <div className="max-w-xl">
                    <h3 className={`font-black tracking-[-0.03em] text-white ${index === 0 ? 'text-3xl sm:text-4xl' : 'text-2xl'}`}>
                      {product.title}
                    </h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">
                      {product.description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-white">
                      Ask about availability
                      <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">→</span>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span className="font-semibold text-slate-700">Need a different part?</span>
          <span>Share your car model or old part photo and we can help identify the right category.</span>
        </div>
      </div>
    </section>
  )
}
