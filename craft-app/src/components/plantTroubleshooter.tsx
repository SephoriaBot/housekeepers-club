import { useMemo, useState } from 'react'
import { SYMPTOMS, FOLLOW_UP_QUESTIONS, PLANT_PROBLEMS } from '../data/plantQuestions'
import type { GardenPlant } from '../types'

interface Props {
  plant: GardenPlant
}

type Answers = Record<string, string>

export default function PlantTroubleshooter({ plant }: Props) {
  const [step, setStep] = useState(0)
  const [symptom, setSymptom] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Answers>({})

  function reset() {
    setStep(0)
    setSymptom(null)
    setAnswers({})
  }

  const filteredProblems = useMemo(() => {
    if (!symptom) return []
    return PLANT_PROBLEMS.filter(p => p.symptom === symptom)
  }, [symptom])

  const bestMatch = useMemo(() => {
    if (!symptom) return null

    let best = null
    let bestScore = -1

    for (const problem of filteredProblems) {
      let score = problem.confidence

      // light heuristic adjustment using answers
      if (answers.soil === 'wet' && problem.symptom === 'yellow_leaves' && problem.diagnosis.includes('Overwatering')) {
        score += 10
      }

      if (answers.soil === 'dry' && problem.diagnosis.includes('Underwatering')) {
        score += 10
      }

      if (answers.drainage === 'no' && problem.diagnosis.includes('Overwatering')) {
        score += 8
      }

      if (score > bestScore) {
        bestScore = score
        best = problem
      }
    }

    return best
  }, [symptom, answers, filteredProblems])

  function selectSymptom(value: string) {
    setSymptom(value)
    setStep(1)
  }

  function answerQuestion(id: string, value: string) {
    setAnswers(prev => ({ ...prev, [id]: value }))
    setStep(prev => prev + 1)
  }

  const currentQuestion = FOLLOW_UP_QUESTIONS[step - 1]

  return (
    <div style={{ fontSize: '0.9rem' }}>
      <h3 style={{ marginBottom: 6 }}>Troubleshoot: {plant.name}</h3>
      <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: 16 }}>
        Select symptoms and answer a few questions.
      </p>

      {/* STEP 0: Symptoms */}
      {step === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {SYMPTOMS.map(s => (
            <button
              key={s.value}
              onClick={() => selectSymptom(s.value)}
              style={{
                padding: 10,
                border: '1px solid var(--border)',
                borderRadius: 8,
                background: 'white',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* FOLLOW-UP QUESTIONS */}
      {step > 0 && step <= FOLLOW_UP_QUESTIONS.length && currentQuestion && (
        <div>
          <div style={{ fontWeight: 600, marginBottom: 10 }}>
            {currentQuestion.question}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {currentQuestion.options.map(opt => (
              <button
                key={opt.value}
                onClick={() => answerQuestion(currentQuestion.id, opt.value)}
                style={{
                  padding: 10,
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  background: 'white',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* RESULT */}
      {step > FOLLOW_UP_QUESTIONS.length && bestMatch && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>
            {bestMatch.diagnosis}
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: 10 }}>
            {bestMatch.description}
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Fix</div>
            <ul>
              {bestMatch.fix.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Prevention</div>
            <ul>
              {bestMatch.prevention.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
            Confidence: {bestMatch.confidence}% • Severity: {bestMatch.severity}
          </div>

          <button
            onClick={reset}
            style={{
              marginTop: 12,
              padding: 10,
              border: '1px solid var(--border)',
              borderRadius: 8,
              background: 'white',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Start Over
          </button>
        </div>
      )}
    </div>
  )
}