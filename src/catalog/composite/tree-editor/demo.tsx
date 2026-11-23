// Showcase stage for TreeEditor, for the Playground values (playground.ts: three neutral data sets with a schema each,
// shared with MarchIDE's raw component).
import { signal } from "march";
import { lazy } from "march/lazy";
import type { TreeEditorProps } from "march/composite";
import { DATA } from "./playground.ts";

// one lazy chunk for the editor, shared with JsonEditor's tree view (two entries would split it into a shared chunk)
const TreeEditor = lazy<TreeEditorProps>(() => import("march/composite").then((m) => ({ default: m.TreeEditor })), { placeholder: "form" });

export default function TreeEditorDemo(props: { values: { data: string; schema: boolean; search: boolean; expand: number; readonly: boolean; status: boolean; typeBadges: boolean; actions: string; ownLabels: boolean } }) {
  return <div class="sc-ed-one">
    {() => {
      const d = DATA[props.values.data] ?? DATA.config!
      const value = signal(d.value)
      const v = props.values
      const parts = { status: v.status, typeBadges: v.typeBadges, actions: v.actions === "none" ? false : v.actions === "add" ? ["add"] as const : true }
      const labels = v.ownLabels ? { valid: "Her şey yolunda", problems: (n: number) => `${n} düzeltilecek yer`, search: "Ayarlarda ara", items: (n: number) => `${n} kayıt`, fields: (n: number) => `${n} ayar` } : undefined
      return <TreeEditor value={value} schema={v.schema ? d.schema : undefined} search={v.search} expand={v.expand} readonly={v.readonly} label="HADİ verisi" {...parts} labels={labels} />
    }}
  </div>
}
