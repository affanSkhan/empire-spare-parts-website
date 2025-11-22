import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

/**
 * Admin authentication hook
 * Protects admin routes and redirects to login if not authenticated
 */
export function useAdminAuth() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          router.push('/admin/login');
        } else if (session) {
          setUser(session.user);
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [router]);

  async function checkAuth() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        router.push('/admin/login');
        return;
      }

      // Check if user has admin role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      // If no role data found or not admin, redirect
      if (roleError || !roleData || !['admin', 'staff'].includes(roleData.role)) {
        console.error('Admin access denied:', roleError || 'No admin role found');
        await supabase.auth.signOut();
        router.push('/admin/login');
        return;
      }

      setUser(user);
    } catch (err) {
      console.error('Auth check error:', err);
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  }

  return { user, loading };
}

export default useAdminAuth;
