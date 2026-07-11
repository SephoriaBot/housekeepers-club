import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { AppointmentNoteType } from '../types/appointmentNotes';

/**
 * Given a list of appointment ids, returns a map of which ones already
 * have notes started, and what note_type each is using. Used to show a
 * "view note" indicator on scheduled appointments in the planner.
 */
export function useAppointmentNoteMap(appointmentIds: string[]) {
  const [map, setMap] = useState<Record<string, AppointmentNoteType>>({});

  useEffect(() => {
    if (appointmentIds.length === 0) {
      setMap({});
      return;
    }

    let cancelled = false;

    supabase
      .from('appointment_note_items')
      .select('appointment_id, note_type')
      .in('appointment_id', appointmentIds)
      .then(({ data }) => {
        if (cancelled || !data) return;
        const next: Record<string, AppointmentNoteType> = {};
        for (const row of data) {
          if (row.appointment_id && !next[row.appointment_id]) {
            next[row.appointment_id] = row.note_type;
          }
        }
        setMap(next);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentIds.join(',')]);

  return map;
}
