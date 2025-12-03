import { supabase } from '@/lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Delete all read notifications
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('is_read', true)

    if (error) throw error

    res.status(200).json({ message: 'All read notifications cleared' })
  } catch (error) {
    console.error('Error clearing notifications:', error)
    res.status(500).json({ error: error.message })
  }
}
