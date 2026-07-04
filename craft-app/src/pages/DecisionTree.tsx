import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { Plus, ArrowLeft, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase'; // adjust path to match your other pages
import DecisionTree from './DecisionTree';
import './DecisionTree.css';

interface DecisionSummary {
  id: string;
  title: string;
  updated_at: string;
}

const DecisionsPage: FC = () => {
  const [list, setList] = useState<DecisionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | 'new' | null>(null);

  async function loadList() {
    setLoading(true);
    setLoadError(null);
    try {
      const { data, error } = await supabase
        .from('decision_trees')
        .select('id, title, updated_at')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      setList((data ?? []) as DecisionSummary[]);
    } catch (err: any) {
      console.error('Decision list load failed:', err);
      setLoadError(err?.message ?? 'Something went wrong loading your decisions.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (openId === null) loadList();
  }, [openId]);

  async function handleDelete(id: string) {
    await supabase.from('decision_trees').delete().eq('id', id);
    loadList();
  }

  // Editor view — either a fresh tree or an existing one
  if (openId !== null) {
    return (
      <div>
        <button className="dt-back-btn" onClick={() => setOpenId(null)}>
          <ArrowLeft size={16} /> Back to decisions
        </button>
        <DecisionTree treeId={openId === 'new' ? undefined : openId} />
      </div>
    );
  }

  // List view
  return (
    <div className="dt-page">
      <div className="dt-list-header">
        <h2>Decisions</h2>
        <button className="dt-add-btn dt-add-outcome" onClick={() => setOpenId('new')}>
          <Plus size={14} /> New decision
        </button>
      </div>

      {loading && <p className="dt-hint">Loading...</p>}

      {!loading && loadError && (
        <p className="dt-error">Couldn't load your decisions: {loadError}</p>
      )}

      {!loading && !loadError && list.length === 0 && (
        <p className="dt-hint">No decisions saved yet. Start a new one above.</p>
      )}

      <div className="dt-list">
        {list.map((d) => (
          <div key={d.id} className="dt-list-item" onClick={() => setOpenId(d.id)}>
            <div>
              <div className="dt-list-title">{d.title || 'Untitled decision'}</div>
              <div className="dt-list-date">
                Updated {new Date(d.updated_at).toLocaleDateString()}
              </div>
            </div>
            <button
              className="dt-remove-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(d.id);
              }}
              aria-label="Delete decision"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DecisionsPage;
