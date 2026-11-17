// The corner mark while something loads: its 15 dots leave the M one after another, in the order you would draw it (from
// the foot of the right leg up, over the curve, down the left leg), and line up on a turning spiral, the first one out
// at the spiral's tail, the last one at its centre. The spiral starts turning with the first dot. When the load is
// done the spiral comes apart from its centre: the centre dot goes to the foot of the left leg, the others follow in
// turn; each dot stops turning once it is home, the ones still on the spiral keep turning until the M is whole.
// Driven by the motion engine's frame clock (global speed and pause apply); nothing moves with reduced motion.
import { MARK_DOTS } from "./logo.tsx"

/** The M drawn as one line: up the right leg from its foot, over the curve, down the left leg to its foot. */
const DRAW = [9, 8, 7, 6, 5, 14, 13, 12, 11, 10, 0, 1, 2, 3, 4]
const N = DRAW.length
/** Spiral slots, 0 the centre … N - 1 the tail: the last dot drawn sits at the centre, the first at the tail. */
const slotOf = (i: number): number => N - 1 - DRAW.indexOf(i)
const CX = 60, CY = 52, INNER = 5, OUTER = 42, TURNS = 1.55
const slotR = (s: number): number => 2.6 + (s / (N - 1)) * 3.6
/** ms: between two dots setting off, one dot's way, one turn of the spiral. */
const STAGGER = 60, TRAVEL = 520, TURN = 1600

type Dot = { el: SVGCircleElement; home: [number, number]; r: number; slot: number;
  /** where it is going: "spiral" or "home"; from where and when it set off (start in the future: still waiting) */
  to: "spiral" | "home"; from: [number, number]; fromR: number; start: number; at: [number, number]; atR: number }

const ease = (u: number): number => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2)

export function busyLogo(svg: SVGSVGElement): (busy: boolean) => void {
  const dots: Dot[] = [...svg.querySelectorAll("circle")].map((el, i) => {
    const [x, y, r] = MARK_DOTS[i]!
    return { el, home: [x, y], r, slot: slotOf(i), to: "home", from: [x, y], fromR: r, start: 0, at: [x, y], atR: r }
  })
  let now = 0, angle = 0, turning = false, stopFrame: (() => void) | undefined, busy = false

  const slotPos = (s: number): [number, number] => {
    const a = (s / (N - 1)) * TURNS * 2 * Math.PI + angle, rad = INNER + (s / (N - 1)) * (OUTER - INNER)
    return [CX + rad * Math.cos(a), CY + rad * Math.sin(a)]
  }
  const draw = (d: Dot): void => {
    const dx = d.at[0] - d.home[0], dy = d.at[1] - d.home[1]
    if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01 && Math.abs(d.atR - d.r) < 0.01) { d.el.removeAttribute("transform"); d.el.setAttribute("r", String(d.r)); return }
    d.el.setAttribute("transform", `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`)
    d.el.setAttribute("r", d.atR.toFixed(2))
  }
  const tick = (_t: number, dt: number): void => {
    now += dt
    // the spiral turns from the moment the first dot sets off until the last one is home
    if (!turning && dots.some((d) => d.to === "spiral" && now >= d.start)) turning = true
    if (turning) angle += (dt / TURN) * 2 * Math.PI
    let settled = true
    for (const d of dots) {
      const target: [number, number] = d.to === "spiral" ? slotPos(d.slot) : d.home
      const targetR = d.to === "spiral" ? slotR(d.slot) : d.r
      if (now < d.start) { settled = false; continue }
      const u = Math.min(1, (now - d.start) / TRAVEL)
      if (u < 1) {
        settled = false
        // set off from where it was, curving out a little to the side as it goes (the target may be turning)
        const e = ease(u), bend = Math.sin(Math.PI * u) * 8
        const mx = d.from[0] + (target[0] - d.from[0]) * e, my = d.from[1] + (target[1] - d.from[1]) * e
        const len = Math.hypot(target[0] - d.from[0], target[1] - d.from[1]) || 1
        d.at = [mx - ((target[1] - d.from[1]) / len) * bend, my + ((target[0] - d.from[0]) / len) * bend]
        d.atR = d.fromR + (targetR - d.fromR) * e
      } else {
        d.at = target; d.atR = targetR
        if (d.to === "spiral") settled = false
      }
      draw(d)
    }
    if (settled && !busy) { stopFrame?.(); stopFrame = undefined; turning = false; angle = 0; now = 0 }
  }
  const send = (to: "spiral" | "home", order: number[]): void => {
    order.forEach((i, k) => {
      const d = dots[i]!
      if (d.to === to) return
      // a dot still waiting to set off stays where it is; one on its way turns round from where it is now
      d.to = to; d.from = [...d.at] as [number, number]; d.fromR = d.atR; d.start = now + k * STAGGER
    })
  }
  // a dot's starting point is taken when its turn comes, not when it is scheduled (the spiral turns meanwhile)
  const tickWithStarts = (t: number, dt: number): void => {
    for (const d of dots) if (d.start > now && d.start <= now + dt) { d.from = [...d.at] as [number, number]; d.fromR = d.atR }
    tick(t, dt)
  }

  return (b: boolean): void => {
    if (b === busy) return
    busy = b
    void import("march/motion").then(({ onFrame, reducedMotion }) => {
      if (reducedMotion()) return
      if (busy) send("spiral", DRAW)
      else send("home", [...DRAW].reverse())
      stopFrame ??= onFrame(tickWithStarts)
    })
  }
}
