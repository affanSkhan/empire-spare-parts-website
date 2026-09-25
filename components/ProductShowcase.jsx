import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function ProductShowcase() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProducts() {
      const { data } = await supabase
        .from('products')
        .select('id, name, slug, brand, car_model, description, category:categories(id, name, slug), images:product_images(image_url, is_primary)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(4)

      setProducts(data || [])
      setLoading(false)
    }

    loadProducts()
  }, [])

  const getImage = (product) => {
    if (!product.images?.length) return null
    const primary = product.images.find((image) => image.is_primary)
    return primary?.image_url || product.images[0]?.image_url || null
  }

  return (
    <section className="bg-[#f4f2ee] py-20 sm:py-28 lg:py-36">
      <div className="site-shell">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="eyebrow reveal">Catalogue / live selection</span>
            <h2 className="reveal reveal-delay-1 mt-5 text-4xl font-black leading-[.94] tracking-[-.055em] sm:text-5xl lg:text-6xl">
              See the parts.<br />Open the details.
            </h2>
            <p className="reveal reveal-delay-2 mt-5 max-w-2xl text-base leading-7 text-[#68727f]">
              The homepage pulls from the active catalogue, so the visual experience is connected to real product data instead of static marketing cards.
            </p>
          </div>

          <Link href="/products" className="reveal reveal-delay-2 btn-secondary w-fit">
            Open full catalogue <span aria-hidden="true">↗</span>
          </Link>
        </div>

        {loading ? (
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            <div className="h-[430px] animate-pulse rounded-[34px] bg-[#e8e5de]" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="h-[205px] animate-pulse rounded-[28px] bg-[#e8e5de]" />
              <div className="h-[205px] animate-pulse rounded-[28px] bg-[#e8e5de]" />
              <div className="h-[205px] animate-pulse rounded-[28px] bg-[#e8e5de]" />
              <div className="h-[205px] animate-pulse rounded-[28px] bg-[#e8e5de]" />
            </div>
          </div>
        ) : products.length ? (
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {products.map((product, index) => {
              const image = getImage(product)
              const featured = index === 0
              return (
                <Link
                  key={product.id}
                  href={'/products/' + product.slug}
                  className={
                    'group reveal relative overflow-hidden rounded-[34px] bg-[#0b0f13] text-white ' +
                    (featured ? 'min-h-[430px] lg:row-span-2' : 'min-h-[205px]')
                  }
                >
                  {image ? (
                    <Image
                      src={image}
                      alt={product.name}
                      fill
                      className={
                        'object-contain transition duration-[1100ms] ease-out group-hover:scale-105 ' +
                        (featured ? 'p-10 sm:p-14' : 'p-7')
                      }
                      sizes={featured ? '(max-width: 1024px) 100vw, 50vw' : '(max-width: 1024px) 50vw, 25vw'}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(255,91,31,.16),transparent_38%)]">
                      <div className="flex h-20 w-20 items-center justify-center rounded-[26px] border border-white/10 bg-white/[.05] text-3xl">⌁</div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f13] via-[#0b0f13]/5 to-transparent opacity-95" />

                  {product.category && (
                    <span className="absolute left-5 top-5 rounded-full border border-white/12 bg-black/25 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.16em] text-white/75 backdrop-blur-xl">
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
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[.06] text-lg transition-transform duration-500 group-hover:translate-x-1 group-hover:bg-[#ff5b1f]">→</span>
                    </div>
                  </div>
                </Link>
              )
            })}

            {products.length < 4 && (
              <Link href="/products" className="group flex min-h-[205px] items-end rounded-[34px] border border-dashed border-black/15 bg-white p-7 transition-all duration-500 hover:-translate-y-1 hover:border-black/25 hover:shadow-[0_20px_50px_rgba(11,15,19,.06)]">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[.18em] text-[#ff5b1f]">More in catalogue</p>
                  <h3 className="mt-2 text-2xl font-black tracking-[-.035em]">Browse every active part.</h3>
                  <span className="mt-6 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0b0f13] text-white transition-transform duration-500 group-hover:translate-x-1">→</span>
                </div>
              </Link>
            )}
          </div>
        ) : (
          <div className="mt-10 rounded-[34px] border border-black/10 bg-white p-10 text-center">
            <p className="text-sm text-[#68727f]">No active catalogue items are currently available.</p>
            <Link href="/products" className="mt-5 inline-flex text-sm font-black text-[#dc4310] hover:underline">Open catalogue →</Link>
          </div>
        )}
      </div>
    </section>
  )
}
