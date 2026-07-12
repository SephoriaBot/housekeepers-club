/// <reference types="node" />
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Known grocery/retail chains, mapped to a single canonical name so the same
// store isn't split into duplicates by inconsistent formatting (casing,
// "- Pickup & Delivery" tags, marketplace labels, etc). Anything NOT in this
// list passes through untouched — nothing is filtered or dropped, this only
// fixes name collisions for stores it actually recognizes.
const KNOWN_STORES: Record<string, string> = {
  'walmart': 'Walmart',
  'target': 'Target',
  'kroger': 'Kroger',
  'costco': 'Costco',
  "sam's club": "Sam's Club",
  'whole foods': 'Whole Foods',
  'safeway': 'Safeway',
  'publix': 'Publix',
  'aldi': 'Aldi',
  'meijer': 'Meijer',
  'h-e-b': 'H-E-B',
  'heb': 'H-E-B',
  "trader joe": "Trader Joe's",
  'food lion': 'Food Lion',
  'giant': 'Giant',
  'wegmans': 'Wegmans',
  'sprouts': 'Sprouts',
  'cvs': 'CVS',
  'walgreens': 'Walgreens',
}

function cleanStoreName(raw: string): string {
  const trimmed = raw.trim().replace(/\s+/g, ' ')
  const lower = trimmed.toLowerCase()
  for (const key in KNOWN_STORES) {
    if (lower.includes(key)) return KNOWN_STORES[key]
  }
  return trimmed
}


export default async function handler(req: VercelRequest, res: VercelResponse) {
  const q = (req.query.q || "").toString().trim()
  const location = (req.query.zip || "").toString().trim()

  if (!q) return res.status(400).json([])

  try {
    let url = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(q)}&api_key=${process.env.SERPAPI_KEY}&gl=us&hl=en`

    if (location) url += `&location=${encodeURIComponent(location)}`

    const r = await fetch(url)
    const data = await r.json()

    const results = (data.shopping_results || [])
      .filter((item: any) => {
        const source = (item.source || '').toLowerCase()
        if (source === 'instacart') return false
        // Filter out websites masquerading as stores
        if (source.includes('.com') || source.includes('.net') || source.includes('.org') || source.includes('.co')) return false
        return true
      })
      .map((item: any) => ({
        name: item.title,
        price: item.extracted_price ?? null,
        store: item.source ? cleanStoreName(item.source) : 'unknown',
        image: item.thumbnail ?? null
      }))

    results.sort((a: any, b: any) => Number(a.price || 9999) - Number(b.price || 9999))
    return res.status(200).json(results.slice(0, 20))
  } catch (e) {
    console.error('handler error:', e)
    return res.status(200).json([])
  }
}
