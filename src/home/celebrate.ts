// The moment a count reaches its value (the home page's figures, the like counter of the bench): a firework of the
// brand colours goes off over it (two bursts, a ring and a smaller one) and a ghost of the number grows and fades out.
import { animate, reducedMotion } from "march/motion";
import { heartBurst } from "march/ui";

/** Celebrate `number` inside `host` (positioned: the burst and the ghost are placed in it). */
export function celebrate(host: HTMLElement, number: HTMLElement | null): void {
  if (reducedMotion()) return;
  heartBurst(host, { count: 16, radius: 58 });
  setTimeout(() => heartBurst(host, { count: 10, radius: 30, ring: false }), 170);
  if (!number) return;
  // the ghost: a copy laid over the number, growing from its centre as it fades
  const a = host.getBoundingClientRect(), b = number.getBoundingClientRect();
  const ghost = number.cloneNode(true) as HTMLElement;
  ghost.setAttribute("aria-hidden", "true");
  ghost.classList.add("sc-ghost");
  Object.assign(ghost.style, { left: `${b.left - a.left}px`, top: `${b.top - a.top}px`, width: `${b.width}px`, height: `${b.height}px` });
  host.append(ghost);
  animate(ghost, [{ transform: "scale(1)", opacity: 0.75 }, { transform: "scale(2.6)", opacity: 0 }], { duration: 750, easing: "out" });
  setTimeout(() => ghost.remove(), 800);
}
