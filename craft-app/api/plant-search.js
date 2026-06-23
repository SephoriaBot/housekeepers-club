export default async function handler(req, res) {
  const q = (req.query.q || "").toString().trim()
  if (!q) return res.status(400).json([])

  try {
    const searchRes = await fetch(
      `https://perenual.com/api/species-list?key=${process.env.PERENUAL_KEY}&q=${encodeURIComponent(q)}&page=1`
    )
    const searchData = await searchRes.json()
    const results = searchData.data ?? []

    if (!results.length) return res.status(200).json([])

    const detailed = await Promise.all(
      results.slice(0, 5).map(async (plant) => {
        const detailRes = await fetch(
          `https://perenual.com/api/species/details/${plant.id}?key=${process.env.PERENUAL_KEY}`
        )
        const detail = await detailRes.json()
        return {
          id: detail.id,
          name: detail.common_name,
          scientific_name: detail.scientific_name?.[0] ?? null,
          watering: detail.watering ?? null,
          sunlight: detail.sunlight ?? [],
          cycle: detail.cycle ?? null,
          poisonous_to_pets: detail.poisonous_to_pets ?? null,
          poisonous_to_humans: detail.poisonous_to_humans ?? null,
        }
      })
    )

    return res.status(200).json(detailed)
  } catch (e) {
    console.error('plant-search error:', e)
    return res.status(500).json([])
  }
}
