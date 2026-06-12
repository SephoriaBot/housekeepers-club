import { useState, useEffect } from 'react'
import type { GroceryItem } from '../types'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import styles from './Grocery.module.css'

interface SavedList { id: string; name: string; items: string[]; created_at: string }

export default function Grocery() {
  const { user } = useAuth()
  const [items, setItems] = useState<GroceryItem[]>([])
  const [newItem, setNewItem] = useState('')
  const [newQty, setNewQty] = useState('')
  const [loading, setLoading] = useState(true)
  const [savedLists, setSavedLists] = useState<SavedList[]>([])
  const [listName, setListName] = useState('')
  const [showSaved, setShowSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchItems(); fetchSavedLists() }, [])

  async function fetchItems() {
    setLoading(true)
    const { data } = await supabase
      .from('grocery_items')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: true })
    setItems(data ?? [])
    setLoading(false)
  }

  async function fetchSavedLists() {
    const { data } = await supabase
      .from('saved_grocery_lists')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
    setSavedLists(data ?? [])
  }

  async function addItem() {
    const name = newItem.trim()
    if (!name) return
    const { data } = await supabase
      .from('grocery_items')
      .insert({ name, qty: newQty.trim(), checked: false, user_id: user!.id })
      .select().single()
    if (data) setItems(prev => [...prev, data])
    setNewItem('')
    setNewQty('')
  }

  async function toggle(id: string, checked: boolean) {
    await supabase.from('grocery_items').update({ checked: !checked }).eq('id', id)
    setItems(prev => prev.map(i => i.id === id ? { ...i, checked: !checked } : i))
  }

  async function removeItem(id: string) {
    await supabase.from('grocery_items').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  async function clearChecked() {
    const checkedIds = items.filter(i => i.checked).map(i => i.id)
    if (!checkedIds.length) return
    await supabase.from('grocery_items').delete().in('id', checkedIds)
    setItems(prev => prev.filter(i => !i.checked))
  }

  async function saveList() {
    const name = listName.trim() || `List ${new Date().toLocaleDateString()}`
    const itemNames = items.map(i => i.qty ? `${i.qty} ${i.name}` : i.name)
    setSaving(true)
    const { data } = await supabase
      .from('saved_grocery_lists')
      .insert({ user_id: user!.id, name, items: itemNames })
      .select().single()
    if (data) setSavedLists(prev => [data, ...prev])
    setListName('')
    setSaving(false)
  }

  async function deleteSavedList(id: string) {
    await supabase.from('saved_grocery_lists').delete().eq('id', id)
    setSavedLists(prev => prev.filter(l => l.id !== id))
  }

  function openAmazon() {
    const needItems = items.filter(i => !i.checked)
    if (!needItems.length) return
    const listText = needItems.map(i => `${i.qty ? i.qty + ' ' : ''}${i.name}`).join(', ')
    navigator.clipboard?.writeText(listText).then(() => {
      alert(`Your list has been copied to clipboard!\n\nYour shopping list will open — your items are copied to clipboard separated by commas.`)
      window.open('https://www.doordash.com/categories?cursor=eyJvZmZzZXQiOjAsImNvbnRlbnRfaWRzIjpbIjM1ODAwOTMyIiwiMjYyNzQ4NyIsIjI0MzIwNDk4IiwiMzEwMjA0MzAiLCIyNDQ3ODg2MiIsIjIzODk3NjgiLCIyNzU0OTkyMiIsIjIzMjA1NjMiLCIyNDcwMTA1OSJdLCJyZXF1ZXN0X3BhcmVudF9pZCI6IkRFRkFVTFRfSE9NRVBBR0UiLCJyZXF1ZXN0X2NoaWxkX2lkIjoiY2Fyb3VzZWwuc3RhbmRhcmQ6c3RvcmVfY2Fyb3VzZWw6Mzc3ZTliNjQtZjQzMi00NmVkLTgzYzYtMDQ5Y2I2MTYzOGNmIiwicmVxdWVzdF9jaGlsZF9jb21wb25lbnRfaWQiOiJjYXJvdXNlbC5zdGFuZGFyZCIsImNyb3NzX3ZlcnRpY2FsX3BhZ2VfdHlwZSI6IkRFRkFVTFRfSE9NRVBBR0UiLCJwYWdlX3N0YWNrX3RyYWNlIjpbXSwidmVydGljYWxfaWRzIjpbXSwidmVydGljYWxfY29udGV4dF9pZCI6bnVsbCwibGF5b3V0X292ZXJyaWRlIjoiVU5TUEVDSUZJRUQiLCJzaW5nbGVfc3RvcmVfaWQiOm51bGwsInNlYXJjaF9pdGVtX2Nhcm91c2VsX2N1cnNvciI6bnVsbCwiY2F0ZWdvcnlfaWRzIjpbXSwiY29sbGVjdGlvbl9pZHMiOltdLCJpc19wYWdpbmF0aW9uX2ZhbGxiYWNrIjpudWxsLCJzb3VyY2VfcGFnZV90eXBlIjpudWxsLCJnZW9fdHlwZSI6IiIsImdlb19pZCI6IiIsImtleXdvcmQiOiIiLCJhZHNfY3Vyc29yX2NhY2hlX2tleSI6bnVsbCwidmlzdWFsX2Fpc2xlc19pbnNlcnRpb25faW5kZXgiOm51bGwsImJhc2VDdXJzb3IiOnsicGFnZV9pZCI6IjM3N2U5YjY0LWY0MzItNDZlZC04M2M2LTA0OWNiNjE2MzhjZiIsInBhZ2VfdHlwZSI6IlNUT1JFX0NBUk9VU0VMX0xBTkRJTkciLCJjdXJzb3JfdmVyc2lvbiI6IkZBQ0VUIn0sInZlcnRpY2FsX25hbWVzIjp7fSwiaXRlbV9pZHMiOltdLCJtZXJjaGFudF9zdXBwbGllZF9pZHMiOltdLCJpc19vdXRfb2Zfc3RvY2siOm51bGwsIm1lbnVfaWQiOm51bGwsInRyYWNraW5nIjpudWxsLCJkaWV0YXJ5X3RhZyI6bnVsbCwib3JpZ2luX3RpdGxlIjpudWxsLCJyYW5rZWRfcmVtYWluaW5nX2NvbGxlY3Rpb25faWRzIjpudWxsLCJwcmV2aW91c2x5X3NlZW5fY29sbGVjdGlvbl9pZHMiOltdLCJwcmVjaGVja291dF9idW5kbGVfc2VhcmNoX2luZm8iOm51bGwsInRvdGFsX2l0ZW1zX29mZnNldCI6MCwidG90YWxfYWRzX3ByZXZpb3VzbHlfYmxlbmRlZCI6MCwidmVydGljYWxfdGl0bGUiOm51bGwsIm11bHRpX3N0b3JlX2VudGl0aWVzIjpbXSwibGFzdF9zZWVuX2l0ZW1faWRzIjpbXSwibGFzdF9pbnNlcnRlZF9yb3dfaW5kZXgiOm51bGwsImN1cnNvclZlcnNpb24iOiJGQUNFVF9DT05URU5UX09GRlNFVCIsInBhZ2VJZCI6IjM3N2U5YjY0LWY0MzItNDZlZC04M2M2LTA0OWNiNjE2MzhjZiIsInBhZ2VUeXBlIjoiU1RPUkVfQ0FST1VTRUxfTEFORElORyJ9', '_blank')
    }).catch(() => {
      alert(`Open your shopping list and add these items:\n\n${listText}`)
      window.open('https://www.doordash.com/categories?cursor=eyJvZmZzZXQiOjAsImNvbnRlbnRfaWRzIjpbIjM1ODAwOTMyIiwiMjYyNzQ4NyIsIjI0MzIwNDk4IiwiMzEwMjA0MzAiLCIyNDQ3ODg2MiIsIjIzODk3NjgiLCIyNzU0OTkyMiIsIjIzMjA1NjMiLCIyNDcwMTA1OSJdLCJyZXF1ZXN0X3BhcmVudF9pZCI6IkRFRkFVTFRfSE9NRVBBR0UiLCJyZXF1ZXN0X2NoaWxkX2lkIjoiY2Fyb3VzZWwuc3RhbmRhcmQ6c3RvcmVfY2Fyb3VzZWw6Mzc3ZTliNjQtZjQzMi00NmVkLTgzYzYtMDQ5Y2I2MTYzOGNmIiwicmVxdWVzdF9jaGlsZF9jb21wb25lbnRfaWQiOiJjYXJvdXNlbC5zdGFuZGFyZCIsImNyb3NzX3ZlcnRpY2FsX3BhZ2VfdHlwZSI6IkRFRkFVTFRfSE9NRVBBR0UiLCJwYWdlX3N0YWNrX3RyYWNlIjpbXSwidmVydGljYWxfaWRzIjpbXSwidmVydGljYWxfY29udGV4dF9pZCI6bnVsbCwibGF5b3V0X292ZXJyaWRlIjoiVU5TUEVDSUZJRUQiLCJzaW5nbGVfc3RvcmVfaWQiOm51bGwsInNlYXJjaF9pdGVtX2Nhcm91c2VsX2N1cnNvciI6bnVsbCwiY2F0ZWdvcnlfaWRzIjpbXSwiY29sbGVjdGlvbl9pZHMiOltdLCJpc19wYWdpbmF0aW9uX2ZhbGxiYWNrIjpudWxsLCJzb3VyY2VfcGFnZV90eXBlIjpudWxsLCJnZW9fdHlwZSI6IiIsImdlb19pZCI6IiIsImtleXdvcmQiOiIiLCJhZHNfY3Vyc29yX2NhY2hlX2tleSI6bnVsbCwidmlzdWFsX2Fpc2xlc19pbnNlcnRpb25faW5kZXgiOm51bGwsImJhc2VDdXJzb3IiOnsicGFnZV9pZCI6IjM3N2U5YjY0LWY0MzItNDZlZC04M2M2LTA0OWNiNjE2MzhjZiIsInBhZ2VfdHlwZSI6IlNUT1JFX0NBUk9VU0VMX0xBTkRJTkciLCJjdXJzb3JfdmVyc2lvbiI6IkZBQ0VUIn0sInZlcnRpY2FsX25hbWVzIjp7fSwiaXRlbV9pZHMiOltdLCJtZXJjaGFudF9zdXBwbGllZF9pZHMiOltdLCJpc19vdXRfb2Zfc3RvY2siOm51bGwsIm1lbnVfaWQiOm51bGwsInRyYWNraW5nIjpudWxsLCJkaWV0YXJ5X3RhZyI6bnVsbCwib3JpZ2luX3RpdGxlIjpudWxsLCJyYW5rZWRfcmVtYWluaW5nX2NvbGxlY3Rpb25faWRzIjpudWxsLCJwcmV2aW91c2x5X3NlZW5fY29sbGVjdGlvbl9pZHMiOltdLCJwcmVjaGVja291dF9idW5kbGVfc2VhcmNoX2luZm8iOm51bGwsInRvdGFsX2l0ZW1zX29mZnNldCI6MCwidG90YWxfYWRzX3ByZXZpb3VzbHlfYmxlbmRlZCI6MCwidmVydGljYWxfdGl0bGUiOm51bGwsIm11bHRpX3N0b3JlX2VudGl0aWVzIjpbXSwibGFzdF9zZWVuX2l0ZW1faWRzIjpbXSwibGFzdF9pbnNlcnRlZF9yb3dfaW5kZXgiOm51bGwsImN1cnNvclZlcnNpb24iOiJGQUNFVF9DT05URU5UX09GRlNFVCIsInBhZ2VJZCI6IjM3N2U5YjY0LWY0MzItNDZlZC04M2M2LTA0OWNiNjE2MzhjZiIsInBhZ2VUeXBlIjoiU1RPUkVfQ0FST1VTRUxfTEFORElORyJ9', '_blank')
    })
  }

  const needs = items.filter(i => !i.checked)
  const have  = items.filter(i =>  i.checked)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}><i className="ti ti-shopping-cart" aria-hidden="true" /> grocery list</h1>
        <div style={{display:'flex',gap:8}}>
          <button className="btn-ghost" onClick={() => setShowSaved(!showSaved)}>
            <i className="ti ti-history" aria-hidden="true" /> saved lists {savedLists.length > 0 && `(${savedLists.length})`}
          </button>
          <button className="btn-primary" onClick={openAmazon} disabled={!needs.length}>
            <i className="ti ti-shopping-bag" aria-hidden="true" /> shop on doordash
          </button>
        </div>
      </div>

      {/* save list row */}
      <div className={styles.saveRow}>
        <input type="text" placeholder="name this list (optional)..." value={listName}
          onChange={e => setListName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && saveList()}
          style={{flex:2}} />
        <button className="btn-primary" onClick={saveList} disabled={saving || !items.length}>
          <i className="ti ti-device-floppy" aria-hidden="true" /> save list
        </button>
        {have.length > 0 && (
          <button className="btn-ghost" onClick={clearChecked}>
            <i className="ti ti-trash" aria-hidden="true" /> clear checked
          </button>
        )}
      </div>

      {/* saved lists panel */}
      {showSaved && (
        <div className={`card ${styles.savedPanel}`}>
          <div className={styles.savedPanelTitle}>saved lists</div>
          {savedLists.length === 0
            ? <p style={{fontSize:12,color:'var(--text-soft)',padding:'0.5rem 0'}}>no saved lists yet</p>
            : savedLists.map(list => (
              <div key={list.id} className={styles.savedListRow}>
                <div>
                  <div className={styles.savedListName}>{list.name}</div>
                  <div className={styles.savedListItems}>{list.items.slice(0,5).join(' · ')}{list.items.length > 5 ? ` +${list.items.length - 5} more` : ''}</div>
                </div>
                <button className={styles.removeBtn} onClick={() => deleteSavedList(list.id)}>
                  <i className="ti ti-trash" aria-hidden="true" />
                </button>
              </div>
            ))
          }
        </div>
      )}

      {loading ? (
        <p style={{color:'var(--text-soft)',fontSize:13}}>loading...</p>
      ) : (
        <div className={styles.layout}>
          <div className="card">
            <div className={styles.colHeader}>
              <span><i className="ti ti-list-check" aria-hidden="true" /> need to buy</span>
              <span className={styles.count}>{needs.length} items</span>
            </div>
            <div className={styles.list}>
              {needs.length === 0
                ? <p style={{textAlign:'center',fontSize:12,color:'var(--text-soft)',padding:'1rem'}}>list is clear!</p>
                : needs.map(item => (
                  <div key={item.id} className={styles.item}>
                    <input type="checkbox" onChange={() => toggle(item.id, item.checked)} />
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemQty}>{item.qty}</span>
                    <button className={styles.removeBtn} onClick={() => removeItem(item.id)}>
                      <i className="ti ti-trash" aria-hidden="true" />
                    </button>
                  </div>
                ))
              }
            </div>
            <div className={styles.addRow}>
              <input type="text" placeholder="add item..." value={newItem}
                onChange={e => setNewItem(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addItem()}
                style={{flex:2}} />
              <input type="text" placeholder="qty" value={newQty}
                onChange={e => setNewQty(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addItem()}
                style={{flex:1,minWidth:0}} />
              <button className="btn-primary" style={{padding:'7px 12px'}} onClick={addItem}>
                <i className="ti ti-plus" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="card">
            <div className={styles.colHeader}>
              <span><i className="ti ti-circle-check" aria-hidden="true" /> already have</span>
              <span className={styles.count}>{have.length} items</span>
            </div>
            <div className={styles.list}>
              {have.length === 0
                ? <p style={{textAlign:'center',fontSize:12,color:'var(--text-soft)',padding:'1rem'}}>nothing checked off yet</p>
                : have.map(item => (
                  <div key={item.id} className={`${styles.item} ${styles.checked}`}>
                    <input type="checkbox" checked onChange={() => toggle(item.id, item.checked)} />
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemQty}>{item.qty}</span>
                    <button className={styles.removeBtn} onClick={() => removeItem(item.id)}>
                      <i className="ti ti-trash" aria-hidden="true" />
                    </button>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
