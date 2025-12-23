import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('=== ORDER NOTIFICATION TEST ===')
    
    // Step 1: Check VAPID keys
    const vapidPublic = process.env.VAPID_PUBLIC_KEY
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY
    
    if (!vapidPublic || !vapidPrivate) {
      return res.status(500).json({ 
        success: false, 
        error: 'VAPID keys not configured',
        step: 'vapid_check'
      })
    }
    console.log('✓ VAPID keys configured')

    // Step 2: Check for admin users
    const { data: admins, error: adminError } = await supabaseAdmin
      .from('user_roles')
      .select('user_id')
      .in('role', ['admin', 'staff'])

    if (adminError || !admins || admins.length === 0) {
      return res.status(500).json({ 
        success: false, 
        error: 'No admin users found',
        step: 'admin_check',
        details: adminError
      })
    }
    console.log(`✓ Found ${admins.length} admin users`)

    // Step 3: Check for push subscriptions
    const adminIds = admins.map(a => a.user_id)
    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*')
      .in('user_id', adminIds)

    if (subError || !subscriptions || subscriptions.length === 0) {
      return res.status(500).json({ 
        success: false, 
        error: 'No push subscriptions found',
        step: 'subscription_check',
        details: subError,
        adminIds
      })
    }
    console.log(`✓ Found ${subscriptions.length} push subscriptions`)

    // Step 4: Test creating a notification in database
    const { data: notification, error: notifError } = await supabaseAdmin
      .from('notifications')
      .insert({
        title: 'TEST: Simulated Order',
        message: 'This is a test notification simulating an order placement',
        type: 'info',
        category: 'order',
        link: '/admin/orders',
        recipient_type: 'admin',
        recipient_id: null
      })
      .select()
      .single()

    if (notifError) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to create notification',
        step: 'notification_create',
        details: notifError
      })
    }
    console.log('✓ Notification created in database:', notification.id)

    // Step 5: Wait a moment for real-time to process
    await new Promise(resolve => setTimeout(resolve, 500))

    // Step 6: Send push notification
    console.log('Attempting to send push notification...')
    
    // Use the base URL from the request to call our own API
    const protocol = req.headers['x-forwarded-proto'] || 'http'
    const host = req.headers['host']
    const baseUrl = `${protocol}://${host}`
    
    const pushResponse = await fetch(`${baseUrl}/api/push/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'TEST: Simulated Order',
        message: 'This is a test notification simulating an order placement',
        url: '/admin/orders',
        userType: 'admin'
      })
    })

    const pushResult = await pushResponse.json()
    console.log('Push result:', pushResult)

    return res.status(200).json({
      success: true,
      steps: {
        vapid: 'OK',
        admins: `Found ${admins.length}`,
        subscriptions: `Found ${subscriptions.length}`,
        notification: `Created: ${notification.id}`,
        push: pushResult
      },
      notification,
      pushResult,
      subscriptions: subscriptions.map(s => ({
        id: s.id,
        user_id: s.user_id,
        endpoint: s.endpoint?.substring(0, 60) + '...',
        created_at: s.created_at
      })),
      instructions: [
        '1. Check if notification appeared in NotificationBell (real-time)',
        '2. Check if push notification appeared on device',
        '3. If push didn\'t appear, check browser console and service worker logs',
        '4. Verify service worker is active: chrome://serviceworker-internals/',
        '5. Check if notification permission is granted'
      ]
    })

  } catch (error) {
    console.error('Test failed:', error)
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    })
  }
}
