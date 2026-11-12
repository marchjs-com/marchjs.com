// Loads a library that asks for its own Trusted Types policy as soon as it is evaluated (Svelte, Lit). The showcase
// CSP allows no policy (trusted-types 'none'), so the lookup is hidden while the chunk loads: the library then creates
// none and falls back to plain strings, which the browser still refuses at every HTML sink. The benchmark apps never
// hand it an HTML string (Svelte compiles with fragments: "tree", Lit gets DOM-built compiled templates).
export async function withoutPolicyLookup<T>(load: () => Promise<T>): Promise<T> {
  const g = globalThis as Record<string, unknown>
  const own = Object.getOwnPropertyDescriptor(g, "trustedTypes")
  Object.defineProperty(g, "trustedTypes", { value: undefined, configurable: true, writable: true })
  try { return await load() } finally {
    if (own) Object.defineProperty(g, "trustedTypes", own)
    else delete g.trustedTypes
  }
}
