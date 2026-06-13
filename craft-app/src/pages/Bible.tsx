import { useState } from 'react'
import styles from './Bible.module.css'

const CATEGORIES = [
  { label: 'Plumbing', query: 'leaky faucet pipe drain toilet' },
  { label: 'Electrical', query: 'outlet switch light fixture wiring' },
  { label: 'Appliances', query: 'washing machine refrigerator oven dryer' },
  { label: 'Walls & Floors', query: 'drywall tile flooring paint patch' },
  { label: 'Doors & Windows', query: 'door hinge window lock squeaky' },
  { label: 'HVAC', query: 'furnace AC filter thermostat heating' },
]

interface GuideResult {
  guideid: number
  title: string
  difficulty: string
  time_required: string
  image?: { text: string; thumbnail: string }
  url: string
}

interface Step {
  title: string
  lines: { text_rendered: string }[]
  media?: { data: { standard?: string; thumbnail?: string }[] }
}

interface GuideDetail {
  title: string
  difficulty: string
  time_required: string
  introduction_rendered: string
  steps: Step[]
  image?: { standard: string }
}

export default function Bible() {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<GuideResult[]>([])
  const [guide, setGuide] = useState<GuideDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingGuide, setLoadingGuide] = useState(false)
  const [error, setError] = useState('')
  const [activeStep, setActiveStep] = useState(0)

  async function fetchResults(query: string) {
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setResults([])
    setGuide(null)
    setActiveStep(0)
    try {
      const res = await fetch(
        `https://www.ifixit.com/api/2.0/search/${encodeURIComponent(query)}?doctypes=guide&limit=9`
      )
      const data = await res.json()
      const guides = (data.results || []).filter((r: any) => r.dataType === 'guide')
      if (!guides.length) {
        setError(`No guides found for "${query}" — try different keywords`)
      } else {
        setResults(guides)
      }
    } catch {
      setError('Could not load results — check your connection')
    }
    setLoading(false)
  }

  async function fetchGuide(id: number) {
    setLoadingGuide(true)
    setGuide(null)
    setActiveStep(0)
    try {
      const res = await fetch(`https://www.ifixit.com/api/2.0/guides/${id}`)
      const data = await res.json()
      setGuide(data)
    } catch {
      setError('Could not load guide')
    }
    setLoadingGuide(false)
  }

  function difficultyColor(d: string) {
    if (!d) return ''
    const lower = d.toLowerCase()
    if (lower.includes('easy') || lower.includes('very easy')) return styles.easy
    if (lower.includes('moderate')) return styles.moderate
    return styles.hard
  }

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>home repair & maintenance</p>
          <h1 className={styles.title}>The Housekeepers Bible</h1>
        </div>
      </div>

      {/* Search bar */}
      <div className={styles.searchWrap}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="e.g. leaky faucet, squeaky door, patch drywall..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetchResults(search)}
        />
        <button
          className="btn-primary"
          onClick={() => fetchResults(search)}
          disabled={loading}
        >
          {loading ? 'searching...' : 'search'}
        </button>
      </div>

      {/* Category chips */}
      {!guide && (
        <div className={styles.chips}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.label}
              className={styles.chip}
              onClick={() => { setSearch(cat.label); fetchResults(cat.query) }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="empty-state">
          <i className="ti ti-alert-circle" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Guide detail view */}
      {loadingGuide && (
        <div className="empty-state">loading guide...</div>
      )}

      {guide && !loadingGuide && (
        <div className={styles.guideWrap}>
          <button
            className="btn-ghost"
            style={{ marginBottom: '1.25rem' }}
            onClick={() => { setGuide(null); setActiveStep(0) }}
          >
            <i className="ti ti-arrow-left" aria-hidden="true" /> back to results
          </button>

          <div className={styles.guideHeader}>
            {guide.image?.standard && (
              <img src={guide.image.standard} alt={guide.title} className={styles.guideHero} />
            )}
            <div>
              <h2 className={styles.guideTitle}>{guide.title}</h2>
              <div className={styles.guideMeta}>
                {guide.difficulty && (
                  <span className={`${styles.pill} ${difficultyColor(guide.difficulty)}`}>
                    {guide.difficulty}
                  </span>
                )}
                {guide.time_required && (
                  <span className={styles.pill}>
                    <i className="ti ti-clock" aria-hidden="true" /> {guide.time_required}
                  </span>
                )}
                <span className={styles.pill}>{guide.steps?.length} steps</span>
              </div>
              {guide.introduction_rendered && (
                <p
                  className={styles.intro}
                  dangerouslySetInnerHTML={{ __html: guide.introduction_rendered }}
                />
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${guide.steps.length > 1 ? Math.round((activeStep / (guide.steps.length - 1)) * 100) : 100}%` }}
            />
          </div>

          {/* Steps */}
          <div className={styles.stepsLayout}>
            {/* Step list sidebar */}
            <div className={styles.stepsSidebar}>
              {guide.steps.map((step, i) => (
                <button
                  key={i}
                  className={`${styles.stepBtn} ${i === activeStep ? styles.stepActive : ''} ${i < activeStep ? styles.stepDone : ''}`}
                  onClick={() => setActiveStep(i)}
                >
                  <span className={styles.stepNum}>
                    {i < activeStep
                      ? <i className="ti ti-check" style={{ fontSize: 10 }} aria-hidden="true" />
                      : i + 1}
                  </span>
                  <span className={styles.stepLabel}>{step.title || `Step ${i + 1}`}</span>
                </button>
              ))}
            </div>

            {/* Active step detail */}
            <div className={styles.stepDetail}>
              {guide.steps[activeStep] && (
                <>
                  <h3 className={styles.stepTitle}>
                    Step {activeStep + 1}: {guide.steps[activeStep].title || ''}
                  </h3>

                  {/* Step images */}
                  {guide.steps[activeStep].media?.data?.length > 0 && (
                    <div className={styles.stepImages}>
                      {guide.steps[activeStep].media.data.slice(0, 3).map((img, i) =>
                        img.standard || img.thumbnail ? (
                          <img
                            key={i}
                            src={img.standard || img.thumbnail}
                            alt={`step ${activeStep + 1} image ${i + 1}`}
                            className={styles.stepImg}
                          />
                        ) : null
                      )}
                    </div>
                  )}

                  {/* Step instructions */}
                  <div className={styles.stepLines}>
                    {guide.steps[activeStep].lines.map((line, i) => (
                      <p
                        key={i}
                        className={styles.stepLine}
                        dangerouslySetInnerHTML={{ __html: line.text_rendered }}
                      />
                    ))}
                  </div>

                  {/* Nav buttons */}
                  <div className={styles.navRow}>
                    <button
                      className="btn-ghost"
                      disabled={activeStep === 0}
                      onClick={() => setActiveStep(s => s - 1)}
                    >
                      <i className="ti ti-arrow-left" aria-hidden="true" /> prev
                    </button>
                    <button
                      className="btn-primary"
                      disabled={activeStep === guide.steps.length - 1}
                      onClick={() => setActiveStep(s => s + 1)}
                    >
                      next <i className="ti ti-arrow-right" aria-hidden="true" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results grid */}
      {!guide && !loadingGuide && results.length > 0 && (
        <div className={styles.resultsGrid}>
          {results.map(r => (
            <div
              key={r.guideid}
              className={`card ${styles.resultCard}`}
              onClick={() => fetchGuide(r.guideid)}
            >
              {r.image?.thumbnail && (
                <img src={r.image.thumbnail} alt={r.title} className={styles.resultThumb} />
              )}
              <div className={styles.resultBody}>
                <h3 className={styles.resultTitle}>{r.title}</h3>
                <div className={styles.resultMeta}>
                  {r.difficulty && (
                    <span className={`${styles.pill} ${difficultyColor(r.difficulty)}`}>
                      {r.difficulty}
                    </span>
                  )}
                  {r.time_required && (
                    <span className={styles.pill}>{r.time_required}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !loadingGuide && !error && results.length === 0 && !guide && (
        <div className="empty-state">
          <i className="ti ti-tool" aria-hidden="true" />
          <p>search for a repair above or pick a category</p>
        </div>
      )}
    </div>
  )
}
