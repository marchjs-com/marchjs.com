// Shared bits of the march/ui examples Section … Wizard (ui-d.tsx, ui-d2.tsx, ui-d3.tsx).
export const now = (): string => new Date().toLocaleTimeString("tr-TR")
export const tl = (n: number): string => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(n)
export const COLORS = [{ value: "primary", label: "birincil" }, { value: "brand-blue", label: "mavi" }, { value: "brand-green", label: "yeşil" }, { value: "brand-purple", label: "mor" }]
