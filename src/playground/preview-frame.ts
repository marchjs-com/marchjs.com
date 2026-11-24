// MarchIDE's preview frame (playground/preview.html, built to playground/preview.js): the preview runtime on March from
// the CDN, as any page made with March loads it (march.config.js › cdn). The frame is the preview's own document: what
// the code does to March (its language, its router, its extensions, its theme, its layers) stays in the frame and never
// reaches the IDE around it. The page reaches the runtime through the frame's window (same origin): window.__marchRuntime,
// set once everything here has loaded.
import "march/css/font.css";
import "march/css/tokens.css";
import "march/css/sx.css";
import "march/motion/motion.css";
// the accents (data-m-accent, which the preview toolbar's accent sets on the frame's <html>)
import "march/mod/ui/accent";
import { loadTheme } from "march/ui";
import { installThrottle } from "march/components/composite/network-throttle";
import * as runtime from "./preview-runtime.ts";

// the frame's fetch and XMLHttpRequest at the preview toolbar's network speed (the state is the page's: preview-share.ts)
installThrottle();
(globalThis as { __marchRuntime?: unknown }).__marchRuntime = { ...runtime, loadTheme };
