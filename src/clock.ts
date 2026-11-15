// A wall clock for demos that show ages, countdowns and "x s ago" (managers pages). Not an animation: it does not
// follow the motion engine's speed or "Stop all" (a countdown keeps real time).
import { onCleanup, signal } from "march";

/** Date.now() as a signal, refreshed every `ms` while the owning component is on screen. */
export function clock(ms = 250) {
  const now = signal(Date.now())
  const id = setInterval(() => now.set(Date.now()), ms)
  onCleanup(() => clearInterval(id))
  return now
}
