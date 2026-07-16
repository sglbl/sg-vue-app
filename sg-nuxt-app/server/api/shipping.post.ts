// server/api/shipping.post.ts
//
// POST /api/shipping
// Body:    { country: string, premium: boolean, subtotal?: number }
// Response: { cost: number, currency: 'USD', estimatedDays: number }
//
// Why this lives on the server (not just in ProductDisplayCloud.vue):
//   - Real shipping rates come from a carrier API (FedEx, UPS, EasyPost)
//     whose API key must NEVER reach the browser.
//   - The pricing rules are business logic — keeping them on the server
//     stops a client from tampering with the calculation.
//   - Supabase gives you data; this kind of endpoint gives you *behavior*.

/*
Demonstrates the four Nitro primitives you'll reuse in every server route:
defineEventHandler — the entry point
readBody / getQuery / getRouterParam — reading the request
createError — failing with proper HTTP status codes
returning a plain object — Nitro JSON-serializes it for you
*/

// --- Types (just for the handler's inputs/outputs) -------------------
interface ShippingRequest {
    country: string,
    premium: boolean,
    subtotal?: number
}

interface ShippingResponse {
    cost: number, 
    currency: 'EUR',
    estimatedDays: number
}

// --- "Pricing table" ------------------------------------------------
// In production this would come from a carrier API or your own DB.
const RATES: Record<string, {base: number; days: number}> = {
    US: { base:  5.99, days:  3 },
    CA: { base:  8.99, days:  5 },
    GB: { base: 12.99, days:  7 },
    DE: { base: 12.99, days:  7 },
    TR: { base: 14.99, days: 10 },
}

const DEFAULT_RATE = {base: 19.99, days:14}


// --- Handler --------------------------------------------------------
// `defineEventHandler` is auto-imported in server/ — no import statement.

// Nitro (server engine and backend layer of Nuxt to help with server side rendering SSR) wraps your default export as the route handler.

export default defineEventHandler(async (event): Promise<ShippingResponse> => {
    // 1. Read and validate the POST body.
    // 'readBody' is also auto imported. It parses JSON or form-encoded bodies.
    const body = await readBody<ShippingRequest>(event)

    if (!body?.country || typeof body.country !== "string") {
        // createError is auto imported, throwing it stops the handler and sends a proper HTTP error response with the status code you sent.
        throw createError({
            statusCode: 400,
            statusMessage: 'country is required (string'
        })    
    }

    // 2. normalize inputs
    const country = body.country.toUpperCase()
    const premium = Boolean(body.premium)
    const subtotal = Number(body.subtotal ?? 0)

    // 3. compute
    const rate = RATES[country] ?? DEFAULT_RATE
    let cost = rate.base

    // Premium customers: free over $50, otherwise $50 off.
    if (premium && subtotal >= 50) 
        cost = 0
    else if (premium) 
        cost = cost / 2

    // 4. whatever you return is auto-serialized as JSON with status 200
    // rount to 2 decimals to avoid floating point ugliness like 6.495000001
    return {
        cost: Math.round(cost * 100) / 100,
        currency: 'EUR',
        estimatedDays: rate.days
    } 
})