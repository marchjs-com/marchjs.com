// Motion › Micro-interactions: ripple, magnetic pull, tilt + hover parallax, spring press and a button that morphs
// through loading / success / error (confetti from march/fx on success). All on the motion engine.
import "../motion-pages.css";
import { onCleanup } from "march";
import { ripple, hoverParallax, stateMorph, type ButtonState, magnet, press } from "march/motion";
import { Section } from "../../demo.tsx";
// the demo kit is part of the shared Playground module (as on the other /motion/* pages)
import { MotionDemo, opt } from "../../playground.tsx";
import { Icon, heart, star, sparkles, send } from "march/icons";

export default function MotionMicro() {
  document.title = "Mikro etkileşimler · MarchJS"

  // 1 · ripple
  let $rDur = 650, $rCenter = false, $rInk = 22
  // 2 · magnetic
  let $mPull = 30
  // 3 · tilt + parallax
  let $pDepth = 16, $pTilt = 8
  // 4 · spring press
  let $sScale = 92, $sEase = "spring-wobbly"
  // 5 · state morph
  let $result = "success", $confetti = true, $wait = 1200
  let $state = "idle" as ButtonState
  let saveBtn: HTMLElement | undefined
  const timers: ReturnType<typeof setTimeout>[] = []
  onCleanup(() => timers.forEach(clearTimeout))
  const go = (s: ButtonState): void => { $state = s; if (saveBtn) stateMorph(saveBtn, s, { confetti: $confetti, labels: { loading: "Kaydediliyor", success: "Kaydedildi", error: "Kaydedilemedi" } }) }
  const save = (): void => {
    if ($state !== "idle") return
    go("loading")
    timers.push(setTimeout(() => {
      go($result as ButtonState)
      timers.push(setTimeout(() => go("idle"), 1600))
    }, $wait))
  }

  return <Section kicker="Hareket" title="Mikro etkileşimler" lead="Dokunuşa cevap veren küçük hareketler: basılan yerden yayılan dalga, imlece çekilen düğme, katmanları derinliğine göre kayan kart, yaylı basma ve yükleniyor → tamam / hata durumuna dönüşen düğme. Hareketi azalt tercihinde hepsi sakinleşir.">
    <MotionDemo title="Dalga (ripple)" desc="Basılan noktadan yayılan mürekkep; klavyeyle (Enter, boşluk) ortadan. Rengi öğenin yazı rengi."
      call={() => `use:ripple={{ duration: ${$rDur}, opacity: ${($rInk / 100).toFixed(2)}${$rCenter ? ", center: true" : ""} }}`}
      code={`import { ripple } from "march/motion"

<button use:ripple>Kaydet</button>
<div class="card" use:ripple={{ duration: 800, center: true }} tabindex="0">…</div>`}
      options={[
        opt("Süre", () => $rDur, (v: number) => { $rDur = v }, { min: 300, max: 1500, step: 50, unit: " ms" }),
        opt("Yoğunluk", () => $rInk, (v: number) => { $rInk = v }, { min: 8, max: 50, unit: "%" }),
        opt("Ortadan", () => $rCenter, (v: boolean) => { $rCenter = v }),
      ]}>
      {() => { const o = { duration: $rDur, center: $rCenter, opacity: $rInk / 100 }; return <div class="sc-mo-micro">
        <button type="button" class="m-btn m-btn-primary" use:ripple={o}>Kaydet</button>
        <button type="button" class="m-btn m-btn-secondary" use:ripple={o}>Paylaş</button>
        <div class="sc-mo-ripple-card" tabindex="0" role="button" use:ripple={o}><strong>HADİ</strong><span>Karta bas</span></div>
      </div> }}
    </MotionDemo>

    <MotionDemo title="Mıknatıs" desc="Düğme imlece doğru çekilir, bırakınca yayla yerine oturur."
      call={() => `use:magnet={{ strength: ${($mPull / 100).toFixed(2)} }}`}
      code={`import { magnet } from "march/motion"

<button use:magnet={{ strength: 0.3 }}>Başla</button>`}
      options={[opt("Çekim", () => $mPull, (v: number) => { $mPull = v }, { min: 5, max: 60, unit: "%" })]}>
      {() => { const o = { strength: $mPull / 100 }; return <div class="sc-mo-micro">
        {[{ i: heart, l: "Beğen" }, { i: star, l: "Yıldızla" }, { i: send, l: "Gönder" }].map((b, k) =>
          <button type="button" class={`sc-mo-magnet sc-mo-t-${["o", "b", "g"][k]}`} aria-label={b.l} use:magnet={o}><Icon of={b.i} /></button>)}
      </div> }}
    </MotionDemo>

    <MotionDemo wide title="Eğim ve katman parallax" desc="Kart imlece doğru eğilir, içindeki katmanlar derinliklerine göre farklı miktarda kayar; çıkınca yayla toplanır."
      call={() => `use:hoverParallax={{ depth: ${$pDepth}, tilt: ${$pTilt} }}`}
      code={`import { hoverParallax } from "march/motion"

<div use:hoverParallax={{ depth: 16, tilt: 8 }}>
  <img data-depth="0.3" …/>   <h3 data-depth="1">…</h3>   // deeper layers move more
</div>`}
      options={[
        opt("Derinlik", () => $pDepth, (v: number) => { $pDepth = v }, { min: 0, max: 40, unit: " px" }),
        opt("Eğim", () => $pTilt, (v: number) => { $pTilt = v }, { min: 0, max: 20, unit: "°" }),
      ]}>
      {() => { const o = { depth: $pDepth, tilt: $pTilt }; return <div class="sc-mo-plx" use:hoverParallax={o}>
        <span class="sc-mo-plx-sun" data-depth="0.3" aria-hidden="true" />
        <span class="sc-mo-plx-hill sc-mo-plx-h1" data-depth="0.5" aria-hidden="true" />
        <span class="sc-mo-plx-hill sc-mo-plx-h2" data-depth="0.8" aria-hidden="true" />
        <div class="sc-mo-plx-text" data-depth="1.2"><strong>HADİ Doğa</strong><span>İmleci kartın üstünde gezdir</span></div>
        <span class="sc-mo-plx-spark" data-depth="1.6" aria-hidden="true"><Icon of={sparkles} size="lg" /></span>
      </div> }}
    </MotionDemo>

    <MotionDemo title="Yaylı basma" desc="Basılı tutunca küçülür, bırakınca seçilen yayla aşıp yerine oturur."
      call={() => `use:press={{ scale: ${($sScale / 100).toFixed(2)}, easing: "${$sEase}" }}`}
      code={`import { press } from "march/motion"

<button use:press>…</button>                                   // 0.97, back easing
<button use:press={{ scale: 0.9, easing: "spring-wobbly" }}>…</button>`}
      options={[
        opt("Basınca", () => $sScale, (v: number) => { $sScale = v }, { min: 80, max: 98, unit: "%" }),
        opt("Yay", () => $sEase, (v: string) => { $sEase = v }, { options: [{ value: "spring-wobbly", label: "esnek" }, { value: "spring", label: "yay" }, { value: "spring-snappy", label: "çevik" }, { value: "back", label: "geri" }] }),
      ]}>
      {() => { const o = { scale: $sScale / 100, easing: $sEase }; return <div class="sc-mo-micro">
        <button type="button" class="sc-mo-press sc-mo-t-o" use:press={o}>Bas</button>
        <button type="button" class="sc-mo-press sc-mo-press-ghost" use:press={o}>Tut ve bırak</button>
      </div> }}
    </MotionDemo>

    <MotionDemo wide title="Durum morph" desc="Kaydet: düğme daireye daralır ve döner; sonuç gelince onay ya da çarpı çizilir (hata sallanır), başarıda konfeti; sonra eski hâline yayla döner. Ekran okuyucuya durum bildirilir."
      call={() => `stateMorph(button, "${$state}")  // ${$wait} ms sonra: stateMorph(button, "${$result}"${$result === "success" && $confetti ? ", { confetti: true }" : ""})`}
      code={`import { stateMorph } from "march/motion"

stateMorph(btn, "loading")
try { await save(); stateMorph(btn, "success", { confetti: true }) }
catch { stateMorph(btn, "error") }
setTimeout(() => stateMorph(btn, "idle"), 1600)`}
      options={[
        opt("Sonuç", () => $result, (v: string) => { $result = v }, { options: [{ value: "success", label: "başarı" }, { value: "error", label: "hata" }] }),
        opt("Konfeti", () => $confetti, (v: boolean) => { $confetti = v }, { visibleWhen: () => $result === "success" }),
        opt("Bekleme", () => $wait, (v: number) => { $wait = v }, { min: 300, max: 3000, step: 100, unit: " ms" }),
      ]}>
      <div class="sc-mo-micro">
        <button type="button" class="m-btn m-btn-primary sc-mo-save" ref={(el: HTMLElement) => { saveBtn = el }} on:click={save}>Değişiklikleri kaydet</button>
      </div>
    </MotionDemo>
  </Section>
}
