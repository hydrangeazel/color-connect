/**
 * Tiny bounded backtracking helper for future hint / assist search.
 * Explores a deterministic depth-first tree until `maxExpansions` nodes are visited.
 */
export type BoundedBacktrackResult<T> =
  | { ok: true; solution: T }
  | { ok: false; reason: 'limit' | 'exhausted' }

export function boundedBacktrack<T>(
  initial: T,
  options: {
    maxExpansions: number
    /** Return ordered child states, or empty if dead. */
    children: (state: T) => readonly T[]
    isGoal: (state: T) => boolean
  },
): BoundedBacktrackResult<T> {
  const stack: T[] = [initial]
  let expansions = 0

  while (stack.length) {
    const cur = stack.pop()!
    expansions += 1
    if (expansions > options.maxExpansions) {
      return { ok: false, reason: 'limit' }
    }
    if (options.isGoal(cur)) {
      return { ok: true, solution: cur }
    }
    const kids = options.children(cur)
    for (let i = kids.length - 1; i >= 0; i -= 1) {
      stack.push(kids[i]!)
    }
  }

  return { ok: false, reason: 'exhausted' }
}
