import { useState, useEffect } from 'react'
import type { GroceryItem } from '../types'
import { supabase } from '../lib/supabase'
import styles from './Grocery.module.css'

interface SavedList { id: string; name: string; items: string[]; created_at: string }

interface PriceEntry {
  id: string
  item_name: string
  store: string
  price: number
  updated_at: string
}

export default function Grocery() {
  const [items, setItems] = useState<GroceryItem[]>([])
  const [newItem, setNewItem] = useState('')
  const [newQty, setNewQty] = useState('')
  const [loading, setLoading] = useState(true)
  const [savedLists, setSavedLists] = useState<SavedList[]>([])
  const [listName, setListName] = useState('')
  const [showSaved, setShowSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [cart, setCart] = useState<any[]>([])
  const [loadingCart, setLoadingCart] = useState(false)
  const [prices, setPrices] = useState<PriceEntry[]>([])
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [priceForm, setPriceForm] = useState<{ store: string; price: string }>({ store: '', price: '' })
  const [location, setLocation] = useState(() => localStorage.getItem('grocery_location') || '')

  useEffect(() => {
    fetchItems()
    fetchSavedLists()
    fetchPrices()
  }, [])

  async function fetchItems() {
    setLoading(true)
    const { data } = await supabase
      .from('grocery_items')
      .select('*')
      .order('created_at', { ascending: true })
    setItems(data ?? [])
    setLoading(false)
  }

  async function fetchSavedLists() {
    const { data } = await supabase
      .from('saved_grocery_lists')
      .select('*')
      .order('created_at', { ascending: false })
    setSavedLists(data ?? [])
  }

  async function fetchPrices() {
    const { data } = await supabase
      .from('grocery_prices')
      .select('*')
      .order('price', { ascending: true })
    setPrices(data ?? [])
  }

  async function addItem() {
    const name = newItem.trim()
    if (!name) return
    const { data } = await supabase
      .from('grocery_items')
      .insert({ name, qty: newQty.trim(), checked: false })
      .select().single()
    if (data) setItems(prev => [...prev, data])
    setNewItem('')
    setNewQty('')
  }

  async function buildSmartCart() {
    const needItems = items.filter(i => !i.checked)
    setLoadingCart(true)
    const results = await Promise.all(
      needItems.map(async (item) => {
        const res = await fetch(`/api/product-search?q=${encodeURIComponent(item.name)}&zip=${encodeURIComponent(location)}`)
        const data = await res.json()
        return {
          item: item.name,
          results: Array.isArray(data) ? data : []
        }
      })
    )
    setCart(results)
    setLoadingCart(false)
  }

  function refreshSmartCart() {
    setCart([])
    buildSmartCart()
  }

  function clearSmartCart() {
    setCart([])
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
      .insert({ name, items: itemNames })
      .select().single()
    if (data) setSavedLists(prev => [data, ...prev])
    setListName('')
    setSaving(false)
  }

  async function deleteSavedList(id: string) {
    await supabase.from('saved_grocery_lists').delete().eq('id', id)
    setSavedLists(prev => prev.filter(l => l.id !== id))
  }

  function openShoppingList() {
    const needItems = items.filter(i => !i.checked)
    if (!needItems.length) return
    const listText = needItems.map(i => `${i.qty ? i.qty + ' ' : ''}${i.name}`).join('\n')
    navigator.clipboard?.writeText(listText).then(() => {
      window.location.href = 'mobilenotes://'
      setTimeout(() => {
        alert('Your list has been copied!\n\nOpen Notes and paste (long-press → Paste) to create your shopping list.')
      }, 500)
    }).catch(() => {
      alert(`Copy failed — here's your list:\n\n${listText}`)
    })
  }

  function searchOnInstacart(itemId: string, itemName: string) {
    const query = encodeURIComponent(itemName)
    window.open(`https://www.instacart.com/store/s?k=${query}`, '_blank')
    setPriceForm({ store: 'Instacart', price: '' })
    setExpandedItem(itemId)
  }

  function saveLocation(val: string) {
    setLocation(val)
    localStorage.setItem('grocery_location', val)
  }

  function pricesFor(itemName: string) {
    return prices
      .filter(p => p.item_name.toLowerCase() === itemName.toLowerCase())
      .sort((a, b) => a.price - b.price)
  }

  function cheapestFor(itemName: string) {
    const list = pricesFor(itemName)
    return list.length > 0 ? list[0] : null
  }

  function isStale(dateStr: string) {
    const days = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
    return days > 30
  }

  async function addPrice(itemName: string) {
    if (!priceForm.store.trim() || !priceForm.price) return
    const { data } = await supabase
      .from('grocery_prices')
      .insert({
        item_name: itemName,
        store: priceForm.store.trim(),
        price: parseFloat(priceForm.price),
        updated_at: new Date().toISOString().split('T')[0],
      })
      .select().single()
    if (data) setPrices(prev => [...prev, data].sort((a, b) => a.price - b.price))
    setPriceForm({ store: '', price: '' })
  }

  async function deletePrice(id: string) {
    await supabase.from('grocery_prices').delete().eq('id', id)
    setPrices(prev => prev.filter(p => p.id !== id))
  }

  function storeTally() {
    const storeCounts = new Map<string, number>()
    const storeTotals = new Map<string, number>()

    cart.forEach(c => {
      const byStore = new Map<string, number>()
      c.results?.forEach((r: any) => {
        if (!r.store || r.price == null) return
        if (!byStore.has(r.store) || r.price < byStore.get(r.store)!) {
          byStore.set(r.store, r.price)
        }
      })
      byStore.forEach((price, store) => {
        storeCounts.set(store, (storeCounts.get(store) ?? 0) + 1)
        storeTotals.set(store, (storeTotals.get(store) ?? 0) + price)
      })
    })

    return Array.from(storeCounts.entries())
      .map(([store, count]) => ({
        store,
        count,
        total: storeTotals.get(store) ?? 0
      }))
      .sort((a, b) => b.count - a.count || a.total - b.total)
  }

  const needs = items.filter(i => !i.checked)
  const have  = items.filter(i =>  i.checked)
  const tally = storeTally()
  const totalTracked = tally.reduce((sum, t) => sum + t.count, 0)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}><i className="ti ti-shopping-cart" aria-hidden="true" /> grocery list</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={buildSmartCart}>Build Smart Cart</button>
          <button onClick={refreshSmartCart}>Refresh</button>
          <button onClick={clearSmartCart}>Clear</button>
          <button className="btn-ghost" onClick={() => setShowSaved(!showSaved)}>
            <i className="ti ti-history" aria-hidden="true" /> saved lists {savedLists.length > 0 && `(${savedLists.length})`}
          </button>
          <button className="btn-primary" onClick={openShoppingList} disabled={!needs.length}>
            <i className="ti ti-clipboard-list" aria-hidden="true" /> copy list & open notes
          </button>
        </div>
      </div>

      {/* location input */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <i className="ti ti-map-pin" aria-hidden="true" />
        <input
          type="text"
          placeholder="city, state (e.g. Richmond, Virginia)..."
          value={location}
          onChange={e => saveLocation(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && buildSmartCart()}
          style={{ width: 280 }}
        />
        <button className="btn-primary" onClick={buildSmartCart} disabled={!location}>
          <i className="ti ti-search" aria-hidden="true" /> search
        </button>
      </div>

      {/* save list row */}
      <div className={styles.saveRow}>
        <input type="text" placeholder="name this list (optional)..." value={listName}
          onChange={e => setListName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && saveList()}
          style={{ flex: 2 }} />
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
            ? <p style={{ fontSize: 12, color: 'var(--ink-muted)', padding: '0.5rem 0' }}>no saved lists yet</p>
            : savedLists.map(list => (
              <div key={list.id} className={styles.savedListRow}>
                <div>
                  <div className={styles.savedListName}>{list.name}</div>
                  <div className={styles.savedListItems}>{list.items.slice(0, 5).join(' · ')}{list.items.length > 5 ? ` +${list.items.length - 5} more` : ''}</div>
                </div>
                <button className={styles.removeBtn} onClick={() => deleteSavedList(list.id)}>
                  <i className="ti ti-trash" aria-hidden="true" />
                </button>
              </div>
            ))
          }
        </div>
      )}

      {/* store leaderboard */}
      {tally.length > 0 && (
        <div className={`card ${styles.savedPanel}`}>
          <div className={styles.savedPanelTitle}>best store for your list</div>
          {tally.map((t, i) => (
            <div key={t.store} className={styles.tallyRow}>
              <span className={styles.tallyRank}>{i + 1}</span>
              <span className={styles.tallyStore}>{t.store}</span>
              <div className={styles.tallyBarTrack}>
                <div className={styles.tallyBarFill} style={{ width: `${(t.count / totalTracked) * 100}%` }} />
              </div>
              <span className={styles.tallyCount}>{t.count}/{totalTracked} items</span>
              <span className={styles.priceBadge}>${t.total.toFixed(2)} est.</span>
            </div>
          ))}
        </div>
      )}
