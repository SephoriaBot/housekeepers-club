export const config = {
  runtime: 'nodejs'
}

export default async function handler(req, res) {
  const q = (req.query.q || '').toLowerCase()

  const url = `https://www.instacart.com/store/s?k=${encodeURIComponent(q)}`

  const html = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  }).then(r => r.text())

  const raw = extractCandidates(html)

  const cleaned = raw
    .filter(isRealProduct)
    .map(name => ({ name }))
    .slice(0, 10)

  const ranked = rank(cleaned, q)

  res.status(200).json(ranked.slice(0, 8))
}
