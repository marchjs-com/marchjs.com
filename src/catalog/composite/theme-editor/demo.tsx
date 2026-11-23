// Showcase stage for ThemeEditor: the editor itself, for the Playground values (playground.ts). Its first draft is the
// saved one or a share link; a new start choice starts that preset (or one accent color, "scratch").
import { untrack } from "march";
import { ThemeEditor, presetCopy, draftFromColor, type ThemeEditorTab, type ThemeDraft } from "march/components/composite/theme-editor";

export const code = `import { ThemeEditor, registerDraft, applyDraft, presetCopy } from "march/components/composite/theme-editor"

<ThemeEditor />                                    // HADİ copy, a share link (?theme=…) or the saved draft
<ThemeEditor bind:value={$draft} base="night" tabs={["colors", "type"]} storageKey={false} onSave={(d) => api.save(d)} />
<ThemeEditor tabs={["colors", "shape"]} presets={false} applyButton={false} previewControls={false}
  labels={{ tabs: { colors: "Palet" }, startFrom: "Temel al" }} />
registerDraft(draft)    // ThemePicker / ThemeMenu offer it (a runtime theme, no stylesheet)
applyDraft(draft)       // … and switch the whole app to it

// the model: plain data in, theme out
import { presetDraft, draftFromTheme, draftFromColor, deriveDark, draftToTheme, draftTokens, draftVars,
  draftCode, draftCss, draftJson, importTheme, normalizeDraft, encodeDraft, decodeDraft, shareUrl, sharedDraft,
  toneScale, typeScale, contrastAudit, PRESETS } from "march/components/composite/theme-editor"

const d = draftFromColor("#0e7490", "HADİ")        // or presetDraft("night"), draftFromTheme(myDef), presetCopy("neon")
d.dark = deriveDark(d.light)
contrastAudit(d.light)          // [{ fg: "muted", bg: "surface", ratio: 4.9, min: 4.5, ok: true, fix: null }, …]
toneScale(d.light.primary)      // 50 … 900;  typeScale(d.type) → 2xs … 5xl in px
draftToTheme(d)                 // ThemeDef (defineTheme) with tokens: draftTokens(d)
draftCode(d)  draftCss(d)  draftJson(d)   // defineTheme module, themeCss stylesheet, JSON
draftVars(d, "dark")            // { "--m-bg": "#…", … } for a scoped element
importTheme(pasted)             // JSON, defineTheme JSON, CSS or a share link → draft (normalizeDraft fills gaps)
shareUrl(d)  sharedDraft(location.href)  encodeDraft(d)  decodeDraft(code)
PRESETS.map((p) => p.name)`

const TABS: Record<string, readonly ThemeEditorTab[] | undefined> = { all: undefined, colors: ["colors"], noexport: ["colors", "type", "shape", "motion"] }

export default function ThemeEditorDemo(props: { values: { base: string; preview: boolean; tabs: string; readonly: boolean; presets: boolean; nameField: boolean; historyButtons: boolean; applyButton: boolean; previewControls: boolean; ownLabels: boolean } }) {
  // the draft outlives a redraw (preview, sections, read-only); a new start choice replaces it
  let $draft: ThemeDraft | null = null
  let lastBase = ""
  return <div class="sc-te">{() => {
    const base = props.values.base
    if (lastBase && base !== lastBase) $draft = base === "scratch" ? draftFromColor("#0e7490", "HADİ") : presetCopy(base)
    lastBase = base
    return <ThemeEditor base={base} value={untrack(() => $draft)} onChange={(v: ThemeDraft) => { $draft = v }}
      tabs={TABS[props.values.tabs]} preview={props.values.preview} readonly={props.values.readonly}
      presets={props.values.presets} nameField={props.values.nameField} historyButtons={props.values.historyButtons}
      applyButton={props.values.applyButton} previewControls={props.values.previewControls}
      labels={props.values.ownLabels ? { tabs: { colors: "Palet", type: "Yazı", shape: "Biçim", motion: "Devinim", export: "Dışa aktar" }, apply: "Uygulamada dene", applied: "Uygulamada deneniyor", startFrom: "Temel al" } : undefined} />
  }}</div>
}
