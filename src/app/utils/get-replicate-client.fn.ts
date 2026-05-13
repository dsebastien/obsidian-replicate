import { log } from './log'
import Replicate from 'replicate'
import { obsidianFetch } from './obsidian-fetch'

export const getReplicateClient = (apiKey: string): Replicate => {
    log('Creating Replicate.com API client', 'debug')
    return new Replicate({
        auth: apiKey,
        userAgent: 'Obsidian Replicate',
        // Route requests through Obsidian's requestUrl to avoid CORS restrictions
        // without overriding global fetch / Headers / Request / Response.
        fetch: obsidianFetch
    })
}
