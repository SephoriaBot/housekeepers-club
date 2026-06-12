import { useState, useEffect } from 'react'
import type { PantryItem } from '../types'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import styles from './Pantry.module.css'

const LEVEL_LABEL: Record<string, string> = { full: 'full', ok: 'ok', low: 'low!' }
const CYCLE: PantryItem['level'][] = ['full', 'ok', 'low']

export default function Pantry() {
  const { user } = useAuth()
  const [items, setItems] = useState<PantryItem[]>([])
  const [newName, setNewName] = useState('')
  const [newLevel, setNewLevel] = useState<PantryItem['level']>('ok')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchItems() }, [])

  async function fetchItems() {
    setLoading(true)
    const { data } = await supabase
      .from('pantry_items')
      .select('*')
      .eq('user_id', user!.id)
      .order('name', { ascending: true })
    setItems(data ?? [])
    setLoading(false)
  }

  async function addItem() {
    const name = newName.trim()
    if (!name) return
    const { data } = await supabase
      .from('pantry_items')
      .insert({ name, level: newLevel, user_id: user!.id })
      .select()
      .single()
    if (data) setItems(prev => [...prev, data])
    setNewName('')
  }

  async function cycleLevel(item: PantryItem) {
    const next = CYCLE[(CYCLE.indexOf(item.level) + 1) % CYCLE.length]
    await supabase.from('pantry_items').update({ level: next }).eq('id', item.id)
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, level: next } : i))
  }

  async function removeItem(id: string) {
    await supabase.from('pantry_items').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const low = items.filter(i => i.level === 'low')

  return (
    <div className={styles.page}>
      <h1 className={styles.title}><i className="ti ti-box" aria-hidden="true" /> pantry inventory</h1>
      <p className={styles.sub}>track what you have so nothing goes to waste. click a status badge to cycle it.</p>

      {low.length > 0 && (
        <div className={styles.lowAlert}>
          <i className="ti ti-alert-circle" aria-hidden="true" />
          running low: {low.map(i => i.name).join(', ')}
        </div>
      )}

      {loading ? (
        <p style={{color:'var(--text-soft)',fontSize:13}}>loading...</p>
      ) : (
        <div className={styles.grid}>
          {items.map(item => (
            <div key={item.id} className={`card ${styles.item} ${styles[item.level]}`}>
              <span className={styles.itemName}>{item.name}</span>
              <div style={{display:'flex',gap:6,alignItems:'center'}}>
                <button className={`${styles.levelBadge} ${styles[`badge_${item.level}`]}`} onClick={() => cycleLevel(item)}>
                  {LEVEL_LABEL[item.level]}
                </button>
                <button className={styles.removeBtn} onClick={() => removeItem(item.id)}>
                  <i className="ti ti-x" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="empty-state" style={{gridColumn:'1/-1'}}>
              <i className="ti ti-box" aria-hidden="true" />
              no pantry items yet — add some below
            </div>
          )}
        </div>
      )}

      <div className={styles.addRow}>
        <input type="text" placeholder="add pantry item..." value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addItem()}
          style={{flex:2}} />
        <select value={newLevel} onChange={e => setNewLevel(e.target.value as PantryItem['level'])} style={{flex:1,minWidth:0}}>
          <option value="full">full</option>
          <option value="ok">ok</option>
          <option value="low">low</option>
        </select>
        <button className="btn-primary" onClick={addItem}>add</button>
      </div>
    </div>
  )
}
