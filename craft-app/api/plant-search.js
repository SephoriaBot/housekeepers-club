export default async function handler(req, res) {
  const q = (req.query.q || "").toString().trim()
  if (!q) return res.status(400).json({ error: 'no query' })

  try {
    // Search for plant
    const searchRes = await fetch(
      `https://perenual.com/api/species-list?key=${process.env.PERENUAL_KEY}&q=${encodeURIComponent(q)}&page=1`
    )
    const searchData = await searchRes.json()
    const results = searchData.data ?? []

    if (!results.length) return res.status(200).json(null)

    // Get full details for top result
    const top = results[0]
    const detailRes = await fetch(
      `https://perenual.com/api/species/details/${top.id}?key=${process.env.PERENUAL_KEY}`
    )
    const detail = await detailRes.json()

    // Get care guide
    const careRes = await fetch(
      `https://perenual.com/api/species-care-guide-list?key=${process.env.PERENUAL_KEY}&species_id=${top.id}`
    )
    const careData = await careRes.json()
    const careGuide = careData.data?.[0]?.section ?? []

    return res.status(200).json({
      id: detail.id,
      name: detail.common_name,
      scientific_name: detail.scientific_name?.[0] ?? null,
      image: detail.default_image?.medium_url ?? null,
      type: detail.type ?? null,
      cycle: detail.cycle ?? null,
      watering: detail.watering ?? null,
      sunlight: detail.sunlight ?? [],
      maintenance: detail.maintenance ?? null,
      growth_rate: detail.growth_rate ?? null,
      indoor: detail.indoor ?? null,
      poisonous_to_pets: detail.poisonous_to_pets ?? null,
      poisonous_to_humans: detail.poisonous_to_humans ?? null,
      description: detail.description ?? null,
      propagation: detail.propagation ?? [],
      hardiness: detail.hardiness ?? null,
      flowers: detail.flowers ?? null,
      flowering_season: detail.flowering_season ?? null,
      soil: detail.soil ?? [],
      care_guide: careGuide,
    })
  } catch (e) {
    console.error('plant-search error:', e)
    return res.status(500).json(null)
  }
}
