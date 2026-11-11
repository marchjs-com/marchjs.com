// HADI March showcase — every motion and visual capability on one page (the base for a future launch page).
// Run with `march dev` (entry: this file). Uses hadi-march/motion, hadi-march/fx and hadi-march/charts.
import "hadi-march/css/tokens.css";
import "hadi-march/css/sx.css";
import "hadi-march/css/ui.css";
import "hadi-march/motion/motion.css";
import "hadi-march/fx/fx.css";
import "hadi-march/charts/charts.css";
import "./showcase.css";
import { render, For, If, Else } from "hadi-march";
import { spring, tween, timeline, inView, reveal, parallax, scrollProgress, drag, magnet, tilt, press, stagger, animate } from "hadi-march/motion";
import { Particles, Aurora, confetti, spotlight } from "hadi-march/fx";
import { LineChart, Stat, BarList, Heatmap } from "hadi-march/charts";

interface Card { id: number; title: string; hue: number }

let $count = 0;
let $cards: Card[] = Array.from({ length: 6 }, (_, i) => ({ id: i + 1, title: `Card ${i + 1}`, hue: i * 55 }));
let $show = true;
let $target = 0;
let $series = Array.from({ length: 60 }, (_, i) => ({ t: Date.now() - (60 - i) * 864e5, a: 50 + Math.sin(i / 6) * 20 + i, b: 40 + Math.cos(i / 5) * 15 }));

function Hero() {
  const progress = scrollProgress();
  return <header class="sc-hero hm-noise">
    <Aurora colors={["#6d5dfc", "#22d3ee", "#a3e635", "#f472b6"]} />
    <Particles count={90} links={120} interactive class="hm-fx-fill" />
    <div class="sc-hero-inner">
      <h1 class="sc-title hm-gradient-text" use:reveal={{ duration: 900 }}>HADI March</h1>
      <p class="sc-sub" use:reveal={{ delay: 150 }}>Run once, then march. Fine-grained signals, real DOM, zero dependencies.</p>
      <div class="sc-row" use:reveal={{ delay: 300 }}>
        <button class="hm-btn hm-btn-primary sc-cta" use:magnet={{ strength: 0.35 }} use:press on:click={(e: Event) => { const r = (e.currentTarget as Element).getBoundingClientRect(); void confetti({ x: r.left + r.width / 2, y: r.top }); $count++; }}>
          Celebrate ({$count})
        </button>
      </div>
    </div>
    <div class="sc-progress" style={{ transform: `scaleX(${progress()})` }} aria-hidden="true" />
  </header>;
}

function Springs() {
  const x = spring(() => $target, { stiffness: 220, damping: 18 });
  const y = tween(() => $target, { duration: 600, easing: "easeOutBounce" });
  return <section class="sc-section" use:inView>
    <h2>Springs and tweens</h2>
    <input type="range" min="0" max="300" value={$target} on:input={(e: Event) => { $target = Number((e.target as HTMLInputElement).value); }} aria-label="Target" />
    <div class="sc-track"><span class="sc-ball" style={{ transform: `translateX(${x()}px)` }}>spring</span></div>
    <div class="sc-track"><span class="sc-ball sc-ball-2" style={{ transform: `translateX(${y()}px)` }}>tween</span></div>
  </section>;
}

function Lists() {
  const shuffle = (): void => { $cards = [...$cards].sort(() => Math.random() - 0.5); };
  const add = (): void => { const id = Math.max(0, ...$cards.map((c) => c.id)) + 1; $cards = [{ id, title: `Card ${id}`, hue: (id * 55) % 360 }, ...$cards]; };
  const remove = (id: number): void => { $cards = $cards.filter((c) => c.id !== id); };
  return <section class="sc-section">
    <h2>FLIP lists</h2>
    <div class="sc-row">
      <button class="hm-btn" on:click={shuffle}>Shuffle</button>
      <button class="hm-btn" on:click={add}>Add</button>
      <button class="hm-btn" on:click={() => { $show = !$show; }}>Toggle panel</button>
    </div>
    <ul class="sc-grid">
      <For each={$cards} key="id" animate>{(c: () => Card) =>
        <li class="sc-card hm-glass hm-tilt-glare" use:tilt={{ max: 10 }} style={{ "--sc-hue": String(c().hue) }}>
          <b>{c().title}</b>
          <button class="hm-btn hm-btn-sm" on:click={() => remove(c().id)}>Remove</button>
        </li>}
      </For>
    </ul>
    <If when={$show}>
      <div class="sc-panel hm-glass" transition:blur={{ duration: 300 }}>Blur in, blur out.</div>
      <Else><div class="sc-panel" transition:fly={{ y: 40 }}>Flying in from below.</div></Else>
    </If>
  </section>;
}

function Choreography() {
  let root: HTMLElement | undefined;
  const play = (): void => {
    if (!root) return;
    void timeline({ root, defaults: { duration: 500, easing: "easeOutExpo" } })
      .add(".sc-dot", [{ opacity: 0, transform: "translateY(30px) scale(.6)" }, { opacity: 1, transform: "none" }], { stagger: stagger(60, { from: "center", total: 12 }) })
      .add(".sc-dot", [{ transform: "none" }, { transform: "rotate(180deg)" }], { at: "-=200", stagger: 30 })
      .play();
  };
  return <section class="sc-section" ref={(el: Element) => { root = el as HTMLElement; }}>
    <h2>Timeline and stagger</h2>
    <button class="hm-btn hm-btn-primary" on:click={play}>Play</button>
    <div class="sc-dots">{Array.from({ length: 12 }, () => <i class="sc-dot" />)}</div>
  </section>;
}

function Gestures() {
  return <section class="sc-section hm-spotlight" use:spotlight>
    <h2>Gestures</h2>
    <div class="sc-drag-zone">
      <div class="sc-draggable hm-glow" tabindex="0" use:drag={{ snapBack: true }}>Drag me (or use arrow keys)</div>
    </div>
    <img class="sc-parallax" use:parallax={0.25} alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />
  </section>;
}

function Data() {
  const tick = (): void => { $series = [...$series.slice(1), { t: Date.now(), a: 60 + Math.random() * 40, b: 40 + Math.random() * 30 }]; };
  return <section class="sc-section">
    <h2>Reactive charts</h2>
    <button class="hm-btn" on:click={tick}>Add a point</button>
    <div class="sc-kpis">
      <Stat label="Signups" value={$count * 13 + 1200} delta={0.12} format="compact" />
      <Stat label="Revenue" value={48230} delta={-0.03} format={["money", "EUR"]} />
    </div>
    <LineChart data={$series} x="t" y={["a", "b"]} xFormat="date" title="Traffic" height={240} />
    <BarList data={[{ label: "Motion", value: 42 }, { label: "Charts", value: 31 }, { label: "Tables", value: 27 }]} />
    <Heatmap data={Array.from({ length: 7 * 24 }, (_, i) => ({ x: i % 24, y: Math.floor(i / 24), v: Math.random() }))} x="x" y="y" value="v" title="Activity" />
  </section>;
}

export default function Showcase() {
  return <main class="sc">
    <Hero />
    <Springs />
    <Lists />
    <Choreography />
    <Gestures />
    <Data />
    <footer class="sc-foot"><p>Built with HADI March · animations honor “reduce motion”.</p></footer>
  </main>;
}

const el = globalThis.document?.getElementById("app");
if (el) {
  render(() => <Showcase />, el);
  void animate(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 400 });
}
