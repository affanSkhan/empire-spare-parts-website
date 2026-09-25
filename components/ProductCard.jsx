import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'

export default function ProductCard({ product }) {
  const router = useRouter()
  const [addingToCart, setAddingToCart] = useState(false)
  const [showMessage, setShowMessage] = useState(false)

  const getPrimaryImage = () => {
    if (!product.images || product.images.length === 0) return null
    const primary = product.images.find((img) => img.is_primary)
    return primary ? primary.image_url : product.images[0].image_url
  }

  async function handleAddToCart(e) {
    e.preventDefault()
    e.stopPropagation()

    const customerId = localStorage.getItem('customer_id')

    if (!customerId) {
      router.push(`/auth/login?returnUrl=/products`)
      return
    }

    setAddingToCart(true)

    try {
      const { data: existingItem, error: checkError } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('customer_id', customerId)
        .eq('product_id', product.id)
        .maybeSingle()

      if (checkError) throw checkError

      if (existingItem) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert([{ customer_id: customerId, product_id: product.id, quantity: 1 }])

        if (error) throw error
      }

      window.dispatchEvent(new Event('cart-updated'))
      setShowMessage(true)
      setTimeout(() => setShowMessage(false), 2200)
    } catch (error) {
      console.error('Add to cart error:', error)
      alert('Failed to add to cart')
    } finally {
      setAddingToCart(false)
    }
  }

  const buildProductUrl = () => {
    const { category, search } = router.query
    const query = new URLSearchParams()
    if (category) query.set('category', category)
    if (search) query.set('search', search)

    const queryString = query.toString()
    return `/products/${product.slug}${queryString ? `?${queryString}` : ''}`
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(16,21,28,0.045)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(16,21,28,0.1)]">
      <Link href={buildProductUrl()} className="block focus:outline-none focus:ring-4 focus:ring-blue-100">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#f4f6f8]">
          {getPrimaryImage() ? (
            <Image
              src={getPrimaryImage()}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-2xl text-white">⌁</div>
            </div>
          )}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            {product.category ? (
              <span className="rounded-full border border-white/30 bg-slate-950/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur">
                {product.category.name}
              </span>
            ) : <span />}
            <span className="rounded-full border border-white/60 bg-white/85 px-2.5 py-1 text-[10px] font-bold text-slate-700 backdrop-blur">
              View part
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/25 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <Link href={buildProductUrl()} className="focus:outline-none">
          <h3 className="line-clamp-2 text-lg font-black leading-tight tracking-[-0.025em] text-slate-950 transition-colors group-hover:text-[#dc4310]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3 space-y-2">
          {product.brand && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff5b22]" />
              <span className="truncate"><span className="font-semibold text-slate-900">Brand:</span> {product.brand}</span>
            </div>
          )}
          {product.car_model && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span className="truncate"><span className="font-semibold text-slate-900">Vehicle:</span> {product.car_model}</span>
            </div>
          )}
        </div>

        {product.description && (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
            {product.description}
          </p>
        )}

        <div className="mt-5 flex items-center gap-2">
          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className="btn-primary min-w-0 flex-1 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {showMessage ? (
              <>
                <span aria-hidden="true">✓</span> Added
              </>
            ) : addingToCart ? (
              'Adding…'
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add to cart
              </>
            )}
          </button>

          <Link
            href={buildProductUrl()}
            aria-label={`View details for ${product.name}`}
            className="focus-ring inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
          >
            →
          </Link>
        </div>
      </div>
    </article>
  )
}
