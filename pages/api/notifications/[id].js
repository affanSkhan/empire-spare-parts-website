import { supabase } from '@/lib/supabaseClient'

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'PATCH') {
    // Mark notification as read/unread
    try {
      const { is_read } = req.body

      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      res.status(200).json({ notification: data })
    } catch (error) {
      console.error('Error updating notification:', error)
      res.status(500).json({ error: error.message })
    }
  } else if (req.method === 'DELETE') {
    // Delete notification
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)

      if (error) throw error

      res.status(200).json({ message: 'Notification deleted' })
    } catch (error) {
      console.error('Error deleting notification:', error)
      res.status(500).json({ error: error.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
