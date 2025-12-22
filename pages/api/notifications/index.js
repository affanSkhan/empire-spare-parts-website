import { supabase } from '@/lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { limit = 50, unreadOnly = false, recipientType = 'admin' } = req.query

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('recipient_type', recipientType) // Filter by recipient type (admin/customer)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit))

    if (unreadOnly === 'true') {
      query = query.eq('is_read', false)
    }

    const { data, error } = await query

    if (error) throw error

    // Get unread count for this recipient type
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_type', recipientType)
      .eq('is_read', false)

    res.status(200).json({ 
      notifications: data || [],
      unreadCount: unreadCount || 0
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    res.status(500).json({ error: error.message })
  }
}
