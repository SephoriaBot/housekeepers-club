export interface PlantProfile {
  medicinal: boolean
  medicinal_note: string | null
  poisonous_to_pets: boolean
  poisonous_to_pets_note: string | null
  poisonous_to_humans: boolean
  watering: string | null
  sunlight: string[]
  cycle: string | null
  care_level: string | null
  edible_fruit: boolean
  edible_leaf: boolean
  description: string | null
}

export async function fetchPlantProfile(plantName: string): Promise<PlantProfile | null> {
  const prompt = `You are a plant care reference. For the plant "${plantName}", respond ONLY with a valid JSON object, no markdown, no backticks, no preamble.

Respond with this exact shape:
{
  "medicinal": boolean (true if this plant has any traditional/folk medicinal use),
  "medicinal_note": "1-2 sentence description of traditional medicinal uses, or null if not medicinal",
  "poisonous_to_pets": boolean (true if toxic to cats/dogs),
  "poisonous_to_pets_note": "brief note on what makes it toxic or why it's considered safe, 1 sentence",
  "poisonous_to_humans": boolean,
  "watering": "brief watering guidance, e.g. 'Water when top inch of soil is dry'",
  "sunlight": ["array", "of", "sunlight needs, e.g. full sun, partial shade"],
  "cycle": "annual | biennial | perennial",
  "care_level": "easy | moderate | difficult",
  "edible_fruit": boolean,
  "edible_leaf": boolean,
  "description": "2-3 sentence general description of the plant"
}

Be factual and concise. If uncertain about a field, use your best general knowledge of the species rather than leaving it null, except medicinal_note which should be null if the plant has no notable medicinal use.`

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    const data = await response.json()
    const raw = data.choices?.[0]?.message?.content ?? ''
    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return {
      medicinal: parsed.medicinal === true,
      medicinal_note: typeof parsed.medicinal_note === 'string' ? parsed.medicinal_note : null,
      poisonous_to_pets: parsed.poisonous_to_pets === true,
      poisonous_to_pets_note: typeof parsed.poisonous_to_pets_note === 'string' ? parsed.poisonous_to_pets_note : null,
      poisonous_to_humans: parsed.poisonous_to_humans === true,
      watering: typeof parsed.watering === 'string' ? parsed.watering : null,
      sunlight: Array.isArray(parsed.sunlight) ? parsed.sunlight.filter((s: unknown) => typeof s === 'string') : [],
      cycle: typeof parsed.cycle === 'string' ? parsed.cycle : null,
      care_level: typeof parsed.care_level === 'string' ? parsed.care_level : null,
      edible_fruit: parsed.edible_fruit === true,
      edible_leaf: parsed.edible_leaf === true,
      description: typeof parsed.description === 'string' ? parsed.description : null,
    }
  } catch {
    return null
  }
}
