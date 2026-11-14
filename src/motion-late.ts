// Motion extras of the shell (loaded as their own lazy part after the shell): transition: names, <For animate> FLIP,
// page transitions and the "everything is paused" notice, all on the motion engine.
import "hadi-march/motion/install";
import { h, render } from "hadi-march";
import { pageTransitions, motion, installThemeWave, spotlight } from "hadi-march/motion";
import { Button } from "hadi-march/ui";

pageTransitions({ type: "fade", duration: 180 });
// a new theme, accent or light / dark spreads from the pressed point (at once without View Transitions or with reduced motion)
installThemeWave();
// one light follows the pointer over the cards of every page: all cards near the pointer are lit from where it really is
spotlight(document, { selector: ".sc-hub-card, .sc-demo, .sc-card, .sc-home-cat, .m-link-card" });

// "Stop all" stops the whole showcase (every page, CSS loops, canvas layers, page transitions): this notice stays on
// screen on every page until motion is resumed
const host = document.createElement("div");
document.body.append(host);
render(() => h("div", { class: "sc-paused", role: "status", hidden: () => !motion.paused() },
  h("span", {}, "Tüm animasyonlar durduruldu: her sayfada"),
  h(Button, { variant: "primary", size: "sm", onClick: () => motion.resumeAll() }, "Sürdür")), host);
