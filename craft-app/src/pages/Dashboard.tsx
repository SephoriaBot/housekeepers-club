import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Focus {
  id: string;
  title: string;
  estimated_minutes: number | null;
  completed: boolean;
  date: string;
}

interface MealEntry {
  meal_type: string;
  meal_name: string;
}

const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export default function Dashboard({ onNavigate: _onNavigate }: { onNavigate: (page: string) => void }) {
  const [focuses, setFocuses] = useState<Focus[]>([]);
  const [todayMeals, setTodayMeals] = useState<MealEntry[]>([]);
  const [newFocus, setNewFocus] = useState('');
  const [newFocusMins, setNewFocusMins] = useState('');
  const [addingFocus, setAddingFocus] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayName = DAY_NAMES[new Date().getDay()];

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    const [focusRes, mealsRes] = await Promise.all([
      supabase.from('focuses').select('*').eq('date', todayStr).order('created_at'),
      supabase.from('week_plans').select('meal_type, meal_name').eq('day', todayName),
    ]);

    setFocuses(focusRes.data || []);
    setTodayMeals(mealsRes.data || []);
  }

  async function addFocus() {
    if (!newFocus.trim()) return;
    const { data } = await supabase.from('focuses').insert({
      title: newFocus.trim(),
      estimated_minutes: newFocusMins ? parseInt(newFocusMins) : null,
      date: todayStr,
      completed: false,
    }).select().single();
    if (data) setFocuses(prev => [...prev, data]);
    setNewFocus('');
    setNewFocusMins('');
    setAddingFocus(false);
  }

  async function toggleFocus(focus: Focus) {
    const { data } = await supabase.from('focuses')
      .update({ completed: !focus.completed })
      .eq('id', focus.id)
      .select().single();
    if (data) setFocuses(prev => prev.map(f => f.id === focus.id ? data : f));
  }

  async function deleteFocus(id: string) {
    await supabase.from('focuses').delete().eq('id', id);
    setFocuses(prev => prev.filter(f => f.id !== id));
  }

  const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'];
  const sortedMeals = [...todayMeals].sort(
    (a, b) => MEAL_ORDER.indexOf(a.meal_type.toLowerCase()) - MEAL_ORDER.indexOf(b.meal_type.toLowerCase())
  );

  const completedFocuses = focuses.filter(f => f.completed).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{todayName} · {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</h1>
        </div>
      </div>

      <div className="page-body">

        {/* ── TODAY'S FOCUS ── */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div className="section-label" style={{ marginBottom: 0 }}>
              Today's Focus
              {focuses.length > 0 && (
                <span style={{ marginLeft: 8, fontWeight: 600, color: 'var(--pink-dark)', fontSize: '0.65rem' }}>
                  {completedFocuses}/{focuses.length} done
                </span>
              )}
            </div>
            <button
              onClick={() => setAddingFocus(true)}
              style={{
                padding: '4px 10px', borderRadius: 12,
                background: 'var(--blush)', border: '1.5px solid var(--border)',
                color: 'var(--pink-dark)', fontSize: '0.7rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace',
              }}
            >
              + Add
            </button>
          </div>

          {addingFocus && (
            <div style={{
              background: 'var(--white)', border: '1.5px solid var(--border)',
              borderRadius: 18, padding: 14, marginBottom: 10,
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <input
                className="form-input"
                placeholder="What's the focus?"
                value={newFocus}
                onChange={e => setNewFocus(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addFocus()}
                style={{ fontSize: '0.85rem' }}
              />
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  className="form-input"
                  placeholder="Est. minutes (optional)"
                  value={newFocusMins}
                  onChange={e => setNewFocusMins(e.target.value)}
                  style={{ fontSize: '0.82rem', flex: 1 }}
                  type="number"
                />
                <button className="btn btn-primary btn-sm" onClick={addFocus}>Save</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setAddingFocus(false)}>Cancel</button>
              </div>
            </div>
          )}

          {focuses.length === 0 && !addingFocus ? (
            <div style={{
              background: 'var(--white)', border: '1.5px dashed var(--border)',
              borderRadius: 18, padding: '18px 16px', textAlign: 'center',
              color: 'var(--ink-muted)', fontSize: '0.82rem',
            }}>
              No focuses set for today — add one to get started
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {focuses.map(f => (
                <div
                  key={f.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: f.completed ? 'var(--blush)' : 'var(--white)',
                    border: `1.5px solid ${f.completed ? 'var(--pink-light)' : 'var(--border)'}`,
                    borderRadius: 18, padding: '12px 14px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <button
                    onClick={() => toggleFocus(f)}
                    aria-label={f.completed ? 'Mark not done' : 'Mark done'}
                    style={{
                      width: 20, height: 20, borderRadius: '50%',
                      border: `2px solid ${f.completed ? 'var(--pink-dark)' : 'var(--border)'}`,
                      background: f.completed ? 'var(--pink-dark)' : 'transparent',
                      cursor: 'pointer', flexShrink: 0, padding: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '0.88rem', fontWeight: 600,
                      color: f.completed ? 'var(--ink-muted)' : 'var(--ink)',
                      textDecoration: f.completed ? 'line-through' : 'none',
                    }}>
                      {f.title}
                    </div>
                    {f.estimated_minutes && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', marginTop: 2, fontFamily: 'IBM Plex Mono, monospace' }}>
                        Est. {f.estimated_minutes} min
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteFocus(f.id)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--ink-muted)', fontSize: '0.65rem', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                      fontFamily: 'IBM Plex Mono, monospace', padding: '2px 4px',
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── TODAY'S MEALS ── */}
        {sortedMeals.length > 0 && (
          <section>
            <div className="section-label">Today's Meals</div>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
              {sortedMeals.map((m, i) => (
                <div
                  key={i}
                  style={{
                    flexShrink: 0,
                    background: 'var(--white)', border: '1.5px solid var(--border)',
                    borderRadius: 18, padding: '10px 14px', minWidth: 120,
                  }}
                >
                  <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-muted)', marginBottom: 4, fontFamily: 'IBM Plex Mono, monospace' }}>
                    {m.meal_type}
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3 }}>
                    {m.meal_name}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
