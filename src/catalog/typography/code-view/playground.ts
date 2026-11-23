import { definePlayground } from "../../spec.ts";

interface Values { code: string; lang: string; toolbar: boolean; langLabel: string; lineNumbers: boolean; wrap: boolean; wrapButton: boolean; copy: boolean; buttons: string }

// code is required (the source): the raw component in MarchIDE draws this sample; on the stage the sample follows the
// language until you type your own
export const SAMPLE_TSX = `import { signal } from "march";

// a counter: only the text node changes on click
export function Counter(props: { start?: number }) {
  let $n = props.start ?? 0
  return <button class="counter" on:click={() => { $n++ }}>Tıklama: {$n}</button>
}`

export default definePlayground<Values>({
  options: [
    { key: "code", label: "Kod (code)", default: SAMPLE_TSX, kind: "text" },
    { key: "lang", label: "Dil", default: "tsx", options: ["tsx", "css", "json", "sh"] },
    { key: "toolbar", label: "Araç çubuğu", default: true },
    { key: "langLabel", label: "Dil etiketi", default: "lang", kind: "segmented", options: [{ value: "lang", label: "dil adı" }, { value: "own", label: "dosya adı" }, { value: "off", label: "yok" }], visibleWhen: (v) => v.toolbar,
      // what the prop gets (the raw component in MarchIDE): the language itself, a file name, or none
      toCode: { lang: null, own: '"Counter.tsx"', off: "{false}" } },
    { key: "lineNumbers", label: "Satır numarası", default: true },
    { key: "wrap", label: "Satır kaydır (başlangıç)", default: false },
    { key: "wrapButton", label: "Kaydır düğmesi", default: true, visibleWhen: (v) => v.toolbar },
    { key: "copy", label: "Kopyala düğmesi", default: true, visibleWhen: (v) => v.toolbar },
    { key: "buttons", label: "Düğmeler", default: "text", kind: "segmented", options: [{ value: "text", label: "yazı" }, { value: "icon", label: "simge" }], visibleWhen: (v) => v.toolbar && (v.wrapButton || v.copy) },
  ],
});
