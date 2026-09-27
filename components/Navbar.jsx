import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Logo from './Logo'
import { supabase } from '@/lib/supabaseClient'

const WhatsAppIcon = ({ className = 'h-5 w-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.198.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.758-.085 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c0 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
)

const PhoneIcon = ({ className = 'h-5 w-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 011.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.04 11.04 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 16.72V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5Z" />
  </svg>
)

export default function Navbar() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [scrolled, setScrolled] = useState(false)

  const isHome = router.pathname === '/'
  const lightHero = isHome && !scrolled
  const orderRoute = router.pathname.startsWith('/products/') || router.pathname.startsWith('/customer/cart')
  const whatsappMessage = router.pathname.startsWith('/products/')
    ? 'Hello Empire Car A/C, I want to order/enquire about this part: ' + router.query.slug
    : router.pathname.startsWith('/customer/cart')
      ? 'Hello Empire Car A/C, I want to place an order from my cart.'
      : 'Hello Empire Car A/C, I want to enquire about a car A/C part.'
  const whatsappLink = 'https://wa.me/917741077666?text=' + encodeURIComponent(whatsappMessage)

  const fetchCartCount = async () => {
    if (typeof window === 'undefined') return
    const customerId = localStorage.getItem('customer_id')
    if (!customerId) {
      setCartCount(0)
      return
    }
    const response = await supabase.from('cart_items').select('*', { count: 'exact', head: true }).eq('customer_id', customerId)
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

  useEffect(() => setMobileMenuOpen(false), [router.asPath])

  useEffect(() => {
    if (!isLoggedIn) return
    const customerId = localStorage.getItem('customer_id')
    if (!customerId) return

    const channel = supabase
      .channel('cart-nav-' + customerId)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'cart_items',
        filter: 'customer_id=eq.' + customerId
      }, fetchCartCount)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [isLoggedIn])

  const navLink = (href, label) => (
    <Link
      href={href}
      className={
        'group relative py-2 text-[13px] font-black tracking-[-.01em] transition-colors duration-300 ' +
        (lightHero ? '!text-white hover:!text-white' : 'text-[#596472] hover:text-[#0b0f13]')
      }
    >
      {label}
      <span className={'absolute -bottom-1 left-0 h-px w-full origin-left bg-[#ff5b1f] transition-transform duration-500 ' + (router.pathname === href ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100')} />
    </Link>
  )

  return (
    <>
      <header className={'fixed inset-x-0 top-0 z-50 transition-all duration-700 ' + (lightHero
        ? 'bg-transparent'
        : 'border-b border-black/[.06] bg-[#f4f2ee]/92 shadow-[0_12px_40px_rgba(11,15,19,.05)] backdrop-blur-2xl')}>
        
        <div className="hidden h-[34px] border-b border-white/10 bg-[#0b0f13] px-4 sm:hidden">
          <div className="mx-auto flex h-full max-w-[1480px] items-center justify-between text-[9px] font-black uppercase tracking-[.12em] text-white/65">
            <a href="tel:+917741077666" className="inline-flex items-center gap-1.5 text-white/85">
              <PhoneIcon className="h-3.5 w-3.5 text-[#ff8e68]" />
              +91 77410 77666
            </a>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[#25D366]">
              <WhatsAppIcon className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>

        <div className="sm:hidden h-[34px] border-b border-white/10 bg-[#0b0f13] px-4">
          <div className="mx-auto flex h-full max-w-[1480px] items-center justify-between text-[9px] font-black uppercase tracking-[.12em] text-white/65">
            <a href="tel:+917741077666" className="inline-flex items-center gap-1.5 text-white/85">
              <PhoneIcon className="h-3.5 w-3.5 text-[#ff8e68]" />
              +91 77410 77666
            </a>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[#25D366]">
              <WhatsAppIcon className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>

        <div className="site-shell">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-[#ff5b1f]" />
          <div className="flex h-[72px] items-center justify-between gap-5 sm:h-[82px]">
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
                <Link href="/customer/cart" className={'rounded-full px-4 py-2.5 text-[13px] font-black transition-colors ' + (lightHero ? 'text-white hover:bg-white/10' : 'text-[#596472] hover:bg-black/[.04] hover:text-[#0b0f13]')}>
                  Cart {cartCount > 0 ? '(' + cartCount + ')' : ''}
                </Link>
              )}

              <Link
                href={isLoggedIn ? '/customer/dashboard' : '/auth/login'}
                className={'rounded-full px-5 py-3 text-[13px] font-black transition-all duration-500 ' + (lightHero
                  ? 'border border-white/30 bg-black/20 !text-white shadow-[0_8px_30px_rgba(0,0,0,.16)] hover:-translate-y-0.5 hover:bg-black/30'
                  : 'border border-black/10 bg-white text-[#0b0f13] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(11,15,19,.07)]')}
              >
                {isLoggedIn ? 'Account' : 'Customer Login'}
              </Link>

              <Link href="/products" className="magnetic rounded-full bg-[#ff5b1f] px-5 py-3 text-[13px] font-black text-white shadow-[0_12px_32px_rgba(255,91,31,.18)] transition-all duration-500 hover:bg-[#dc4310]">
                Find a Part <span aria-hidden="true">↗</span>
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((value) => !value)}
              className={'inline-flex h-11 w-11 items-center justify-center rounded-full border lg:hidden transition-colors ' + (lightHero ? 'border-white/30 bg-black/20 text-white' : 'border-black/10 bg-white text-[#0b0f13]')}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
            >
              <span className="text-lg leading-none">{mobileMenuOpen ? '×' : '☰'}</span>
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="pb-4 lg:hidden">
              <div className={'rounded-[26px] border p-3 shadow-2xl backdrop-blur-xl ' + (lightHero ? 'border-white/10 bg-[#0b0f13]/90' : 'border-black/10 bg-white')}>
                <div className="grid gap-1">
                  <Link href="/" className={'rounded-2xl px-4 py-3 text-sm font-black ' + (lightHero ? 'text-white hover:bg-white/10' : 'text-[#0b0f13] hover:bg-black/[.04]')}>Home</Link>
                  <Link href="/products" className={'rounded-2xl px-4 py-3 text-sm font-black ' + (lightHero ? 'text-white hover:bg-white/10' : 'text-[#0b0f13] hover:bg-black/[.04]')}>Parts Catalogue</Link>
                  <Link href="/contact" className={'rounded-2xl px-4 py-3 text-sm font-black ' + (lightHero ? 'text-white hover:bg-white/10' : 'text-[#0b0f13] hover:bg-black/[.04]')}>Visit & Contact</Link>
                  {isLoggedIn && <Link href="/customer/dashboard" className={'rounded-2xl px-4 py-3 text-sm font-black ' + (lightHero ? 'text-white hover:bg-white/10' : 'text-[#0b0f13] hover:bg-black/[.04]')}>Account</Link>}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="pointer-events-none fixed bottom-[max(10px,env(safe-area-inset-bottom))] inset-x-2 z-[70] sm:hidden">
        <div className="pointer-events-auto grid grid-cols-[.82fr_1.3fr_.88fr] gap-1.5 rounded-[22px] border border-black/10 bg-white/95 p-1.5 shadow-[0_16px_44px_rgba(11,15,19,.20)] backdrop-blur-xl">
          <a href="tel:+917741077666" className="flex min-h-14 items-center justify-center gap-1.5 rounded-[17px] bg-[#0b0f13] px-2 text-[10px] font-black text-white">
            <PhoneIcon className="h-4 w-4" />
            Call
          </a>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex min-h-14 items-center justify-center gap-1.5 rounded-[17px] bg-[#25D366] px-2 text-[11px] font-black text-white shadow-[0_8px_22px_rgba(37,211,102,.28)]">
            <WhatsAppIcon className="h-4 w-4" />
            {orderRoute ? 'Order on WhatsApp' : 'WhatsApp'}
          </a>
          <Link href={isLoggedIn && router.pathname.startsWith('/customer') ? '/customer/cart' : '/products'} className="flex min-h-14 items-center justify-center rounded-[17px] bg-white px-2 text-[10px] font-black text-[#0b0f13] ring-1 ring-black/10">
            {isLoggedIn && router.pathname.startsWith('/customer') ? 'Cart' : 'Find a Part'}
          </Link>
        </div>
      </div>

      {isHome && !scrolled && (
        <div className="pointer-events-none fixed bottom-24 right-4 z-40 hidden lg:block">
          <div className="flex items-center gap-3 rounded-full border border-white/14 bg-black/15 px-4 py-2.5 text-[9px] font-black uppercase tracking-[.18em] text-white/58 backdrop-blur-xl">
            Scroll to explore <span className="orbit-pulse h-2 w-2 rounded-full border border-[#ff8e68]" />
          </div>
        </div>
      )}

      {!isHome && <div className="h-[106px] sm:h-[82px]" aria-hidden="true" />}

      {!isHome && (
        <div className="pointer-events-none fixed bottom-4 right-4 z-40 hidden lg:block">
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-xs font-black text-white shadow-xl">
            <WhatsAppIcon className="h-4 w-4" />
            WhatsApp
          </a>
        </div>
      )}
    </>
  )
}
