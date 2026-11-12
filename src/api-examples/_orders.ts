// Sample orders shared by the data and table API examples (files starting with "_" are not example files).
export interface Order { id: number; customer: string; region: string; amount: number; paid: boolean; date: string }
export const ORDERS: Order[] = [
  { id: 1, customer: "Acme", region: "Ege", amount: 1250, paid: true, date: "2026-10-02" },
  { id: 2, customer: "Bora Yapı", region: "Marmara", amount: 480, paid: false, date: "2026-10-05" },
  { id: 3, customer: "Çınar Gıda", region: "Ege", amount: 2210, paid: true, date: "2026-10-09" },
  { id: 4, customer: "Deniz Lojistik", region: "Akdeniz", amount: 760, paid: true, date: "2026-10-12" },
  { id: 5, customer: "Ege Tekstil", region: "Ege", amount: 3120, paid: false, date: "2026-10-15" },
  { id: 6, customer: "Fırat Enerji", region: "Marmara", amount: 1890, paid: true, date: "2026-10-21" },
  { id: 7, customer: "Göl Turizm", region: "Akdeniz", amount: 540, paid: false, date: "2026-10-26" },
  { id: 8, customer: "Hisar Yazılım", region: "Marmara", amount: 2675, paid: true, date: "2026-11-01" },
]
/** "₺1.250" (or "—" for empty). */
export const money = (n: unknown) => (n == null ? "—" : `₺${Math.round(Number(n)).toLocaleString("tr-TR")}`)
