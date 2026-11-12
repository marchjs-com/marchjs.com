// Overlay: layers inside a container — video, image, SVG, canvas drawing and CSS effects — that never take input.
import { Overlay, Button, TextInput, Segmented, Slider, Field, Toggle, Select, Card, Grid, toast, type DrawFn } from "hadi-march/ui";
import { Demo, Section } from "../demo.tsx";

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

export default function OverlayPage() {
  let $email = ""
  let $kind = "video"
  let $fit = "cover"
  let $inset = 0
  let $opacity = 100
  let $blend = "normal"
  let $effect = "glass"
  let $front = false
  return <Section kicker="Hareket" title="Overlay" lead="Bir kapsayıcının içinde yaşayan katmanlar: sessiz döngülü video, resim, SVG, çizim işlevli canvas ya da CSS efekti (cam, gradyan, mesh, gürültü, vinyet, spot ışığı, ızgara, noktalar). Eklenme sırasıyla üst üste biner; arka plan katmanları içeriğin altında, front olanlar üstünde. Hiçbiri tıklama almaz: altındaki düğme ve alanlar çalışır.">
    <Demo wide title="Video arka plan + cam panel" desc="Kartın arkasında sessiz, döngülü video (görünmezken durur; veri tasarrufu ya da hareketi azalt tercihinde yalnız poster); üstünde cam efekti. Kartın içindeki alan ve düğme çalışır."
      code={`<div class="card">
  <Overlay src="media/waves.webm" poster="media/waves.jpg" />      // first = lowest
  <Overlay effect="glass" inset={4} />                            // glass panel above the video
  <h3>…</h3> <TextInput … /> <Button …>Katıl</Button>             // content stays on top and clickable
</div>`}>
      <div class="sc-ov-hero">
        <Overlay src="media/hadi-waves.webm" poster="media/hadi-waves.jpg" />
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
    </Demo>

    <Demo wide title="Resim: cover / contain / fill" desc="Aynı resim üç sığdırma biçiminde; position ile odak noktası seçilir.">
      <Grid cols={3} gap={3} minCol="10rem">
        {(["cover", "contain", "fill"] as const).map((fit) => <div class="sc-ov-tile"><Overlay src="media/dusk.jpg" fit={fit} /><code class="sc-ov-label">{fit}</code></div>)}
      </Grid>
    </Demo>

    <Demo title="SVG desen" desc="Satır içi SVG; currentColor ile tema rengini alır.">
      <div class="sc-ov-tile sc-ov-tall"><Overlay svg={<Pattern />} /><Overlay effect="vignette" front opacity={0.6} /><strong class="sc-ov-label">Desenli kart</strong></div>
    </Demo>

    <Demo title="Canvas çizimi" desc="draw işlevi: kapsayıcı boyutunda, keskin (devicePixelRatio), tema renkleriyle; animate açıkken görünürken her karede çizer. İmleç konumu kapsayıcıdan gelir.">
      <div class="sc-ov-tile sc-ov-tall"><Overlay draw={waves} animate /><strong class="sc-ov-label">Üzerinde gezin</strong></div>
    </Demo>

    <Demo wide title="Katmanlar ve seçenekler" desc="Kaynak türü, sığdırma, kenar boşluğu, saydamlık, karışım, efekt ve ön/arka seçilebilir. Alttaki düğmeye her durumda tıklanabilir."
      code={`<Overlay src="photo.jpg" fit="cover" inset={4} opacity={0.8} blend="multiply" />
<Overlay effect="spotlight" front />           // above the content, still not clickable
<Overlay draw={(ctx, { width, height, time, theme, pointer }) => …} animate />`}>
      <div class="sc-row">
        <Segmented bind:value={$kind} aria-label="Kaynak" options={["video", "image", "svg", "canvas", "effect"]} />
        <Segmented bind:value={$fit} aria-label="Sığdırma" options={() => ["cover", "contain", "fill"].map((v) => ({ value: v, label: v, disabled: $kind !== "image" && $kind !== "video" }))} />
        <Select bind:value={$effect} aria-label="Efekt" options={["glass", "gradient", "mesh", "noise", "vignette", "spotlight", "grid", "dots"]} />
        <Select bind:value={$blend} aria-label="Karışım" options={["normal", "multiply", "screen", "overlay", "soft-light"]} />
        <Toggle bind:value={$front} label="front" />
      </div>
      <div class="sc-grid-controls">
        <Field label={() => `inset: ${$inset}`}><Slider bind:value={$inset} min={0} max={8} /></Field>
        <Field label={() => `opacity: %${$opacity}`}><Slider bind:value={$opacity} min={10} max={100} step={10} /></Field>
      </div>
      <div class="sc-ov-stage">
        {() => {
          const kind = $kind, fit = $fit as "cover", inset = $inset, opacity = $opacity / 100, blend = $blend, effect = $effect as "glass", front = $front
          return [
            kind === "video" ? <Overlay src="media/hadi-waves.webm" poster="media/hadi-waves.jpg" fit={fit} inset={inset} opacity={opacity} blend={blend} front={front} />
              : kind === "image" ? <Overlay src="media/dusk.jpg" fit={fit} inset={inset} opacity={opacity} blend={blend} front={front} />
              : kind === "svg" ? <Overlay svg={<Pattern />} inset={inset} opacity={opacity} blend={blend} front={front} />
              : kind === "canvas" ? <Overlay draw={waves} animate inset={inset} opacity={opacity} blend={blend} front={front} />
              : <Overlay effect={effect} inset={inset} opacity={opacity} blend={blend} front={front} />,
            <Card title="İçerik" class="sc-ov-content"><Button on:click={() => toast("Tıklama alttaki düğmeye ulaştı", { kind: "success" })}>Bana tıkla</Button></Card>,
          ]
        }}
      </div>
    </Demo>
  </Section>
}
