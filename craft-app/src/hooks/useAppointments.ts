import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase'; // ⚠️ adjust path to your actual client
import type { AppointmentOption } from '../types/appointmentNotes';

interface UseAppointmentsResult {
  appointments: AppointmentOption[];
  loading: boolean;
  error: string | null;
}

/**
 * Fetches appointments for the "which appointment is this for" picker.
 * Most recent first, capped at 100 — bump the limit or add pagination
 * later if that's not enough.
 */
export function useAppointments(): UseAppointmentsResult {
  const [appointments, setAppointments] = useState<AppointmentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('appointments')
        .select('id, title, date_time')
        .order('date_time', { ascending: false })
        .limit(100);

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      setAppointments(data ?? []);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { appointments, loading, error };
}
