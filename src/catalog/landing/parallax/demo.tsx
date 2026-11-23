// Showcase stage for Parallax: three themed SVG layers (far hills, mid hills, near shapes) and a title in front.
import { Parallax } from "march/landing";

export const code = `<Parallax pointer={1} layers={[
  { src: "/sky.jpg", speed: 0.5 },                 // far: slower than the page
  { src: "/hills.png", speed: 0.25 },
  { content: <Shapes />, speed: -0.15 },           // near: faster
]}>
  <h2>Derinlik</h2>
</Parallax>`

const Hills = (p: { cls: string; d: string }) => <svg class={p.cls} viewBox="0 0 1200 400" preserveAspectRatio="none" aria-hidden="true"><path d={p.d} /></svg>

export default function ParallaxDemo(props: { values: { sample: number; text: string; depth: number; pointer: number } }) {
  return <div class="sc-demo-stack"><div class="sc-site-frame">
    {() => {
      const v = { ...props.values }, d = v.depth
      return <Parallax class="sc-plx" pointer={v.pointer} height="22rem" layers={[
        { content: <div class="sc-plx-sky" />, speed: d * 1.4 },
        { content: <Hills cls="sc-plx-far" d="M0 260 C 200 160 340 220 520 170 S 900 120 1200 210 V400 H0 Z" />, speed: d },
        { content: <Hills cls="sc-plx-mid" d="M0 300 C 160 240 380 300 600 250 S 980 230 1200 290 V400 H0 Z" />, speed: d * 0.55 },
        { content: <div class="sc-plx-dots"><i /><i /><i /><i /></div>, speed: -d * 0.6, depth: 90 },
      ].slice(0, v.sample)}>
        <h3 class="sc-plx-title">{v.text || "Derinlik, yalnız transform"}</h3>
      </Parallax>
    }}
    </div>
    <p class="sc-demo-call">{() => props.values.pointer ? `Fare izleme: imleci sahnede gezdir, katmanlar derinliğine göre en çok ${Math.round(60 * props.values.pointer)} px kayar` : "Fare izleme kapalı: katmanlar yalnız kaydırmayla kayar"}</p>
  </div>
}
