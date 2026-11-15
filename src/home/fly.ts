// Flight paths for the home page: where an element starts before it flies to its own place as it scrolls into view
// (Reveal / revealOnScroll with scrub: the scroll position is the step, scrolling back up flies it back out). Every
// path uses the same transform list as the place it lands on, so each step in between is a real point on the way.
type Path = "left" | "right" | "deep" | "flip" | "rise" | "spin" | "stack";

const at = (x: string, y: string, z: string, rx: number, ry: number, rz: number, s: number): string =>
  `perspective(1400px) translate3d(${x}, ${y}, ${z}) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${s})`;
const HOME = at("0px", "0px", "0px", 0, 0, 0, 1);

const FROM: Record<Path, string> = {
  // from far on the start side, turned away and tilted
  left: at("-55vw", "14vh", "-420px", -12, 68, -9, 0.78),
  // the same from the end side
  right: at("55vw", "14vh", "-420px", -12, -68, 9, 0.78),
  // from deep below, lying back
  deep: at("0px", "42vh", "-1100px", 68, 0, 0, 0.7),
  // turned over like a card being dealt
  flip: at("0px", "16vh", "-320px", 0, -115, 0, 0.9),
  // rising up from below, leaning forward
  rise: at("0px", "34vh", "-240px", -38, 0, 0, 0.86),
  // spun in from the distance
  spin: at("0px", "22vh", "-700px", 0, 0, -28, 0.4),
  // a number stood up from the floor
  stack: at("0px", "12vh", "-600px", 82, 0, 0, 0.45),
};

/** A flight as a Reveal effect: `<Reveal effect={fly("left")} scrub>`. */
export const fly = (path: Path): { from: Record<string, string | number>; to: Record<string, string | number> } =>
  ({ from: { opacity: 0, transform: FROM[path] }, to: { opacity: 1, transform: HOME } });

/** The path of the i-th card of a grid of three: from the start side, from below, from the end side. */
export const byColumn = (i: number): Path => (["left", "deep", "right"] as const)[i % 3]!;
