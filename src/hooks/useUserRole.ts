import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<'user' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        console.log('[useUserRole] Fetching role for user:', user.id);
        
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        console.log('[useUserRole] Response:', { data, error });

        if (error) {
          console.error('[useUserRole] Error fetching user role:', error);
          setRole('user'); // Par défaut user
        } else {
          console.log('[useUserRole] Setting role to:', data?.role || 'user');
          setRole(data?.role || 'user');
        }
      } catch (error) {
        console.error('[useUserRole] Caught error:', error);
        setRole('user');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  return { role, isAdmin: role === 'admin', loading };
};
