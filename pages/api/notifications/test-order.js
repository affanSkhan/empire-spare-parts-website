import { createClient } from '@supabase/supabase-js'

// Create a Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const testOrderNumber = `TEST-${Date.now()}`
    
    // 1. Create test notification in database
    console.log('Creating test notification...')
    const { data: notification, error: notifError } = await supabaseAdmin
      .from('notifications')
      .insert({
        title: 'TEST: New Order Received',
        message: `Test order #${testOrderNumber} has been placed`,
        type: 'info',
        category: 'order',
        link: '/admin/orders',
        recipient_type: 'admin',
        recipient_id: null,
        is_read: false
      })
      .select()
      .single()

    if (notifError) {
      console.error('Error creating notification:', notifError)
      throw notifError
    }

    console.log('Notification created:', notification.id)

    // 2. Send push notification
    console.log('Sending push notification...')
    const pushResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://tjitbybznlpdiqbbgqif.supabase.co', 'https://www.empirecarac.in')}/api/push/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'TEST: New Order Received',
        message: `Test order #${testOrderNumber} has been placed`,
        url: '/admin/orders',
        userType: 'admin'
      })
    })

    const pushData = await pushResponse.json()
    console.log('Push response:', pushData)

    res.status(200).json({
      success: true,
      notification: {
        id: notification.id,
        created: true
      },
      push: {
        sent: pushResponse.ok,
        ...pushData
      },
      instructions: [
        '1. Check admin notification bell - should show new notification',
        '2. Check if push notification appeared on device',
        '3. Check browser console for real-time subscription logs'
      ]
    })

  } catch (error) {
    console.error('Test order notification error:', error)
    res.status(500).json({ 
      error: error.message,
      stack: error.stack
    })
  }
}
