// Motion extras of the shell (loaded as their own lazy part after the shell): transition: names, <For animate> FLIP,
// page transitions and the "everything is paused" notice, all on the motion engine.
import "hadi-march/motion/install";
import { h, render } from "hadi-march";
import { pageTransitions, motion } from "hadi-march/motion";
import { installWave } from "./wave.ts";
import { Button } from "hadi-march/ui";

pageTransitions({ type: "fade", duration: 180 });
// a new theme, accent or light / dark comes in with the chosen transition (wave.ts: paint poured from the top unless
// another was picked on Motion › Page transitions)
installWave();
// the pointer light over the cards (spotlight) is the home page's own (pages/home.tsx): other pages stay calm

// "Stop all" stops the whole showcase (every page, CSS loops, canvas layers, page transitions): this notice stays on
// screen on every page until motion is resumed
const host = document.createElement("div");
document.body.append(host);
render(() => h("div", { class: "sc-paused", role: "status", hidden: () => !motion.paused() },
  h("span", {}, "Tüm animasyonlar durduruldu: her sayfada"),
  h(Button, { variant: "primary", size: "sm", onClick: () => motion.resumeAll() }, "Sürdür")), host);
