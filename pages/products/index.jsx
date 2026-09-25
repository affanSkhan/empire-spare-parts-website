import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import CategoryFilter from '@/components/CategoryFilter'
import { supabase } from '@/lib/supabaseClient'

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [totalProducts, setTotalProducts] = useState(0)

  useEffect(() => {
    if (!router.isReady) return
    const { category, search } = router.query
    setSelectedCategory(category || 'all')
    const nextSearch = search || ''
    setSearchTerm(nextSearch)
    setSearchInput(nextSearch)
  }, [router.isReady, router.query.category, router.query.search])

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (router.isReady) fetchProducts()
  }, [selectedCategory, searchTerm, router.isReady])

  async function fetchCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (!error && data) setCategories(data)
  }

  async function fetchProducts() {
    setLoading(true)

    let query = supabase
      .from('products')
      .select(
        `
          *,
          category:categories(id, name, slug),
          images:product_images(image_url, is_primary)
        `,
        { count: 'exact' }
      )
      .eq('is_active', true)

    if (selectedCategory !== 'all') {
      query = query.eq('category_id', selectedCategory)
    }

    if (searchTerm.trim()) {
      const safeSearch = searchTerm.trim().replace(/[,%]/g, ' ')
      query = query.or(
        `name.ilike.%${safeSearch}%,brand.ilike.%${safeSearch}%,car_model.ilike.%${safeSearch}%`
      )
    }

    query = query.order('created_at', { ascending: false })

    const { data, error, count } = await query

    if (!error && data) {
      setProducts(data)
      setTotalProducts(count || 0)
    } else {
      setProducts([])
      setTotalProducts(0)
    }

    setLoading(false)
  }

  function applyFilters(category = selectedCategory, search = searchTerm) {
    const query = {}
    const cleanSearch = search.trim()

    if (category && category !== 'all') query.category = category
    if (cleanSearch) query.search = cleanSearch

    router.push({ pathname: '/products', query }, undefined, { shallow: true })
  }

  function handleCategoryChange(category) {
    setSelectedCategory(category)
    applyFilters(category, searchTerm)
  }

  function clearSearch() {
    setSelectedCategory('all')
    setSearchTerm('')
    setSearchInput('')
    router.push('/products', undefined, { shallow: true })
  }

  return (
    <>
      <Head>
        <title>Car A/C Parts Catalogue | Empire Car A/C — Amravati</title>
        <meta
          name="description"
          content="Browse Empire Car A/C's active catalogue of car air-conditioning spare parts and automotive components in Amravati. Search by part, brand or vehicle."
        />
        <meta
          name="keywords"
          content="car AC parts Amravati, AC spare parts, AC compressor, AC condenser, blower resistor, automotive parts"
        />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Car A/C Parts Catalogue | Empire Car A/C" />
        <meta property="og:description" content="Search car A/C parts by part name, brand or vehicle." />
        <meta property="og:url" content="https://www.empirecarac.in/products" />
        <link rel="canonical" href="https://www.empirecarac.in/products" />
      </Head>

      <Navbar />

      <main className="min-h-screen bg-white">
        {/* Catalogue header */}
        <section className="bg-[#10151c] text-white">
          <div className="site-shell py-12 sm:py-16 lg:py-20">
            <div className="grid gap-8 lg:grid-cols-[1fr_430px] lg:items-end">
              <div>
                <span className="eyebrow !text-[#ff8e68]">Parts catalogue</span>
                <h1 className="mt-4 max-w-3xl text-balance text-4xl font-black tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                  Find the component you need.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  Search across the active Empire Car A/C catalogue using a part name, brand or vehicle model. Open a part to review its details and ask about current availability.
                </p>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
                <form
                  onSubmit={(event) => {
                    event.preventDefault()
                    applyFilters(selectedCategory, searchInput)
                  }}
                  className="rounded-[20px] bg-white p-3"
                >
                  <div className="flex gap-2">
                    <input
                      id="search"
                      type="search"
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                      placeholder="e.g. Swift condenser"
                      className="input-field min-w-0 flex-1 border-0 !shadow-none !ring-0"
                      aria-label="Search parts"
                    />
                    <button type="submit" className="btn-primary shrink-0 px-4">
                      Search
                    </button>
                  </div>
                </form>

                <div className="mt-4 flex items-center justify-between gap-4 text-xs text-slate-400">
                  <span>Search by part / brand / vehicle</span>
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="font-bold text-white hover:text-orange-200"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Controls */}
        <section className="border-b border-slate-200 bg-[#f7f8fa]">
          <div className="site-shell py-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Browse</span>
                  <Link
                    href="/products"
                    className={`rounded-full px-3.5 py-2 text-xs font-bold transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-slate-950 text-white'
                        : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    All parts
                  </Link>
                  {categories.slice(0, 6).map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleCategoryChange(category.id)}
                      className={`rounded-full px-3.5 py-2 text-xs font-bold transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-[#ff5b22] text-white'
                          : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>

                {categories.length > 6 && (
                  <div className="mt-4 max-w-xs">
                    <CategoryFilter
                      categories={categories}
                      selectedCategory={selectedCategory}
                      onCategoryChange={handleCategoryChange}
                    />
                  </div>
                )}
              </div>

              <div className="text-sm text-slate-500 lg:text-right">
                <span className="font-black text-slate-950">{totalProducts}</span> active part{totalProducts === 1 ? '' : 's'} found
              </div>
            </div>

            {(searchTerm || selectedCategory !== 'all') && (
              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Filters</span>
                {searchTerm && (
                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                    “{searchTerm}”
                  </span>
                )}
                {selectedCategory !== 'all' && (
                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                    {categories.find((category) => category.id === selectedCategory)?.name || 'Category'}
                  </span>
                )}
                <button type="button" onClick={clearSearch} className="text-xs font-bold text-[#dc4310] hover:underline">
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Products */}
        <section className="site-shell py-10 sm:py-12 lg:py-16">
          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="aspect-[4/3] animate-pulse bg-slate-100" />
                  <div className="space-y-3 p-5">
                    <div className="h-5 w-4/5 animate-pulse rounded bg-slate-100" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                    <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                    <div className="h-11 w-full animate-pulse rounded-xl bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-[28px] border border-slate-200 bg-[#f7f8fa] px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-xl text-white">⌕</div>
              <h2 className="mt-6 text-2xl font-black tracking-[-0.03em] text-slate-950">No matching parts</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Try a broader part name or vehicle model. You can also contact Empire directly for help identifying a component.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <button type="button" onClick={clearSearch} className="btn-primary">
                  Reset search
                </button>
                <a href="tel:+917741077666" className="btn-secondary">
                  Call +91 77410 77666
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Enquiry strip */}
        {!loading && (
          <section className="border-t border-slate-200 bg-white py-12 sm:py-16">
            <div className="site-shell">
              <div className="grid overflow-hidden rounded-[28px] bg-[#f7f8fa] lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="p-7 sm:p-9">
                  <span className="eyebrow">Can’t find it?</span>
                  <h2 className="mt-4 text-2xl font-black tracking-[-0.035em] text-slate-950 sm:text-3xl">
                    Tell us the car and part.
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    A vehicle model, old part name/number or a clear photo can make an enquiry much easier.
                  </p>
                </div>
                <div className="flex flex-col gap-3 p-7 sm:flex-row sm:p-9 lg:flex-col">
                  <a href="tel:+917741077666" className="btn-primary whitespace-nowrap">
                    Call +91 77410 77666
                  </a>
                  <a
                    href="https://wa.me/917741077666"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary whitespace-nowrap"
                  >
                    WhatsApp enquiry
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  )
}
