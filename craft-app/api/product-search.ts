export const config = { runtime: 'nodejs' }

export default async function handler(req, res) {
  const q = (req.query.q || '').trim()

  if (!q) return res.status(200).json([])

  // deterministic mock results so UI works
  const results = [
    { name: q, store: 'Store A', price: 2.99 },
    { name: q, store: 'Store B', price: 3.49 },
    { name: q, store: 'Store C', price: 2.79 }
  ]

  res.status(200).json(results)
}
