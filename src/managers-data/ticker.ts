// Helpers shared by the data managers page and its lazy part.
import { onCleanup, signal } from "hadi-march";

/** A signal that changes every `ms` while the page is open (ages, countdowns). */
export function ticker(ms: number) {
  const now = signal(Date.now())
  const id = setInterval(() => now.set(Date.now()), ms)
  onCleanup(() => clearInterval(id))
  return now
}
/** Badge tone of a Web Vitals rating. */
export const tone = (r: string) => (r === "good" ? "success" : r === "poor" ? "danger" : "warning") as "success"
