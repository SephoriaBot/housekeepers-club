import { useState } from 'react';
import { X, Circle, CheckCircle2, Inbox } from 'lucide-react';
import type { AppointmentNoteItem } from '../../types/appointmentNotes';
import notesStyles from './AppointmentNotes.module.css';
import styles from './UnlinkedNotes.module.css';

interface UnlinkedNotesProps {
  items: AppointmentNoteItem[];
  loading: boolean;
  error: string | null;
  toggleBringUpCovered: (item: AppointmentNoteItem) => Promise<void>;
  toggleHomeworkDone: (item: AppointmentNoteItem) => Promise<void>;
  saveResolution: (itemId: string, resolution: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
}

export default function UnlinkedNotes({
  items,
  loading,
  error,
  toggleBringUpCovered,
  toggleHomeworkDone,
  saveResolution,
  removeItem,
}: UnlinkedNotesProps) {
  const [resolutionDrafts, setResolutionDrafts] = useState<Record<string, string>>({});

  if (loading) {
    return <p className={notesStyles.loadingText}>Loading unlinked notes…</p>;
  }

  if (error) {
    return <p className={notesStyles.errorText}>{error}</p>;
  }

  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Inbox size={22} className={styles.emptyIcon} />
        <p>No unlinked notes — nothing orphaned right now.</p>
      </div>
    );
  }

  // Grouped by note_type since these no longer belong to any specific
  // appointment — the appointment that created them was deleted.
  const groups = items.reduce<Record<string, AppointmentNoteItem[]>>((acc, item) => {
    (acc[item.note_type] ??= []).push(item);
    return acc;
  }, {});

  const handleSaveResolution = async (item: AppointmentNoteItem) => {
    const text = resolutionDrafts[item.id] ?? item.resolution ?? '';
    await saveResolution(item.id, text);
  };

  return (
    <div className={notesStyles.wrapper}>
      <p className={styles.intro}>
        Notes left behind by deleted appointments. Wrap these up or clear them out.
      </p>

      {Object.entries(groups).map(([noteType, groupItems]) => {
        const bringUpOpen = groupItems.filter((i) => i.kind === 'bring_up' && i.status === 'open');
        const bringUpCovered = groupItems.filter((i) => i.kind === 'bring_up' && i.status === 'covered');
        const homework = groupItems.filter((i) => i.kind === 'homework');

        return (
          <div key={noteType} className={styles.group}>
            <div className={styles.groupHeader}>{noteType}</div>

            {bringUpOpen.length > 0 && (
              <section className={notesStyles.section}>
                <div className={notesStyles.sectionHeader}>
                  <span>Want to bring up</span>
                </div>
                {bringUpOpen.map((item) => (
                  <div key={item.id} className={notesStyles.row}>
                    <button
                      className={notesStyles.checkButton}
                      onClick={() => toggleBringUpCovered(item)}
                      aria-label="Mark covered"
                      type="button"
                    >
                      <Circle size={18} />
                    </button>
                    <span className={notesStyles.itemText}>{item.content}</span>
                    <button
                      className={notesStyles.deleteButton}
                      onClick={() => removeItem(item.id)}
                      aria-label="Delete"
                      type="button"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </section>
            )}

            {bringUpCovered.length > 0 && (
              <section className={notesStyles.section}>
                <div className={notesStyles.sectionHeader}>
                  <span>Covered</span>
                </div>
                {bringUpCovered.map((item) => (
                  <div key={item.id} className={notesStyles.coveredBlock}>
                    <div className={notesStyles.row}>
                      <button
                        className={notesStyles.checkButton}
                        onClick={() => toggleBringUpCovered(item)}
                        aria-label="Mark not covered"
                        type="button"
                      >
                        <CheckCircle2 size={18} className={notesStyles.coveredIcon} />
                      </button>
                      <span className={`${notesStyles.itemText} ${notesStyles.strikethrough}`}>
                        {item.content}
                      </span>
                      <button
                        className={notesStyles.deleteButton}
                        onClick={() => removeItem(item.id)}
                        aria-label="Delete"
                        type="button"
                      >
                        <X size={15} />
                      </button>
                    </div>
                    <div className={notesStyles.resolutionRow}>
                      <input
                        className={notesStyles.resolutionInput}
                        value={resolutionDrafts[item.id] ?? item.resolution ?? ''}
                        onChange={(e) =>
                          setResolutionDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveResolution(item)}
                        placeholder="What was the resolution?"
                      />
                      <button
                        className={notesStyles.saveButton}
                        onClick={() => handleSaveResolution(item)}
                        type="button"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ))}
              </section>
            )}

            {homework.length > 0 && (
              <section className={`${notesStyles.section} ${notesStyles.homeworkSection}`}>
                <div className={notesStyles.sectionHeader}>
                  <span>Homework</span>
                </div>
                {homework.map((item) => (
                  <div key={item.id} className={notesStyles.row}>
                    <button
                      className={notesStyles.checkButton}
                      onClick={() => toggleHomeworkDone(item)}
                      aria-label="Toggle done"
                      type="button"
                    >
                      {item.status === 'done' ? (
                        <CheckCircle2 size={18} className={notesStyles.coveredIcon} />
                      ) : (
                        <Circle size={18} />
                      )}
                    </button>
                    <span
                      className={`${notesStyles.itemText} ${item.status === 'done' ? notesStyles.strikethrough : ''}`}
                    >
                      {item.content}
                    </span>
                    <button
                      className={notesStyles.deleteButton}
                      onClick={() => removeItem(item.id)}
                      aria-label="Delete"
                      type="button"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </section>
            )}
          </div>
        );
      })}
    </div>
  );
}
