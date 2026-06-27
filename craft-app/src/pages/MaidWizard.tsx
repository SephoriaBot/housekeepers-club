import { useState } from 'react'
import { Clock, Package, ChevronRight, RotateCcw, CheckCircle2, Circle } from 'lucide-react'

const ROOMS = [
  { value: 'kitchen', label: 'Kitchen', emoji: '🍳' },
  { value: 'bathroom', label: 'Bathroom', emoji: '🛁' },
  { value: 'bedroom', label: 'Bedroom', emoji: '🛏️' },
  { value: 'living_room', label: 'Living Room', emoji: '🛋️' },
  { value: 'laundry_room', label: 'Laundry Room', emoji: '🧺' },
]

interface CleaningPlan {
  supplies: string[]
  estimatedMinutes: number
  steps: { title: string; detail: string }[]
}

const CLEANING_PLANS: Record<string, CleaningPlan> = {
  kitchen: {
    supplies: [
      'All-purpose cleaner',
      'Degreaser spray',
      'Dish soap',
      'Microfiber cloths',
      'Scrub sponge',
      'Baking soda',
      'White vinegar',
      'Trash bags',
    ],
    estimatedMinutes: 45,
    steps: [
      { title: 'Clear all surfaces', detail: 'Remove everything from countertops, stovetop, and the top of the fridge. Set items aside on the table.' },
      { title: 'Soak the stovetop grates', detail: 'Place grates and burner covers in the sink with hot soapy water to soak while you clean everything else.' },
      { title: 'Wipe down cabinet fronts', detail: 'Spray degreaser on a cloth and wipe all cabinet and drawer fronts, paying extra attention to handles.' },
      { title: 'Clean the microwave', detail: 'Microwave a bowl of water + 2 tbsp vinegar for 3 minutes, then wipe the interior clean with a damp cloth.' },
      { title: 'Scrub the stovetop', detail: 'Spray degreaser on the stovetop, let sit 2 minutes, then scrub with a sponge. Dry the soaked grates and replace.' },
      { title: 'Wipe countertops', detail: 'Spray all-purpose cleaner on countertops and scrub any stains with baking soda. Rinse and dry.' },
      { title: 'Clean the sink', detail: 'Sprinkle baking soda in the sink, scrub with a sponge, rinse, then wipe the faucet and handles.' },
      { title: 'Wipe down appliances', detail: 'Clean the outside of the fridge, dishwasher, and any small appliances with an all-purpose cloth.' },
      { title: 'Take out trash & reline', detail: 'Empty the trash, wipe the inside of the can with a disinfecting wipe, and put in a fresh bag.' },
      { title: 'Sweep and mop the floor', detail: 'Sweep corners and under appliances first, then mop the full floor. Let dry before walking on it.' },
    ],
  },
  bathroom: {
    supplies: [
      'Toilet bowl cleaner',
      'Bathroom disinfectant spray',
      'Glass cleaner',
      'Scrub brush',
      'Microfiber cloths',
      'Old toothbrush (for grout)',
      'Trash bags',
      'Rubber gloves',
    ],
    estimatedMinutes: 35,
    steps: [
      { title: 'Apply toilet bowl cleaner', detail: 'Squirt cleaner under the rim and let it sit while you clean everything else.' },
      { title: 'Clear the counters', detail: 'Remove everything from the sink counter and the top of the toilet tank.' },
      { title: 'Spray the shower/tub', detail: 'Spray bathroom cleaner on all shower and tub surfaces and let it soak for 5 minutes.' },
      { title: 'Scrub the shower/tub', detail: 'Scrub walls, floor, and fixtures with a sponge. Use an old toothbrush on grout lines and around the drain.' },
      { title: 'Rinse the shower/tub', detail: 'Rinse all surfaces thoroughly and wipe the fixtures dry to prevent water spots.' },
      { title: 'Clean the sink and counter', detail: 'Spray and scrub the sink basin, faucet, and handles. Wipe the counter dry and replace items.' },
      { title: 'Scrub and flush the toilet', detail: 'Scrub the bowl with the brush, then flush. Spray and wipe the outside of the toilet top to bottom: tank, seat, base.' },
      { title: 'Clean the mirror', detail: 'Spray glass cleaner and wipe in an S-pattern with a microfiber cloth for a streak-free finish.' },
      { title: 'Wipe walls and light switch', detail: 'Spot-clean any visible splatter on walls and wipe the light switch plate.' },
      { title: 'Sweep and mop the floor', detail: 'Sweep around the toilet base and in corners, then mop. Replace the trash bag.' },
    ],
  },
  bedroom: {
    supplies: [
      'All-purpose cleaner',
      'Glass cleaner',
      'Microfiber cloths',
      'Vacuum with attachments',
      'Laundry basket',
      'Dusting wand or cloth',
      'Trash bag',
    ],
    estimatedMinutes: 40,
    steps: [
      { title: 'Strip the bed', detail: 'Remove all bedding and pillowcases and start a wash cycle if needed.' },
      { title: 'Declutter surfaces', detail: 'Clear nightstands, dresser tops, and the floor. Put laundry in the basket and trash in the bag.' },
      { title: 'Dust ceiling fans and light fixtures', detail: 'Wipe fan blades with a damp cloth and dust any overhead fixtures from the top down.' },
      { title: 'Dust all surfaces', detail: 'Dust shelves, nightstands, dresser, headboard, and baseboards using a microfiber cloth or duster.' },
      { title: 'Wipe mirrors and glass', detail: 'Spray glass cleaner on mirrors and wipe in an S-pattern until streak-free.' },
      { title: 'Wipe down furniture', detail: 'Wipe hard furniture surfaces with an all-purpose cleaner, paying attention to handles and knobs.' },
      { title: 'Vacuum upholstered items', detail: 'Use the upholstery attachment on any chairs, cushions, or the mattress.' },
      { title: 'Vacuum the floor', detail: 'Vacuum under the bed, in corners, and along baseboards, then do the main floor area.' },
      { title: 'Remake the bed', detail: 'Put on fresh sheets and pillowcases. Fluff and arrange pillows.' },
      { title: 'Open a window', detail: 'Air the room out for 10–15 minutes after cleaning to freshen the space.' },
    ],
  },
  living_room: {
    supplies: [
      'All-purpose cleaner',
      'Glass cleaner',
      'Microfiber cloths',
      'Vacuum with attachments',
      'Dusting wand',
      'Trash bag',
    ],
    estimatedMinutes: 40,
    steps: [
      { title: 'Declutter the room', detail: 'Pick up any items that don\'t belong, put remotes and books in their places, and clear the coffee table.' },
      { title: 'Dust from the top down', detail: 'Start with ceiling fans, then light fixtures, shelves, and entertainment center. Work your way down to lower surfaces.' },
      { title: 'Wipe hard surfaces', detail: 'Wipe down the coffee table, side tables, and shelves with all-purpose cleaner.' },
      { title: 'Clean electronics and screens', detail: 'Wipe TV screens with a dry microfiber cloth. Clean remotes and gaming controllers with a slightly damp cloth.' },
      { title: 'Clean windows and mirrors', detail: 'Spray glass cleaner on windows and mirrors and wipe streak-free.' },
      { title: 'Fluff and rotate cushions', detail: 'Remove couch cushions, vacuum under them, then fluff and replace or rotate them.' },
      { title: 'Vacuum upholstery', detail: 'Use the upholstery attachment to vacuum the sofa, chairs, and any fabric surfaces.' },
      { title: 'Wipe baseboards', detail: 'Run a damp cloth along baseboards and door frames.' },
      { title: 'Vacuum or sweep the floor', detail: 'Vacuum rugs and carpet, or sweep hard floors, getting into corners and under furniture edges.' },
      { title: 'Mop hard floors', detail: 'Mop any hard floor areas and let dry.' },
    ],
  },
  laundry_room: {
    supplies: [
      'All-purpose cleaner',
      'White vinegar',
      'Microfiber cloths',
      'Old toothbrush',
      'Vacuum with hose attachment',
      'Trash bag',
    ],
    estimatedMinutes: 30,
    steps: [
      { title: 'Clear the space', detail: 'Remove any laundry, empty baskets, and items sitting on top of the washer and dryer.' },
      { title: 'Clean the washing machine drum', detail: 'Run a hot empty cycle with 2 cups of white vinegar to deodorize and descale the drum.' },
      { title: 'Wipe washer exterior', detail: 'Spray all-purpose cleaner on the top, sides, and control panel of the washer. Wipe clean.' },
      { title: 'Clean the detergent drawer', detail: 'Pull out the detergent tray and scrub with an old toothbrush under warm water. Dry and replace.' },
      { title: 'Clean the dryer drum', detail: 'Wipe the inside of the dryer drum with a damp cloth to remove lint residue and any marks.' },
      { title: 'Clean the lint trap', detail: 'Remove the lint screen, peel off accumulated lint, and wash the screen with warm soapy water. Let dry.' },
      { title: 'Vacuum behind and under appliances', detail: 'Use the hose attachment to vacuum the floor and wall behind the washer and dryer, and the exhaust vent area.' },
      { title: 'Wipe dryer exterior', detail: 'Wipe down the outside of the dryer including the control panel and the door gasket.' },
      { title: 'Wipe shelves and walls', detail: 'Wipe any shelving, the tops of machines, and any visible wall splatter.' },
      { title: 'Sweep and mop the floor', detail: 'Sweep lint and dust from corners and under appliances, then mop the full floor.' },
    ],
  },
}

type WizardState = 'select' | 'plan'

export default function MaidWizard() {
  const [wizardState, setWizardState] = useState<WizardState>('select')
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set())

  function selectRoom(roomValue: string) {
    setSelectedRoom(roomValue)
    setCheckedSteps(new Set())
    setWizardState('plan')
  }

  function toggleStep(index: number) {
    setCheckedSteps(prev => {
      const next = new Set(prev)
      next.has(index) ? next.delete(index) : next.add(index)
      return next
    })
  }

  function reset() {
    setWizardState('select')
    setSelectedRoom(null)
    setCheckedSteps(new Set())
  }

  const room = ROOMS.find(r => r.value === selectedRoom)
  const plan = selectedRoom ? CLEANING_PLANS[selectedRoom] : null
  const doneCount = checkedSteps.size
  const totalSteps = plan?.steps.length ?? 0
  const allDone = totalSteps > 0 && doneCount === totalSteps

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Maid Wizard 🧹</h2>
          <p>Pick a room and get a deep clean plan</p>
        </div>
        {wizardState === 'plan' && (
          <button className="btn btn-ghost" onClick={reset}>
            <RotateCcw size={14} /> New Room
          </button>
        )}
      </div>

      <div className="page-body">

        {/* Room selection */}
        {wizardState === 'select' && (
          <div style={{ maxWidth: 500 }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--ink-muted)', marginBottom: 20, lineHeight: 1.6 }}>
              Which room are we tackling today? ✨
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ROOMS.map(r => (
                <button
                  key={r.value}
                  onClick={() => selectRoom(r.value)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 18px', borderRadius: 16, cursor: 'pointer',
                    border: '1.5px solid var(--border)',
                    background: 'linear-gradient(135deg, var(--cream), #fef6ff)',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                    boxShadow: '0 1px 4px rgba(201,166,240,0.08)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#C9A6F0'
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(201,166,240,0.2)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.boxShadow = '0 1px 4px rgba(201,166,240,0.08)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontSize: '1.4rem' }}>{r.emoji}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--ink)' }}>{r.label}</span>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--ink-muted)' }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Plan view */}
        {wizardState === 'plan' && plan && (
          <div style={{ maxWidth: 640 }}>

            {/* Header strip */}
            <div style={{
              padding: '16px 20px', borderRadius: 16, marginBottom: 20,
              background: 'linear-gradient(135deg, #fde8f5, #e8d5ff)',
              border: '1.5px solid #f0d9ff',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.5rem' }}>{room?.emoji}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--ink)' }}>
                    {room?.label} Deep Clean
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#9B72CF' }}>
                    {allDone ? '🌸 All done! Amazing work~' : `${doneCount} of ${totalSteps} steps done`}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9B72CF', fontWeight: 600, fontSize: '0.88rem' }}>
                <Clock size={15} />
                ~{plan.estimatedMinutes} min
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ height: 8, borderRadius: 99, background: 'var(--border)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${totalSteps > 0 ? (doneCount / totalSteps) * 100 : 0}%`,
                  background: allDone
                    ? 'linear-gradient(90deg, #8FE0B8, #C9A6F0)'
                    : 'linear-gradient(90deg, #C9A6F0, #FF8FC4)',
                  borderRadius: 99,
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </div>

            <div className="grid-2" style={{ alignItems: 'start', gap: 16 }}>

              {/* Steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                  🧽 Steps
                </div>
                {plan.steps.map((step, i) => {
                  const done = checkedSteps.has(i)
                  return (
                    <div
                      key={i}
                      onClick={() => toggleStep(i)}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                        padding: '12px 14px', borderRadius: 14, cursor: 'pointer',
                        background: done ? 'linear-gradient(135deg, #f0faf5, #faf0ff)' : 'var(--cream)',
                        border: `1.5px solid ${done ? '#C9A6F0' : 'var(--border)'}`,
                        transition: 'all 0.2s ease',
                        boxShadow: done ? '0 1px 6px rgba(201,166,240,0.15)' : 'none',
                      }}
                    >
                      <div style={{ flexShrink: 0, marginTop: 1 }}>
                        {done
                          ? <CheckCircle2 size={17} style={{ color: '#9B72CF' }} />
                          : <Circle size={17} style={{ color: 'var(--border)' }} />
                        }
                      </div>
                      <div>
                        <div style={{
                          fontWeight: 600, fontSize: '0.86rem',
                          color: done ? '#9B72CF' : 'var(--ink)',
                          textDecoration: done ? 'line-through' : 'none',
                          transition: 'all 0.2s ease',
                        }}>
                          {step.title}
                        </div>
                        {!done && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginTop: 3, lineHeight: 1.5 }}>
                            {step.detail}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Supplies */}
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                  🧴 Supplies
                </div>
                <div className="card" style={{ borderRadius: 16, border: '1.5px solid #f0d9ff' }}>
                  <div className="card-body">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {plan.supplies.map((supply, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '8px 10px', borderRadius: 10,
                          background: 'linear-gradient(135deg, #fff8f0, #fef6ff)',
                          border: '1px solid #f0d9ff',
                          fontSize: '0.84rem', color: 'var(--ink)',
                        }}>
                          <Package size={13} style={{ color: '#9B72CF', flexShrink: 0 }} />
                          {supply}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {allDone && (
              <div style={{
                marginTop: 24, padding: '16px 20px', borderRadius: 16, textAlign: 'center',
                background: 'linear-gradient(135deg, #f0faf5, #faf0ff)',
                border: '1.5px solid #C9A6F0',
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>🌸✨</div>
                <div style={{ fontWeight: 700, color: '#9B72CF', marginBottom: 4 }}>Spotless! You did it!</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>Your {room?.label.toLowerCase()} is sparkling clean.</div>
                <button
                  onClick={reset}
                  style={{
                    marginTop: 12, padding: '8px 20px', borderRadius: 12, cursor: 'pointer',
                    background: 'linear-gradient(135deg, #C9A6F0, #FF8FC4)',
                    border: 'none', color: 'white', fontWeight: 600, fontSize: '0.85rem',
                  }}
                >
                  Clean another room ✨
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  )
}
