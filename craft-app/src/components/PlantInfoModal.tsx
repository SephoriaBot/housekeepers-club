import { useEffect, useState } from 'react'
import type { GardenPlant } from '../types/legacy'

interface Props {
  plant: GardenPlant
}

interface PlantDetails {
  medicinal: boolean
  poisonous_to_pets: boolean
  poisonous_to_humans: boolean
  watering: string | null
  sunlight: string[]
  cycle: string | null
  care_level: string | null
  edible_fruit: boolean
  edible_leaf: boolean
  description: string | null
}

export default function PlantInfoModal({ plant }: Props) {
  const [details, setDetails] = useState<PlantDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!plant.perenual_id) {
      setError('No plant database record for this entry.')
      setLoading(false)
      return
    }
    fetch(`/api/plant-details?id=${plant.perenual_id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setDetails(data)
      })
      .catch(() => setError('Could not load plant info.'))
      .finally(() => setLoading(false))
  }, [plant.perenual_id])

  return (
    <div style={{ fontSize: '0.9rem' }}>
      <h3 style={{ marginBottom: 4 }}>{plant.name}</h3>
      {plant.scientific_name && (
        <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', fontStyle: 'italic', marginBottom: 16 }}>
          {plant.scientific_name}
        </p>
      )}

      {loading && <p style={{ color: 'var(--ink-muted)', fontSize: '0.85rem' }}>Loading plant info…</p>}
      {error && <p style={{ color: '#b91c1c', fontSize: '0.85rem' }}>{error}</p>}

      {details && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Cat safety — front and center */}
          <div style={{
            padding: '10px 14px', borderRadius: 10,
            background: details.poisonous_to_pets ? '#fff0f0' : '#f0fdf4',
            border: `1.5px solid ${details.poisonous_to_pets ? '#fecaca' : '#bbf7d0'}`,
          }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: details.poisonous_to_pets ? '#b91c1c' : '#15803d' }}>
              {details.poisonous_to_pets ? '⚠️ Toxic to pets' : '✓ Safe for pets'}
            </div>
          </div>

          {details.medicinal && plant.medicinal_note && (
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>🌿 Traditional uses</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--ink-soft)', lineHeight: 1.5 }}>{plant.medicinal_note}</p>
            </div>
          )}

          {details.description && (
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>About</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--ink-soft)', lineHeight: 1.5 }}>{details.description}</p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {details.watering && (
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Watering</div>
                <div style={{ fontSize: '0.85rem' }}>{details.watering}</div>
              </div>
            )}
            {details.sunlight.length > 0 && (
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Sunlight</div>
                <div style={{ fontSize: '0.85rem' }}>{details.sunlight.join(', ')}</div>
              </div>
            )}
            {details.cycle && (
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Cycle</div>
                <div style={{ fontSize: '0.85rem' }}>{details.cycle}</div>
              </div>
            )}
            {details.care_level && (
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Care level</div>
                <div style={{ fontSize: '0.85rem' }}>{details.care_level}</div>
              </div>
            )}
          </div>

          {(details.edible_fruit || details.edible_leaf) && (
            <div style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>
              🍽️ Edible {[details.edible_fruit && 'fruit', details.edible_leaf && 'leaf'].filter(Boolean).join(' & ')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
