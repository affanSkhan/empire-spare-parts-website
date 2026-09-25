import { useRouter } from 'next/router'
import Link from 'next/link'
import { useEffect } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import CustomerNotificationBell from './CustomerNotificationBell'
import useSimpleAuth from '@/hooks/useSimpleAuth'

export default function CustomerLayout({ children }) {
  const router = useRouter()
  const { customer, loading, signOut } = useSimpleAuth()

  useEffect(() => {
    if (!loading && !customer) {
      router.push(`/auth/login?returnUrl=${router.asPath}`)
    }
  }, [customer, loading, router])

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[65vh] items-center justify-center bg-[#f7f8fa]">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-[#ff5b22]" />
            <p className="mt-4 text-sm font-semibold text-slate-500">Loading your account…</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!customer) return null

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      await signOut()
    }
  }

  const itemClass = (active) =>
    `relative rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
      active ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
    }`

  return (
    <>
      <Navbar />

      <nav className="border-b border-slate-200 bg-white">
        <div className="site-shell flex min-h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-1 overflow-x-auto py-2">
            <Link href="/customer/dashboard" className={itemClass(router.pathname === '/customer/dashboard')}>
              Dashboard
            </Link>
            <Link href="/customer/cart" className={itemClass(router.pathname === '/customer/cart')}>
              Cart
            </Link>
            <Link href="/customer/orders" className={itemClass(router.pathname.startsWith('/customer/orders'))}>
              My Orders
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <CustomerNotificationBell />
            <span className="hidden max-w-[160px] truncate text-xs font-bold text-slate-500 sm:block">
              {customer.name}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl px-3 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 hover:text-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="min-h-screen bg-[#f7f8fa] py-8 sm:py-10">
        <div className="site-shell">
          {children}
        </div>
      </main>

      <Footer />
    </>
  )
}
