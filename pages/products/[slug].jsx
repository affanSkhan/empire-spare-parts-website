import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'

const whatsappNumber = '917741077666'
const phoneNumber = '+917741077666'
const fallbackImages = [
  '/showcase/wiring-socket.jpg',
  '/showcase/blower-resistance.jpg',
  '/showcase/radiator-fan.jpg',
  '/showcase/motor-gear.jpg'
]

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

    try {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*, category:categories(id, name, slug)')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (productError || !productData) {
        setNotFound(true)
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
      setSelectedImage(imageList.find((image) => image.is_primary)?.image_url || imageList[0]?.image_url || fallbackImages[0])

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
    } catch (error) {
      console.error('[ProductDetails]', error)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  function getWhatsAppLink() {
    if (!product) return '#'
    const message = 'Hello Empire Car A/C, I need details for: ' + product.name + (product.car_model ? ' (' + product.car_model + ')' : '') + '.'
    return 'https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent(message)
  }

  async function handleAddToCart() {
    const customerId = localStorage.getItem('customer_id')

    if (!customerId) {
      router.push('/auth/login?returnUrl=' + encodeURIComponent(router.asPath))
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
      setCartMessage('Could not add this part: ' + error.message)
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
    return '/products' + (queryString ? '?' + queryString : '')
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#f4f2ee] py-12">
          <div className="site-shell grid gap-6 lg:grid-cols-2">
            <div className="aspect-square rounded-[34px] bg-white ring-1 ring-black/10">
              <div className="flex h-full items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-black/10 border-t-[#ff5b1f]" />
              </div>
            </div>
            <div className="space-y-5">
              <div className="h-5 w-24 animate-pulse rounded-full bg-[#e6e2d9]" />
              <div className="h-14 w-4/5 animate-pulse rounded-2xl bg-[#e6e2d9]" />
              <div className="h-28 animate-pulse rounded-2xl bg-[#e6e2d9]" />
              <div className="h-14 w-full animate-pulse rounded-full bg-[#e6e2d9]" />
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
          <title>Part Not Found | Empire Car A/C</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <Navbar />
        <main className="min-h-[72vh] bg-[#f4f2ee]">
          <div className="site-shell flex min-h-[72vh] items-center justify-center py-16">
            <div className="max-w-md text-center">
              <span className="text-7xl font-black tracking-[-.07em] text-black/10">404</span>
              <h1 className="mt-3 text-3xl font-black tracking-[-.045em]">Part not found.</h1>
              <p className="mt-3 text-sm leading-6 text-[#68727f]">This component is no longer active. Browse the current catalogue or ask Empire to help identify it.</p>
              <div className="mt-7 flex justify-center gap-3">
                <Link href="/products" className="btn-primary">Browse parts</Link>
                <a href="tel:+917741077666" className="btn-secondary">Call Empire</a>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const pageTitle = product.name + ' | Empire Car A/C'
  const pageDescription = product.description || product.name + ' automotive component. Contact Empire Car A/C in Amravati for availability and fitment guidance.'
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: pageDescription,
    image: images.map((image) => image.image_url).filter(Boolean),
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    category: product.category?.name,
    url: 'https://www.empirecarac.in/products/' + product.slug
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
        <meta property="og:url" content={'https://www.empirecarac.in/products/' + product.slug} />
        <link rel="canonical" href={'https://www.empirecarac.in/products/' + product.slug} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      </Head>

      <Navbar />

      <main className="bg-[#f4f2ee]">
        <div className="site-shell py-5 sm:py-7">
          <nav aria-label="Breadcrumb" className="text-xs font-bold text-[#68727f]">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href="/" className="hover:text-[#0b0f13]">Home</Link></li>
              <li className="text-black/20">/</li>
              <li><Link href={buildBackUrl()} className="hover:text-[#0b0f13]">Parts</Link></li>
              {product.category && <><li className="text-black/20">/</li><li>{product.category.name}</li></>}
              <li className="text-black/20">/</li>
              <li className="max-w-[260px] truncate text-[#0b0f13]">{product.name}</li>
            </ol>
          </nav>
        </div>

        <section className="border-y border-black/10 bg-white">
          <div className="site-shell grid gap-10 py-8 sm:py-12 lg:grid-cols-[1.04fr_.96fr] lg:gap-14 lg:py-14">
            <div>
              <div className="relative aspect-square overflow-hidden rounded-[36px] bg-[#ece9e2] ring-1 ring-black/10">
                <img
                  src={selectedImage || fallbackImages[0]}
                  alt={product.name}
                  className="absolute inset-0 h-full w-full object-contain p-10 sm:p-14"
                  onError={(event) => {
                    const fallback = fallbackImages[0]
                    if (event.currentTarget.src !== window.location.origin + fallback) {
                      event.currentTarget.src = fallback
                    }
                  }}
                />

                <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                  {product.category && (
                    <span className="rounded-full bg-[#0b0f13]/85 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.15em] text-white backdrop-blur-xl">{product.category.name}</span>
                  )}
                  {product.brand && (
                    <span className="rounded-full bg-white/90 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.15em] text-[#0b0f13] ring-1 ring-black/10 backdrop-blur-xl">{product.brand}</span>
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
                      className={
                        'relative aspect-square overflow-hidden rounded-2xl border bg-white ' +
                        (selectedImage === image.image_url ? 'border-[#ff5b1f] ring-2 ring-[#ff5b1f]/20' : 'border-black/10')
                      }
                    >
                      <img
                        src={image.image_url || fallbackImages[index % fallbackImages.length]}
                        alt={product.name + ' view ' + (index + 1)}
                        className="h-full w-full object-contain p-2"
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.src = fallbackImages[(index + 1) % fallbackImages.length]
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}

              <p className="mt-3 text-[11px] font-semibold text-[#9aa2ac]">
                {images.length ? images.length + ' product image' + (images.length === 1 ? '' : 's') : 'Using a catalogue fallback image while product imagery is unavailable'}
              </p>
            </div>

            <div className="lg:sticky lg:top-[105px] lg:self-start">
              <span className="eyebrow">Component details</span>
              <h1 className="mt-5 text-5xl font-black leading-[.91] tracking-[-.06em] sm:text-6xl">{product.name}</h1>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {product.brand && (
                  <div className="rounded-2xl border border-black/10 bg-[#f8f7f4] p-4">
                    <p className="text-[9px] font-black uppercase tracking-[.16em] text-[#9aa2ac]">Brand</p>
                    <p className="mt-2 text-sm font-black">{product.brand}</p>
                  </div>
                )}
                {product.car_model && (
                  <div className="rounded-2xl border border-black/10 bg-[#f8f7f4] p-4">
                    <p className="text-[9px] font-black uppercase tracking-[.16em] text-[#9aa2ac]">Vehicle / fitment</p>
                    <p className="mt-2 text-sm font-black">{product.car_model}</p>
                  </div>
                )}
              </div>

              {product.description && (
                <div className="mt-5 rounded-[26px] border border-black/10 bg-white p-6">
                  <p className="text-[9px] font-black uppercase tracking-[.16em] text-[#9aa2ac]">About this part</p>
                  <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#68727f] sm:text-base">{product.description}</p>
                </div>
              )}

              <div className="mt-5 rounded-[26px] border border-[#ffc8ae] bg-[#fff4ee] p-5">
                <p className="text-sm font-black text-[#0b0f13]">Confirm before ordering</p>
                <p className="mt-1 text-sm leading-6 text-[#68727f]">Stock and pricing can change. Share the vehicle details when you contact Empire so the component can be checked.</p>
              </div>

              {cartMessage && (
                <div className={'mt-5 rounded-2xl border p-4 text-sm font-bold ' + (cartMessage.startsWith('Added') ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800')}>
                  {cartMessage}
                </div>
              )}

              <div className="mt-6 rounded-[26px] border border-black/10 bg-white p-5">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[.16em] text-[#9aa2ac]">Quantity</p>
                    <div className="mt-2 inline-flex overflow-hidden rounded-full border border-black/10">
                      <button type="button" className="h-11 w-11 font-black text-[#596472] hover:bg-[#f4f2ee] disabled:opacity-25" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={quantity <= 1}>−</button>
                      <span className="flex h-11 w-11 items-center justify-center border-x border-black/10 text-sm font-black">{quantity}</span>
                      <button type="button" className="h-11 w-11 font-black text-[#596472] hover:bg-[#f4f2ee]" onClick={() => setQuantity((value) => value + 1)}>+</button>
                    </div>
                  </div>

                  <div className="flex w-full flex-col gap-2 sm:w-[245px]">
                    <button type="button" onClick={handleAddToCart} disabled={addingToCart} className="btn-primary w-full disabled:opacity-50">{addingToCart ? 'Adding…' : 'Add to cart'}</button>
                    <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full">Ask on WhatsApp ↗</a>
                  </div>
                </div>
              </div>

              <a href={'tel:' + phoneNumber} className="mt-4 flex items-center justify-between rounded-[22px] bg-[#0b0f13] px-5 py-4 text-white transition-transform duration-300 hover:-translate-y-0.5">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[.16em] text-white/35">Need help matching it?</p>
                  <p className="mt-1 text-sm font-black">+91 77410 77666</p>
                </div>
                <span className="text-lg">→</span>
              </a>
            </div>
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="site-shell py-16 sm:py-20">
            <div className="flex items-end justify-between gap-5">
              <div>
                <span className="eyebrow">More to explore</span>
                <h2 className="mt-4 text-3xl font-black tracking-[-.045em] sm:text-4xl">More in this category.</h2>
              </div>
              {product.category && <Link href={'/products?category=' + product.category.id} className="text-sm font-black text-[#dc4310] hover:underline">View category →</Link>}
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((item) => <ProductCard key={item.id} product={item} />)}
            </div>
          </section>
        )}

        <section className="border-t border-black/10 bg-white py-12">
          <div className="site-shell">
            <div className="flex flex-col gap-6 rounded-[30px] bg-[#ece9e2] p-7 sm:p-9 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[.18em] text-[#ff5b1f]">Fitment help</p>
                <h2 className="mt-2 text-2xl font-black tracking-[-.04em]">Not sure this is the right component?</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68727f]">Send the vehicle details or old-part photo before ordering.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="btn-primary">WhatsApp Empire</a>
                <a href={'tel:' + phoneNumber} className="btn-secondary">Call the shop</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
