/// <reference types="node" />
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = (req.query.id || "").toString().trim()
  if (!id) return res.status(400).json({ medicinal: false })

  try {
    const detailRes = await fetch(
      `https://perenual.com/api/species/details/${id}?key=${process.env.PERENUAL_KEY}`
    )
    const detail = await detailRes.json()

    return res.status(200).json({
      medicinal: detail.medicinal === true,
    })
  } catch (e) {
    console.error('plant-details error:', e)
    return res.status(500).json({ medicinal: false })
  }
}
