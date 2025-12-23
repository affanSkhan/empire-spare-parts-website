import { supabaseAdmin } from '@/lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const checks = {
      notifications_table: null,
      trigger_function: null,
      trigger_exists: null,
      realtime_enabled: null,
      sample_notifications: null
    }

    // 1. Check if notifications table exists and has recipient columns
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .limit(1)

    if (tableError) {
      checks.notifications_table = { status: 'error', message: tableError.message }
    } else {
      checks.notifications_table = { status: 'ok', message: 'Table exists and accessible' }
    }

    // 2. Check if trigger function exists
    const { data: functionData, error: functionError } = await supabaseAdmin
      .rpc('exec_sql', { 
        sql: `SELECT EXISTS (
          SELECT 1 FROM pg_proc 
          WHERE proname = 'notify_new_order'
        ) as exists`
      })
      .single()

    if (functionError) {
      // Try alternative method
      const { data: altCheck } = await supabaseAdmin
        .from('notifications')
        .select('count')
        .limit(0)
      
      checks.trigger_function = { 
        status: 'unknown', 
        message: 'Cannot directly query functions, but table is accessible' 
      }
    } else {
      checks.trigger_function = functionData?.exists 
        ? { status: 'ok', message: 'Function exists' }
        : { status: 'error', message: 'Function not found' }
    }

    // 3. Get recent notifications
    const { data: recentNotifs, error: notifsError } = await supabaseAdmin
      .from('notifications')
      .select('id, title, recipient_type, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    if (!notifsError && recentNotifs) {
      checks.sample_notifications = {
        status: 'ok',
        count: recentNotifs.length,
        data: recentNotifs
      }
    }

    // 4. Check database settings via direct query (if available)
    try {
      // Note: This requires specific database permissions
      checks.database_info = {
        message: 'Run this in Supabase SQL Editor to check trigger:',
        sql: `
          -- Check if trigger exists
          SELECT * FROM pg_trigger WHERE tgname = 'order_notification_trigger';
          
          -- Check trigger function
          SELECT proname, prosrc FROM pg_proc WHERE proname = 'notify_new_order';
          
          -- Check realtime publication
          SELECT schemaname, tablename FROM pg_publication_tables 
          WHERE pubname = 'supabase_realtime' AND tablename = 'notifications';
        `
      }
    } catch (e) {
      // Ignore
    }

    return res.status(200).json({
      status: 'completed',
      checks,
      instructions: {
        check_trigger: 'Run in Supabase SQL Editor: SELECT * FROM pg_trigger WHERE tgname LIKE \'%notification%\';',
        check_realtime: 'Go to Database → Replication → enable "notifications" table',
        test_trigger: 'Create a test order and check if notification is inserted'
      }
    })

  } catch (error) {
    return res.status(500).json({
      error: error.message,
      stack: error.stack
    })
  }
}
