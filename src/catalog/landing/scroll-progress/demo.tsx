// Showcase stage for ScrollProgress: an inline bar that follows how far this page is read.
import { ScrollProgress } from "march/landing";

export const code = `<ScrollProgress />                                        // whole page, fixed to the top
<ScrollProgress target={() => article} position="inline" paint="accent" />`

export default function ScrollProgressDemo(props: { values: { position: string; paint: string; size: number; color: string } }) {
  return <div class="sc-web-col">
    <p class="m-muted">Sayfayı kaydır: çubuk bu sayfanın ne kadarının okunduğunu gösterir.</p>
    {() => { const v = { ...props.values }; return <ScrollProgress position={v.position as "inline"} paint={v.paint as "gradient"} size={v.size} color={v.color === "default" ? undefined : v.color as "brand-orange"} class="sc-sprog-demo" /> }}
  </div>
}
