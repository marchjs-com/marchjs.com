// Showcase stage for NetworkThrottle: choose a network, then load something; the request comes at that speed.
import { signal } from "march";
import { NetworkThrottle } from "march/components/composite/network-throttle";
import { Button } from "march/components/actions/button";

export const code = `<NetworkThrottle />                                    // the whole page while it is shown
<NetworkThrottle scope={(stack) => /blob:/.test(stack)} />  // only the code loaded from blob: modules`

export default function NetworkThrottleDemo(props: { values: { gauge: boolean; custom: boolean; requests: boolean; max: number } }) {
  const took = signal("")
  const load = async (): Promise<void> => {
    const t0 = performance.now()
    took.set("yükleniyor…")
    try { const r = await fetch(`/favicon.svg?${Date.now()}`); await r.text(); took.set(`${Math.round(performance.now() - t0)} ms`) }
    catch { took.set("çevrimdışı: yüklenemedi") }
  }
  return <div class="sc-col" sx={{ gap: 3 }}>
    {() => <NetworkThrottle gauge={props.values.gauge} custom={props.values.custom} requests={props.values.requests} max={props.values.max} />}
    <div class="sc-row"><Button size="sm" onClick={() => void load()}>Bir dosya yükle</Button><span class="m-muted">{took}</span></div>
  </div>
}
