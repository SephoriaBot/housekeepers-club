import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import styles from './Pets.module.css'

interface Pet {
  id: string
  name: string
  species: string
  breed: string
  age: number
  weight: number
  notes: string
  created_at: string
}

interface Vaccination {
  id: string
  pet_id: string
  name: string
  date_given: string
  next_due: string
  notes: string
}

interface Medication {
  id: string
  pet_id: string
  name: string
  dose: string
  frequency: string
  start_date: string
  end_date: string
  notes: string
}

interface WeightEntry {
  id: string
  pet_id: string
  weight: number
  unit: string
  recorded_at: string
}

const SPECIES_EMOJI: Record<string, string> = {
  cat: '🐱', dog: '🐶', bird: '🐦', rabbit: '🐰', fish: '🐠', other: '🐾'
}

const EMPTY_PET_FORM = { name: '', species: 'cat', breed: '', age: '', weight: '', notes: '' }

export default function Pets() {
  const [pets, setPets] = useState<Pet[]>([])
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [tab, setTab] = useState<'vaccinations' | 'medications' | 'weight' | 'notes'>('vaccinations')
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([])
  const [medications, setMedications] = useState<Medication[]>([])
  const [weights, setWeights] = useState<WeightEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showPetModal, setShowPetModal] = useState(false)
  const [editingPetId, setEditingPetId] = useState<string | null>(null)

  const [petForm, setPetForm] = useState(EMPTY_PET_FORM)

  const [vacForm, setVacForm] = useState({ name: '', date_given: '', next_due: '', notes: '' })
  const [medForm, setMedForm] = useState({ name: '', dose: '', frequency: '', start_date: '', end_date: '', notes: '' })
  const [weightForm, setWeightForm] = useState({ weight: '', unit: 'lbs', recorded_at: new Date().toISOString().split('T')[0] })

  useEffect(() => { fetchPets() }, [])

  useEffect(() => {
    if (selectedPet) {
      fetchVaccinations(selectedPet.id)
      fetchMedications(selectedPet.id)
      fetchWeights(selectedPet.id)
    }
  }, [selectedPet])

  async function fetchPets() {
    setLoading(true)
    const { data } = await supabase.from('pets').select('*').order('name')
    setPets(data ?? [])
    setLoading(false)
  }

  async function fetchVaccinations(petId: string) {
    const { data } = await supabase.from('pet_vaccinations').select('*').eq('pet_id', petId).order('date_given', { ascending: false })
    setVaccinations(data ?? [])
  }

  async function fetchMedications(petId: string) {
    const { data } = await supabase.from('pet_medications').select('*').eq('pet_id', petId).order('start_date', { ascending: false })
    setMedications(data ?? [])
  }

  async function fetchWeights(petId: string) {
    const { data } = await supabase.from('pet_weights').select('*').eq('pet_id', petId).order('recorded_at', { ascending: false })
    setWeights(data ?? [])
  }

  function openAddPet() {
    setEditingPetId(null)
    setPetForm(EMPTY_PET_FORM)
    setShowPetModal(true)
  }

  function openEditPet(pet: Pet) {
    setEditingPetId(pet.id)
    setPetForm({
      name: pet.name,
      species: pet.species ?? 'cat',
      breed: pet.breed ?? '',
      age: pet.age != null ? String(pet.age) : '',
      weight: pet.weight != null ? String(pet.weight) : '',
      notes: pet.notes ?? '',
    })
    setShowPetModal(true)
  }

  async function savePet() {
    if (!petForm.name.trim()) return
    const payload = {
      name: petForm.name.trim(),
      species: petForm.species,
      breed: petForm.breed.trim(),
      age: petForm.age ? parseFloat(petForm.age) : null,
      weight: petForm.weight ? parseFloat(petForm.weight) : null,
      notes: petForm.notes.trim(),
    }

    if (editingPetId) {
      const { data } = await supabase.from('pets').update(payload).eq('id', editingPetId).select().single()
      if (data) {
        setPets(prev => prev.map(p => p.id === editingPetId ? data : p).sort((a, b) => a.name.localeCompare(b.name)))
        if (selectedPet?.id === editingPetId) setSelectedPet(data)
      }
    } else {
      const { data } = await supabase.from('pets').insert(payload).select().single()
      if (data) {
        setPets(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
        setSelectedPet(data)
      }
    }

    setPetForm(EMPTY_PET_FORM)
    setEditingPetId(null)
    setShowPetModal(false)
  }

  async function deletePet(id: string) {
    if (!confirm('Delete this pet and all their records?')) return
    await supabase.from('pets').delete().eq('id', id)
    setPets(prev => prev.filter(p => p.id !== id))
    if (selectedPet?.id === id) setSelectedPet(null)
  }

  async function addVaccination() {
    if (!vacForm.name.trim() || !selectedPet) return
    const { data } = await supabase.from('pet_vaccinations').insert({
      pet_id: selectedPet.id,
      name: vacForm.name.trim(),
      date_given: vacForm.date_given || null,
      next_due: vacForm.next_due || null,
      notes: vacForm.notes.trim(),
    }).select().single()
    if (data) setVaccinations(prev => [data, ...prev])
    setVacForm({ name: '', date_given: '', next_due: '', notes: '' })
  }

  async function deleteVaccination(id: string) {
    await supabase.from('pet_vaccinations').delete().eq('id', id)
    setVaccinations(prev => prev.filter(v => v.id !== id))
  }

  async function addMedication() {
    if (!medForm.name.trim() || !selectedPet) return
    const { data } = await supabase.from('pet_medications').insert({
      pet_id: selectedPet.id,
      name: medForm.name.trim(),
      dose: medForm.dose.trim(),
      frequency: medForm.frequency.trim(),
      start_date: medForm.start_date || null,
      end_date: medForm.end_date || null,
      notes: medForm.notes.trim(),
    }).select().single()
    if (data) setMedications(prev => [data, ...prev])
    setMedForm({ name: '', dose: '', frequency: '', start_date: '', end_date: '', notes: '' })
  }

  async function deleteMedication(id: string) {
    await supabase.from('pet_medications').delete().eq('id', id)
    setMedications(prev => prev.filter(m => m.id !== id))
  }

  async function addWeight() {
    if (!weightForm.weight || !selectedPet) return
    const { data } = await supabase.from('pet_weights').insert({
      pet_id: selectedPet.id,
      weight: parseFloat(weightForm.weight),
      unit: weightForm.unit,
      recorded_at: weightForm.recorded_at,
    }).select().single()
    if (data) setWeights(prev => [data, ...prev])
    setWeightForm({ weight: '', unit: 'lbs', recorded_at: new Date().toISOString().split('T')[0] })
  }

  async function deleteWeight(id: string) {
    await supabase.from('pet_weights').delete().eq('id', id)
    setWeights(prev => prev.filter(w => w.id !== id))
  }

  function isDueSoon(dateStr: string) {
    if (!dateStr) return false
    const due = new Date(dateStr)
    const diff = (due.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    return diff <= 30 && diff >= 0
  }

  function isOverdue(dateStr: string) {
    if (!dateStr) return false
    return new Date(dateStr) < new Date()
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Garden & Home</p>
          <h1 className={styles.title}>My Pets</h1>
        </div>
        <button className="btn-primary" onClick={openAddPet}>+ Add Pet</button>
      </div>

      {/* Add/Edit pet modal */}
      {showPetModal && (
        <div className="modal-overlay" onClick={() => setShowPetModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingPetId ? 'Edit Pet' : 'Add a Pet'}</h3>
              <button className="close-btn" onClick={() => setShowPetModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-input" value={petForm.name} onChange={e => setPetForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Luna" />
              </div>
              <div className="form-group">
                <label className="form-label">Species</label>
                <select className="form-select" value={petForm.species} onChange={e => setPetForm(f => ({ ...f, species: e.target.value }))}>
                  <option value="cat">Cat</option>
                  <option value="dog">Dog</option>
                  <option value="bird">Bird</option>
                  <option value="rabbit">Rabbit</option>
                  <option value="fish">Fish</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Breed</label>
                <input className="form-input" value={petForm.breed} onChange={e => setPetForm(f => ({ ...f, breed: e.target.value }))} placeholder="e.g. Domestic Shorthair" />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Age (years)</label>
                  <input className="form-input" type="number" value={petForm.age} onChange={e => setPetForm(f => ({ ...f, age: e.target.value }))} placeholder="3" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Weight (lbs)</label>
                  <input className="form-input" type="number" value={petForm.weight} onChange={e => setPetForm(f => ({ ...f, weight: e.target.value }))} placeholder="10" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-textarea" value={petForm.notes} onChange={e => setPetForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any important info..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setShowPetModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={savePet}>{editingPetId ? 'Save Changes' : 'Add Pet'}</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--ink-muted)', fontSize: 13 }}>loading...</p>
      ) : pets.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize: '2.5rem', marginBottom: 12 }}>🐾</p>
          <p>No pets yet — add your first one above!</p>
        </div>
      ) : (
        <div className={styles.layout}>

          {/* Pet list */}
          <div className={styles.petList}>
            {pets.map(pet => (
              <div
                key={pet.id}
                className={`${styles.petCard} ${selectedPet?.id === pet.id ? styles.petCardActive : ''}`}
                onClick={() => setSelectedPet(pet)}
              >
                <span className={styles.petEmoji}>{SPECIES_EMOJI[pet.species] ?? '🐾'}</span>
                <div className={styles.petInfo}>
                  <div className={styles.petName}>{pet.name}</div>
                  <div className={styles.petMeta}>{pet.breed || pet.species}</div>
                </div>
                <button className={styles.deleteBtn} onClick={e => { e.stopPropagation(); openEditPet(pet) }} title="edit">✎</button>
                <button className={styles.deleteBtn} onClick={e => { e.stopPropagation(); deletePet(pet.id) }} title="delete">✕</button>
              </div>
            ))}
          </div>

          {/* Pet detail */}
          {selectedPet && (
            <div className={styles.detail}>

              {/* Pet summary */}
              <div className={`card ${styles.petSummary}`}>
                <div className={styles.summaryLeft}>
                  <span className={styles.summaryEmoji}>{SPECIES_EMOJI[selectedPet.species] ?? '🐾'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <h2 className={styles.summaryName}>{selectedPet.name}</h2>
                      <button className="btn-ghost btn-sm" onClick={() => openEditPet(selectedPet)}>✎ Edit</button>
                    </div>
                    <p className={styles.summaryMeta}>
                      {[selectedPet.breed, selectedPet.age ? `${selectedPet.age} yrs` : null, selectedPet.weight ? `${selectedPet.weight} lbs` : null].filter(Boolean).join(' · ')}
                    </p>
                    {selectedPet.notes && <p className={styles.summaryNotes}>{selectedPet.notes}</p>}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className={styles.tabs}>
                {(['vaccinations', 'medications', 'weight', 'notes'] as const).map(t => (
                  <button key={t} className={`${styles.tabBtn} ${tab === t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>
                    {t}
                  </button>
                ))}
              </div>

              {/* Vaccinations */}
              {tab === 'vaccinations' && (
                <div className={styles.section}>
                  <div className={styles.addRow}>
                    <input className="form-input" placeholder="Vaccine name..." value={vacForm.name} onChange={e => setVacForm(f => ({ ...f, name: e.target.value }))} style={{ flex: 2 }} />
                    <input className="form-input" type="date" value={vacForm.date_given} onChange={e => setVacForm(f => ({ ...f, date_given: e.target.value }))} style={{ flex: 1 }} />
                    <input className="form-input" type="date" value={vacForm.next_due} onChange={e => setVacForm(f => ({ ...f, next_due: e.target.value }))} style={{ flex: 1 }} placeholder="Next due" />
                    <button className="btn-primary" onClick={addVaccination}>Add</button>
                  </div>
                  <div className={styles.addRowLabels}>
                    <span style={{ flex: 2 }}>Name</span>
                    <span style={{ flex: 1 }}>Date given</span>
                    <span style={{ flex: 1 }}>Next due</span>
                  </div>
                  {vaccinations.length === 0 ? (
                    <p className={styles.empty}>No vaccinations recorded yet</p>
                  ) : vaccinations.map(v => (
                    <div key={v.id} className={`card ${styles.recordRow}`}>
                      <div className={styles.recordMain}>
                        <span className={styles.recordName}>{v.name}</span>
                        {v.date_given && <span className={styles.recordMeta}>Given: {v.date_given}</span>}
                        {v.next_due && (
                          <span className={`${styles.recordMeta} ${isOverdue(v.next_due) ? styles.overdue : isDueSoon(v.next_due) ? styles.dueSoon : ''}`}>
                            Due: {v.next_due} {isOverdue(v.next_due) ? '⚠️ overdue' : isDueSoon(v.next_due) ? '⏰ soon' : ''}
                          </span>
                        )}
                        {v.notes && <span className={styles.recordNotes}>{v.notes}</span>}
                      </div>
                      <button className={styles.deleteBtn} onClick={() => deleteVaccination(v.id)}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Medications */}
              {tab === 'medications' && (
                <div className={styles.section}>
                  <div className={styles.addRow}>
                    <input className="form-input" placeholder="Medication name..." value={medForm.name} onChange={e => setMedForm(f => ({ ...f, name: e.target.value }))} style={{ flex: 2 }} />
                    <input className="form-input" placeholder="Dose..." value={medForm.dose} onChange={e => setMedForm(f => ({ ...f, dose: e.target.value }))} style={{ flex: 1 }} />
                    <input className="form-input" placeholder="Frequency..." value={medForm.frequency} onChange={e => setMedForm(f => ({ ...f, frequency: e.target.value }))} style={{ flex: 1 }} />
                    <button className="btn-primary" onClick={addMedication}>Add</button>
                  </div>
                  {medications.length === 0 ? (
                    <p className={styles.empty}>No medications recorded yet</p>
                  ) : medications.map(m => (
                    <div key={m.id} className={`card ${styles.recordRow}`}>
                      <div className={styles.recordMain}>
                        <span className={styles.recordName}>{m.name}</span>
                        {m.dose && <span className={styles.recordMeta}>Dose: {m.dose}</span>}
                        {m.frequency && <span className={styles.recordMeta}>Frequency: {m.frequency}</span>}
                        {m.start_date && <span className={styles.recordMeta}>Started: {m.start_date}</span>}
                        {m.end_date && <span className={styles.recordMeta}>Ends: {m.end_date}</span>}
                        {m.notes && <span className={styles.recordNotes}>{m.notes}</span>}
                      </div>
                      <button className={styles.deleteBtn} onClick={() => deleteMedication(m.id)}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Weight */}
              {tab === 'weight' && (
                <div className={styles.section}>
                  <div className={styles.addRow}>
                    <input className="form-input" type="number" placeholder="Weight..." value={weightForm.weight} onChange={e => setWeightForm(f => ({ ...f, weight: e.target.value }))} style={{ flex: 1 }} />
                    <select className="form-select" value={weightForm.unit} onChange={e => setWeightForm(f => ({ ...f, unit: e.target.value }))} style={{ flex: 1 }}>
                      <option value="lbs">lbs</option>
                      <option value="kg">kg</option>
                    </select>
                    <input className="form-input" type="date" value={weightForm.recorded_at} onChange={e => setWeightForm(f => ({ ...f, recorded_at: e.target.value }))} style={{ flex: 1 }} />
                    <button className="btn-primary" onClick={addWeight}>Add</button>
                  </div>
                  {weights.length === 0 ? (
                    <p className={styles.empty}>No weight entries yet</p>
                  ) : weights.map(w => (
                    <div key={w.id} className={`card ${styles.recordRow}`}>
                      <div className={styles.recordMain}>
                        <span className={styles.recordName}>{w.weight} {w.unit}</span>
                        <span className={styles.recordMeta}>{w.recorded_at}</span>
                      </div>
                      <button className={styles.deleteBtn} onClick={() => deleteWeight(w.id)}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Notes */}
              {tab === 'notes' && (
                <div className={styles.section}>
                  <div className={`card ${styles.notesCard}`}>
                    <p className={styles.recordNotes} style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>
                      {selectedPet.notes || 'No notes for this pet yet.'}
                    </p>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      )}
    </div>
  )
}
