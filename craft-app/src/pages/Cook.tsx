import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ChefHat, AlertCircle, Check, ArrowLeft, ArrowRight } from 'lucide-react'

const CONVERSIONS = {
  us: [
    { from: '1 cup',          to: '16 tbsp' },
    { from: '1 tbsp',         to: '3 tsp' },
    { from: '1 cup',          to: '8 fl oz' },
    { from: '1 lb',           to: '16 oz' },
    { from: '1 stick butter', to: '½ cup / 8 tbsp' },
  ],
  metric: [
    { from: '1 cup',  to: '240 ml' },
    { from: '1 tbsp', to: '15 ml' },
    { from: '1 tsp',  to: '5 ml' },
    { from: '1 oz',   to: '28 g' },
    { from: '1 lb',   to: '454 g' },
  ],
}

interface Ingredient { name: string; measure: string }
interface MealData {
  id: string
  title: string
  thumb: string
  ingredients: Ingredient[]
  steps: string[]
  category: string
}

export default function Cook() {
  const initialMeal = null
  const [savedMeals, setSavedMeals] = useState<{ spoonacular_id: number; name: string }[]>([])
  const [meal, setMeal] = useState<MealData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(0)
  const [unit, setUnit] = useState<'us' | 'metric'>('us')

  useEffect(() => {
    loadSavedMeals()

    if (initialMeal) {
      fetchMeal(initialMeal)
    }
  }, [])

  async function loadSavedMeals() {
    const { data } = await supabase
      .from('meals')
      .select('spoonacular_id, name')
      .order('name')

    setSavedMeals(data ?? [])
  }

  async function fetchMeal(id: number) {
    setLoading(true)
    setError('')
    setMeal(null)
    setStep(0)

    try {
      const res = await fetch(
        `https://api.spoonacular.com/recipes/${id}/information?apiKey=${import.meta.env.VITE_SPOONACULAR_API_KEY}`
      )

      const data = await res.json()

      setMeal({
        id: String(data.id),
        title: data.title,
        thumb: data.image,
        category: data.dishTypes?.join(', ') || '',
        ingredients: (data.extendedIngredients || []).map((i: any) => ({
          name: i.name,
          measure: i.originalMeasure || i.original || ''
        })),
        steps:
          data.analyzedInstructions?.[0]?.steps?.map((s: any) => s.step) ??
          ['No instructions available']
      })
    } catch {
      setError('Could not load recipe.')
    }

    setLoading(false)
  }

  const progressPct = meal
    ? meal.steps.length > 1 ? Math.round((step / (meal.steps.length - 1)) * 100) : 100
    : 0

  function pillStyle() {
    return {
      fontSize: '0.68rem', fontWeight: 700, color: 'var(--pink-dark)',
      background: 'var(--white)', border: '1px solid var(--pink-light)',
      borderRadius: 999, padding: '3px 10px',
    } as React.CSSProperties
  }

  return (
    <div>
      <div className="page-header">
        <h2>Cook 🍳</h2>
      </div>

      <div className="page-body">

        <section>
          <div className="section-label">Choose One of Your Saved Meals</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {savedMeals.map(m => {
              const active = meal?.title === m.name
              return (
                <button
                  key={m.name}
                  onClick={() => fetchMeal(m.spoonacular_id)}
                  style={{
                    background: active ? 'var(--pink-dark)' : 'var(--white)',
                    color: active ? '#fff' : 'var(--ink-soft)',
                    border: `1.5px solid ${active ? 'var(--pink-dark)' : 'var(--border)'}`,
                    borderRadius: 999, padding: '6px 14px', fontSize: '0.8rem',
                    fontWeight: active ? 700 : 600, cursor: 'pointer',
                    fontFamily: "'Nunito Sans', sans-serif",
                  }}
                >
                  {m.name}
                </button>
              )
            })}
          </div>
          {savedMeals.length === 0 && (
            <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', marginTop: 8 }}>
              Save some meals from the Suggestions page first.
            </p>
          )}
        </section>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {!meal && !loading && !error && (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--ink-muted)' }}>
              <ChefHat size={26} style={{ color: 'var(--pink-dark)', marginBottom: 10 }} />
              <div style={{ fontSize: '0.85rem' }}>Search for a recipe above to get started</div>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              <div style={{
                width: 24, height: 24, margin: '0 auto 10px',
                border: '2.5px solid var(--pink-light)', borderTopColor: 'var(--pink-dark)',
                borderRadius: '50%', animation: 'cookSpin 0.7s linear infinite',
              }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>Loading recipe…</span>
            </div>
          )}

          {error && (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--danger)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={20} />
              <span style={{ fontSize: '0.85rem' }}>{error}</span>
            </div>
          )}

          {meal && !loading && (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: 'var(--blush)', padding: '16px 18px',
              }}>
                {meal.thumb && (
                  <img src={meal.thumb} alt={meal.title} style={{
                    width: 96, height: 96, objectFit: 'cover',
                    borderRadius: 'var(--radius-sm)', flexShrink: 0,
                  }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ margin: '0 0 8px', fontSize: '1.15rem', color: 'var(--pink-dark)' }}>{meal.title}</h2>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {meal.category && <span style={pillStyle()}>{meal.category}</span>}
                    <span style={pillStyle()}>{meal.steps.length} steps</span>
                    <span style={pillStyle()}>{meal.ingredients.length} ingredients</span>
                  </div>
                </div>
              </div>

              <div className="cook-grid" style={{ display: 'grid', gridTemplateColumns: '230px 1fr', minHeight: 440 }}>

                {/* INGREDIENTS */}
                <div style={{ borderRight: '1px solid var(--border)', padding: 16, display: 'flex', flexDirection: 'column' }}>
                  <div className="section-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span>Ingredients</span>
                    <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                      <button
                        onClick={() => setUnit('us')}
                        style={{
                          background: unit === 'us' ? 'var(--pink-dark)' : 'none', color: unit === 'us' ? '#fff' : 'var(--ink-muted)',
                          border: 'none', padding: '3px 8px', fontSize: '0.6rem', cursor: 'pointer',
                          fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase',
                        }}
                      >US</button>
                      <button
                        onClick={() => setUnit('metric')}
                        style={{
                          background: unit === 'metric' ? 'var(--pink-dark)' : 'none', color: unit === 'metric' ? '#fff' : 'var(--ink-muted)',
                          border: 'none', padding: '3px 8px', fontSize: '0.6rem', cursor: 'pointer',
                          fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase',
                        }}
                      >Metric</button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 14 }}>
                    {meal.ingredients.map((ing, i) => {
                      const isActive = meal.steps[step]?.toLowerCase().includes(ing.name.toLowerCase())
                      return (
                        <div key={i} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                          padding: '6px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem',
                          background: isActive ? 'var(--blush)' : 'transparent',
                          borderLeft: isActive ? '2px solid var(--pink-dark)' : '2px solid transparent',
                          transition: 'background 0.1s',
                        }}>
                          <span style={{ flex: 1, color: 'var(--ink)' }}>{ing.name}</span>
                          <span style={{ color: 'var(--pink-dark)', fontWeight: 600, fontSize: '0.72rem', textAlign: 'right', minWidth: 65, marginLeft: 8 }}>{ing.measure}</span>
                        </div>
                      )
                    })}
                  </div>

                  <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', marginTop: 'auto' }}>
                    <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--ink-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'IBM Plex Mono', monospace" }}>
                      Quick Conversions
                    </div>
                    {CONVERSIONS[unit].map((c, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', padding: '2px 0', color: 'var(--ink-muted)' }}>
                        <span>{c.from}</span>
                        <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{c.to}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* STEPS */}
                <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column' }}>
                  <div className="section-label">Steps</div>

                  <div style={{ height: 6, background: 'var(--border)', borderRadius: 999, marginBottom: 14, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 999, width: `${progressPct}%`,
                      background: 'linear-gradient(90deg, var(--secondary), var(--pink-dark))',
                      transition: 'width 0.3s',
                    }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                    {meal.steps.map((s, i) => {
                      const state = i < step ? 'done' : i === step ? 'active' : 'pending'
                      return (
                        <div
                          key={i}
                          onClick={() => setStep(i)}
                          style={{
                            border: `1.5px solid ${state === 'active' ? 'var(--pink-dark)' : 'var(--border)'}`,
                            background: state === 'active' ? 'var(--blush)' : 'var(--white)',
                            borderRadius: 'var(--radius-md)', padding: '10px 12px',
                            cursor: 'pointer', opacity: state === 'done' ? 0.55 : 1,
                            transition: 'all 0.15s',
                          }}
                        >
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 20, height: 20, borderRadius: '50%', marginBottom: 6,
                            background: state === 'active' ? 'var(--pink-dark)' : state === 'done' ? 'var(--pink-dark)' : 'var(--cream)',
                            border: `1px solid ${state === 'pending' ? 'var(--border)' : 'var(--pink-dark)'}`,
                            color: state === 'pending' ? 'var(--ink-muted)' : '#fff',
                            fontSize: '0.62rem', fontWeight: 700,
                          }}>
                            {i < step ? <Check size={11} /> : i + 1}
                          </div>
                          <div style={{ fontSize: '0.85rem', lineHeight: 1.55, color: state === 'done' ? 'var(--ink-muted)' : 'var(--ink)' }}>
                            {s}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                    <button
                      className="btn btn-ghost"
                      style={{ flex: 1, justifyContent: 'center' }}
                      disabled={step === 0}
                      onClick={() => setStep(s => s - 1)}
                    >
                      <ArrowLeft size={14} /> Prev
                    </button>
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => step < meal.steps.length - 1 ? setStep(s => s + 1) : undefined}
                    >
                      {step === meal.steps.length - 1
                        ? <><Check size={14} /> Done!</>
                        : <>Next <ArrowRight size={14} /></>}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

      </div>

      <style>{`
        @keyframes cookSpin { to { transform: rotate(360deg); } }
        @media (max-width: 800px) {
          .cook-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
