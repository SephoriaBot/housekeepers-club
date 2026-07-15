import { useState, useEffect } from 'react'
import type { WeekPlan, Meal } from '../types/legacy'
import { supabase } from '../lib/supabase'
import { Sparkles, Plus, X, Heart, Salad, ChefHat, Trash2, Check, Loader2, ShoppingCart } from 'lucide-react'

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const MEAL_TYPES = ['breakfast','lunch','dinner'] as const

const EMPTY_PLAN: WeekPlan = Object.fromEntries(
  DAYS.map(d => [d, { breakfast: null, lunch: null, dinner: null }])
)

interface PlannerProps {
  onNavigate: (page: string) => void
}

// words/phrases that signal the end of the ingredient name
const TRAILING_STOPWORDS = [
  'to taste','or more','as needed','such as','about','approx','approximately',
  'optional','if desired','for serving','for garnish','for topping',
]

export default function Planner({ onNavigate }: PlannerProps) {
  const [plan, setPlan] = useState<WeekPlan>(EMPTY_PLAN)
  const [meals, setMeals] = useState<Meal[]>([])
  const [selecting, setSelecting] = useState<{day:string; type:typeof MEAL_TYPES[number]} | null>(null)
  const [loading, setLoading] = useState(true)
  const [addingId, setAddingId] = useState<string | null>(null)
  const [addedId, setAddedId] = useState<string | null>(null)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    const [mealsRes, planRes] = await Promise.all([
      supabase.from('meals').select('*').order('name'),
      supabase.from('week_plans').select('*')
    ])
    if (mealsRes.data) setMeals(mealsRes.data)
    if (planRes.data?.length) {
      const rebuilt: WeekPlan = { ...EMPTY_PLAN }
      planRes.data.forEach((row: any) => {
        if (!rebuilt[row.day]) rebuilt[row.day] = { breakfast: null, lunch: null, dinner: null }
        rebuilt[row.day][row.meal_type as typeof MEAL_TYPES[number]] = row.meal_name
      })
      setPlan(rebuilt)
    }
    setLoading(false)
  }

  async function assignMeal(mealName: string) {
    if (!selecting) return
    const { day, type } = selecting
    await supabase.from('week_plans').upsert(
      { day, meal_type: type, meal_name: mealName },
      { onConflict: 'day,meal_type' }
    )
    setPlan(p => ({ ...p, [day]: { ...p[day], [type]: mealName } }))
    setSelecting(null)
  }

  async function clearSlot(day: string, type: string) {
    await supabase.from('week_plans')
      .delete()
      .eq('day', day)
      .eq('meal_type', type)
    setPlan(p => ({ ...p, [day]: { ...p[day], [type]: null } }))
  }

  async function deleteMeal(id: string) {
    await supabase.from('meals').delete().eq('id', id)
    setMeals(prev => prev.filter(m => m.id !== id))
  }

  function cleanIngredient(raw: string): string {
    const units = new Set([
      'cup','cups','tbsp','tsp','tablespoon','tablespoons','teaspoon','teaspoons',
      'oz','ounce','ounces','lb','lbs','pound','pounds','g','gram','grams',
      'kg','ml','l','liter','liters','pinch','dash','can','cans','clove','cloves',
      'slice','slices','piece','pieces','large','medium','small','whole','bunch',
      'handful','package','packages','pkg','sprig','sprigs','stalk','stalks',
      'head','heads','quart','quarts','pint','pints','gallon','gallons',
    ])
    const skipWords = new Set([
      'of','fresh','dried','ground','chopped','minced','diced','sliced','to',
      'taste','or','and','finely','roughly','coarsely','about','approximately',
    ])

    // 1. strip parenthetical content
    let cleaned = raw.replace(/\(.*?\)/g, '').trim()

    // 2. strip trailing clauses like "to taste", "or more as needed", "such as X"
    for (const phrase of TRAILING_STOPWORDS) {
      const idx = cleaned.toLowerCase().indexOf(phrase)
      if (idx !== -1) cleaned = cleaned.slice(0, idx).trim()
    }

    // 2b. strip everything after the first comma (almost always prep instructions
    // like ", finely chopped" or ", crushed" rather than part of the ingredient name)
    const commaIdx = cleaned.indexOf(',')
    if (commaIdx !== -1) cleaned = cleaned.slice(0, commaIdx).trim()

    // 3. strip leading numbers, fractions, units, and skip words
    const words = cleaned.split(/\s+/)
    const start = words.findIndex(w => {
      const c = w.toLowerCase().replace(/[.,;:]/g, '')
      return (
        c.length > 0 &&
        isNaN(parseFloat(c)) &&
        !/^[\d/¼½¾⅓⅔⅛⅜⅝⅞-]+$/.test(c) &&
        !units.has(c) &&
        !skipWords.has(c)
      )
    })

    // 4. strip trailing punctuation
    const result = (start === -1 ? cleaned : words.slice(start).join(' '))
      .replace(/[,;:]+$/, '')
      .trim()

    return result || raw
  }

  function normalizeForDedup(name: string): string {
    let n = name.toLowerCase().trim()
    // naive singular/plural normalization: drop trailing "es" or "s" (but not for short words)
    if (n.endsWith('es') && n.length > 4) n = n.slice(0, -2)
    else if (n.endsWith('s') && !n.endsWith('ss') && n.length > 3) n = n.slice(0, -1)
    return n
  }

  async function sendToGroceryList(meal: Meal) {
    const ingredients = meal.ingredients ?? []
    if (!ingredients.length) return
    setAddingId(meal.id)

    const cleanedNames = ingredients.map(cleanIngredient)
    const seen = new Map<string, string>() // normalized -> first-seen display name

    for (const name of cleanedNames) {
      const key = normalizeForDedup(name)
      if (!seen.has(key)) seen.set(key, name)
    }

    // check what's already on the grocery list so we don't duplicate it
    const { data: existing } = await supabase.from('grocery_items').select('name')
    const existingKeys = new Set((existing ?? []).map(e => normalizeForDedup(e.name)))

    const rows = Array.from(seen.entries())
      .filter(([key]) => !existingKeys.has(key))
      .map(([, name]) => ({ name, qty: '', checked: false }))

    if (rows.length) {
      await supabase.from('grocery_items').insert(rows)
    }

    setAddingId(null)
    setAddedId(meal.id)
    setTimeout(() => setAddedId(null), 2000)
  }

  return (
    <div>
      <div className="page-header">
        <h2>This Week</h2>
        <button className="btn btn-primary" onClick={() => onNavigate('suggest')}>
          <Sparkles size={14} /> Get Meal Ideas
        </button>
      </div>

      <div className="page-body">
        {loading ? <p style={{ color: 'var(--ink-muted)', fontSize: 13 }}>Loading…</p> : (
          <>
            <div className="planner-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, overflowX: 'auto', minWidth: 0 }}>
              {DAYS.map(day => (
                <div key={day} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{
                    background: 'var(--blush)', color: 'var(--pink-dark)', fontSize: '0.62rem', fontWeight: 700,
                    textAlign: 'center', padding: '5px 4px', textTransform: 'uppercase', letterSpacing: '0.05em',
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}>
                    {day}
                  </div>
                  <div style={{ padding: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {MEAL_TYPES.map(type => {
                      const meal = plan[day]?.[type]
                      return (
                        <div
                          key={type}
                          onClick={() => meal ? clearSlot(day, type) : setSelecting({ day, type: type })}
                          title={meal ? 'Click to clear' : `Add ${type}`}
                          style={{
                            borderRadius: 'var(--radius-sm)', padding: '5px 6px', cursor: 'pointer',
                            minHeight: 30, display: 'flex', alignItems: meal ? 'flex-start' : 'center', gap: 4,
                            flexDirection: meal ? 'column' : 'row',
                            border: meal ? '1.5px solid var(--pink-light)' : '1px dashed var(--border)',
                            background: meal ? 'var(--blush)' : 'transparent',
                            color: meal ? 'var(--ink)' : 'var(--ink-muted)',
                            fontSize: '0.6rem', transition: 'background 0.1s',
                          }}
                        >
                          <span style={{ fontSize: '0.52rem', color: 'var(--pink-dark)', fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>
                            {type[0].toUpperCase()}
                          </span>
                          {meal
                            ? <span style={{ fontSize: '0.6rem', lineHeight: 1.3 }}>{meal}</span>
                            : <Plus size={9} style={{ opacity: 0.4 }} />
                          }
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {selecting && (
              <div className="modal-overlay" onClick={() => setSelecting(null)}>
                <div className="modal" style={{ maxWidth: 340, maxHeight: '70vh' }} onClick={e => e.stopPropagation()}>
                  <div className="modal-header" style={{ background: 'var(--blush)', color: 'var(--pink-dark)' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Pick a meal for {selecting.day} {selecting.type}</span>
                    <button className="close-btn" onClick={() => setSelecting(null)}><X size={16} /></button>
                  </div>
                  <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {meals.length === 0 && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', padding: '1rem', textAlign: 'center' }}>
                        No saved meals yet — visit Suggest Meals to add some
                      </p>
                    )}
                    {meals.map(m => (
                      <div
                        key={m.id}
                        onClick={() => assignMeal(m.name)}
                        style={{
                          padding: '10px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                          border: '1.5px solid var(--border)', background: 'var(--white)', transition: 'background 0.1s',
                        }}
                      >
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 2, color: 'var(--ink)' }}>{m.name}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--ink-muted)' }}>{m.time}</span>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 3 }}>
                          {m.tags.map(t => <span key={t} className={`tag ${t}`}>{t}</span>)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <section style={{ marginTop: 8 }}>
              <h2 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Heart size={16} style={{ color: 'var(--pink)' }} /> Saved Meals
              </h2>
              {meals.length === 0 ? (
                <div className="empty-state">
                  <Salad size={20} />
                  No saved meals yet — go to Suggest Meals to find some
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
                  {meals.map(m => {
                    const hasIngredients = (m.ingredients ?? []).length > 0
                    return (
                      <div key={m.id} className="card">
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 5, color: 'var(--ink)' }}>{m.name}</div>
                          <button
                            className="btn btn-danger btn-sm"
                            style={{ flexShrink: 0, padding: '2px 6px' }}
                            onClick={() => deleteMeal(m.id)}
                            title="Delete meal"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ color: 'var(--ink-muted)', fontSize: '0.68rem' }}>{m.time}</span>
                          {m.tags.map(t => <span key={t} className={`tag ${t}`}>{t}</span>)}
                        </div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                          <button
                            className="btn btn-ghost"
                            style={{ fontSize: '0.68rem', padding: '4px 8px', flex: 1, justifyContent: 'center' }}
                            onClick={() => onNavigate('cook')}
                          >
                            <ChefHat size={12} /> Cook This
                          </button>
                          <button
                            className="btn btn-primary"
                            style={{ fontSize: '0.68rem', padding: '4px 8px', flex: 1, justifyContent: 'center' }}
                            onClick={() => sendToGroceryList(m)}
                            disabled={!hasIngredients || addingId === m.id}
                            title={!hasIngredients ? 'No ingredients saved for this meal' : ''}
                          >
                            {addedId === m.id
                              ? <><Check size={12} /> Added!</>
                              : addingId === m.id
                                ? <><Loader2 size={12} style={{ animation: 'spin 0.7s linear infinite' }} /> Adding...</>
                                : <><ShoppingCart size={12} /> Add to List</>}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 700px) {
          .planner-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 6px !important; }
        }
      `}</style>
    </div>
  )
}
