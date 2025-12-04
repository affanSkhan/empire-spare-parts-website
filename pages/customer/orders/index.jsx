import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import CustomerLayout from '@/components/CustomerLayout'
import useSimpleAuth from '@/hooks/useSimpleAuth'
import { supabase } from '@/lib/supabaseClient'
import { getStatusColor, getStatusDisplayName } from '@/utils/enhancedOrderHelpers'

/**
 * Customer Orders List Page
 * Shows all orders placed by the customer
 */
export default function CustomerOrders() {
  const { customer } = useSimpleAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, pending, reviewed, approved, invoiced

  const fetchOrders = useCallback(async () => {
    if (!customer) return
    
    try {
      setLoading(true)
      
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items(count)
        `)
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false })

      // Apply filter
      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }, [customer, filter])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  function getStatusBadge(status) {
    const color = getStatusColor(status)
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border bg-${color}-100 text-${color}-800 border-${color}-200`}>
        {getStatusDisplayName(status)}
      </span>
    )
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <CustomerLayout>
      <Head>
        <title>My Orders - Empire Car A/C</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-slate-600 bg-clip-text text-transparent mb-2">
              My Orders
            </h1>
            <p className="text-gray-600">Track and manage your orders</p>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All Orders' },
              { value: 'pending', label: 'Pending' },
              { value: 'quotation_sent', label: 'Quotations' },
              { value: 'payment_pending', label: 'Payment Due' },
              { value: 'processing', label: 'Processing' },
              { value: 'ready_for_pickup', label: 'Ready' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
              { value: 'invoiced', label: 'Invoiced' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === value
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No orders found</h3>
              <p className="text-gray-500 mb-6">
                {filter === 'all' 
                  ? "You haven't placed any orders yet."
                  : `No ${filter} orders found.`}
              </p>
              <Link href="/products" className="btn-primary inline-block">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/customer/orders/${order.id}`}
                  className="block bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {order.order_number}
                        </h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(order.created_at)}
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          {order.order_items?.[0]?.count || 0} item(s)
                        </div>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <div className="flex items-center text-blue-600 font-medium">
                      View Details
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  {/* Notes if any */}
                  {order.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600 italic">Note: {order.notes}</p>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  )
}
