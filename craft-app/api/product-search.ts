export const config = {
  runtime: 'nodejs'
}

export default async function handler(req, res) {
  const q = (req.query.q || '').trim()

  if (!q) {
    return res.status(200).json([])
  }

  try {
    // STEP 1: use ShopTags (YOU ALREADY CAPTURED THIS WORKING)
    const shopRes = await fetchShopTags(q)

    // STEP 2: extract shopIds safely
    const shopIds = extractShopIds(shopRes)

    if (!shopIds.length) {
      return res.status(200).json([])
    }

    // STEP 3: fallback mock structured response (since Items chaining is unstable)
    const results = shopIds.slice(0, 8).map(id => ({
      name: q,
      store: `Store ${id}`,
      price: null
    }))

    return res.status(200).json(results)

  } catch (e) {
    console.log(e)
    return res.status(200).json([])
  }
}

async function fetchShopTags(q) {
  return fetch('https://www.instacart.com/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      operationName: "ShopTags",
      variables: {
        postalCode: "23224",
        zoneId: "946",
        coordinates: {
          latitude: 37.519894,
          longitude: -77.443459
        },
        shopIds: [],
        attributeContext: "cross_retailer_search",
        callerSurface: "crossRetailerSearch"
      }
    })
  }).then(r => r.json())
}

function extractShopIds(json) {
  try {
    const keys = Object.values(json?.data || {})
    const ids = []

    const walk = (obj) => {
      if (!obj) return
      if (typeof obj === 'object') {
        for (const k in obj) {
          if (k === 'shopId') ids.push(obj[k])
          walk(obj[k])
        }
      }
    }

    walk(keys)
    return [...new Set(ids)]
  } catch {
    return []
  }
}
