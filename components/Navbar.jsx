import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Logo from './Logo'
import { supabase } from '@/lib/supabaseClient'

export default function Navbar() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [scrolled, setScrolled] = useState(false)

  const isHome = router.pathname === '/'
  const lightHero = isHome && !scrolled

  const fetchCartCount = async () => {
    if (typeof window === 'undefined') return
    const customerId = localStorage.getItem('customer_id')
    if (!customerId) {
      setCartCount(0)
      return
    }
    const response = await supabase
      .from('cart_items')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', customerId)

    if (!response.error) setCartCount(response.count || 0)
  }

  useEffect(() => {
    const checkAuth = () => {
      const customerId = localStorage.getItem('customer_id')
      setIsLoggedIn(Boolean(customerId))
      if (customerId) fetchCartCount()
      else setCartCount(0)
    }

    const onScroll = () => setScrolled(window.scrollY > 48)

    checkAuth()
    onScroll()

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('storage', checkAuth)
    router.events.on('routeChangeComplete', checkAuth)
    window.addEventListener('cart-updated', fetchCartCount)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('storage', checkAuth)
      router.events.off('routeChangeComplete', checkAuth)
      window.removeEventListener('cart-updated', fetchCartCount)
    }
  }, [router.events])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [router.asPath])

  useEffect(() => {
    if (!isLoggedIn) return
    const customerId = localStorage.getItem('customer_id')
    if (!customerId) return

    const channel = supabase
      .channel('cart-nav-' + customerId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
          filter: 'customer_id=eq.' + customerId
        },
        fetchCartCount
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [isLoggedIn])

  const navLink = (href, label) => (
    <Link
      href={href}
      className={
        'group relative py-2 text-[13px] font-black tracking-[-0.01em] transition-colors duration-300 ' +
        (lightHero ? 'text-white/72 hover:text-white' : 'text-[#596472] hover:text-[#0b0f13]')
      }
    >
      {label}
      <span
        className={
          'absolute -bottom-1 left-0 h-px w-full origin-left bg-[#ff5b1f] transition-transform duration-500 ' +
          (router.pathname === href ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100')
        }
      />
    </Link>
  )

  return (
    <>
      <header
        className={
          'fixed inset-x-0 top-0 z-50 transition-all duration-700 ' +
          (lightHero
            ? 'bg-transparent'
            : 'border-b border-black/[.06] bg-[#f4f2ee]/90 shadow-[0_12px_40px_rgba(11,15,19,.05)] backdrop-blur-2xl')
        }
      >
        <div className="site-shell">
          <div className="flex h-[82px] items-center justify-between gap-6">
            <Link href="/" aria-label="Empire Car A/C home" className="shrink-0">
              <Logo size="small" light={lightHero} />
            </Link>

            <nav className="hidden items-center gap-9 lg:flex">
              {navLink('/', 'Home')}
              {navLink('/products', 'Parts')}
              {navLink('/contact', 'Visit & Contact')}
            </nav>

            <div className="hidden items-center gap-2 sm:flex">
              {isLoggedIn && (
                <Link
                  href="/customer/cart"
                  className={
                    'rounded-full px-4 py-2.5 text-[13px] font-black transition-colors ' +
                    (lightHero ? 'text-white/75 hover:bg-white/10 hover:text-white' : 'text-[#596472] hover:bg-black/[.04] hover:text-[#0b0f13]')
                  }
                >
                  Cart {cartCount > 0 ? '(' + cartCount + ')' : ''}
                </Link>
              )}

              <Link
                href={isLoggedIn ? '/customer/dashboard' : '/auth/login'}
                className={
                  'rounded-full px-5 py-3 text-[13px] font-black transition-all duration-500 ' +
                  (lightHero
                    ? 'border border-white/18 bg-white/[.06] text-white hover:-translate-y-0.5 hover:bg-white/[.10]'
                    : 'border border-black/10 bg-white text-[#0b0f13] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(11,15,19,.07)]')
                }
              >
                {isLoggedIn ? 'Account' : 'Customer Login'}
              </Link>

              <Link
                href="/products"
                className="magnetic rounded-full bg-[#ff5b1f] px-5 py-3 text-[13px] font-black text-white shadow-[0_12px_32px_rgba(255,91,31,.18)] transition-all duration-500 hover:bg-[#dc4310]"
              >
                Find a Part <span aria-hidden="true">↗</span>
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((value) => !value)}
              className={
                'inline-flex h-11 w-11 items-center justify-center rounded-full border lg:hidden transition-colors ' +
                (lightHero ? 'border-white/18 bg-white/[.06] text-white' : 'border-black/10 bg-white text-[#0b0f13]')
              }
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
            >
              <span className="text-lg leading-none">{mobileMenuOpen ? '×' : '☰'}</span>
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="pb-5 lg:hidden">
              <div className={
                'rounded-[28px] border p-3 shadow-2xl backdrop-blur-xl ' +
                (lightHero ? 'border-white/10 bg-[#0b0f13]/85' : 'border-black/10 bg-white')
              }>
                <div className="grid gap-1">
                  <Link href="/" className={'rounded-2xl px-4 py-3 text-sm font-black ' + (lightHero ? 'text-white hover:bg-white/10' : 'text-[#0b0f13] hover:bg-black/[.04]')}>Home</Link>
                  <Link href="/products" className={'rounded-2xl px-4 py-3 text-sm font-black ' + (lightHero ? 'text-white hover:bg-white/10' : 'text-[#0b0f13] hover:bg-black/[.04]')}>Parts Catalogue</Link>
                  <Link href="/contact" className={'rounded-2xl px-4 py-3 text-sm font-black ' + (lightHero ? 'text-white hover:bg-white/10' : 'text-[#0b0f13] hover:bg-black/[.04]')}>Visit & Contact</Link>
                  {isLoggedIn && <Link href="/customer/dashboard" className={'rounded-2xl px-4 py-3 text-sm font-black ' + (lightHero ? 'text-white hover:bg-white/10' : 'text-[#0b0f13] hover:bg-black/[.04]')}>Account</Link>}
                  <a href="tel:+917741077666" className="mt-2 rounded-2xl bg-[#ff5b1f] px-4 py-3 text-center text-sm font-black text-white">
                    Call +91 77410 77666
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {isHome && !scrolled && (
        <div className="pointer-events-none fixed bottom-6 right-6 z-40 hidden lg:block">
          <div className="flex items-center gap-3 rounded-full border border-white/14 bg-black/15 px-4 py-2.5 text-[9px] font-black uppercase tracking-[.18em] text-white/58 backdrop-blur-xl">
            Scroll to explore
            <span className="orbit-pulse h-2 w-2 rounded-full border border-[#ff8e68]" />
          </div>
        </div>
      )}

      {!isHome && (
        <div className="h-[82px]" aria-hidden="true" />
      )}

      {!isHome && (
        <div className="pointer-events-none fixed bottom-4 right-4 z-40 hidden lg:block">
          <a href="tel:+917741077666" className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-3 text-xs font-black text-[#0b0f13] shadow-xl">
            <span className="h-2 w-2 rounded-full bg-[#ff5b1f]" />
            +91 77410 77666
          </a>
        </div>
      )}
    </>
  )
}
