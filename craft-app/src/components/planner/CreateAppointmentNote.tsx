import { useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { useAppointments } from '../../hooks/useAppointments';
import { DEFAULT_NOTE_TYPES } from '../../types/appointmentNotes';
import type { AppointmentNoteType } from '../../types/appointmentNotes';
import styles from './CreateAppointmentNote.module.css';

interface CreateAppointmentNoteProps {
  onCreate: (appointmentId: string, noteType: AppointmentNoteType) => void;
  onCancel: () => void;
}

export default function CreateAppointmentNote({ onCreate, onCancel }: CreateAppointmentNoteProps) {
  const { appointments, loading, error } = useAppointments();

  const [noteType, setNoteType] = useState<AppointmentNoteType | null>(null);
  const [customType, setCustomType] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [appointmentId, setAppointmentId] = useState('');

  const chooseType = (type: AppointmentNoteType) => {
    setNoteType(type);
    setShowCustomInput(false);
    setAppointmentId('');
  };

  const confirmCustomType = () => {
    if (!customType.trim()) return;
    setNoteType(customType.trim().toLowerCase());
    setShowCustomInput(false);
    setAppointmentId('');
  };

  const handleCreate = () => {
    if (!noteType || !appointmentId) return;
    onCreate(appointmentId, noteType);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.sectionLabel}>What type of appointment?</div>

      <div className={styles.typeRow}>
        {DEFAULT_NOTE_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            className={`${styles.typeChip} ${noteType === type ? styles.typeChipActive : ''}`}
            onClick={() => chooseType(type)}
          >
            {type}
          </button>
        ))}

        {noteType && !DEFAULT_NOTE_TYPES.includes(noteType) && (
          <button type="button" className={`${styles.typeChip} ${styles.typeChipActive}`}>
            {noteType}
          </button>
        )}

        <button
          type="button"
          className={styles.typeChipAdd}
          onClick={() => setShowCustomInput((s) => !s)}
        >
          <Plus size={13} /> other
        </button>
      </div>

      {showCustomInput && (
        <div className={styles.customTypeRow}>
          <input
            className={styles.customTypeInput}
            value={customType}
            onChange={(e) => setCustomType(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && confirmCustomType()}
            placeholder="e.g. dentist, vet…"
          />
          <button type="button" className={styles.smallConfirmButton} onClick={confirmCustomType}>
            Use
          </button>
        </div>
      )}

      {noteType && (
        <>
          <div className={styles.sectionLabel}>Which appointment?</div>

          {loading && <p className={styles.helperText}>Loading your appointments…</p>}
          {error && <p className={styles.errorText}>{error}</p>}

          {!loading && !error && (
            <div className={styles.selectWrap}>
              <select
                className={styles.select}
                value={appointmentId}
                onChange={(e) => setAppointmentId(e.target.value)}
              >
                <option value="">Select from your planner…</option>
                {appointments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title} — {new Date(a.date_time).toLocaleDateString()}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className={styles.selectChevron} />
            </div>
          )}

          {!loading && !error && appointments.length === 0 && (
            <p className={styles.helperText}>
              No appointments found yet — add one to your planner first.
            </p>
          )}
        </>
      )}

      <div className={styles.actionRow}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className={styles.confirmButton}
          disabled={!noteType || !appointmentId}
          onClick={handleCreate}
        >
          Start notes
        </button>
      </div>
    </div>
  );
}
