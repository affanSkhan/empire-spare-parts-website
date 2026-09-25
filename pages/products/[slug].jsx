import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import { supabase } from '@/lib/supabaseClient'

const whatsappNumber = '917741077666'
const phoneNumber = '+917741077666'

export default function ProductDetailsPage() {
  const router = useRouter()
  const { slug } = router.query

  const [product, setProduct] = useState(null)
  const [images, setImages] = useState([])
  const [relatedProducts, setRelatedProducts] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [cartMessage, setCartMessage] = useState('')

  useEffect(() => {
    if (slug) fetchProduct()
  }, [slug])

  async function fetchProduct() {
    setLoading(true)
    setNotFound(false)

    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('*, category:categories(id, name, slug)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (productError || !productData) {
      setNotFound(true)
      setLoading(false)
      return
    }

    const { data: imagesData } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productData.id)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true })

    const imageList = imagesData || []

    setProduct(productData)
    setImages(imageList)
    setSelectedImage(imageList.find((image) => image.is_primary)?.image_url || imageList[0]?.image_url || null)

    if (productData.category_id) {
      const { data: relatedData } = await supabase
        .from('products')
        .select('*, category:categories(id, name, slug), images:product_images(image_url, is_primary)')
        .eq('is_active', true)
        .eq('category_id', productData.category_id)
        .neq('id', productData.id)
        .order('created_at', { ascending: false })
        .limit(3)

      setRelatedProducts(relatedData || [])
    }

    setLoading(false)
  }

  function getWhatsAppLink() {
    if (!product) return '#'
    const message = `Hello Empire Car A/C, I need details for: ${product.name}${product.car_model ? ` (${product.car_model})` : ''}.`
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
  }

  async function handleAddToCart() {
    const customerId = localStorage.getItem('customer_id')

    if (!customerId) {
      router.push(`/auth/login?returnUrl=${router.asPath}`)
      return
    }

    setAddingToCart(true)
    setCartMessage('')

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
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert([{ customer_id: customerId, product_id: product.id, quantity }])

        if (error) throw error
      }

      window.dispatchEvent(new Event('cart-updated'))
      setCartMessage('Added to your cart.')
      setTimeout(() => setCartMessage(''), 3200)
    } catch (error) {
      console.error('Add to cart error:', error)
      setCartMessage(`Could not add this part: ${error.message}`)
    } finally {
      setAddingToCart(false)
    }
  }

  const buildBackUrl = () => {
    const { category, search } = router.query
    const query = new URLSearchParams()
    if (category) query.set('category', category)
    if (search) query.set('search', search)

    const queryString = query.toString()
    return `/products${queryString ? `?${queryString}` : ''}`
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#f7f8fa] py-12">
          <div className="site-shell grid gap-6 lg:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-[30px] bg-white ring-1 ring-slate-200" />
            <div className="space-y-5">
              <div className="h-6 w-28 animate-pulse rounded-full bg-slate-200" />
              <div className="h-12 w-4/5 animate-pulse rounded-xl bg-slate-200" />
              <div className="h-28 animate-pulse rounded-2xl bg-slate-200" />
              <div className="h-14 w-full animate-pulse rounded-xl bg-slate-200" />
              <div className="h-14 w-full animate-pulse rounded-xl bg-slate-200" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (notFound || !product) {
    return (
      <>
        <Head>
          <title>Product Not Found | Empire Car A/C</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <Navbar />
        <main className="min-h-screen bg-white">
          <div className="site-shell flex min-h-[60vh] items-center justify-center py-16">
            <div className="max-w-md text-center">
              <span className="text-6xl font-black tracking-[-0.06em] text-slate-200">404</span>
              <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950">Part not found.</h1>
              <p className="mt-3 text-sm leading-6 text-slate-500">This product may no longer be active. Browse the current catalogue or contact Empire for help.</p>
              <Link href="/products" className="btn-primary mt-7">Back to catalogue</Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const pageTitle = `${product.name} | Empire Car A/C`
  const pageDescription = product.description || `${product.name} car A/C and automotive component. Contact Empire Car A/C in Amravati for current availability and fitment guidance.`
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: pageDescription,
    image: images.map((image) => image.image_url).filter(Boolean),
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    category: product.category?.name,
    url: `https://www.empirecarac.in/products/${product.slug}`
  }

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={[product.name, product.brand, product.car_model, 'car AC parts', 'Amravati'].filter(Boolean).join(', ')} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={`https://www.empirecarac.in/products/${product.slug}`} />
        {selectedImage && <meta property="og:image" content={selectedImage} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        {selectedImage && <meta name="twitter:image" content={selectedImage} />}
        <link rel="canonical" href={`https://www.empirecarac.in/products/${product.slug}`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      </Head>

      <Navbar />

      <main className="min-h-screen bg-white">
        <div className="site-shell py-5 sm:py-7">
          <nav aria-label="Breadcrumb" className="text-xs font-semibold text-slate-500">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href="/" className="hover:text-slate-950">Home</Link></li>
              <li className="text-slate-300">/</li>
              <li><Link href={buildBackUrl()} className="hover:text-slate-950">Parts catalogue</Link></li>
              {product.category && (
                <>
                  <li className="text-slate-300">/</li>
                  <li>{product.category.name}</li>
                </>
              )}
              <li className="text-slate-300">/</li>
              <li className="max-w-[220px] truncate text-slate-950" title={product.name}>{product.name}</li>
            </ol>
          </nav>
        </div>

        <section className="border-y border-slate-200 bg-[#f7f8fa]">
          <div className="site-shell grid gap-8 py-8 sm:py-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-12 lg:py-12">
            {/* Gallery */}
            <div>
              <div className="relative aspect-square overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_14px_40px_rgba(16,21,28,0.06)]">
                {selectedImage ? (
                  <Image
                    src={selectedImage}
                    alt={product.name}
                    fill
                    priority
                    className="object-contain p-8 sm:p-12 lg:p-14"
                    sizes="(max-width: 1024px) 100vw, 55vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-slate-50 text-center">
                    <div>
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-white">⌁</div>
                      <p className="mt-4 text-sm font-semibold text-slate-500">No product image available</p>
                    </div>
                  </div>
                )}

                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  {product.category && (
                    <Link
                      href={`/products?category=${product.category.id}`}
                      className="rounded-full border border-white/50 bg-slate-950/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-white backdrop-blur"
                    >
                      {product.category.name}
                    </Link>
                  )}
                  {product.brand && (
                    <span className="rounded-full border border-slate-200/80 bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-slate-700 backdrop-blur">
                      {product.brand}
                    </span>
                  )}
                </div>
              </div>

              {images.length > 1 && (
                <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                  {images.map((image, index) => (
                    <button
                      type="button"
                      key={image.id || image.image_url}
                      onClick={() => setSelectedImage(image.image_url)}
                      className={`relative aspect-square overflow-hidden rounded-2xl border bg-white transition-all focus:outline-none focus:ring-4 focus:ring-blue-100 ${
                        selectedImage === image.image_url
                          ? 'border-[#ff5b22] ring-2 ring-[#ffb196]'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      aria-label={`View product image ${index + 1}`}
                    >
                      <Image
                        src={image.image_url}
                        alt={`${product.name} view ${index + 1}`}
                        fill
                        className="object-contain p-2"
                        sizes="120px"
                      />
                    </button>
                  ))}
                </div>
              )}

              <p className="mt-3 text-xs text-slate-400">
                {images.length > 0 ? `${images.length} product image${images.length === 1 ? '' : 's'}` : 'Product imagery will be added when available'}
              </p>
            </div>

            {/* Product information */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <span className="eyebrow">Part details</span>
              <h1 className="mt-4 text-4xl font-black leading-[1.02] tracking-[-0.05em] text-slate-950 sm:text-5xl">
                {product.name}
              </h1>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {product.brand && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Brand</p>
                    <p className="mt-1 text-sm font-bold text-slate-950">{product.brand}</p>
                  </div>
                )}
                {product.car_model && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Vehicle / fitment</p>
                    <p className="mt-1 text-sm font-bold text-slate-950">{product.car_model}</p>
                  </div>
                )}
              </div>

              {product.description && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                  <h2 className="text-sm font-black uppercase tracking-[0.14em] text-slate-400">About this part</h2>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600 sm:text-base">{product.description}</p>
                </div>
              )}

              <div className="mt-5 rounded-2xl border border-[#ffd6c7] bg-[#fff7f3] p-5">
                <div className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ff5b22] text-sm font-black text-white">i</span>
                  <div>
                    <h2 className="text-sm font-black text-slate-950">Confirm price & availability</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Stock and pricing can change. Contact Empire with your vehicle details before ordering a part.
                    </p>
                  </div>
                </div>
              </div>

              {cartMessage && (
                <div className={`mt-5 rounded-2xl border p-4 text-sm font-semibold ${
                  cartMessage.startsWith('Added')
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-red-200 bg-red-50 text-red-800'
                }`}>
                  {cartMessage}
                </div>
              )}

              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_26px_rgba(16,21,28,0.04)]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Quantity</p>
                    <div className="mt-2 inline-flex items-center rounded-xl border border-slate-200 bg-white">
                      <button
                        type="button"
                        className="h-11 w-11 text-lg font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                        onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                        disabled={quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="flex h-11 w-11 items-center justify-center border-x border-slate-200 text-sm font-black text-slate-950">{quantity}</span>
                      <button
                        type="button"
                        className="h-11 w-11 text-lg font-bold text-slate-600 hover:bg-slate-50"
                        onClick={() => setQuantity((value) => value + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex w-full flex-col gap-2 sm:w-[230px]">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={addingToCart}
                      className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {addingToCart ? 'Adding…' : 'Add to cart'}
                    </button>
                    <a
                      href={getWhatsAppLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary w-full"
                    >
                      Ask on WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              <a
                href={`tel:${phoneNumber}`}
                className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-950 px-5 py-4 text-white transition-colors hover:bg-slate-800"
              >
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Need help matching it?</p>
                  <p className="mt-1 text-sm font-bold">Call +91 77410 77666</p>
                </div>
                <span className="text-xl" aria-hidden="true">→</span>
              </a>

              <Link href={buildBackUrl()} className="mt-4 inline-flex text-sm font-bold text-slate-500 hover:text-slate-950">
                ← Back to parts catalogue
              </Link>
            </div>
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="site-shell py-14 sm:py-16 lg:py-20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="eyebrow">More to explore</span>
                <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-950">More parts in this category.</h2>
              </div>
              {product.category && (
                <Link href={`/products?category=${product.category.id}`} className="text-sm font-bold text-[#dc4310] hover:underline">
                  View category →
                </Link>
              )}
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}

        <section className="border-t border-slate-200 bg-[#f7f8fa] py-12">
          <div className="site-shell">
            <div className="flex flex-col gap-6 rounded-[28px] bg-white p-7 ring-1 ring-slate-200 sm:p-9 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#dc4310]">Not sure this is the right fit?</p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-slate-950">Share the vehicle details or old-part photo.</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Small fitment differences can matter. Use WhatsApp or call the shop before placing an order.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
                <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="btn-primary">WhatsApp Empire</a>
                <a href={`tel:${phoneNumber}`} className="btn-secondary">Call the shop</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
