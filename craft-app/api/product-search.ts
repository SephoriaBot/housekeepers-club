export default async function handler(req, res) {
  const q = req.query.q

  if (!q) {
    return res.status(400).json({ error: 'missing query' })
  }

  const url = `https://www.instacart.com/store/s?k=${encodeURIComponent(q)}`

  // simple proxy-style response (basic version)
  return res.status(200).json([
    {
      name: q,
      retailer: 'Instacart',
      price: 0,
      url
    }
  ])
}
