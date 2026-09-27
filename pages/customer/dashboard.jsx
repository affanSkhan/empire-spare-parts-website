import { useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import CustomerLayout from '@/components/CustomerLayout'
import useSimpleAuth from '@/hooks/useSimpleAuth'
import { supabase } from '@/lib/supabaseClient'

const statusStyles = {
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  reviewed: 'bg-blue-50 text-blue-800 border-blue-200',
  approved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  quotation_sent: 'bg-violet-50 text-violet-800 border-violet-200',
  payment_received: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  completed: 'bg-slate-900 text-white border-slate-900',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  invoiced: 'bg-slate-100 text-slate-700 border-slate-200',
}

function StatusBadge({ status }) {
  const label = String(status || 'pending').replace(/_/g, ' ')
  const style = statusStyles[status] || 'bg-slate-50 text-slate-700 border-slate-200'
  return <span className={'inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] ' + style}>{label}</span>
}

function formatDate(dateString) {
  if (!dateString) return 'No date'
  return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function CustomerDashboard() {
  const { customer } = useSimpleAuth()
  const [stats, setStats] = useState({ cartItems: 0, totalOrders: 0, pendingOrders: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (customer) fetchDashboardData()
  }, [customer])

  async function fetchDashboardData() {
    try {
      setLoading(true)

      const [cartRes, ordersRes, recentRes] = await Promise.all([
        supabase.from('cart_items').select('*', { count: 'exact', head: true }).eq('customer_id', customer.id),
        supabase.from('orders').select('*', { count: 'exact' }).eq('customer_id', customer.id).order('created_at', { ascending: false }),
        supabase.from('orders').select('*, order_items(*)').eq('customer_id', customer.id).order('created_at', { ascending: false }).limit(4),
      ])

      const orders = ordersRes.data || []
      setStats({
        cartItems: cartRes.count || 0,
        totalOrders: ordersRes.count || 0,
        pendingOrders: orders.filter((order) => order.status === 'pending').length,
      })
      setRecentOrders(recentRes.data || [])
    } catch (error) {
      console.error('Customer dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }

  const firstName = useMemo(
    () => (customer?.name || 'Customer').trim().split(/\s+/)[0],
    [customer?.name]
  )

  return (
    <CustomerLayout>
      <Head>
        <title>Customer Dashboard - Empire Car A/C</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="mx-auto max-w-[1320px]">
        <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(11,15,19,0.04)] sm:p-8">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff5b1f]">Customer portal</p>
              <h1 className="mt-3 text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl">Welcome back, {firstName}.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Track your requests, manage your cart, and get back to the parts you need without digging through the site.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link href="/products" className="btn-primary px-5">Browse parts</Link>
              <Link href="/customer/cart" className="btn-secondary px-5">Open cart</Link>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Link href="/customer/cart" className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Cart</p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <p className="text-2xl font-black text-slate-950">{stats.cartItems}</p>
                <span className="text-sm font-black text-slate-300 transition group-hover:text-[#dc4310]">→</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-500">item{stats.cartItems === 1 ? '' : 's'} ready for review</p>
            </Link>

            <Link href="/customer/orders" className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Orders</p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <p className="text-2xl font-black text-slate-950">{stats.totalOrders}</p>
                <span className="text-sm font-black text-slate-300 transition group-hover:text-[#dc4310]">→</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-500">total requests placed</p>
            </Link>

            <div className="rounded-2xl border border-[#ffc8ae] bg-[#fff4ee] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#dc4310]">In progress</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{stats.pendingOrders}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">order{stats.pendingOrders === 1 ? '' : 's'} waiting for review</p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(11,15,19,0.04)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Activity</p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">Recent orders</h2>
              </div>
              <Link href="/customer/orders" className="text-xs font-black text-[#dc4310] hover:underline">View all →</Link>
            </div>

            <div className="mt-6">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-slate-100" />)}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">⌁</div>
                  <p className="mt-4 text-sm font-black text-slate-900">No orders yet</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Browse the catalogue and add the parts you need to your cart.</p>
                  <Link href="/products" className="btn-primary mt-5 inline-flex px-5">Browse parts</Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentOrders.map((order) => (
                    <Link key={order.id} href={'/customer/orders/' + order.id} className="group flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-black text-slate-950">{order.order_number}</span>
                          <StatusBadge status={order.status} />
                        </div>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {order.order_items?.length || 0} item{(order.order_items?.length || 0) === 1 ? '' : 's'} · {formatDate(order.created_at)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <span className="text-sm font-black text-slate-950">
                          {order.admin_total ? 'Rs. ' + Number(order.admin_total).toLocaleString('en-IN') : 'Awaiting quote'}
                        </span>
                        <span className="text-lg text-slate-300 transition group-hover:text-[#dc4310]" aria-hidden="true">→</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[28px] bg-slate-950 p-6 text-white shadow-[0_20px_55px_rgba(11,15,19,0.12)]">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">Need a hand?</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.05em]">Not sure which part fits?</h2>
            <p className="mt-3 text-sm leading-6 text-white/55">Send Empire your vehicle details or a photo of the old component before placing the order.</p>

            <div className="mt-7 space-y-2">
              <a href="https://wa.me/917741077666?text=Hello%20Empire%20Car%20A%2FC%2C%20I%20need%20help%20finding%20the%20right%20part." target="_blank" rel="noreferrer" className="flex min-h-12 items-center justify-between rounded-full bg-white px-5 text-sm font-black text-slate-950 transition hover:-translate-y-0.5">
                Ask on WhatsApp <span aria-hidden="true">↗</span>
              </a>
              <a href="tel:+917741077666" className="flex min-h-12 items-center justify-between rounded-full border border-white/15 bg-white/5 px-5 text-sm font-black text-white transition hover:bg-white/10">
                Call the shop <span aria-hidden="true">↗</span>
              </a>
            </div>

            <div className="mt-7 border-t border-white/10 pt-5 text-xs text-white/35">Empire Car A/C · Amravati</div>
          </div>
        </section>
      </div>
    </CustomerLayout>
  )
}
