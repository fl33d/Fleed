/** An absent ID and token create a new portfolio. Any partial credential pair is an error. */
export function isPortfolioId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-z0-9]{6,32}$/.test(value)
}

export type EditIntent =
  | { kind: 'create' }
  | { kind: 'update'; id: string; token: string }
  | { kind: 'invalid' }

export function classifyEditIntent(id: unknown, token: unknown): EditIntent {
  if (id == null && token == null) return { kind: 'create' }
  if (isPortfolioId(id) && typeof token === 'string' && token.length > 0 && token.length <= 256) {
    return { kind: 'update', id, token }
  }
  return { kind: 'invalid' }
}

/** A length-consistent hash comparison; no direct token comparison or logging. */
export function hashesMatch(expected: string, received: string): boolean {
  if (expected.length !== received.length) return false
  let difference = 0
  for (let index = 0; index < expected.length; index++) {
    difference |= expected.charCodeAt(index) ^ received.charCodeAt(index)
  }
  return difference === 0
}
