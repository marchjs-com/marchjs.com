// Showcase stage for Menu / Dropdown: the trigger's name, the entries, an icon-only trigger, its look, size and colour
// follow the Playground values (playground.ts); a Dropdown beside it takes the same trigger options.
import { Menu, Dropdown, type MenuItem, Chip } from "march/actions";
import type { ColorToken } from "march/theme";
import { action } from "march/ui";
import { signal } from "march";
import { type Signal } from "../../demo-util.ts";
import { edit, copy, trash, more, filter, star, bell, heart } from "march/icons";

export const code = `const remove = action("Sil", api.remove, { icon: trash, danger: true, confirm: "Silinsin mi?" })
<Menu label="Eylemler" icon={more} items={[
  { label: "Düzenle", icon: edit, shortcut: "E", onSelect: () => open(row) },
  "-", remove,                                           // an action(): guarded, confirmed, toasted
]} args={[row]} />
<Menu label="Sırala" items={[{ label: "Ad", radio: true, checked: () => $sort === "ad", onSelect: () => { $sort = "ad" } }, …]} />   // işaretli öğe
<Menu label="Bölümler" items={[{ label: "Formlar", sub: "Alanlar ve seçiciler", href: "/forms", current: true }, …]} />   // açıklama satırı, bulunulan öğe
<Dropdown label="Süzgeç" variant="primary" m:color="brand-purple">{(close) => <FilterForm onDone={close} />}</Dropdown>`

// the Playground's icon names → their glyphs (any other name: the "more" dots)
const ICONS: Record<string, typeof more> = { more, filter, star, bell, heart, edit }
const LEADS: Record<string, typeof edit> = { "Düzenle": edit, "Kopyala": copy }
type Entry = { label: string; checked?: boolean; radio?: boolean; danger?: boolean }

export default function MenuDemo(props: { values: { label: string; items: readonly unknown[]; icon: string; variant: string; size: string; color: string } }) {
  let $last = ""
  let $filters = new Set(["Açık"])
  const remove = action("Sil", async () => { await new Promise((r) => setTimeout(r, 400)) }, { icon: trash, danger: true, confirm: "Bu öğe silinsin mi?", success: "Silindi" })
  const toggle = (f: string) => { const n = new Set($filters); if (n.has(f)) n.delete(f); else n.add(f); $filters = n }
  // the Playground's plain entries, each given what it does: a check follows a signal, "Sil" is an action()
  const live = (items: readonly unknown[], checked: Signal<Set<string>>): MenuItem[] => items.map((x): MenuItem => {
    if (x === "-") return "-"
    const it = x as Entry
    if (it.danger) return remove
    if (it.checked === undefined) return { ...(it as object), label: it.label, icon: LEADS[it.label], onSelect: () => { $last = it.label } } as MenuItem
    return { ...(it as object), label: it.label, checked: () => checked().has(it.label), onSelect: () => {
      const n = new Set(it.radio ? [...checked()].filter((k) => !items.some((y) => (y as Entry).radio && (y as Entry).label === k)) : checked())
      if (!it.radio && n.has(it.label)) n.delete(it.label); else n.add(it.label)
      checked.set(n); $last = it.label
    } } as MenuItem
  })
  return <div class="sc-row">
    {() => {
      const v = props.values
      // the checks start as the Playground's entries say
      const checked = signal(new Set((v.items as Entry[]).filter((x) => typeof x === "object" && x.checked).map((x) => x.label)))
      const icon = v.icon ? ICONS[v.icon] ?? more : undefined
      const variant = v.variant as "secondary", size = v.size as "md", color = (v.color || undefined) as ColorToken | undefined
      return [
        <Menu label={v.label || "Eylemler"} icon={icon} variant={variant} size={size} m:color={color} placement="bottom-start" items={live(v.items, checked)} />,
        <Dropdown label="Süzgeç" icon={icon ? filter : undefined} variant={variant} size={size} m:color={color}>
          <div class="sc-col"><strong>Durum</strong>
            <div class="sc-row">{["Açık", "Bekliyor", "Çözüldü"].map((f) => <Chip selected={() => $filters.has(f)} onClick={() => toggle(f)}>{f}</Chip>)}</div>
          </div>
        </Dropdown>,
      ]
    }}
    <span class="m-muted">{() => `${$last ? `Seçilen: ${$last} · ` : ""}Süzgeç: ${[...$filters].join(", ") || "yok"}`}</span>
  </div>
}
