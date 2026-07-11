/// <reference types="node" />
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = (req.query.id || "").toString().trim()
  if (!id) return res.status(400).json({ error: 'missing id' })

  try {
    const detailRes = await fetch(
      `https://perenual.com/api/species/details/${id}?key=${process.env.PERENUAL_KEY}`
    )
    const d = await detailRes.json()

    const sunlightArr = Array.isArray(d.sunlight)
      ? d.sunlight
      : (typeof d.sunlight === 'string' ? [d.sunlight] : [])

    return res.status(200).json({
      medicinal: d.medicinal === true,
      poisonous_to_pets: d.poisonous_to_pets === true,
      poisonous_to_humans: d.poisonous_to_humans === true,
      watering: typeof d.watering === 'string' ? d.watering : null,
      sunlight: sunlightArr.filter((s: unknown) => typeof s === 'string'),
      cycle: typeof d.cycle === 'string' ? d.cycle : null,
      care_level: typeof d.care_level === 'string' ? d.care_level : null,
      edible_fruit: d.edible_fruit === true,
      edible_leaf: d.edible_leaf === true,
      description: typeof d.description === 'string' ? d.description : null,
    })
  } catch (e) {
    console.error('plant-details error:', e)
    return res.status(500).json({ error: 'fetch failed' })
  }
}
