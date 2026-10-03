import type { SecretStore } from './api-key-secret.fn'

/** An in-memory SecretStorage stand-in for tests (records every write). */
export interface MockSecretStore extends SecretStore {
    readonly secrets: Map<string, string>
    readonly writes: { id: string; value: string }[]
}

export function createMockSecretStore(initial: Record<string, string> = {}): MockSecretStore {
    const secrets = new Map<string, string>(Object.entries(initial))
    const writes: { id: string; value: string }[] = []
    return {
        secrets,
        writes,
        getSecret: (id: string): string | null => secrets.get(id) ?? null,
        setSecret: (id: string, value: string): void => {
            if (!/^[a-z0-9-]+$/.test(id)) {
                throw new Error(`Invalid secret id: ${id}`)
            }
            writes.push({ id, value })
            secrets.set(id, value)
        },
        listSecrets: (): string[] => [...secrets.keys()]
    }
}
