export default async function handler(req, res) {
  const q = (req.query.q || "").toString().trim()

  if (!q) return res.status(400).json([])

  try {
    const url =
      `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(q)}&api_key=${process.env.SERPAPI_KEY}`

    const r = await fetch(url)
    const data = await r.json()

    const products = (data.shopping_results || [])
  .filter((p: any) => typeof p.extracted_price === 'number')
  .sort((a: any, b: any) => a.extracted_price - b.extracted_price)

const cheapest = products[0]

if (!cheapest) {
  return res.status(200).json(null)
}

return res.status(200).json({
  name: cheapest.title,
  price: cheapest.extracted_price,
  store: cheapest.source,
  image: cheapest.thumbnail
})
  } catch (e) {
    return res.status(200).json([])
  }
}