// Showcase stage for Spinner: size, name and colours from the Playground values (playground.ts), inside a button and alone.
import { Spinner } from "march/feedback";

export const code = `<Spinner size="lg" label="Kullanıcılar yükleniyor" />
<Spinner colors="brand" />                     // dört HADİ rengi
<Spinner colors={["brand-blue", "brand-green"]} />
<Spinner colors="single" />                    // çok renkli temada tek renk
<Spinner color="brand-orange" />               // tek renk: bir tema rengi
<Spinner decorative size="em" />               // düğme ya da metin içinde: süs, metnin boyu ve rengi`

const COLORS: Record<string, "brand" | "single" | ("brand-blue" | "brand-green")[]> = { brand: "brand", pair: ["brand-blue", "brand-green"], single: "single" }

export default function SpinnerDemo(props: { values: { size: string; label: string; decorative: boolean; colors: string; color: string } }) {
  return <div class="sc-row sc-row-center">
    {() => {
      const v = props.values
      const em = v.size === "em"
      const spinner = <Spinner size={v.size as "lg"} decorative={v.decorative} colors={em ? undefined : COLORS[v.colors]} color={!em && v.colors === "single" && v.color !== "theme" ? (v.color as "success") : undefined} label={v.label || undefined} />
      return [em ? <strong class="sc-row">{spinner} Kaydediliyor…</strong> : spinner,
        <span class="m-muted">{v.decorative ? "aria-hidden: yanındaki metin durumu söyler" : `role="status", ad: ${v.label || "Loading (çevrilir)"}`}</span>]
    }}
  </div>
}
