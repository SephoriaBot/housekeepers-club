import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { supabase } from '../lib/supabase'; // adjust path to your existing client
import './DecisionTree.css';

type NodeType = 'root' | 'choice' | 'outcome';

interface TreeNode {
  id: string;
  label: string;
  type: NodeType;
  probability?: number; // 0-100, only meaningful on 'outcome' nodes
  payoffValue?: number; // numeric payoff, only meaningful on 'outcome' nodes. Use consistent units (dollars, a 1-10 happiness score, etc.)
  note?: string; // optional free-text annotation
  children: TreeNode[];
}

interface DecisionTreeRow {
  id: string;
  title: string;
  root: TreeNode;
  created_at: string;
  updated_at: string;
}

function newNode(type: NodeType): TreeNode {
  return {
    id: crypto.randomUUID(),
    label: '',
    type,
    children: [],
  };
}

function updateNodeInTree(node: TreeNode, targetId: string, fn: (n: TreeNode) => TreeNode): TreeNode {
  if (node.id === targetId) return fn(node);
  return { ...node, children: node.children.map((c) => updateNodeInTree(c, targetId, fn)) };
}

function removeNodeFromTree(node: TreeNode, targetId: string): TreeNode {
  return {
    ...node,
    children: node.children
      .filter((c) => c.id !== targetId)
      .map((c) => removeNodeFromTree(c, targetId)),
  };
}

// Expected value of a node = sum of (probability/100 * payoffValue) for outcome children,
// plus the recursively-computed EV of any nested choice children.
// Returns null if there's not enough data (no outcome children with both fields set).
function expectedValue(node: TreeNode): number | null {
  if (node.children.length === 0) return null;

  let total = 0;
  let hasData = false;

  for (const child of node.children) {
    if (child.type === 'outcome') {
      if (child.probability != null && child.payoffValue != null) {
        total += (child.probability / 100) * child.payoffValue;
        hasData = true;
      }
    } else {
      const childEV = expectedValue(child);
      if (childEV != null) {
        total += childEV;
        hasData = true;
      }
    }
  }

  return hasData ? total : null;
}

// Sum of probabilities across an outcome node's siblings, to flag when they don't add to 100.
function siblingProbabilitySum(node: TreeNode): number | null {
  const outcomeSiblings = node.children.filter((c) => c.type === 'outcome');
  if (outcomeSiblings.length === 0) return null;
  return outcomeSiblings.reduce((sum, c) => sum + (c.probability ?? 0), 0);
}

// --- Recursive node renderer ---

const TreeNodeView: FC<{
  node: TreeNode;
  depth: number;
  onChange: (id: string, fn: (n: TreeNode) => TreeNode) => void;
  onRemove: (id: string) => void;
}> = ({ node, depth, onChange, onRemove }) => {
  const [collapsed, setCollapsed] = useState(false);

  const childType: NodeType = node.type === 'root' || node.type === 'choice' ? 'choice' : 'outcome';
  const canAddOutcome = node.type === 'choice';
  const ev = node.type !== 'outcome' ? expectedValue(node) : null;
  const probSum = siblingProbabilitySum(node);
  const probWarning = probSum != null && probSum !== 100;

  return (
    <div className={`dt-node dt-${node.type}`} style={{ marginLeft: depth === 0 ? 0 : 20 }}>
      <div className="dt-node-row">
        {node.children.length > 0 && (
          <button className="dt-collapse-btn" onClick={() => setCollapsed((c) => !c)} aria-label="Toggle branch">
            {collapsed ? '▸' : '▾'}
          </button>
        )}
        <input
          className="dt-label-input"
          placeholder={
            node.type === 'root' ? 'What are you deciding?' : node.type === 'choice' ? 'A choice...' : 'An outcome...'
          }
          value={node.label}
          onChange={(e) => onChange(node.id, (n) => ({ ...n, label: e.target.value }))}
        />
        {node.type === 'outcome' && (
          <>
            <input
              className="dt-prob-input"
              type="number"
              min={0}
              max={100}
              placeholder="%"
              value={node.probability ?? ''}
              onChange={(e) =>
                onChange(node.id, (n) => ({
                  ...n,
                  probability: e.target.value === '' ? undefined : Number(e.target.value),
                }))
              }
            />
            <input
              className="dt-payoff-input"
              type="number"
              placeholder="payoff"
              value={node.payoffValue ?? ''}
              onChange={(e) =>
                onChange(node.id, (n) => ({
                  ...n,
                  payoffValue: e.target.value === '' ? undefined : Number(e.target.value),
                }))
              }
            />
          </>
        )}
        {ev != null && <span className="dt-ev-badge">EV: {ev.toFixed(1)}</span>}
        {node.type !== 'root' && (
          <button className="dt-remove-btn" onClick={() => onRemove(node.id)} aria-label="Remove branch">
            ✕
          </button>
        )}
      </div>

      {probWarning && (
        <div className="dt-prob-warning">Outcome probabilities add up to {probSum}%, not 100%</div>
      )}

      {node.type === 'outcome' && (
        <input
          className="dt-note-input"
          placeholder="Note (optional)..."
          value={node.note ?? ''}
          onChange={(e) => onChange(node.id, (n) => ({ ...n, note: e.target.value }))}
        />
      )}

      {!collapsed && (
        <div className="dt-children">
          {node.children.map((child) => (
            <TreeNodeView key={child.id} node={child} depth={depth + 1} onChange={onChange} onRemove={onRemove} />
          ))}
          <div className="dt-add-row">
            <button
              className="dt-add-btn"
              onClick={() =>
                onChange(node.id, (n) => ({ ...n, children: [...n.children, newNode(childType)] }))
              }
            >
              + branch
            </button>
            {canAddOutcome && (
              <button
                className="dt-add-btn dt-add-outcome"
                onClick={() =>
                  onChange(node.id, (n) => ({ ...n, children: [...n.children, newNode('outcome')] }))
                }
              >
                + outcome
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Page component ---

const DecisionTree: FC<{ treeId?: string }> = ({ treeId }) => {
  const [title, setTitle] = useState('');
  const [root, setRoot] = useState<TreeNode>(newNode('root'));
  const [rowId, setRowId] = useState<string | undefined>(treeId);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!treeId) return;
    (async () => {
      const { data, error } = await supabase
        .from('decision_trees')
        .select('*')
        .eq('id', treeId)
        .maybeSingle<DecisionTreeRow>();
      if (!error && data) {
        setTitle(data.title);
        setRoot(data.root);
        setRowId(data.id);
      }
    })();
  }, [treeId]);

  const handleChange = (id: string, fn: (n: TreeNode) => TreeNode) => {
    setRoot((r) => updateNodeInTree(r, id, fn));
  };

  const handleRemove = (id: string) => {
    setRoot((r) => removeNodeFromTree(r, id));
  };

  const handleSave = async () => {
    setSaving(true);
    if (rowId) {
      await supabase
        .from('decision_trees')
        .update({ title, root, updated_at: new Date().toISOString() })
        .eq('id', rowId);
    } else {
      const { data } = await supabase
        .from('decision_trees')
        .insert({ title, root })
        .select()
        .maybeSingle<DecisionTreeRow>();
      if (data) setRowId(data.id);
    }
    setSaving(false);
  };

  const overallEV = expectedValue(root);

  return (
    <div className="dt-page">
      <input
        className="dt-title-input"
        placeholder="Decision title (e.g. Swing shift vs night shift)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      {overallEV != null && (
        <div className="dt-overall-ev">Overall expected value: {overallEV.toFixed(1)}</div>
      )}
      <div className="dt-tree-container">
        <TreeNodeView node={root} depth={0} onChange={handleChange} onRemove={handleRemove} />
      </div>
      <p className="dt-hint">
        Tip: give each branch a comparable payoff number (dollars, or a 1-10 happiness score) and a probability.
        Each choice's EV = sum of (probability × payoff) across its outcomes — higher EV means that branch wins on paper,
        though it won't capture things you can't put a number on.
      </p>
      <button className="dt-save-btn" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save decision'}
      </button>
    </div>
  );
};

export default DecisionTree;
