/**
 * Deterministic 32-bit string hash (FNV-1a style) for seed mixing.
 * Same input string always yields the same uint32.
 */
export function stringToSeed(str: string): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function mixSeed(base: number, salt: string): number {
  return stringToSeed(`${(base >>> 0).toString(16)}:${salt}`) >>> 0
}
