/**
 * Node drawing vs acquisition (CSS / layout pixel space, same as board layout).
 * Hit radius is intentionally larger than the painted disc so grabs feel forgiving.
 */
export const NODE_VISUAL_RADIUS_CELL = 0.39

/** ~1.55× visual — primary grab ring */
export const NODE_HIT_RADIUS_CELL = 0.61

/** Extra magnet while a drag session is active (path continuation + noisy input). */
export const NODE_HIT_RADIUS_DRAG_CELL = 0.78
