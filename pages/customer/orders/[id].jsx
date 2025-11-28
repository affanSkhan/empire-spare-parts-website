import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import CustomerLayout from '@/components/CustomerLayout'
import useSimpleAuth from '@/hooks/useSimpleAuth'
import { supabase } from '@/lib/supabaseClient'

/**
 * Customer Order Detail Page
 * Shows detailed information about a specific order
 * NOTE: Prices are NOT shown to customers per Phase 6 requirements
 */
export default function OrderDetail() {
  const router = useRouter()
  const { id } = router.query
  const { customer } = useSimpleAuth()
  
  const [order, setOrder] = useState(null)
  const [orderItems, setOrderItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const fetchOrderDetails = useCallback(async () => {
    if (!id || !customer) return
    try {
      setLoading(true)

      // Fetch order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .eq('customer_id', customer.id)
        .single()

      if (orderError || !orderData) {
        setNotFound(true)
        setLoading(false)
        return
      }

      // Fetch order items with product details
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          product:products(
            id,
            name,
            slug,
            brand,
            car_model,
            product_images(image_url, is_primary)
          )
        `)
        .eq('order_id', id)
        .order('created_at', { ascending: true })

      if (itemsError) throw itemsError

      setOrder(orderData)
      setOrderItems(itemsData || [])
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }, [id, customer])

  useEffect(() => {
    fetchOrderDetails()
  }, [fetchOrderDetails])

  function getStatusInfo(status) {
    const info = {
      pending: {
        color: 'yellow',
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        message: 'Your order is being reviewed by our team.',
      },
      reviewed: {
        color: 'blue',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        message: 'Our team has reviewed your order and is preparing pricing.',
      },
      approved: {
        color: 'green',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        message: 'Your order has been approved! Invoice generation in progress.',
      },
      invoiced: {
        color: 'purple',
        icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        message: 'Invoice has been generated. Please check your email or contact us.',
      },
    }

    return info[status] || info.pending
  }

  function getProductImage(product) {
    if (!product?.product_images || product.product_images.length === 0) {
      return '/images/placeholder-product.jpg'
    }
    
    const primaryImage = product.product_images.find(img => img.is_primary)
    return primaryImage?.image_url || product.product_images[0]?.image_url
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <CustomerLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        </div>
      </CustomerLayout>
    )
  }

  if (notFound) {
    return (
      <CustomerLayout>
        <Head>
          <title>Order Not Found - Empire Car A/C</title>
        </Head>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center py-12">
            <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 22s-8-4.5-8-11V5l8-3 8 3v6c0 6.5-8 11-8 11z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
            <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or you don't have access to it.</p>
            <Link href="/customer/orders" className="btn-primary inline-block">
              View All Orders
            </Link>
          </div>
        </div>
      </CustomerLayout>
    )
  }

  const statusInfo = getStatusInfo(order.status)

  return (
    <CustomerLayout>
      <Head>
        <title>Order {order.order_number} - Empire Car A/C</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link 
            href="/customer/orders"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Orders
          </Link>

          {/* Order Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  Order {order.order_number}
                </h1>
                <p className="text-sm text-gray-600">
                  Placed on {formatDate(order.created_at)}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold border bg-${statusInfo.color}-100 text-${statusInfo.color}-800 border-${statusInfo.color}-200`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>

            {/* Status Message */}
            <div className={`bg-${statusInfo.color}-50 border border-${statusInfo.color}-200 rounded-lg p-4 flex items-start`}>
              <svg className={`w-6 h-6 text-${statusInfo.color}-600 mr-3 flex-shrink-0 mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={statusInfo.icon} />
              </svg>
              <div>
                <h3 className={`font-semibold text-${statusInfo.color}-900 mb-1`}>
                  Order Status
                </h3>
                <p className={`text-sm text-${statusInfo.color}-800`}>
                  {statusInfo.message}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {orderItems.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                  {/* Product Image */}
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={getProductImage(item.product)}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {item.product_name}
                    </h3>
                    {item.product_code && (
                      <p className="text-xs text-gray-500 mb-2">Code: {item.product_code}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">
                        Quantity: <span className="font-semibold text-gray-900">{item.quantity}</span>
                      </span>
                      {item.product?.brand && (
                        <span className="text-gray-500">
                          Brand: {item.product.brand}
                        </span>
                      )}
                    </div>
                    {item.product?.car_model && (
                      <p className="text-xs text-gray-500 mt-1">
                        Compatible: {item.product.car_model}
                      </p>
                    )}
                  </div>

                  {/* View Product Link */}
                  {item.product?.slug && (
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="flex-shrink-0 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Order Notes */}
          {order.notes && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Order Notes</h2>
              <p className="text-gray-700 whitespace-pre-line">{order.notes}</p>
            </div>
          )}

          {/* Pricing Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">About Pricing</h3>
                <p className="text-sm text-blue-800">
                  Pricing information will be provided after our team reviews your order. 
                  You will receive a detailed invoice via email once the order is processed.
                  For any questions, please contact our sales team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  )
}
