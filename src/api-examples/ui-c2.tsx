// API examples of hadi-march/ui, names Menu … OverflowText (code-point order). Layout and rules: tools/api-examples.js.
// Each `run` is a small live demo of its `code`; components re-create themselves for options they read once.
import { signal } from "hadi-march";
import { Menu, MoneyInput, MultiSelect, NavMenu, NavSidebar, Notice, NumberInput, OverflowText, Button } from "hadi-march/ui";
import { inbox, users, wallet, settings, copy, trash, columns, barChart, dashboard } from "hadi-march/icons";
import { examples } from "./types.ts";
import { Out, Log, Row } from "./_kit.tsx";
import "./ui-c.css";
export { default as SIG } from "./ui-c2.sig.gen.ts";

const CITIES = ["Ankara", "Antalya", "Bursa", "Eskişehir", "İstanbul", "İzmir", "Konya", "Trabzon"]
/** A log signal and a function that appends a line (keeps the last six). */
const logger = () => { const lines = signal<string[]>([]); return [lines, (l: string) => lines.update((x) => [...x.slice(-5), l])] as const }
const opts = (...pairs: [unknown, string][]) => pairs.map(([value, label]) => ({ value, label }))

export default examples({
  "hadi-march/ui": {
    Menu: {
      code: `<Menu label="İşlemler" args={[row]} items={[
  { label: "Düzenle", onSelect: (r) => edit(r), shortcut: "mod+e" },
  "-",
  { label: "Sil", danger: true, onSelect: (r) => remove(r) },
]} />`,
      play: { options: [
        { key: "variant", label: "Düğme", default: "secondary", options: opts(["secondary", "ikincil"], ["primary", "birincil"], ["ghost", "sade"]) },
        { key: "locked", label: "Sil kapalı", default: false },
      ] },
      run: (p: { values: { variant: "secondary" | "primary" | "ghost"; locked: boolean } }) => {
        const [lines, add] = logger()
        const row = { name: "Acme faturası #42" }
        return <div class="sc-ex-ui-c-stack">
          <Row><span>{row.name}</span>
            <Menu label="İşlemler" variant={() => p.values.variant} args={[row]} items={[
              { label: "Düzenle", icon: columns, shortcut: "mod+e", onSelect: (r) => add(`düzenle: ${(r as typeof row).name}`) },
              { label: "Kopyala", icon: copy, onSelect: (r) => add(`kopyala: ${(r as typeof row).name}`) },
              "-",
              { label: "Sil", icon: trash, danger: true, disabled: () => p.values.locked, onSelect: (r) => add(`sil: ${(r as typeof row).name}`) },
            ]} /></Row>
          <Log lines={lines} />
        </div>
      },
    },
    MoneyInput: {
      code: `const price = signal<number | null>(1499.9)
<MoneyInput value={price} currency="TRY" min={0} />`,
      play: { options: [{ key: "currency", label: "Para birimi", default: "TRY", options: ["TRY", "USD", "EUR"] }] },
      run: (p: { values: { currency: string } }) => {
        const price = signal<number | null>(1499.9)
        return <div class="sc-ex-ui-c-stack">
          <div class="sc-ex-ui-c-narrow">{() => { const currency = p.values.currency; return <MoneyInput value={price} currency={currency} min={0} aria-label="Fiyat" /> }}</div>
          <Row><Out label="değer" value={() => String(price())} /><Out label="KDV dahil" value={() => (price() == null ? "—" : (price()! * 1.2).toFixed(2))} />
            <Button variant="ghost" onClick={() => price.set(99)}>99 yaz</Button></Row>
        </div>
      },
    },
    MultiSelect: {
      code: `const tags = signal<string[]>([])
<MultiSelect value={tags} options={["Ankara", "İzmir", "Bursa"]} placeholder="Şehir seçin" />`,
      play: { options: [{ key: "custom", label: "Serbest giriş", default: false }] },
      run: (p: { values: { custom: boolean } }) => {
        const picked = signal<unknown>(["İzmir"])
        return <div class="sc-ex-ui-c-stack">
          {() => { const custom = p.values.custom
            return <MultiSelect value={picked} options={CITIES} allowCustom={custom} placeholder={custom ? "Şehir yazın ya da seçin" : "Şehir seçin"} aria-label="Şehirler" /> }}
          <Out label="seçili" value={() => ((picked() as string[] | null) ?? []).join(", ") || "—"} />
        </div>
      },
    },
    NavMenu: {
      code: `<NavMenu brand="Acme" palette={false} items={[
  { id: "inbox", title: "Gelen kutusu", href: "/inbox", icon: inbox, badge: () => unread() },
  { id: "pay", title: "Ödemeler", href: "/pay", group: "Finans" },
]} />`,
      play: { options: [
        { key: "filter", label: "Süzme kutusu", default: false },
        { key: "collapsible", label: "Daraltılabilir", default: true },
      ] },
      run: (p: { values: { filter: boolean; collapsible: boolean } }) => {
        const unread = signal(2)
        const items = [
          { id: "inbox", title: "Gelen kutusu", href: "/start?ornek=inbox", icon: inbox, badge: () => unread() },
          { id: "team", title: "Ekip", href: "/start?ornek=team", icon: users, group: "Yönetim" },
          { id: "pay", title: "Ödemeler", href: "/start?ornek=pay", icon: wallet, group: "Finans" },
          { id: "settings", title: "Ayarlar", href: "/start?ornek=settings", icon: settings },
        ]
        return <div class="sc-ex-ui-c-stack">
          <Row><Button onClick={() => unread.update((x) => x + 1)}>Yeni ileti</Button><Button variant="ghost" onClick={() => unread.set(0)}>Hepsini oku</Button></Row>
          <div class="sc-ex-ui-c-frame">
            {() => { const filter = p.values.filter, collapsible = p.values.collapsible
              return <NavMenu items={items as never} brand={<strong>Acme</strong>} label="Örnek menü" palette={false} storageKey="sc.ex.navmenu" filter={filter} collapsible={collapsible} /> }}
            <div class="sc-ex-ui-c-main hm-muted">Sayfa içeriği</div>
          </div>
        </div>
      },
    },
    NavSidebar: {
      code: `<NavSidebar title="Acme" recent={0} items={[
  { id: "orders", label: "Siparişler", group: "Satış", onSelect: () => go("orders"), badge: 3 },
  { id: "team", label: "Ekip", group: "Yönetim", sub: "4 kişi" },
]} />`,
      play: { options: [
        { key: "open", label: "İlk açılışta", default: "all", options: opts(["all", "hepsi açık"], ["none", "kapalı"]) },
        { key: "collapsible", label: "Daraltılabilir", default: false },
      ] },
      run: (p: { values: { open: "all" | "none"; collapsible: boolean } }) => {
        const [lines, add] = logger()
        const orders = signal(3)
        const pick = (label: string) => () => add(`seçildi: ${label}`)
        const items = [
          { id: "orders", label: "Siparişler", group: "Satış", icon: dashboard, badge: () => orders(), onSelect: () => { orders.set(0); add("seçildi: Siparişler") } },
          { id: "reports", label: "Raporlar", group: "Satış", icon: barChart, sub: "Haftalık", onSelect: pick("Raporlar") },
          { id: "team", label: "Ekip", group: "Yönetim", icon: users, sub: "4 kişi", onSelect: pick("Ekip") },
          { id: "settings", label: "Ayarlar", group: "Yönetim", icon: settings, onSelect: pick("Ayarlar") },
        ]
        return <div class="sc-ex-ui-c-stack">
          <div class="sc-ex-ui-c-frame">
            {() => { const open = p.values.open, collapsible = p.values.collapsible
              return <NavSidebar title="Acme" items={items} recent={0} groupOrder="none" itemOrder="none" defaultOpen={open} collapsible={collapsible}
                storageKey={`sc.ex.navsidebar.${open}`} hotkey={false} palette={false} label="Örnek kenar çubuğu" /> }}
          </div>
          <Log lines={lines} />
        </div>
      },
    },
    Notice: {
      code: `<Notice tone="success" title="Kaydedildi" dismissable onDismiss={() => track("notice-closed")}>
  Değişiklikler ekibinize gönderildi.
</Notice>`,
      play: { options: [
        { key: "tone", label: "Ton", default: "info", options: opts(["info", "bilgi"], ["success", "başarı"], ["warn", "uyarı"], ["danger", "hata"]) },
        { key: "dismissable", label: "Kapatılabilir", default: true },
      ] },
      run: (p: { values: { tone: string; dismissable: boolean } }) => {
        const round = signal(0), closed = signal(0)
        return <div class="sc-ex-ui-c-stack">
          {() => { round(); const dismissable = p.values.dismissable
            return <Notice tone={() => p.values.tone} title="Acme raporu hazır" dismissable={dismissable} onDismiss={() => closed.update((x) => x + 1)}>Haftalık özet e-posta ile de gönderildi.</Notice> }}
          <Row><Button variant="ghost" onClick={() => round.update((x) => x + 1)}>Yeniden göster</Button><Out label="kapatıldı" value={closed} /></Row>
        </div>
      },
    },
    NumberInput: {
      code: `<NumberInput value={qty} min={0} max={100} step={5} suffix="adet" />   // ↑ ↓ change by step`,
      play: { options: [
        { key: "step", label: "Adım", default: 1, options: [1, 5, 10] },
        { key: "decimals", label: "Ondalık", default: 0, options: [0, 2] },
      ] },
      run: (p: { values: { step: number; decimals: number } }) => {
        const qty = signal<number | null>(12)
        return <div class="sc-ex-ui-c-stack">
          <div class="sc-ex-ui-c-narrow">{() => { const step = p.values.step, decimals = p.values.decimals
            return <NumberInput value={qty} min={0} max={100} step={step} decimals={decimals} suffix="adet" aria-label="Adet" /> }}</div>
          <Row><Out label="değer" value={() => String(qty())} /><Button variant="ghost" onClick={() => qty.set(250)}>250 yaz (en çok 100)</Button></Row>
        </div>
      },
    },
    OverflowText: {
      code: `<button class="hm-btn"><OverflowText text={file.name} trigger="hover" /></button>   // scrolls only when clipped`,
      play: { options: [
        { key: "trigger", label: "Tetik", default: "hover", options: opts(["hover", "üstüne gelince"], ["focus", "odakta"], ["always", "her zaman"]) },
        { key: "mode", label: "Mod", default: "bounce", options: ["bounce", "loop", "once"] },
      ] },
      run: (p: { values: { trigger: "hover" | "focus" | "always"; mode: "bounce" | "loop" | "once" } }) => <div class="sc-ex-ui-c-stack sc-ex-ui-c-narrow">
        {() => { const trigger = p.values.trigger, mode = p.values.mode
          return <div class="sc-ex-ui-c-stack">
            <Button><OverflowText text="Acme_2026_yillik_faaliyet_raporu_son_hali.pdf" trigger={trigger} mode={mode} /></Button>
            <Button variant="ghost"><OverflowText text="Kısa ad.pdf" trigger={trigger} mode={mode} /></Button>
          </div> }}
        <p class="hm-muted">Uzun ad kırpılır ve kayar; kısa ad sabit kalır.</p>
      </div>,
    },
  },
})
