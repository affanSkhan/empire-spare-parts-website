import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Logo from './Logo'
import { supabase } from '@/lib/supabaseClient'

export default function Navbar() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  const fetchCartCount = async () => {
    if (typeof window === 'undefined') return
    const customerId = localStorage.getItem('customer_id')
    if (!customerId) {
      setCartCount(0)
      return
    }

    try {
      const { count, error } = await supabase
        .from('cart_items')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', customerId)

      if (!error) setCartCount(count || 0)
    } catch (error) {
      console.error('Error fetching cart count:', error)
    }
  }

  useEffect(() => {
    const checkAuth = () => {
      const customerId = localStorage.getItem('customer_id')
      setIsLoggedIn(Boolean(customerId))
      if (customerId) fetchCartCount()
      else setCartCount(0)
    }

    checkAuth()
    window.addEventListener('storage', checkAuth)
    router.events?.on('routeChangeComplete', checkAuth)

    return () => {
      window.removeEventListener('storage', checkAuth)
      router.events?.off('routeChangeComplete', checkAuth)
    }
  }, [router])

  useEffect(() => {
    if (!isLoggedIn) return

    const customerId = localStorage.getItem('customer_id')
    if (!customerId) return

    fetchCartCount()

    const channel = supabase
      .channel(`cart-changes-${customerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
          filter: `customer_id=eq.${customerId}`
        },
        () => fetchCartCount()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isLoggedIn])

  useEffect(() => {
    const handleCartUpdate = () => fetchCartCount()
    window.addEventListener('cart-updated', handleCartUpdate)
    return () => window.removeEventListener('cart-updated', handleCartUpdate)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [router.asPath])

  const showPublicContactDock = !router.pathname.startsWith('/admin') && !router.pathname.startsWith('/customer')

  const navLink = (href, label) => (
    <Link
      href={href}
      className={`relative py-2 text-sm font-semibold transition-colors group ${
        router.pathname === href ? 'text-slate-950' : 'text-slate-600 hover:text-slate-950'
      }`}
    >
      {label}
      <span
        className={`absolute left-0 right-0 -bottom-0.5 h-0.5 origin-left rounded-full bg-[#ff5b22] transition-transform ${
          router.pathname === href ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
        }`}
      />
    </Link>
  )

  return (
    <>
      <div className="bg-[#10151c] text-white">
        <div className="site-shell flex min-h-9 items-center justify-between gap-4 text-[11px] sm:text-xs">
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff5b22]" />
            <span className="truncate font-medium tracking-wide">Car A/C parts • Amravati</span>
          </div>
          <a
            href="tel:+917741077666"
            className="shrink-0 font-bold text-white hover:text-orange-300 transition-colors"
          >
            +91 77410 77666
          </a>
        </div>
      </div>

      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="site-shell">
          <div className="flex h-[72px] items-center justify-between gap-6">
            <Link href="/" className="shrink-0 rounded-xl focus-ring" aria-label="Empire Car A/C home">
              <Logo size="small" />
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              {navLink('/', 'Home')}
              {navLink('/products', 'Parts Catalogue')}
              {navLink('/contact', 'Visit & Contact')}
            </div>

            <div className="hidden sm:flex items-center gap-2">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/customer/dashboard"
                    className="px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-950 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/customer/cart"
                    className="relative inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition-colors"
                  >
                    Cart
                    {cartCount > 0 && (
                      <span className="inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-[#ff5b22] px-1.5 text-[10px] font-black">
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-950 transition-colors"
                  >
                    Customer Login
                  </Link>
                  <Link href="/products" className="btn-primary py-2.5 px-4 text-sm">
                    Find a Part
                  </Link>
                </>
              )}
            </div>

            <button
              type="button"
              className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm focus-ring"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-slate-200 py-4">
              <div className="grid gap-1">
                <Link href="/" className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Home</Link>
                <Link href="/products" className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Parts Catalogue</Link>
                <Link href="/contact" className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Visit & Contact</Link>
                {isLoggedIn ? (
                  <>
                    <Link href="/customer/dashboard" className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Dashboard</Link>
                    <Link href="/customer/cart" className="rounded-xl px-4 py-3 text-sm font-bold text-slate-950 hover:bg-slate-50">
                      Cart {cartCount > 0 ? `(${cartCount})` : ''}
                    </Link>
                  </>
                ) : (
                  <Link href="/auth/login" className="mt-2 rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-bold text-white">
                    Customer Login
                  </Link>
                )}
                <a href="tel:+917741077666" className="mt-2 rounded-xl border border-[#ffd6c7] bg-[#fff5f1] px-4 py-3 text-center text-sm font-bold text-[#dc4310]">
                  Call +91 77410 77666
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>
      {showPublicContactDock && (
        <div className="fixed inset-x-3 bottom-3 z-[60] grid grid-cols-2 gap-2 sm:hidden">
          <a
            href="tel:+917741077666"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-black text-white shadow-2xl ring-1 ring-white/10 backdrop-blur"
          >
            <span className="h-2 w-2 rounded-full bg-[#ff5b22]" />
            Call +91 77410 77666
          </a>
          <a
            href="https://wa.me/917741077666"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3.5 text-sm font-black text-slate-950 shadow-2xl ring-1 ring-slate-200"
          >
            WhatsApp
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      )}
    </>
  )
}
