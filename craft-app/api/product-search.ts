export default async function handler(req, res) {
  const q = req.query.q

  if (!q) return res.status(400).json({ error: 'missing query' })

  const url = `https://www.instacart.com/store/s?k=${encodeURIComponent(q)}`

  try {
    const html = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    }).then(r => r.text())

    const products = extractProducts(html)
    const ranked = rankProducts(products, q)

    return res.status(200).json(ranked.slice(0, 8))
  } catch (e) {
    return res.status(500).json({ error: 'failed search' })
  }
}

function extractProducts(html) {
  const results = []

  // safer: pull product names even if price missing
  const nameRegex = /"name":"(.*?)"/g

  let match
  const seen = new Set()

  while ((match = nameRegex.exec(html)) !== null) {
    const name = decode(match[1])

    if (!name || seen.has(name)) continue
    seen.add(name)

    results.push({
      name,
      price: null,
      retailer: 'Instacart'
    })
  }

  return results
}

function rankProducts(products, query) {
  const q = query.toLowerCase()
  const words = q.split(' ').filter(Boolean)

  return products
    .map(p => ({
      ...p,
      score: score(p.name.toLowerCase(), q, words)
    }))
    .sort((a, b) => b.score - a.score)
}

function score(name, query, words) {
  let score = 0

  if (name === query) score += 200
  if (name.includes(query)) score += 100

  for (const w of words) {
    if (name.includes(w)) score += 20
  }

  // punish junk matches
  if (name.length < 3) score -= 100

  return score
}
function sizeScore(name, query) {
  const sizes = ['oz', 'lb', 'gallon', 'ct', 'pack']

  let score = 0

  for (const s of sizes) {
    if (name.includes(s)) score += 5
  }

  // prefer gallon milk if milk is requested
  if (query.includes('milk') && name.includes('gallon')) {
    score += 30
  }

  return score
}

function brandScore(name) {
  const preferred = [
    'fairlife',
    'organic valley',
    'land o lakes',
    'kirkland',
    'great value',
    'heinz'
  ]

  for (const b of preferred) {
    if (name.includes(b)) return 10
  }

  return 0
}

function scoreMatch(name, query) {
  const n = name.toLowerCase()

  let score = 0

  if (n === query) score += 100
  if (n.includes(query)) score += 50

  const words = query.split(' ')
  for (const w of words) {
    if (n.includes(w)) score += 10
  }

  return score
}

function decode(str) {
  return str.replace(/\\u0026/g, '&')
}
