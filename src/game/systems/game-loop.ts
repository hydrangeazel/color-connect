/**
 * Reserved for future fixed-step simulation / replay ticks.
 * Rendering stays RAF-driven; gameplay mutations currently run on pointer events.
 */
export const TARGET_SIM_HZ = 60 as const
