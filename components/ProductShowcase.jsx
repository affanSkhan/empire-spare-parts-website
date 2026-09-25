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
    <section className="bg-[#f7f8fa] py-16 sm:py-20 lg:py-24">
      <div className="site-shell">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <span className="eyebrow">Latest parts</span>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-5xl">
              A live look at the catalogue.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
              These cards are pulled from the active catalogue so the homepage stays connected to current product data.
            </p>
          </div>
          <Link href="/products" className="btn-secondary w-fit">
            View all parts
            <span aria-hidden="true">↗</span>
          </Link>
        </div>

        {loading ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="aspect-[4/3] animate-pulse bg-slate-100" />
                <div className="space-y-3 p-5">
                  <div className="h-5 w-4/5 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                  <div className="h-11 w-full animate-pulse rounded-xl bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => {
              const image = getImage(product)
              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(16,21,28,0.045)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(16,21,28,0.10)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    {image ? (
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        className="object-contain p-7 transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-2xl text-white">⌁</div>
                      </div>
                    )}
                    {product.category && (
                      <span className="absolute left-3 top-3 rounded-full border border-white/40 bg-slate-950/75 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-white backdrop-blur">
                        {product.category.name}
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="line-clamp-2 text-lg font-black leading-tight tracking-[-0.025em] text-slate-950 transition-colors group-hover:text-[#dc4310]">
                      {product.name}
                    </h3>

                    {product.brand && (
                      <p className="mt-2 text-sm text-slate-500">
                        <span className="font-semibold text-slate-900">{product.brand}</span>
                        {product.car_model ? ` · ${product.car_model}` : ''}
                      </p>
                    )}

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="text-sm font-bold text-slate-500">View details</span>
                      <span className="text-lg font-bold text-[#dc4310] transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="mt-10 rounded-[28px] border border-slate-200 bg-white p-8 text-center">
            <p className="text-sm text-slate-500">The catalogue is ready for your next product additions.</p>
            <Link href="/products" className="mt-4 inline-flex text-sm font-bold text-[#dc4310] hover:underline">Browse the catalogue →</Link>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span className="font-semibold text-slate-700">Need a specific part?</span>
          <span>Share your vehicle model, part number or a clear photo when you contact us.</span>
        </div>
      </div>
    </section>
  )
}
