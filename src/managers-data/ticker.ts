// Helpers shared by the data managers page and its lazy part.
/** A signal that changes every `ms` while the page is open (ages, countdowns): the showcase clock. */
export { clock as ticker } from "../clock.ts";
/** Badge tone of a Web Vitals rating. */
export const tone = (r: string) => (r === "good" ? "success" : r === "poor" ? "danger" : "warning") as "success"
