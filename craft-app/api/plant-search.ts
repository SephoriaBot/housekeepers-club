/// <reference types="node" />
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const q = (req.query.q || "").toString().trim()
  if (!q) return res.status(400).json([])

  try {
    const searchRes = await fetch(
      `https://perenual.com/api/species-list?key=${process.env.PERENUAL_KEY}&q=${encodeURIComponent(q)}&page=1`
    )
    const searchData = await searchRes.json()
    const results = searchData.data ?? []

    const qLower = q.toLowerCase()

    function matchScore(name: string): number {
      const nameLower = name.toLowerCase()
      if (nameLower === qLower) return 0                    // exact match
      if (nameLower.startsWith(qLower)) return 1             // starts with query
      const wordBoundary = new RegExp(`\\b${qLower}\\b`)
      if (wordBoundary.test(nameLower)) return 2              // contains query as whole word
      if (nameLower.includes(qLower)) return 3                // contains query as substring
      return 4
    }

    const mapped = results
      .filter((plant: any) => typeof plant.common_name === 'string' && plant.common_name.trim().length > 0)
      .map((plant: any) => ({
        id: plant.id,
        name: plant.common_name,
        scientific_name: plant.scientific_name?.[0] ?? null,
      }))
      .sort((a: any, b: any) => {
        const scoreDiff = matchScore(a.name) - matchScore(b.name)
        if (scoreDiff !== 0) return scoreDiff
        return a.name.length - b.name.length  // shorter/simpler names first as tiebreak
      })
      .slice(0, 12)

    return res.status(200).json(mapped)
  } catch (e) {
    console.error('plant-search error:', e)
    return res.status(500).json([])
  }
}
