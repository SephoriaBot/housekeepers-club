export const config = {
  runtime: 'nodejs'
}

export default async function handler(req, res) {
  const q = req.query.q

  const url = `https://www.instacart.com/store/s?k=${encodeURIComponent(q)}`

  try {
    const html = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    }).then(r => r.text())

    const products = extract(html)
    const ranked = rank(products, q)

    res.status(200).json(ranked.slice(0, 8))
  } catch (e) {
    res.status(500).json({ error: 'failed' })
  }
}

function extract(html) {
  const matches = []
  const regex = /"name":"(.*?)"/g

  let m
  const seen = new Set()

  while ((m = regex.exec(html))) {
    const name = decode(m[1])
    if (!seen.has(name)) {
      seen.add(name)
      matches.push({ name })
    }
  }

  return matches
}

function rank(products, q) {
  const words = q.toLowerCase().split(' ').filter(Boolean)

  return products
    .map(p => ({
      ...p,
      score: score(p.name.toLowerCase(), q.toLowerCase(), words)
    }))
    .sort((a, b) => b.score - a.score)
}

function score(name, q, words) {
  let s = 0

  if (name === q) s += 200
  if (name.includes(q)) s += 120

  for (const w of words) {
    if (name.includes(w)) s += 20
  }

  return s
}

function decode(str) {
  return str.replace(/\\u0026/g, '&')
}
