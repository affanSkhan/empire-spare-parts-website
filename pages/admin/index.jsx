'use client'

import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import AdminLayout from '@/components/AdminLayout'
import ProductCatalogPdfButton from '@/components/ProductCatalogPdfButton'
import { supabase } from '@/lib/supabaseClient'
import useAdminAuth from '@/hooks/useAdminAuth'

const statusStyles = {
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  quotation_sent: 'bg-blue-50 text-blue-800 border-blue-200',
  payment_received: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  completed: 'bg-slate-900 text-white border-slate-900',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
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

function StatCard({ label, value, detail, href, accent = 'orange' }) {
  const body = (
    <div className="group rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(11,15,19,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(11,15,19,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-slate-950">{value}</p>
          {detail && <p className="mt-2 text-xs font-semibold text-slate-500">{detail}</p>}
        </div>
        <span className={'mt-1 h-2.5 w-2.5 rounded-full ring-4 ' + (accent === 'green' ? 'bg-emerald-500 ring-emerald-50' : accent === 'red' ? 'bg-red-500 ring-red-50' : 'bg-[#ff5b1f] ring-orange-50')} />
      </div>
      {href && <div className="mt-5 text-xs font-black text-slate-600 transition group-hover:text-[#dc4310]">Open section <span aria-hidden="true">→</span></div>}
    </div>
  )
  return href ? <Link href={href}>{body}</Link> : body
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAdminAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    activeProducts: 0,
    recentInvoices: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalCustomers: 0,
    monthlyRevenue: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [catalogProducts, setCatalogProducts] = useState([])

  useEffect(() => {
    if (user) fetchStats()
  }, [user])

  async function fetchStats() {
    try {
      setLoading(true)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

      const [
        productsRes,
        categoriesRes,
        activeRes,
        invoicesRes,
        ordersRes,
        pendingOrdersRes,
        customersRes,
        revenueRes,
        recentOrdersRes,
        catalogRes,
      ] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('invoices').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('customers').select('id', { count: 'exact', head: true }),
        supabase.from('invoices').select('total').gte('created_at', startOfMonth),
        supabase.from('orders').select('*, customer:customers(name)').order('created_at', { ascending: false }).limit(5),
        supabase.from('products').select('*, category:categories(name), images:product_images(image_url, is_primary)').eq('is_active', true).order('created_at', { ascending: false }),
      ])

      const monthlyRevenue = revenueRes.data?.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0) || 0

      setStats({
        totalProducts: productsRes.count || 0,
        totalCategories: categoriesRes.count || 0,
        activeProducts: activeRes.count || 0,
        recentInvoices: invoicesRes.count || 0,
        totalOrders: ordersRes.count || 0,
        pendingOrders: pendingOrdersRes.count || 0,
        totalCustomers: customersRes.count || 0,
        monthlyRevenue,
      })
      setRecentOrders(recentOrdersRes.data || [])
      setCatalogProducts(catalogRes.data || [])
    } catch (error) {
      console.error('Dashboard data error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-[#ff5b1f]" />
            <p className="mt-4 text-sm font-semibold text-slate-500">Loading Empire operations...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <Head>
        <title>Admin Dashboard - Empire Car A/C</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="mx-auto max-w-[1480px]">
        <header className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff5b1f]">Operations overview</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">Empire Car A/C</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Keep orders moving, keep the catalogue current, and export the latest product sheet whenever you need it.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/admin/orders" className="btn-secondary px-5">View orders</Link>
            <Link href="/admin/products/new" className="btn-primary px-5">Add product</Link>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total orders" value={stats.totalOrders} detail={stats.pendingOrders + ' waiting for action'} href="/admin/orders" />
          <StatCard label="Active catalogue" value={stats.activeProducts} detail={stats.totalProducts + ' products in database'} href="/admin/products" />
          <StatCard label="Customers" value={stats.totalCustomers} detail={stats.totalCategories + ' categories'} href="/admin/categories" />
          <StatCard label="Revenue this month" value={'Rs. ' + stats.monthlyRevenue.toLocaleString('en-IN')} detail={stats.recentInvoices + ' invoices in last 30 days'} href="/admin/invoices" accent="green" />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(11,15,19,0.04)] sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Order queue</p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">Recent customer activity</h2>
              </div>
              <Link href="/admin/orders" className="text-xs font-black text-[#dc4310] hover:underline">View all orders →</Link>
            </div>

            <div className="mt-6">
              {recentOrders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
                  <p className="text-sm font-bold text-slate-700">No orders yet</p>
                  <p className="mt-1 text-xs text-slate-500">New customer requests will appear here.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentOrders.map((order) => (
                    <Link key={order.id} href={'/admin/orders/' + order.id} className="group flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-black text-slate-950">#{order.order_number}</span>
                          <StatusBadge status={order.status} />
                        </div>
                        <p className="mt-1 truncate text-sm font-semibold text-slate-600">{order.customer?.name || 'Customer'}</p>
                        <p className="mt-1 text-xs text-slate-400">{formatDate(order.created_at)}</p>
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <span className="text-sm font-black text-slate-950">Rs. {Number(order.admin_total || 0).toLocaleString('en-IN')}</span>
                        <span className="text-lg text-slate-300 transition group-hover:text-[#dc4310]" aria-hidden="true">→</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[28px] bg-slate-950 p-6 text-white shadow-[0_20px_55px_rgba(11,15,19,0.12)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">Catalogue</p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">Customer-ready PDF</h2>
              </div>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/60">3 × 5 grid</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/55">Export the active catalogue in a print-friendly A4 layout with product photos, fitment, references and MRP.</p>
            <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-3xl font-black tracking-[-0.04em]">{catalogProducts.length}</p>
              <p className="mt-1 text-xs font-semibold text-white/45">active products ready to publish</p>
            </div>
            <div className="mt-5">
              <ProductCatalogPdfButton products={catalogProducts} className="w-full border-white/15 bg-white text-slate-950 hover:border-white" />
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/admin/products" className="rounded-[24px] border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Catalogue</p>
            <h3 className="mt-2 text-lg font-black tracking-[-0.03em]">Manage products</h3>
            <p className="mt-2 text-sm text-slate-500">Edit pricing, fitment, stock and images.</p>
          </Link>
          <Link href="/admin/orders" className="rounded-[24px] border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Sales</p>
            <h3 className="mt-2 text-lg font-black tracking-[-0.03em]">Work the queue</h3>
            <p className="mt-2 text-sm text-slate-500">{stats.pendingOrders} new order{stats.pendingOrders === 1 ? '' : 's'} waiting for review.</p>
          </Link>
          <Link href="/admin/invoices" className="rounded-[24px] border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Finance</p>
            <h3 className="mt-2 text-lg font-black tracking-[-0.03em]">Invoices</h3>
            <p className="mt-2 text-sm text-slate-500">{stats.recentInvoices} invoices created in the last 30 days.</p>
          </Link>
          <Link href="/admin/notifications" className="rounded-[24px] border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Alerts</p>
            <h3 className="mt-2 text-lg font-black tracking-[-0.03em]">Notifications</h3>
            <p className="mt-2 text-sm text-slate-500">Keep track of order and system alerts.</p>
          </Link>
        </section>
      </div>
    </AdminLayout>
  )
}
