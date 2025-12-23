// Check if service worker and push subscriptions are properly configured

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Check VAPID keys
    const vapidConfigured = !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY)
    
    // Check for admin users
    const { data: admins, count: adminCount } = await supabaseAdmin
      .from('user_roles')
      .select('user_id', { count: 'exact' })
      .in('role', ['admin', 'staff'])

    // Check for push subscriptions
    const { data: subscriptions, count: subCount } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*', { count: 'exact' })

    // Get recent subscriptions
    const { data: recentSubs } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    // Check recent notifications
    const { data: recentNotifications, count: notifCount } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('recipient_type', 'admin')
      .order('created_at', { ascending: false })
      .limit(5)

    return res.status(200).json({
      system: {
        vapid_configured: vapidConfigured,
        vapid_public_key: process.env.VAPID_PUBLIC_KEY ? process.env.VAPID_PUBLIC_KEY.substring(0, 20) + '...' : 'NOT SET'
      },
      database: {
        admin_count: adminCount || 0,
        subscription_count: subCount || 0,
        notification_count: notifCount || 0,
        admin_ids: admins?.map(a => a.user_id) || []
      },
      recent_subscriptions: recentSubs?.map(s => ({
        id: s.id,
        user_id: s.user_id,
        endpoint: s.endpoint?.substring(0, 60) + '...',
        created_at: s.created_at
      })) || [],
      recent_notifications: recentNotifications?.map(n => ({
        id: n.id,
        title: n.title,
        recipient_type: n.recipient_type,
        created_at: n.created_at
      })) || [],
      health: {
        status: vapidConfigured && adminCount > 0 && subCount > 0 ? 'HEALTHY' : 'UNHEALTHY',
        issues: [
          ...(!vapidConfigured ? ['VAPID keys not configured'] : []),
          ...(adminCount === 0 ? ['No admin users found'] : []),
          ...(subCount === 0 ? ['No push subscriptions found'] : [])
        ]
      }
    })

  } catch (error) {
    return res.status(500).json({
      error: error.message,
      stack: error.stack
    })
  }
}
