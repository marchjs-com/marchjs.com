// Motion extras of the shell (loaded as their own lazy part after the shell): transition: names, <For animate> FLIP
// and page transitions, all on the motion engine.
import "hadi-march/motion/install";
import { pageTransitions } from "hadi-march/motion";

pageTransitions({ type: "fade", duration: 180 });
