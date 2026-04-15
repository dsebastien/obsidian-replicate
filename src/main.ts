import { ReplicatePlugin } from './app/plugin'
// The Replicate SDK requires a CORS-free fetch. Obsidian's requestUrl is not a drop-in replacement for the SDK.
// eslint-disable-next-line no-restricted-imports
import nfetch, { Headers, Request, Response } from 'node-fetch'

// Replace the browser's fetch (which uses CORS) with node-fetch, which is compatible, but has no CORS restrictions
// Reference: https://forum.obsidian.md/t/make-http-requests-from-plugins/15461/25?page=2

// @ts-expect-error - globalThis is not defined in the Node.js environment
globalThis.fetch = nfetch
// @ts-expect-error - globalThis is not defined in the Node.js environment
globalThis.Headers = Headers
// @ts-expect-error - globalThis is not defined in the Node.js environment
globalThis.Request = Request
// @ts-expect-error - globalThis is not defined in the Node.js environment
globalThis.Response = Response

// noinspection JSUnusedGlobalSymbols
export default ReplicatePlugin
