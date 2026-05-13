import { requestUrl, type RequestUrlParam } from 'obsidian'

/**
 * A `fetch`-shaped wrapper around Obsidian's `requestUrl` so that CORS-restricted
 * libraries (like the Replicate SDK) can be used inside Obsidian without falling back
 * to `node-fetch` and polluting `globalThis`.
 *
 * Only the surface that the Replicate SDK actually uses is implemented:
 * - string / URL / Request input
 * - method, headers, body (string or ArrayBuffer)
 * - Response with `.ok`, `.status`, `.statusText`, `.text()`, `.json()`, `.arrayBuffer()`
 *
 * Streaming, FormData, ReadableStream bodies, and AbortSignal are not supported because
 * the SDK does not use them in the code paths this plugin exercises (`replicate.run()`).
 */
export async function obsidianFetch(
    input: string | URL | Request,
    init?: RequestInit
): Promise<Response> {
    const url =
        typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
    const method = init?.method ?? (input instanceof Request ? input.method : 'GET')

    const headers: Record<string, string> = {}
    if (input instanceof Request) {
        input.headers.forEach((value, key) => {
            headers[key] = value
        })
    }
    if (init?.headers) {
        const initHeaders = new Headers(init.headers)
        initHeaders.forEach((value, key) => {
            headers[key] = value
        })
    }

    let body: string | ArrayBuffer | undefined
    if (typeof init?.body === 'string') {
        body = init.body
    } else if (init?.body instanceof ArrayBuffer) {
        body = init.body
    } else if (init?.body !== undefined && init?.body !== null) {
        // The Replicate SDK only sends string or ArrayBuffer bodies. Refuse anything else
        // rather than producing `[object Object]` via implicit coercion.
        throw new TypeError('obsidianFetch only supports string or ArrayBuffer request bodies')
    }

    const params: RequestUrlParam = {
        url,
        method,
        headers,
        body,
        throw: false
    }

    const response = await requestUrl(params)

    return new Response(response.arrayBuffer, {
        status: response.status,
        headers: response.headers
    })
}
