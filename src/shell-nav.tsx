// The showcase side menu's start-up piece: only a placeholder of the menu's width. The menu itself (NavSidebar, its
// manifest of descriptions, groups and icons: shell-menu.tsx + nav-meta.ts) loads once the browser is idle after the
// first paint, so neither is part of start-up (test/boot-pages.test.js).
import { signal } from "hadi-march";
import { whenIdle } from "hadi-march/lazy";

const menu = signal<(() => unknown) | null>(null);
whenIdle(() => { void import("./shell-menu.tsx").then((m) => menu.set(() => m.default)); }, 1200);

export default function ShellNav() {
  return () => { const Menu = menu(); return Menu ? <Menu /> : <div class="sc-nav-placeholder" aria-hidden="true" /> }
}
