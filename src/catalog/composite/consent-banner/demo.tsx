// Showcase stage for ConsentBanner: the banner in the page flow (always shown, a choice still closes it) and a
// ConsentGate placeholder that opens once third-party content is allowed. Playground values change the wording.
import { Button } from "march/components/actions/button";
import { lazy } from "march/lazy";
import type { ConsentBannerProps, ConsentGateProps } from "march/components/composite/consent-banner";
import { TEXT, OWN } from "./playground.ts";

// the consent UI is a lazy module (as the docs recommend): this stage stays tiny, the module loads with the card
const ui = () => import("march/components/composite/consent-banner")
const ConsentBanner = lazy<ConsentBannerProps>(ui, { pick: "ConsentBanner", placeholder: "card" })
const ConsentGate = lazy<ConsentGateProps>(ui, { pick: "ConsentGate", placeholder: "card" })
const showConsentBanner = (): void => { void ui().then((m) => m.showConsentBanner()) }

export const code = `<ConsentBanner title="Çerezler" text="Ziyaretleri ölçmek için analitik kullanıyoruz." />
<ConsentGate category="thirdParty">{() => <iframe src={videoUrl} title="Video" />}</ConsentGate>
// later: openConsentPreferences()   showConsentBanner()   consent.withdraw()`

type Values = { title: string; wording: string; buttons: string; customize: boolean; inline: boolean; always: boolean }

export default function ConsentBannerDemo(props: { values: Values }) {
  return <div class="m-stack" style={{ gap: "var(--m-space-3)" }}>
    {() => <ConsentBanner inline={props.values.inline} always={props.values.always} title={props.values.title} text={TEXT[props.values.wording] ?? TEXT["short"]!}
      customize={props.values.customize} labels={props.values.buttons === "own" ? OWN : undefined} />}
    {() => <ConsentGate category="thirdParty" labels={props.values.buttons === "own" ? OWN : undefined}><p>Üçüncü taraf içerik yüklendi.</p></ConsentGate>}
    <div><Button size="sm" variant="ghost" on:click={showConsentBanner}>Şeridi yeniden göster</Button></div>
  </div>
}
