export default async function handler(req, res) {
  const q = req.query.q

  if (!q) {
    return res.status(400).json({ error: 'missing query' })
  }

  const url = `https://www.instacart.com/store/s?k=${encodeURIComponent(q)}`

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    })

    const html = await response.text()

    // very simple extraction (no API needed)
    const products = extractProducts(html)

    const ranked = rankProducts(products, q)

    return res.status(200).json(ranked.slice(0, 5))
  } catch (e) {
    return res.status(500).json({ error: 'search failed' })
  }
}

function extractProducts(html) {
  const results = []

  const regex = /"name":"(.*?)".*?"price":(\d+\.?\d*)/g
  let match

  while ((match = regex.exec(html)) !== null) {
    results.push({
      name: decode(match[1]),
      price: parseFloat(match[2] || '0'),
      retailer: 'Instacart'
    })
  }

  return results
}

function rankProducts(products, query) {
  const q = query.toLowerCase()

  return products
    .map(p => ({
      ...p,
      score: scoreMatch(p.name, q)
    }))
    .sort((a, b) => b.score - a.score)
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
