// Helpers the hadi-march/ui "Dialog" … "Loader" example files (ui-b*.tsx) share.
import { signal } from "hadi-march";
import { schema } from "hadi-march/schema";

export const now = () => new Date().toLocaleTimeString("tr-TR")
export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
/** A log signal and a push helper (newest last, at most 6 lines). */
export function useLog() {
  const lines = signal<string[]>([])
  return { lines, push: (s: string) => lines.update((l) => [...l.slice(-5), `${now()} ${s}`]) }
}

/** A small profile schema (Form, EditForm, Field examples). */
export const Profile = schema({
  name: { type: "text", label: "Ad", required: true, max: 40 },
  email: { type: "email", label: "E-posta", required: true },
  team: { type: "pick", label: "Ekip", options: [{ value: "web", label: "Web" }, { value: "mobile", label: "Mobil" }], default: "web", control: "segmented" },
})
