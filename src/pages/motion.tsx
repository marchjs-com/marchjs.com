// Motion and effects: spring/tween, FLIP lists, transitions, timeline + stagger, drag, magnet, tilt, parallax,
// spotlight, particles, confetti, reveal on scroll. All of it honours "reduce motion".
import "hadi-march/motion/install"; // fly, blur… transitions and <For animate> on this page (the shell installs them later, when idle)
import { spring, tween, timeline, stagger, drag, magnet, tilt, press, parallax, reveal, inView } from "hadi-march/motion";
import { Particles, confetti, spotlight } from "hadi-march/fx";
import { Button, Card, Badge, Slider, Field, toast } from "hadi-march/ui";
import { Icon, plus, refresh, sparkles, x as xIcon } from "hadi-march/icons";
import { Demo, Section } from "../demo.tsx";

interface Item { id: number; name: string; tone: number }
const NAMES = ["Elmas", "Akçe", "Sohbet", "Etkinlik", "Canlı", "Oyun", "Market", "Radyo", "Akademi", "Kurye"];

export default function Motion() {
  let $target = 120
  let $items: Item[] = NAMES.slice(0, 6).map((name, i) => ({ id: i + 1, name, tone: (i % 8) + 1 }))
  let $panel = true
  let $num = 1240
  const x = spring(() => $target, { stiffness: 210, damping: 16 })
  const y = tween(() => $target, { duration: 700, easing: "easeOutBounce" })
  const n = tween(() => $num, { duration: 900, easing: "easeOutExpo" })
  let nextId = 7
  const add = () => { const id = nextId++; $items = [{ id, name: NAMES[id % NAMES.length], tone: (id % 8) + 1 }, ...$items] }
  const shuffle = () => { $items = [...$items].sort(() => Math.random() - 0.5) }
  let dots: HTMLElement | undefined
  const play = () => {
    if (!dots) return
    void timeline({ root: dots, defaults: { duration: 520, easing: "easeOutExpo" } })
      .add(".sc-dot", [{ opacity: 0, transform: "translateY(28px) scale(.5)" }, { opacity: 1, transform: "none" }], { stagger: stagger(45, { from: "center", total: 16 }) })
      .add(".sc-dot", [{ transform: "none" }, { transform: "rotate(180deg) scale(.8)" }, { transform: "none" }], { at: "-=250", stagger: 25 })
      .play()
  }
  return <Section kicker="Hareket" title="Hareket ve efektler" lead="hadi-march/motion: yay fiziği, tween, FLIP, zaman çizelgesi, jestler ve kaydırma tetikleyicileri. hadi-march/fx: parçacıklar, konfeti, spot ışığı. Satır içi stil yerine CSS değişkenleri; 'hareketi azalt' açıkken sakinleşir.">
    <Demo title="Yay ve tween" desc="Aynı hedef, iki fizik: yay (aşar ve oturur) ve sekme eğrili tween."
      code={`let $hedef = 120
const x = spring(() => $hedef, { stiffness: 210, damping: 16 })
<span style={{ transform: \`translateX(\${x()}px)\` }} />`}>
      <Field label={() => `Hedef: ${$target}px`}><Slider bind:value={$target} min={0} max={260} /></Field>
      <div class="sc-track"><span class="sc-ball" style={{ transform: `translateX(${x()}px)` }}>yay</span></div>
      <div class="sc-track"><span class="sc-ball sc-ball-2" style={{ transform: `translateX(${y()}px)` }}>tween</span></div>
    </Demo>

    <Demo title="Hareketli sayılar" desc="tween ile değer akışı; tabular rakamlar zıplamaz.">
      <p class="sc-bignum">{() => Math.round(n()).toLocaleString("tr")}</p>
      <div class="sc-row"><Button on:click={() => { $num += Math.round(200 + Math.random() * 3000) }} icon={plus}>Artır</Button><Button variant="ghost" on:click={() => { $num = 0 }}>Sıfırla</Button></div>
    </Demo>

    <Demo wide title="FLIP listeler" desc="Ekle, karıştır, sil: öğeler yeni yerlerine kayar (<For animate>). Kartlar imleçle eğilir."
      code={`<For each={$items} key="id" animate>{(item) => <Card use:tilt>{item().name}</Card>}</For>`}>
      <div class="sc-row"><Button variant="primary" icon={plus} on:click={add}>Ekle</Button><Button icon={refresh} on:click={shuffle}>Karıştır</Button><Button variant="ghost" on:click={() => { $panel = !$panel }}>Paneli aç/kapat</Button></div>
      <ul class="sc-flip">
        <For each={$items} key="id" animate>{(it: () => Item) =>
          <li class={`sc-flip-card sc-cat-bg-${it().tone}`} use:tilt={{ max: 8 }}>
            <strong>{it().name}</strong>
            <button type="button" class="hm-icon-btn hm-btn-sm" aria-label="Kaldır" on:click={() => { $items = $items.filter((x) => x.id !== it().id) }}><Icon of={xIcon} /></button>
          </li>}
        </For>
      </ul>
      <If when={$panel}>
        <div class="sc-panel" transition:fly={{ y: 24, duration: 320 }}>Uçarak gelir, uçarak gider (transition:fly).</div>
      </If>
    </Demo>

    <Demo title="Zaman çizelgesi ve stagger" desc="Ortadan dışa doğru gecikmeli giriş, ardından dönüş.">
      <Button variant="primary" icon={sparkles} on:click={play}>Oynat</Button>
      <div class="sc-dots" ref={(el: HTMLElement) => { dots = el; queueMicrotask(play) }}>{Array.from({ length: 16 }, (_, i) => <i class={`sc-dot sc-cat-bg-${(i % 8) + 1}`} />)}</div>
    </Demo>

    <Demo title="Jestler" desc="Sürükle (geri yaylanır, ok tuşlarıyla da), mıknatıslı düğme, basınca küçülme.">
      <div class="sc-drag-zone"><div class="sc-draggable" tabindex="0" use:drag={{ snapBack: true }}>Sürükle beni</div></div>
      <div class="sc-row sc-row-center">
        <Button variant="primary" size="lg" use:magnet={{ strength: 0.4 }} use:press on:click={(e: MouseEvent) => { const r = (e.currentTarget as Element).getBoundingClientRect(); void confetti({ x: r.left + r.width / 2, y: r.top }); toast("Kutlama!", { kind: "success" }) }}>Mıknatıs + konfeti</Button>
      </div>
    </Demo>

    <Demo wide title="Spot ışığı, parçacıklar, parallax" desc="İmleci kartın üstünde gezdir; parçacıklar imlece tepki verir; görsel katmanlar farklı hızda kayar.">
      <div class="sc-fx-stage hm-spotlight" use:spotlight>
        <Particles count={60} links={100} interactive class="hm-fx-fill" />
        <div class="sc-fx-layer sc-fx-back" use:parallax={0.15} />
        <div class="sc-fx-content">
          <Badge tone="primary">fx</Badge>
          <h3 class="sc-fx-title hm-gradient-text">Işık seni izler.</h3>
          <p class="hm-muted">Spot ışığı CSS değişkeniyle (--hm-spot-x/y) çizilir; satır içi stil yok.</p>
        </div>
      </div>
    </Demo>

    <Demo wide title="Kayınca belir" desc="reveal ve inView: görünür alana girince bir kez oynar.">
      <div class="sc-reveal-grid">{Array.from({ length: 6 }, (_, i) => <Card use:reveal={{ delay: i * 70, y: 24 }}><strong>Kart {i + 1}</strong><p class="hm-muted">Sırayla belirir.</p></Card>)}</div>
    </Demo>
  </Section>
}
