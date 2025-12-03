import { supabase } from '@/lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { notificationIds } = req.body

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({ error: 'Invalid notification IDs' })
    }

    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', notificationIds)
      .select()

    if (error) throw error

    res.status(200).json({ 
      message: 'Notifications marked as read',
      count: data.length 
    })
  } catch (error) {
    console.error('Error marking notifications as read:', error)
    res.status(500).json({ error: error.message })
  }
}
