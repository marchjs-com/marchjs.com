// Overlay: layers inside a container — video, image, SVG, canvas drawing and CSS effects — that never take input.
import { Overlay, Button, TextInput, Card, Grid, toast } from "hadi-march/ui";
import type { DrawFn } from "hadi-march/ui";
import { Demo } from "../demo.tsx";
import { Hub } from "../hub.tsx";
import { Playground } from "../playground.tsx";
import { ComponentDemo } from "../component-demo.tsx";
import { appUrl } from "hadi-march/base";

// public files under the showcase's root (a relative "media/…" would resolve against the route's address)
const DUSK = appUrl("media/dusk.jpg"), WAVES = appUrl("media/hadi-waves.webm"), WAVES_POSTER = appUrl("media/hadi-waves.jpg");

const EFFECTS = ["glass", "gradient", "mesh", "noise", "vignette", "spotlight", "grid", "dots"] as const;
const BLENDS = ["normal", "multiply", "screen", "overlay", "soft-light"] as const;
/** Effect card preview: the effect itself on a small tile. */
const effectPreview = (e: (typeof EFFECTS)[number]) => () => <span class="sc-ov-prev"><Overlay effect={e} /></span>;
/** Blend tile preview: the same photo and colour layer, mixed with this mode (class, no inline style). */
const blendPreview = (b: (typeof BLENDS)[number]) => () => <span class="sc-ov-blend"><img src={DUSK} alt="" loading="lazy" decoding="async" /><span class={`sc-ov-blend-top sc-blend-${b}`} /></span>;

/** HADİ four-color waves drawn on a canvas (theme colors, follows the pointer). */
const waves: DrawFn = (ctx, { width: w, height: h, time, theme, pointer }) => {
  const cols = theme.cat.slice(0, 4);
  cols.forEach((col, i) => {
    ctx.beginPath();
    const amp = h * (0.08 + i * 0.015), base = h * (0.45 + i * 0.12), k = (Math.PI * 2) / (w * (0.9 - i * 0.1)), sp = 0.0006 + i * 0.00018;
    for (let x = 0; x <= w; x += 6) { const y = base + Math.sin(x * k + time * sp * 6.283 + i) * amp; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
    ctx.globalAlpha = 0.5; ctx.fillStyle = col; ctx.fill();
  });
  ctx.globalAlpha = 1;
  if (pointer) { const g = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 140); g.addColorStop(0, "rgba(255,255,255,.35)"); g.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); }
};

/** A repeating SVG pattern that takes the theme color through currentColor. */
function Pattern() {
  return <svg viewBox="0 0 120 120" preserveAspectRatio="none" aria-hidden="true">
    <defs><pattern id="sc-ov-pat" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M0 12 Q6 4 12 12 T24 12" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".55" /></pattern></defs>
    <rect width="120" height="120" fill="url(#sc-ov-pat)" />
  </svg>
}

export default function OverlayPage(props: { params?: { rest?: string } }) {
  let $email = ""
  let $kind = "video"
  let $fit = "cover"
  let $inset = 0
  let $opacity = 100
  let $blend = "normal"
  let $effect = "glass"
  let $front = false
  const RENDER: Record<string, () => unknown> = {
    "video-glass": () => <Demo wide title="Video arka plan + cam panel" desc="Kartın arkasında sessiz, döngülü video (görünmezken durur; veri tasarrufu ya da hareketi azalt tercihinde yalnız poster); üstünde cam efekti. Kartın içindeki alan ve düğme çalışır."
    code={`<div class="card">
<Overlay src="media/waves.webm" poster="media/waves.jpg" />      // first = lowest
<Overlay effect="glass" inset={4} />                            // glass panel above the video
<h3>…</h3> <TextInput … /> <Button …>Katıl</Button>             // content stays on top and clickable
</div>`}>
    <div class="sc-ov-hero">
      <Overlay src={WAVES} poster={WAVES_POSTER} />
      <Overlay effect="glass" inset={5} />
      <div class="sc-ov-hero-body">
        <h3 class="sc-ov-title">Topluluğa katıl</h3>
        <p>Etkinlik haberleri haftada bir.</p>
        <form class="sc-row" on:submit|prevent={() => toast($email ? `${$email} eklendi` : "E-posta yaz", { kind: $email ? "success" : "warn" })}>
          <TextInput bind:value={$email} type="email" placeholder="e-posta" aria-label="E-posta" />
          <Button variant="primary" type="submit">Katıl</Button>
        </form>
      </div>
    </div>
  </Demo>,
    "image": () => <Demo wide title="Resim: cover / contain / fill" desc="Aynı resim üç sığdırma biçiminde; position ile odak noktası seçilir.">
    <Grid cols={3} gap={3} minCol="10rem">
      {(["cover", "contain", "fill"] as const).map((fit) => <div class="sc-ov-tile"><Overlay src={DUSK} fit={fit} /><code class="sc-ov-label">{fit}</code></div>)}
    </Grid>
  </Demo>,
    "svg-pattern": () => <Demo title="SVG desen" desc="Satır içi SVG; currentColor ile tema rengini alır.">
    <div class="sc-ov-tile sc-ov-tall"><Overlay svg={<Pattern />} /><Overlay effect="vignette" front opacity={0.6} /><strong class="sc-ov-label">Desenli kart</strong></div>
  </Demo>,
    "canvas": () => <Demo title="Canvas çizimi" desc="draw işlevi: kapsayıcı boyutunda, keskin (devicePixelRatio), tema renkleriyle; animate açıkken görünürken her karede çizer. İmleç konumu kapsayıcıdan gelir.">
    <div class="sc-ov-tile sc-ov-tall"><Overlay draw={waves} animate /><strong class="sc-ov-label">Üzerinde gezin</strong></div>
  </Demo>,
    "layers": () => <Demo wide title="Katmanlar ve seçenekler" desc="Kaynak türü, sığdırma, kenar boşluğu, saydamlık, karışım, efekt ve ön/arka seçilebilir. Bir seçenek yalnız etkiliyken görünür (sığdırma: video ve resim; efekt: effect kaynağı). Alttaki düğmeye her durumda tıklanabilir."
    code={`<Overlay src="photo.jpg" fit="cover" inset={4} opacity={0.8} blend="multiply" />
<Overlay effect="spotlight" front />           // above the content, still not clickable
<Overlay draw={(ctx, { width, height, time, theme, pointer }) => …} animate />`}>
    <Playground options={[
      { label: "Kaynak", get: () => $kind, set: (v: string) => { $kind = v }, options: ["video", "image", "svg", "canvas", "effect"] },
      // fit only changes video and image
      { label: "Sığdırma", get: () => $fit, set: (v: string) => { $fit = v }, options: ["cover", "contain", "fill"], visibleWhen: () => $kind === "image" || $kind === "video" },
      // the effect only exists for the "effect" source
      { label: "Efekt", get: () => $effect, set: (v: string) => { $effect = v }, options: EFFECTS.map((e) => ({ value: e, label: e, preview: effectPreview(e) })), visibleWhen: () => $kind === "effect" },
      { label: "Karışım (blend)", get: () => $blend, set: (v: string) => { $blend = v }, kind: "grid", options: BLENDS.map((b) => ({ value: b, label: b, preview: blendPreview(b) })) },
      { label: "front (içeriğin üstünde)", get: () => $front, set: (v: boolean) => { $front = v } },
      { label: "inset", get: () => $inset, set: (v: number) => { $inset = v }, min: 0, max: 8 },
      { label: "opacity", get: () => $opacity, set: (v: number) => { $opacity = v }, min: 10, max: 100, step: 10, unit: "%" },
    ]}>
    <div class="sc-ov-stage">
      {() => {
        const kind = $kind, fit = $fit as "cover", inset = $inset, opacity = $opacity / 100, blend = $blend, effect = $effect as "glass", front = $front
        return [
          kind === "video" ? <Overlay src={WAVES} poster={WAVES_POSTER} fit={fit} inset={inset} opacity={opacity} blend={blend} front={front} />
            : kind === "image" ? <Overlay src={DUSK} fit={fit} inset={inset} opacity={opacity} blend={blend} front={front} />
            : kind === "svg" ? <Overlay svg={<Pattern />} inset={inset} opacity={opacity} blend={blend} front={front} />
            : kind === "canvas" ? <Overlay draw={waves} animate inset={inset} opacity={opacity} blend={blend} front={front} />
            : <Overlay effect={effect} inset={inset} opacity={opacity} blend={blend} front={front} />,
          <Card title="İçerik" class="sc-ov-content"><Button on:click={() => toast("Tıklama alttaki düğmeye ulaştı", { kind: "success" })}>Bana tıkla</Button></Card>,
        ]
      }}
    </div>
    </Playground>
  </Demo>,
    "overlay": () => <ComponentDemo folder="media/overlay" title="Overlay: efekt katmanı" desc="Kartın içinde, içeriğin arkasında ya da önünde; katman tıklama almaz, düğme çalışmaya devam eder." />,
    "media": () => <ComponentDemo folder="media/media" title="Media: resim, video, ses" desc="Kabına sığar, türü uzantıdan anlar; yüklenemezse yedek metin gösterir. Pencerede açmak için openMedia." />,
    "carousel": () => <ComponentDemo folder="media/carousel" title="Carousel: kaydır ve yaslan" desc="Geniş ekranda 1–4 slayt, telefonda bir slayt ve sonrakinin ucu; oklar uçlarda gizlenir, noktalar konumu gösterir." />,
  }
  return <Hub base="/overlay" kicker="Hareket" title="Overlay" lead="Bir kapsayıcının içinde yaşayan katmanlar: sessiz döngülü video, resim, SVG, çizim işlevli canvas ya da CSS efekti (cam, gradyan, mesh, gürültü, vinyet, spot ışığı, ızgara, noktalar). Eklenme sırasıyla üst üste biner; arka plan katmanları içeriğin altında, front olanlar üstünde. Hiçbiri tıklama almaz: altındaki düğme ve alanlar çalışır." render={RENDER} params={props.params} />
}
