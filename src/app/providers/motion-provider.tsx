'use client';

import { MotionConfig } from 'framer-motion';

/**
 * Applies the user's `prefers-reduced-motion` setting globally.
 *
 * Do NOT branch on `useReducedMotion()` during render to swap element types or
 * drop `motion.*` wrappers: the server has no media query, so it always renders
 * the animated branch, and React reports the resulting attribute difference as an
 * unpatchable hydration mismatch — the server's `style="opacity:0"` stays in the
 * DOM and the content is permanently invisible.
 *
 * `reducedMotion="user"` lets Framer Motion handle it internally instead: it skips
 * transform and layout animations while still resolving opacity, so nothing can be
 * stranded hidden and no render-time branching is needed.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
