// The showcase navigation's start-up piece: only a placeholder of the rail's and the menu's width. The navigation
// itself (the section rail, NavSidebar, their manifest of descriptions, groups and icons: shell-menu.tsx +
// nav-meta.ts) loads once the browser is idle after the first paint, so neither is part of start-up
// (test/boot-pages.test.js).
import { signal } from "march";
import { whenIdle } from "march/lazy";
import { path } from "march/router";

const menu = signal<(() => unknown) | null>(null);
whenIdle(() => { void import("./shell-menu.tsx").then((m) => menu.set(() => m.default)); }, 1200);

export default function ShellNav() {
  return () => { const Menu = menu(); return Menu ? <Menu /> : <div class="sc-nav-placeholder" data-rail-only={() => (path() === "/" ? "" : null)} aria-hidden="true" /> }
}
