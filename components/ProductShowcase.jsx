import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

const fallbackImages = [
  '/showcase/wiring-socket.jpg',
  '/showcase/blower-resistance.jpg',
  '/showcase/radiator-fan.jpg',
  '/showcase/motor-gear.jpg'
]

export default function ProductShowcase() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, slug, brand, car_model, description, category:categories(id, name, slug), images:product_images(image_url, is_primary)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(4)

      if (cancelled) return
      if (error) console.error('[ProductShowcase]', error)
      setProducts(data || [])
      setLoading(false)
    }

    loadProducts()
    return () => { cancelled = true }
  }, [])

  const getImage = (product, index) => {
    return product.images?.find((image) => image.is_primary)?.image_url
      || product.images?.[0]?.image_url
      || fallbackImages[index % fallbackImages.length]
  }

  return (
    <section className="bg-[#f4f2ee] py-24 sm:py-28 lg:py-36 scroll-mt-[96px]">
      <div className="site-shell">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="eyebrow reveal">Catalogue / live selection</span>
            <h2 className="reveal reveal-delay-1 mt-5 text-4xl font-black leading-[.94] tracking-[-.055em] sm:text-5xl lg:text-6xl">
              See the parts.<br />Open the details.
            </h2>
            <p className="reveal reveal-delay-2 mt-5 max-w-2xl text-base leading-7 text-[#68727f]">
              A live selection from the active catalogue, with resilient image fallbacks so one missing product image never leaves a blank interface.
            </p>
          </div>

          <Link href="/products" className="reveal reveal-delay-2 btn-secondary w-fit">
            Open full catalogue <span aria-hidden="true">↗</span>
          </Link>
        </div>

        {loading ? (
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            <div className="h-[440px] animate-pulse rounded-[34px] bg-[#e5e1d8]" />
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-[208px] animate-pulse rounded-[28px] bg-[#e5e1d8]" />
              ))}
            </div>
          </div>
        ) : products.length > 0 ? (
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {products.map((product, index) => {
              const featured = index === 0
              const image = getImage(product, index)

              return (
                <Link
                  key={product.id}
                  href={'/products/' + product.slug}
                  className={
                    'group relative overflow-hidden rounded-[34px] bg-[#0b0f13] text-white shadow-[0_18px_50px_rgba(11,15,19,.10)] ' +
                    (featured ? 'min-h-[440px] lg:row-span-2' : 'min-h-[208px]')
                  }
                >
                  <img
                    src={image}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className={
                      'absolute inset-0 h-full w-full object-contain transition-transform duration-[1100ms] ease-out group-hover:scale-105 ' +
                      (featured ? 'p-10 sm:p-14' : 'p-7')
                    }
                    onError={(event) => {
                      const node = event.currentTarget
                      const fallback = fallbackImages[(index + 1) % fallbackImages.length]
                      if (node.dataset.fallback !== 'used') {
                        node.dataset.fallback = 'used'
                        node.src = fallback
                      }
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f13] via-[#0b0f13]/5 to-transparent" />

                  {product.category && (
                    <span className="absolute left-5 top-5 rounded-full border border-white/12 bg-black/25 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.16em] text-white/80 backdrop-blur-xl">
                      {product.category.name}
                    </span>
                  )}

                  <div className="absolute inset-x-5 bottom-5 sm:inset-x-7 sm:bottom-7">
                    <div className="flex items-end justify-between gap-4">
                      <div className="max-w-xl">
                        <p className="text-[9px] font-black uppercase tracking-[.18em] text-[#ff8e68]">
                          {featured ? 'Featured component' : 'Catalogued component'}
                        </p>
                        <h3 className={featured ? 'mt-2 text-3xl font-black leading-[.95] tracking-[-.04em] sm:text-4xl' : 'mt-2 text-xl font-black leading-tight tracking-[-.03em]'}>
                          {product.name}
                        </h3>
                        {(product.brand || product.car_model) && (
                          <p className="mt-2 text-xs font-semibold text-white/55">
                            {product.brand || 'Component'}{product.car_model ? ' · ' + product.car_model : ''}
                          </p>
                        )}
                      </div>
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[.06] text-lg transition-all duration-500 group-hover:translate-x-1 group-hover:bg-[#ff5b1f]">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}

            {products.length < 4 && (
              <Link href="/products" className="group flex min-h-[208px] items-end rounded-[34px] border border-dashed border-black/15 bg-white p-7 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(11,15,19,.07)]">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[.18em] text-[#ff5b1f]">More in catalogue</p>
                  <h3 className="mt-2 text-2xl font-black tracking-[-.035em]">Browse every active part.</h3>
                  <span className="mt-6 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0b0f13] text-white">→</span>
                </div>
              </Link>
            )}
          </div>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Wiring sockets', 'Electrical', '/showcase/wiring-socket.jpg'],
              ['Blower resistors', 'Cabin A/C', '/showcase/blower-resistance.jpg'],
              ['Radiator fan resistors', 'Cooling', '/showcase/radiator-fan.jpg'],
              ['Mirror motor gears', 'Body electronics', '/showcase/motor-gear.jpg']
            ].map(([title, category, image]) => (
              <Link
                key={title}
                href="/products"
                className="group relative min-h-[260px] overflow-hidden rounded-[30px] bg-[#0b0f13] text-white shadow-[0_18px_50px_rgba(11,15,19,.08)]"
              >
                <img src={image} alt={title} className="absolute inset-0 h-full w-full object-contain p-8 transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f13] via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="text-[9px] font-black uppercase tracking-[.17em] text-[#ff8e68]">{category}</p>
                  <h3 className="mt-2 text-xl font-black tracking-[-.03em]">{title}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
