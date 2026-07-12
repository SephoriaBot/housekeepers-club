import { useEffect, useRef, useState } from 'react';
import { Plus, Sprout } from 'lucide-react';
import CreateAppointmentNote from './CreateAppointmentNote';
import AppointmentNotes from './AppointmentNotes';
import type { AppointmentNoteType } from '../../types/appointmentNotes';
import styles from './AppointmentNotesPanel.module.css';

export interface AppointmentNoteSelection {
  appointmentId: string;
  noteType: AppointmentNoteType;
  label: string;
}

interface AppointmentNotesPanelProps {
  externalSelection?: AppointmentNoteSelection | null;
  onExternalSelectionConsumed?: () => void;
}

export default function AppointmentNotesPanel({
  externalSelection,
  onExternalSelectionConsumed,
}: AppointmentNotesPanelProps) {
  const [creating, setCreating] = useState(false);
  const [selectedApptId, setSelectedApptId] = useState<string | null>(null);
  const [selectedNoteType, setSelectedNoteType] = useState<AppointmentNoteType | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string>('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleCreate = (appointmentId: string, noteType: AppointmentNoteType, label: string) => {
    setSelectedApptId(appointmentId);
    setSelectedNoteType(noteType);
    setSelectedLabel(label);
    setCreating(false);
  };

  // Respond to "view this appointment's note" requests coming from the
  // Upcoming appointments list.
  useEffect(() => {
    if (!externalSelection) return;

    setCreating(false);
    setSelectedApptId(externalSelection.appointmentId);
    setSelectedNoteType(externalSelection.noteType);
    setSelectedLabel(externalSelection.label);

    wrapperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    onExternalSelectionConsumed?.();
  }, [externalSelection, onExternalSelectionConsumed]);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.header}>
        <Sprout size={20} className={styles.headerIcon} />
        <span className={styles.headerLabel}>Appointment Notes</span>
      </div>

      {!creating && (
        <button type="button" className={styles.newButton} onClick={() => setCreating(true)}>
          <Plus size={14} /> New note
        </button>
      )}

      {creating && (
        <CreateAppointmentNote onCreate={handleCreate} onCancel={() => setCreating(false)} />
      )}

      {!creating && selectedApptId && selectedNoteType && (
        <AppointmentNotes
          appointmentId={selectedApptId}
          appointmentLabel={selectedLabel}
          noteType={selectedNoteType}
        />
      )}
    </div>
  );
}
