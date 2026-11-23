// Showcase stage for CodeView: the code, language, line numbers, wrap and copy follow the Playground values (playground.ts).
import { CodeView } from "march/components/typography/code-view";
import { SAMPLE_TSX } from "./playground.ts";

export const code = `<CodeView code={source} lang="tsx" copy />
<CodeView code={css} lang="css" lineNumbers={false} wrap />
<CodeView code={source} lang="tsx" langLabel="Counter.tsx" wrapLabel="Satırları kaydır" copyLabel="Kodu kopyala" />
<CodeView code={snippet} lang="sh" toolbar={false} />`

const SAMPLE: Record<string, string> = {
  tsx: SAMPLE_TSX,
  css: `/* a card that never overflows its column */
.card { display: flex; flex-direction: column; min-width: 0; padding: var(--m-space-4); border-radius: var(--m-radius-3); }
.card-title { margin: 0; font-size: var(--m-text-lg); }`,
  json: `{
  "name": "hadi-panel",
  "private": true,
  "dependencies": { "march": "^0.2.0" },
  "seats": 48
}`,
  sh: `# install and start the dev server
npm i github:marchjs-com/march
npx march dev --port 5173`,
}

const FILES: Record<string, string> = { tsx: "Counter.tsx", css: "card.css", json: "package.json", sh: "kurulum.sh" }

export default function CodeViewDemo(props: { values: { code: string; lang: string; toolbar: boolean; langLabel: string; lineNumbers: boolean; wrap: boolean; wrapButton: boolean; copy: boolean; buttons: string } }) {
  return <div class="sc-col">
    {() => {
      // read the values here: CodeView takes them when it is built, so the stage rebuilds it when one changes
      const v = props.values, lang = v.lang, lineNumbers = v.lineNumbers, wrap = v.wrap, copy = v.copy
      const toolbar = v.toolbar, wrapButton = v.wrapButton, buttons = v.buttons as "text" | "icon"
      const langLabel = v.langLabel === "off" ? false : v.langLabel === "own" ? FILES[lang] : undefined
      // the sample follows the language; your own code (typed in the Kod option) wins
      const code = v.code && v.code !== SAMPLE_TSX ? v.code : SAMPLE[lang]
      return <CodeView code={code} lang={lang} lineNumbers={lineNumbers} wrap={wrap} copy={copy} toolbar={toolbar} wrapButton={wrapButton} buttons={buttons} langLabel={langLabel} />
    }}
  </div>
}
