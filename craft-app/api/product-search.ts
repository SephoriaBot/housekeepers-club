export const config = {
  runtime: 'nodejs'
}

export default async function handler(req, res) {
  const q = (req.query.q || '').toString().toLowerCase()

  try {
    const url = `https://www.instacart.com/store/s?k=${encodeURIComponent(q)}`

    const html = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }).then(r => r.text())

    const products = extractCandidates(html)
      .filter(isRealProduct)
      .slice(0, 10)

    const ranked = rank(products, q)

    res.status(200).json(ranked)
  } catch (e) {
    res.status(200).json([])
  }
}

function extractCandidates(html) {
  const matches = []
  const regex = /"name"\s*:\s*"(.*?)"/g

  let m
  while ((m = regex.exec(html))) {
    if (m[1]) matches.push(m[1])
  }

  return [...new Set(matches)]
}

function isRealProduct(name) {
  const n = name.toLowerCase()

  if (n.length < 3 || n.length > 80) return false
  if (n.includes('instacart')) return false
  if (n.includes('add to cart')) return false
  if (n.includes('delivery')) return false
  if (n.includes('can i get')) return false

  return true
}

function rank(products, q) {
  return products
    .map(name => ({
      item: name,
      score: name.toLowerCase().includes(q) ? 2 : 0
    }))
    .sort((a, b) => b.score - a.score)
}