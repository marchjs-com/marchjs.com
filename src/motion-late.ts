// Motion extras of the shell (loaded as their own lazy part after the shell): transition: names, <For animate> FLIP,
// page transitions and the "everything is paused" notice, all on the motion engine.
import "hadi-march/motion/install";
import { h, render } from "hadi-march";
import { pageTransitions, motion } from "hadi-march/motion";

pageTransitions({ type: "fade", duration: 180 });

// "Stop all" stops the whole showcase (every page, CSS loops, canvas layers, page transitions): this notice stays on
// screen on every page until motion is resumed
const host = document.createElement("div");
document.body.append(host);
render(() => h("div", { class: "sc-paused", role: "status", hidden: () => !motion.paused() },
  h("span", {}, "Tüm animasyonlar durduruldu: her sayfada"),
  h("button", { type: "button", class: "hm-btn hm-btn-primary hm-btn-sm", onClick: () => motion.resumeAll() }, "Sürdür")), host);
