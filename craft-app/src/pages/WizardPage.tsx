import { useState } from 'react';
import { ArrowLeft, ArrowRight, Wand2, RotateCcw, X, Clock, ChevronRight, BookmarkPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Recipe, RecipeIngredient, RecipeStep, RecipeCategory } from '../types';

const CATEGORY_META: Record<RecipeCategory, { label: string; emoji: string; className: string; badge: string }> = {
  skincare: { label: 'Skincare', emoji: '🌸', className: 'cat-skincare', badge: 'badge-pink' },
  soap:     { label: 'Soap Making', emoji: '🫧', className: 'cat-soap', badge: 'badge-lavender' },
  laundry:  { label: 'Laundry & Cleaning', emoji: '🧺', className: 'cat-laundry', badge: 'badge-green' },
};

const DIFF_BADGE: Record<string, string> = {
  easy: 'badge-green', medium: 'badge-amber', advanced: 'badge-pink',
  Beginner: 'badge-green', Intermediate: 'badge-amber', Advanced: 'badge-pink',
};

const DIFF_NORMALIZE: Record<string, 'easy' | 'medium' | 'advanced'> = {
  Beginner: 'easy', Intermediate: 'medium', Advanced: 'advanced',
  easy: 'easy', medium: 'medium', advanced: 'advanced',
};

interface WizardStep {
  id: string;
  question: string;
  subtitle?: string;
  options: string[];
  type: 'single' | 'multi';
  key: string;
}

interface FormulaIngredient {
  name: string;
  amount: string;
  unit: string;
  function: string;
  notes?: string;
}

interface Formula {
  name: string;
  description: string;
  difficulty: string;
  prep_time_min: number;
  ingredients: FormulaIngredient[];
  steps: string[];
  tips: string[];
}

const FLOW: WizardStep[] = [
  {
    id: 'category',
    question: 'What would you like to make?',
    subtitle: 'Choose your craft category to begin.',
    options: ['Skincare (lotions, serums, toners)', 'Soap Making', 'Laundry & Cleaning'],
    type: 'single',
    key: 'category',
  },
  {
    id: 'goal',
    question: 'What\'s your main goal?',
    subtitle: 'Pick all that apply.',
    options: [],
    type: 'multi',
    key: 'goal',
  },
  {
    id: 'type',
    question: 'What type of product?',
    subtitle: 'Choose the format you want to make.',
    options: [],
    type: 'single',
    key: 'type',
  },
  {
    id: 'difficulty',
    question: 'How comfortable are you with this type of crafting?',
    options: ['Beginner — keep it simple', 'Some experience — ready for more steps', 'Experienced — bring on the complexity'],
    type: 'single',
    key: 'difficulty',
  },
];

const GOAL_OPTIONS: Record<string, string[]> = {
  'Skincare (lotions, serums, toners)': ['Moisturizing & hydration', 'Brightening', 'Anti-aging', 'Soothing sensitive skin', 'Acne-prone skin'],
  'Soap Making': ['Gentle & moisturizing', 'Exfoliating', 'Scented / aromatherapy', 'Unscented / fragrance-free'],
  'Laundry & Cleaning': ['Gentle on clothes', 'Heavy-duty stain removal', 'Scented with essential oils', 'Fragrance-free / sensitive skin', 'Eco-friendly formula'],
};

const TYPE_OPTIONS: Record<string, string[]> = {
  'Skincare (lotions, serums, toners)': ['Face cream', 'Body lotion', 'Serum', 'Toner', 'Face oil', 'Lip balm'],
  'Soap Making': ['Melt & pour soap', 'Cold process bar soap', 'Liquid soap', 'Shampoo bar'],
  'Laundry & Cleaning': ['Laundry powder', 'Laundry liquid', 'Fabric softener', 'All-purpose cleaner'],
};

const CAT_MAP: Record<string, RecipeCategory> = {
  'Skincare (lotions, serums, toners)': 'skincare',
  'Soap Making': 'soap',
  'Laundry & Cleaning': 'laundry',
};

const DIFF_MAP: Record<string, string[]> = {
  'Beginner — keep it simple': ['easy'],
  'Some experience — ready for more steps': ['easy', 'medium'],
  'Experienced — bring on the complexity': ['easy', 'medium', 'advanced'],
};

const DIFF_LABEL: Record<string, string> = {
  'Beginner — keep it simple': 'Beginner',
  'Some experience — ready for more steps': 'Intermediate',
  'Experienced — bring on the complexity': 'Advanced',
};

async function generateFormulaWithGroq(
  category: string,
  goals: string[],
  type: string,
  difficulty: string
): Promise<Formula> {
  const diffLabel = DIFF_LABEL[difficulty] || difficulty;

  const prompt = `You are an expert cosmetic chemist and DIY formulator. Generate a detailed, accurate home crafting formula.

Category: ${category}
Goals: ${goals.join(', ')}
Product type: ${type}
Skill level: ${diffLabel}

Respond ONLY with a valid JSON object, no markdown, no backticks, no explanation. Use this exact shape:
{
  "name": "Creative product name",
  "description": "2-3 sentence description of this formula and what makes it effective.",
  "difficulty": "${diffLabel}",
  "prep_time_min": 30,
  "ingredients": [
    { "name": "Ingredient name", "amount": "10", "unit": "g", "function": "What it does in the formula" }
  ],
  "steps": [
    "Full step instruction with specific temperatures, timing, and technique."
  ],
  "tips": [
    "Pro tip or safety note."
  ]
}

Rules:
- Ingredients must add up to 100g (or 100%) for leave-on products, or use cups/tbsp for cleaning products
- Include 5-10 ingredients with accurate usage rates
- Include 6-10 steps in correct order with temperatures and timing
- Include 3-5 practical tips including safety notes where relevant
- Be chemist-accurate: correct pH ranges, temperatures, order of addition, preservation
- Match complexity to the skill level — ${diffLabel === 'Beginner' ? 'keep steps simple, avoid lye or complex actives' : diffLabel === 'Intermediate' ? 'can include emulsions and mild actives' : 'can include lye, advanced actives, complex techniques'}`

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const data = await response.json()
  const raw = data.choices?.[0]?.message?.content ?? ''
  const clean = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(clean) as Formula
}

export default function WizardPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [results, setResults] = useState<Recipe[] | null>(null);
  const [formula, setFormula] = useState<Formula | null>(null);
  const [formulaError, setFormulaError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [recipeSteps, setRecipeSteps] = useState<RecipeStep[]>([]);
  const [activeTab, setActiveTab] = useState<'formula' | 'library'>('formula');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const currentFlow = FLOW.map(f => {
    if (f.id === 'goal') return { ...f, options: GOAL_OPTIONS[answers['category'] as string] || [] };
    if (f.id === 'type') return { ...f, options: TYPE_OPTIONS[answers['category'] as string] || [] };
    return f;
  });

  const currentStep = currentFlow[step];
  const totalSteps = currentFlow.length;

  function toggleAnswer(key: string, option: string, type: 'single' | 'multi') {
    if (type === 'single') {
      setAnswers(a => ({ ...a, [key]: option }));
    } else {
      setAnswers(a => {
        const prev = (a[key] as string[]) || [];
        const has = prev.includes(option);
        return { ...a, [key]: has ? prev.filter(x => x !== option) : [...prev, option] };
      });
    }
  }

  function isSelected(key: string, option: string) {
    const val = answers[key];
    if (!val) return false;
    return Array.isArray(val) ? val.includes(option) : val === option;
  }

  function canProceed() {
    const val = answers[currentStep?.key];
    if (!val) return false;
    return Array.isArray(val) ? val.length > 0 : true;
  }

  async function saveFormulaToLibrary() {
    if (!formula) return;
    setSaving(true);

    const category = CAT_MAP[answers['category'] as string];
    const difficulty = DIFF_NORMALIZE[formula.difficulty] ?? 'easy';

    const { data: recipe, error } = await supabase
      .from('recipes')
      .insert({
        name: formula.name,
        category,
        description: formula.description,
        difficulty,
        prep_time_min: formula.prep_time_min ?? null,
        tags: ['wizard-generated'],
      })
      .select()
      .single();

    if (error || !recipe) { setSaving(false); return; }

    await supabase.from('recipe_ingredients').insert(
      formula.ingredients.map((ing, i) => ({
        recipe_id: recipe.id,
        ingredient_name: ing.name,
        amount: ing.amount,
        unit: ing.unit || null,
        notes: ing.function || null,
        sort_order: i,
      }))
    );

    const allSteps = [
      ...formula.steps.map((instruction, i) => ({ recipe_id: recipe.id, step_number: i + 1, instruction })),
      ...(formula.tips ?? []).map((tip, i) => ({ recipe_id: recipe.id, step_number: formula.steps.length + i + 1, instruction: `💡 ${tip}` })),
    ];

    await supabase.from('recipe_steps').insert(allSteps);
    setSaving(false);
    setSaved(true);
  }

  async function runSearch() {
    setLoading(true);
    setSaved(false);
    setFormulaError('');
    setFormula(null);

    const goals = answers['goal'] as string[];
    const type = answers['type'] as string;
    const cat = answers['category'] as string;
    const difficulty = answers['difficulty'] as string;

    // Run Groq and Supabase library search in parallel
    const [groqResult, supabaseResult] = await Promise.allSettled([
      generateFormulaWithGroq(cat, Array.isArray(goals) ? goals : [goals], type, difficulty),
      supabase
        .from('recipes')
        .select('*')
        .eq('category', CAT_MAP[cat])
        .in('difficulty', DIFF_MAP[difficulty] || ['easy', 'medium', 'advanced'])
        .limit(6),
    ]);

    if (groqResult.status === 'fulfilled') {
      setFormula(groqResult.value);
    } else {
      setFormulaError('Couldn\'t generate a formula right now. Check your library or try again.');
    }

    const libraryData = supabaseResult.status === 'fulfilled' ? supabaseResult.value.data || [] : [];
    setResults(libraryData);
    setActiveTab(groqResult.status === 'fulfilled' ? 'formula' : 'library');
    setLoading(false);
  }

  async function openRecipe(recipe: Recipe) {
    setSelected(recipe);
    const [ingRes, stepRes] = await Promise.all([
      supabase.from('recipe_ingredients').select('*').eq('recipe_id', recipe.id).order('sort_order'),
      supabase.from('recipe_steps').select('*').eq('recipe_id', recipe.id).order('step_number'),
    ]);
    setIngredients(ingRes.data || []);
    setRecipeSteps(stepRes.data || []);
  }

  function reset() {
    setStep(0);
    setAnswers({});
    setResults(null);
    setFormula(null);
    setFormulaError('');
    setSaved(false);
  }

  // Results view
  if (results !== null) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h2>Your Results ✨</h2>
            <p>Based on your preferences</p>
          </div>
          <button className="btn btn-ghost" onClick={reset}><RotateCcw size={14} /> Start Over</button>
        </div>
        <div className="page-body">

          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            <button className={`btn btn-sm ${activeTab === 'formula' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('formula')}>
              ⚗️ Generated Formula
            </button>
            <button className={`btn btn-sm ${activeTab === 'library' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('library')}>
              📖 My Library {results.length > 0 && `(${results.length})`}
            </button>
          </div>

          {activeTab === 'formula' && (
            formula ? (
              <div className="card" style={{ maxWidth: 680 }}>
                <div className="card-body">
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', color: 'var(--ink)', marginBottom: 6 }}>{formula.name}</h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--ink-soft)', lineHeight: 1.6, margin: '0 0 10px', fontStyle: 'italic' }}>{formula.description}</p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span className={`badge ${DIFF_BADGE[formula.difficulty] ?? 'badge-green'}`}>{formula.difficulty}</span>
                        {formula.prep_time_min && <span className="badge badge-lavender"><Clock size={10} style={{ marginRight: 2 }} />{formula.prep_time_min} min</span>}
                      </div>
                    </div>
                    <button
                      className={`btn btn-sm ${saved ? 'btn-green' : 'btn-secondary'}`}
                      onClick={saveFormulaToLibrary}
                      disabled={saving || saved}
                      style={{ flexShrink: 0 }}
                    >
                      <BookmarkPlus size={13} />
                      {saving ? 'Saving…' : saved ? 'Saved!' : 'Save to Library'}
                    </button>
                  </div>

                  <div style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Ingredients</div>
                  <div style={{ marginBottom: 24 }}>
                    {formula.ingredients.map((ing, i) => (
                      <div key={i} className="ingredient-row">
                        <span className="ingredient-amount">{ing.amount}{ing.unit ? ` ${ing.unit}` : ''}</span>
                        <span style={{ flex: 1 }}>{ing.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', fontStyle: 'italic' }}>{ing.function}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Steps</div>
                  <div style={{ marginBottom: 24 }}>
                    {formula.steps.map((s, i) => (
                      <div key={i} className="step-row">
                        <div className="step-number">{i + 1}</div>
                        <div className="step-text">{s}</div>
                      </div>
                    ))}
                  </div>

                  {formula.tips?.length > 0 && (
                    <>
                      <div style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Pro Tips</div>
                      <div style={{ background: 'var(--lavender-light)', borderRadius: 10, padding: '12px 16px' }}>
                        {formula.tips.map((tip, i) => (
                          <div key={i} style={{ fontSize: '0.875rem', color: 'var(--lavender-dark)', marginBottom: i < formula.tips.length - 1 ? 8 : 0, lineHeight: 1.5 }}>
                            💡 {tip}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">⚗️</div>
                <h3>{formulaError || 'No formula generated'}</h3>
                <p>Try a different combination or check your library tab.</p>
              </div>
            )
          )}

          {activeTab === 'library' && (
            results.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📖</div>
                <h3>No matches in your library</h3>
                <p>Save a generated formula to start building your library.</p>
              </div>
            ) : (
              <div className="grid-3">
                {results.map(recipe => {
                  const meta = CATEGORY_META[recipe.category];
                  return (
                    <div key={recipe.id} className="card" style={{ cursor: 'pointer' }} onClick={() => openRecipe(recipe)}>
                      <div className="card-body">
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                          <div className={`recipe-category-icon ${meta.className}`}>{meta.emoji}</div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 4 }}>{recipe.name}</div>
                            <div style={{ display: 'flex', gap: 5 }}>
                              <span className={`badge ${DIFF_BADGE[recipe.difficulty]}`}>{recipe.difficulty}</span>
                              {recipe.prep_time_min && <span className="badge badge-lavender">{recipe.prep_time_min} min</span>}
                            </div>
                          </div>
                        </div>
                        {recipe.description && <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', lineHeight: 1.5 }}>{recipe.description}</p>}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                          <ChevronRight size={14} style={{ color: 'var(--pink)' }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>

        {selected && (
          <div className="modal-overlay" onClick={() => setSelected(null)}>
            <div className="modal" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className={`recipe-category-icon ${CATEGORY_META[selected.category].className}`}>{CATEGORY_META[selected.category].emoji}</div>
                  <div>
                    <h3>{selected.name}</h3>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      <span className={`badge ${DIFF_BADGE[selected.difficulty]}`}>{selected.difficulty}</span>
                      {selected.prep_time_min && <span className="badge badge-lavender"><Clock size={10} style={{ marginRight: 2 }} />{selected.prep_time_min} min</span>}
                    </div>
                  </div>
                </div>
                <button className="close-btn" onClick={() => setSelected(null)}><X size={18} /></button>
              </div>
              <div className="modal-body">
                {selected.description && <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 20, fontStyle: 'italic' }}>{selected.description}</p>}
                {ingredients.length > 0 && (
                  <>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 10, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ingredients</div>
                    <div style={{ marginBottom: 24 }}>
                      {ingredients.map(ing => (
                        <div key={ing.id} className="ingredient-row">
                          <span className="ingredient-amount">{ing.amount}{ing.unit ? ` ${ing.unit}` : ''}</span>
                          <span>{ing.ingredient_name}</span>
                          {ing.notes && <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', fontStyle: 'italic' }}>{ing.notes}</span>}
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {recipeSteps.length > 0 && (
                  <>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 14, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Steps</div>
                    {recipeSteps.map(s => (
                      <div key={s.id} className="step-row">
                        <div className="step-number">{s.step_number}</div>
                        <div className="step-text">{s.instruction}</div>
                      </div>
                    ))}
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setSelected(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Wizard questions view
  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Recipe Wizard 🪄</h2>
          <p>Answer a few questions to find your perfect formula</p>
        </div>
      </div>
      <div className="page-body">
        <div className="wizard-container">
          <div className="wizard-progress">
            {currentFlow.map((_, i) => (
              <div key={i} className={`wizard-step-dot ${i === step ? 'active' : i < step ? 'done' : ''}`} />
            ))}
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Step {step + 1} of {totalSteps}
          </div>

          <div className="wizard-question">{currentStep.question}</div>
          {currentStep.subtitle && <div className="wizard-subtitle">{currentStep.subtitle}</div>}

          {currentStep.options.length > 0 ? (
            <div className="wizard-options">
              {currentStep.options.map(opt => (
                <button key={opt} className={`wizard-option ${isSelected(currentStep.key, opt) ? 'selected' : ''}`}
                  onClick={() => toggleAnswer(currentStep.key, opt, currentStep.type)}>
                  <div className="wizard-option-check">
                    {isSelected(currentStep.key, opt) && <span style={{ fontSize: '0.7rem' }}>✓</span>}
                  </div>
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', padding: '20px 0' }}>
              Please select a category first to see options.
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
            <button className="btn btn-ghost" onClick={() => step === 0 ? reset() : setStep(s => s - 1)} disabled={loading}>
              <ArrowLeft size={14} /> {step === 0 ? 'Reset' : 'Back'}
            </button>
            {step < totalSteps - 1 ? (
              <button className="btn btn-primary" disabled={!canProceed()} onClick={() => setStep(s => s + 1)}>
                Next <ArrowRight size={14} />
              </button>
            ) : (
              <button className="btn btn-primary" disabled={!canProceed() || loading} onClick={runSearch}>
                {loading ? 'Generating…' : <><Wand2 size={14} /> Generate Formula</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
