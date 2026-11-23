// Showcase stage for PropertyGrid: a card whose look follows the inspector (Playground values in playground.ts).
import { signal } from "march";
import { PropertyGrid, type PropertySpec } from "march/composite";
import { toast } from "march/overlays";
import { cx } from "../../demo-util.ts";
import { Button } from "march/actions";

export const code = `<PropertyGrid label="Kart" bind:value={$card} onSave={(v) => api.save(v)} properties={[
  { key: "title", label: "Başlık", group: "İçerik" },
  { key: "width", label: "Genişlik", type: "number", unit: "px", group: "Yerleşim", validate: (v) => v > 420 ? "En çok 420" : null },
  { key: "elevated", label: "Gölge", type: "switch", group: "Görünüm" },
  { key: "radius", label: "Köşe", type: "slider", min: 0, max: 24, group: "Görünüm" },
  { key: "tone", label: "Ton", type: "segmented", options: ["açık", "koyu"], group: "Görünüm" },
]} />
<PropertyGrid properties={specs} bind:value={$card} historyButtons={false} resetButtons={false} footer={false}
  labels={{ save: "Yayınla", revert: "Vazgeç", search: "Bir ayar bul" }} />          // Ctrl+Z geri alır (Undo), sayfadan ayrılırken kaydedilmemiş değişikliği sorar (DirtyState)`

const PROPS: PropertySpec[] = [
  { key: "title", label: "Başlık", group: "İçerik", keywords: "ad isim" },
  { key: "body", label: "Metin", type: "textarea", group: "İçerik" },
  { key: "width", label: "Genişlik", type: "number", unit: "px", min: 160, max: 600, group: "Yerleşim", description: "160–420 px", validate: (v) => (Number(v) > 420 ? "En çok 420 px" : null) },
  { key: "align", label: "Hizalama", type: "select", options: [{ value: "start", label: "Başa" }, { value: "center", label: "Ortaya" }], group: "Yerleşim" },
  { key: "elevated", label: "Gölge", type: "switch", group: "Görünüm" },
  { key: "radius", label: "Köşe yarıçapı", type: "slider", min: 0, max: 24, group: "Görünüm" },
  { key: "tone", label: "Ton", type: "segmented", options: [{ value: "light", label: "Açık" }, { value: "accent", label: "Vurgulu" }], group: "Görünüm" },
  { key: "accent", label: "Vurgu rengi", type: "color", group: "Görünüm", hidden: (v) => v["tone"] !== "accent" },
]

export default function PropertyGridDemo(props: { values: { properties: string; layout: string; search: boolean; save: boolean; historyButtons: boolean; resetButtons: boolean; changeMarks: boolean; footer: boolean; ownLabels: boolean } }) {
  const card = signal<Record<string, unknown>>({ title: "HADİ bülteni", body: "Haftalık özet", width: 300, align: "start", elevated: true, radius: 12, tone: "light", accent: "#1d9ad6" })
  // an edit without typing: the change marks (row dot, group count), the reset button and the footer show what an edit does
  const RADII = [20, 4, 16]
  let edits = 0
  const edit = (): void => { card.set({ ...card(), radius: RADII[edits++ % RADII.length] }) }
  return <div class="sc-pg-stage">
    <div class="sc-pg-preview" aria-hidden="true">
      {() => {
        const c = card()
        return <div class={cx("sc-pg-card", c["elevated"] && "is-elevated", c["tone"] === "accent" && "is-accent", c["align"] === "center" && "is-center")}
          style={{ "--sc-pg-w": `${Math.min(Number(c["width"]) || 300, 420)}px`, "--sc-pg-r": `${c["radius"]}px`, "--sc-pg-accent": String(c["accent"]) }}>
          <strong>{String(c["title"])}</strong><p>{String(c["body"])}</p>
        </div>
      }}
    </div>
    <div class="sc-pg-panel">
      {() => <PropertyGrid properties={props.values.properties === "look" ? PROPS.filter((p) => p.group === "Görünüm") : PROPS} value={card} label="Kart özellikleri" layout={props.values.layout as "auto"} search={props.values.search}
        historyButtons={props.values.historyButtons} resetButtons={props.values.resetButtons} changeMarks={props.values.changeMarks} footer={props.values.footer}
        labels={props.values.ownLabels ? { search: "Bir ayar bul", save: "Yayınla", revert: "Vazgeç", unsaved: (n) => `${n} düzenleme yayınlanmadı`, noChanges: "Her şey yayında" } : undefined}
        onSave={props.values.save ? () => { toast("Kaydedildi", { kind: "success" }) } : undefined} />}
    </div>
    <div class="sc-row"><Button size="sm" data-audit-try onClick={edit}>Örnek bir değişiklik yap (köşe yarıçapı)</Button></div>
  </div>
}
