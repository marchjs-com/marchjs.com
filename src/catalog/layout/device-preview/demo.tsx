// Showcase stage for DevicePreview: a small app in a phone — drag to scroll, Shift + drag to pinch, open its drawer (it
// stays in the device), and play the device from its control rail (shake, tilt, offline, battery, keyboard).
import { signal, effect } from "march";
import { DevicePreview } from "march/layout";
import { Button } from "march/actions";
import { openDrawer } from "march/overlays";

export const code = `<DevicePreview device="iphone-15" landscape={$land} controls touch time="9:41">
  <MyApp />          // its drawers and dialogs open inside the device
</DevicePreview>`

const ITEMS = Array.from({ length: 30 }, (_, i) => `HADİ etkinlik ${i + 1}`)

export default function DevicePreviewDemo(props: { values: { device: string; landscape: boolean; controls: boolean; touch: boolean; keyboard: string; statusBar: boolean; homeIndicator: boolean; camera: boolean } }) {
  const land = signal(false)
  effect(() => land.set(props.values.landscape))   // the option sets it; the rail turns it too
  const last = signal("")
  return <DevicePreview device={() => props.values.device} landscape={land} controls={() => props.values.controls} touch={() => props.values.touch}
    keyboard={() => (props.values.keyboard === "on" ? true : props.values.keyboard === "off" ? false : "auto")} onEvent={(n) => last.set(n)}
    statusBar={() => props.values.statusBar} homeIndicator={() => props.values.homeIndicator} camera={() => props.values.camera}>
    <div class="sc-dev-app">
      <header class="sc-dev-head"><strong>HADİ</strong>
        <Button size="sm" onClick={() => void openDrawer(() => <ul class="sc-dev-menu"><li>Akış</li><li>Etkinlikler</li><li>Profil</li></ul>, { title: "Menü", side: "end" })}>Menü</Button>
      </header>
      <p class="m-muted" sx={{ p: 3 }}>{() => (last() ? `Son olay: ${last()}` : "Kumandadan salla, eğ, çevrimdışı ol…")}</p>
      <ul class="sc-dev-list">{ITEMS.map((t) => <li>{t}</li>)}</ul>
    </div>
  </DevicePreview>
}
