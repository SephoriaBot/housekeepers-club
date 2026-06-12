import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import styles from './Suggest.module.css'

const DIETS = ['vegetarian','vegan','gluten free','ketogenic','paleo','whole30']
const INTOLERANCES = ['dairy','egg','gluten','peanut','soy','tree nut']
const MAX_TIMES = [
  { label: 'any time', value: '' },
  { label: 'under 15 min', value: '15' },
  { label: 'under 30 min', value: '30' },
  { label: 'under 45 min', value: '45' },
]

interface SpoonRecipe {
  id: number
  title: string
  image: string
  readyInMinutes: number
  servings: number
  vegetarian: boolean
  vegan: boolean
  glutenFree: boolean
  dairyFree: boolean
  summary: string
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g,'&').replace(/&#39;/g,"'").slice(0, 120) + '...'
}

export default function Suggest() {
  const [selectedDiets, setSelectedDiets] = useState<Set<string>>(new Set(['vegetarian']))
  const [selectedIntolerances, setSelectedIntolerances] = useState<Set<string>>(new Set())
  const [maxTime, setMaxTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [meals, setMeals] = useState<SpoonRecipe[]>([])
  const [saved, setSaved] = useState<Set<number>>(new Set())
  const [error, setError] = useState('')

  function toggleSet(setFn: React.Dispatch<React.SetStateAction<Set<string>>>, key: string) {
    setFn(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })
  }

  async function fetchRecipes() {
    setLoading(true)
    setError('')
    setMeals([])
    const params = new URLSearchParams({
      number: '6',
      addRecipeInformation: 'true',
      fillIngredients: 'false',
      sort: 'random',
      apiKey: import.meta.env.VITE_SPOONACULAR_API_KEY,
    })
    if (selectedDiets.size) params.set('diet', [...selectedDiets].join(','))
    if (selectedIntolerances.size) params.set('intolerances', [...selectedIntolerances].join(','))
    if (maxTime) params.set('maxReadyTime', maxTime)

    try {
      const res = await fetch(`https://api.spoonacular.com/recipes/complexSearch?${params}`)
      const data = await res.json()
      if (data.code === 402) { setError('Spoonacular daily limit reached — try again tomorrow'); setLoading(false); return }
      setMeals(data.results || [])
      if (!data.results?.length) setError('No recipes found for those filters — try adjusting them')
    } catch {
      setError('Could not load recipes — check your connection')
    }
    setLoading(false)
  }

  async function saveMeal(m: SpoonRecipe) {
    const tags = [
      m.vegetarian && 'vegetarian',
      m.vegan && 'vegan',
      m.glutenFree && 'gluten-free',
      m.dairyFree && 'dairy-free',
    ].filter(Boolean) as string[]
    const { error } = await supabase.from('meals').upsert(
      { name: m.title, time: `${m.readyInMinutes} min`, tags },
      { onConflict: 'name' }
    )
    if (!error) setSaved(s => new Set([...s, m.id]))
  }

  return (
    <div className={styles.page}>
      <div className={`card ${styles.genBox}`}>
        <h2 className={styles.genTitle}><i className="ti ti-adjustments" aria-hidden="true" /> find recipes that work for you</h2>
        <p className={styles.genSub}>filter by diet, intolerances, and cook time</p>

        <div className={styles.filterSection}>
          <div className={styles.filterLabel}>diet</div>
          <div className={styles.chips}>
            {DIETS.map(d => (
              <button key={d} className={`${styles.chip} ${selectedDiets.has(d) ? styles.active : ''}`}
                onClick={() => toggleSet(setSelectedDiets, d)}>{d}</button>
            ))}
          </div>
        </div>

        <div className={styles.filterSection}>
          <div className={styles.filterLabel}>avoid</div>
          <div className={styles.chips}>
            {INTOLERANCES.map(i => (
              <button key={i} className={`${styles.chip} ${selectedIntolerances.has(i) ? styles.active : ''}`}
                onClick={() => toggleSet(setSelectedIntolerances, i)}>{i}</button>
            ))}
          </div>
        </div>

        <div className={styles.filterSection}>
          <div className={styles.filterLabel}>cook time</div>
          <div className={styles.chips}>
            {MAX_TIMES.map(t => (
              <button key={t.value} className={`${styles.chip} ${maxTime === t.value ? styles.active : ''}`}
                onClick={() => setMaxTime(t.value)}>{t.label}</button>
            ))}
          </div>
        </div>

        <button className="btn-primary" onClick={fetchRecipes} disabled={loading} style={{marginTop:'0.75rem'}}>
          {loading
            ? <><i className="ti ti-loader-2" style={{animation:'spin .7s linear infinite'}} aria-hidden="true" /> loading...</>
            : <><i className="ti ti-search" aria-hidden="true" /> find recipes</>}
        </button>
      </div>

      {loading && <div className={styles.loadingBar}><div className={styles.loadingFill} /></div>}

      {error && <div className="empty-state"><i className="ti ti-alert-circle" aria-hidden="true" />{error}</div>}

      {meals.length > 0 && (
        <>
          <div className={styles.aiBadge}><i className="ti ti-database" aria-hidden="true" /> recipes from Spoonacular</div>
          <div className={styles.resultsGrid}>
            {meals.map(m => (
              <div key={m.id} className={`card ${styles.mealCard}`}>
                {m.image && <img src={m.image} alt={m.title} className={styles.mealThumb} />}
                <div style={{padding:'10px 12px 12px'}}>
                  <h3 className={styles.mealName}>{m.title}</h3>
                  <div className={styles.mealTags}>
                    {m.vegan && <span className="tag">vegan</span>}
                    {m.vegetarian && !m.vegan && <span className="tag">vegetarian</span>}
                    {m.glutenFree && <span className="tag">gluten-free</span>}
                    {m.dairyFree && <span className="tag">dairy-free</span>}
                    <span className={styles.mealTime}>{m.readyInMinutes} min</span>
                  </div>
                  {m.summary && <p className={styles.mealDesc}>{stripHtml(m.summary)}</p>}
                  <button
                    className="btn-ghost"
                    style={{width:'100%',justifyContent:'center',fontSize:11,padding:'5px 8px',marginTop:8}}
                    onClick={() => saveMeal(m)}
                    disabled={saved.has(m.id)}
                  >
                    {saved.has(m.id)
                      ? <><i className="ti ti-check" aria-hidden="true" /> saved!</>
                      : <><i className="ti ti-plus" aria-hidden="true" /> save to my meals</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && !error && meals.length === 0 && (
        <div className="empty-state">
          <i className="ti ti-salad" aria-hidden="true" />
          set your filters and hit find recipes
        </div>
      )}
    </div>
  )
}
