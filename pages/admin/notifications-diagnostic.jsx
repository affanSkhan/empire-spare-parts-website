import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import AdminLayout from '@/components/AdminLayout'
import useAdminAuth from '@/hooks/useAdminAuth'
import { supabase } from '@/lib/supabaseClient'

export default function NotificationsDiagnostic() {
  const { user, loading: authLoading } = useAdminAuth()
  const router = useRouter()
  const [results, setResults] = useState([])
  const [testing, setTesting] = useState(false)

  function addResult(message, status = 'info') {
    setResults(prev => [...prev, { message, status, time: new Date().toLocaleTimeString() }])
  }

  async function runDiagnostics() {
    setResults([])
    setTesting(true)

    try {
      addResult('Starting diagnostics...', 'info')

      // 1. Check if notifications table exists and has data
      addResult('1. Checking notifications table...', 'info')
      const { data: notifs, error: notifsError, count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: false })
        .eq('recipient_type', 'admin')
        .order('created_at', { ascending: false })
        .limit(5)

      if (notifsError) {
        addResult(`✗ Error accessing notifications: ${notifsError.message}`, 'error')
      } else {
        addResult(`✓ Found ${count} admin notifications in database`, 'success')
        if (notifs && notifs.length > 0) {
          addResult(`  Latest: "${notifs[0].title}"`, 'info')
        }
      }

      // 2. Test real-time subscription
      addResult('2. Testing real-time subscription...', 'info')
      let realtimeWorking = false
      
      const testChannel = supabase
        .channel('diagnostic-test')
        .on('postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: 'recipient_type=eq.admin'
          },
          (payload) => {
            realtimeWorking = true
            addResult(`✓ Real-time event received for: "${payload.new.title}"`, 'success')
          }
        )
        .subscribe((status) => {
          addResult(`  Subscription status: ${status}`, status === 'SUBSCRIBED' ? 'success' : 'error')
        })

      // Wait a bit for subscription to connect
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 3. Create test notification
      addResult('3. Creating test notification...', 'info')
      const testResponse = await fetch('/api/notifications/test-order', {
        method: 'POST'
      })

      if (!testResponse.ok) {
        addResult(`✗ Failed to create test notification: ${testResponse.statusText}`, 'error')
      } else {
        const testData = await testResponse.json()
        addResult(`✓ Test notification created (ID: ${testData.notification.id})`, 'success')
        
        if (testData.push.sent) {
          addResult(`✓ Push notification sent (${testData.push.successCount}/${testData.push.totalSubscriptions})`, 'success')
        } else {
          addResult(`✗ Push notification failed: ${testData.push.message}`, 'error')
        }
      }

      // Wait for real-time event
      await new Promise(resolve => setTimeout(resolve, 3000))

      if (!realtimeWorking) {
        addResult(`⚠ Real-time event NOT received - check Supabase realtime settings`, 'error')
        addResult(`  Go to Supabase → Database → Replication`, 'info')
        addResult(`  Ensure 'notifications' table is in 'supabase_realtime' publication`, 'info')
      }

      // Cleanup
      await supabase.removeChannel(testChannel)

      // 4. Check push subscriptions
      addResult('4. Checking push subscriptions...', 'info')
      const debugResponse = await fetch('/api/push/debug')
      if (debugResponse.ok) {
        const debugData = await debugResponse.json()
        addResult(`  Subscriptions in DB: ${debugData.database.subscriptions.count}`, 'info')
        addResult(`  Admin users: ${debugData.database.admins.count}`, 'info')
        addResult(`  VAPID keys match: ${debugData.environment.keysMatch ? '✓' : '✗'}`, 
          debugData.environment.keysMatch ? 'success' : 'error')
      }

      addResult('=== Diagnostics complete ===', 'info')

    } catch (error) {
      addResult(`Error: ${error.message}`, 'error')
    } finally {
      setTesting(false)
    }
  }

  if (authLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <Head>
        <title>Notifications Diagnostic - Empire Car A/C</title>
      </Head>

      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Notifications System Diagnostic</h1>

        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm">
            This tool will test your entire notification system including database access,
            real-time subscriptions, and push notifications.
          </p>
        </div>

        <button
          onClick={runDiagnostics}
          disabled={testing}
          className="mb-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-semibold"
        >
          {testing ? 'Running Diagnostics...' : 'Run Full Diagnostic'}
        </button>

        <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm h-96 overflow-y-auto">
          {results.length === 0 ? (
            <div className="text-gray-500">Click "Run Full Diagnostic" to begin...</div>
          ) : (
            results.map((result, index) => (
              <div
                key={index}
                className={`${
                  result.status === 'error' ? 'text-red-400' :
                  result.status === 'success' ? 'text-green-400' :
                  'text-gray-300'
                }`}
              >
                [{result.time}] {result.message}
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
