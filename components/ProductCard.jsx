import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'

const fallbackImages = [
  '/showcase/blower-resistance.jpg',
  '/showcase/blower-resistance.jpg',
  '/showcase/radiator-fan.jpg',
  '/showcase/radiator-fan.jpg'
]

export default function ProductCard({ product }) {
  const router = useRouter()
  const [addingToCart, setAddingToCart] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const [imageIndex, setImageIndex] = useState(0)

  const remoteImage = product.images?.find((img) => img.is_primary)?.image_url || product.images?.[0]?.image_url || null
  const fallbackIndex = Number(product.id?.toString().slice(-2) || 0) % fallbackImages.length
  const imageSrc = imageIndex === 0
    ? (remoteImage || fallbackImages[fallbackIndex])
    : fallbackImages[(fallbackIndex + imageIndex) % fallbackImages.length]

  async function handleAddToCart(event) {
    event.preventDefault()
    event.stopPropagation()

    const customerId = localStorage.getItem('customer_id')
    if (!customerId) {
      router.push('/auth/login?returnUrl=/products')
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
    return '/products/' + product.slug + (queryString ? '?' + queryString : '')
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_10px_30px_rgba(11,15,19,.05)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_54px_rgba(11,15,19,.10)]">
      <Link href={buildProductUrl()} className="block focus:outline-none">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#ece9e2]">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-contain p-7 transition-transform duration-700 group-hover:scale-105"
              onError={() => {
                if (imageIndex < fallbackImages.length) setImageIndex((value) => value + 1)
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#0b0f13] text-2xl text-white">⌁</div>
            </div>
          )}

          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
            {product.category ? (
              <span className="rounded-full border border-white/30 bg-[#0b0f13]/75 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.14em] text-white backdrop-blur-xl">
                {product.category.name}
              </span>
            ) : <span />}

            <span className="rounded-full border border-white/70 bg-white/88 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.12em] text-[#0b0f13] backdrop-blur-xl">
              View part
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link href={buildProductUrl()}>
          <h3 className="line-clamp-2 text-lg font-black leading-[1.05] tracking-[-.03em] text-[#0b0f13] transition-colors duration-300 group-hover:text-[#dc4310]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3 space-y-1.5">
          {product.brand && (
            <p className="truncate text-sm text-[#68727f]">
              <span className="font-black text-[#0b0f13]">Brand</span> · {product.brand}
            </p>
          )}
          {product.car_model && (
            <p className="truncate text-sm text-[#68727f]">
              <span className="font-black text-[#0b0f13]">Vehicle</span> · {product.car_model}
            </p>
          )}
        </div>

        {product.description && (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#68727f]">{product.description}</p>
        )}

        <div className="mt-6 flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={addingToCart}
            className="btn-primary min-w-0 flex-1 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {showMessage ? '✓ Added' : addingToCart ? 'Adding…' : 'Add to cart'}
          </button>

          <Link
            href={buildProductUrl()}
            aria-label={'View details for ' + product.name}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10 text-[#596472] transition-all duration-300 hover:-translate-y-0.5 hover:border-black/20 hover:bg-[#f4f2ee] hover:text-[#0b0f13]"
          >
            →
          </Link>
        </div>
      </div>
    </article>
  )
}
