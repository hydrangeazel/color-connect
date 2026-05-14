/**
 * DOM → gameplay bridge lives in `engine/input/interactionManager.ts`
 * to keep React and canvas RAF loops free of gesture parsing.
 */
export { mountInteractionController } from '@/engine/input/interactionManager'
