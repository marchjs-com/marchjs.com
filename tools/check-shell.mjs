// The showcase's frame on the built site, in headless Chrome / Edge: what broke unnoticed once March came from the CDN.
//   1. the home page's stats band is one row (StatsBand's grid wins over the rules of what it is made of: Reveal…)
//   2. March's stylesheets are linked in March's order (css.json ranks ascending), before the site's own
//   3. a theme change comes in with the chosen transition (Motion › Page transitions): every shape starts its wave
// Usage: node tools/check-shell.mjs [--base http://127.0.0.1:5183]   (default: serves dist/)
import { openHeadless, flag, sleep } from "./lib/headless.mjs";

const base = flag(process.argv, "--base", null);
const b = await openHeadless(base ? { base } : {});
const fails = [];
const fail = (m) => { fails.push(m); console.error(`✖ ${m}`); };
const until = async (expr, ms = 15000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await b.ev(expr)) return true; await sleep(200); } return false; };

try {
  // 1. the stats band: one row of seven figures at a desktop width
  await b.load("/", 1440);
  // the band is drawn as it comes near: scroll to it on every try (it may not exist yet when the page has just loaded)
  if (!(await until("(document.querySelector('.sc-stats')?.scrollIntoView({ block: 'center' }), document.querySelectorAll('.sc-stats .m-stats > *').length >= 2)"))) fail("home: the stats band did not render");
  else {
    await sleep(800);
    const s = await b.ev(`(() => { const s = document.querySelector('.sc-stats .m-stats'); const tops = [...s.children].map((c) => Math.round(c.getBoundingClientRect().top));
      return { display: getComputedStyle(s).display, rows: new Set(tops).size, n: tops.length }; })()`);
    if (s.display !== "grid" || s.rows !== 1) fail(`home: the stats band is not one row (display ${s.display}, ${s.n} figures in ${s.rows} rows)`);
    else console.log(`✔ home: the stats band is one row (${s.n} figures)`);
  }

  // 2. March's sheets in March's order, before the site's own stylesheets
  const order = await b.ev(`(() => { const links = [...document.head.querySelectorAll('link[rel=stylesheet]')];
    const ranked = links.filter((l) => /^\\d+$/.test(l.getAttribute('data-march-cdn') ?? ''));
    const ranks = ranked.map((l) => +l.getAttribute('data-march-cdn'));
    const firstOwn = links.findIndex((l) => !l.hasAttribute('data-march-cdn'));
    const lastCdn = links.map((l) => l.hasAttribute('data-march-cdn')).lastIndexOf(true);
    return { n: ranked.length, sorted: ranks.every((r, i) => !i || ranks[i - 1] < r), ownLast: firstOwn < 0 || firstOwn > lastCdn,
      bad: ranks.findIndex((r, i) => i && ranks[i - 1] >= r) }; })()`);
  if (!order.n) fail("home: no March stylesheet carries its rank (css.json): an older March compiler or CDN release");
  else if (!order.sorted) fail(`home: March's stylesheets are out of order (at link ${order.bad})`);
  else if (!order.ownLast) fail("home: a March stylesheet comes after the site's own");
  else console.log(`✔ home: ${order.n} March stylesheets in March's order, before the site's own`);

  // 3. the theme wave: each shape, from a reload with it chosen, on a real light / dark change
  for (const shape of ["drip", "circle", "spray", "sweep", "splat"]) {
    await b.ev(`(localStorage.setItem('sc.wave', ${JSON.stringify(shape)}), true)`);
    await b.load("/", 1280);
    // the shell's motion part is loaded when idle (shell-late → motion-late): its pause notice is the sign it is in
    if (!(await until("!!document.querySelector('.sc-paused')", 20000))) { fail(`wave ${shape}: the shell's motion part never loaded`); continue; }
    // the painted shapes load their part ahead
    await sleep(1500);
    const r = await b.ev(`(async () => {
      const root = document.documentElement, seen = new Set();
      const note = () => { if (root.hasAttribute('data-m-wave')) seen.add('attr'); if (document.querySelector('.m-wave-veil, .m-wave-shade')) seen.add('veil'); };
      const mo = new MutationObserver(note);
      mo.observe(root, { attributes: true, childList: true, subtree: true, attributeFilter: ['data-m-wave'] });
      const start = document.startViewTransition?.bind(document);
      if (start) document.startViewTransition = (cb) => { seen.add('vt'); return start(cb); };
      const href = document.querySelector('link[href*="/css/tokens.css"]')?.href ?? '';
      const t = await import(href.replace(/css\\/tokens\\.css$/, 'mod/ui/theme.js'));
      const before = t.resolvedTheme();
      t.setTheme(before === 'dark' ? 'light' : 'dark');
      for (let i = 0; i < 30 && !seen.size; i++) await new Promise((r) => setTimeout(r, 100));
      mo.disconnect();
      if (start) document.startViewTransition = start;
      return { seen: [...seen], changed: t.resolvedTheme() !== before };
    })()`, 30000);
    if (!r?.seen?.length) fail(`wave ${shape}: a light / dark change came without a wave (${JSON.stringify(r)})`);
    else console.log(`✔ wave ${shape}: ${r.seen.join(", ")}`);
    await sleep(2500);
  }

  // 4. the way a visitor changes the look, with real presses: the top bar's theme menu (two cards in a row, the menu
  // left open), an accent swatch, the light / dark toggle. Each change must land; the theme changes come with the
  // drip (the default shape) and its picture must go again (nothing left over the page, no press held behind it)
  await b.ev("(localStorage.removeItem('sc.wave'), localStorage.removeItem('m-color-theme'), true)");
  await b.load("/", 1280);
  if (!(await until("!!document.querySelector('.sc-paused')", 20000))) fail("menu: the shell's motion part never loaded");
  await sleep(1500);
  await b.ev(`(() => { const root = document.documentElement; window.__wave = new Set();
    new MutationObserver(() => { if (root.getAttribute('data-m-wave')) window.__wave.add('drip:' + root.getAttribute('data-m-wave')); if (document.querySelector('.m-wave-veil, .m-wave-shade')) window.__wave.add('paint'); })
      .observe(root, { attributes: true, childList: true, subtree: true, attributeFilter: ['data-m-wave'] });
    const start = document.startViewTransition?.bind(document);
    if (start) document.startViewTransition = (cb) => { window.__wave.add('vt'); return start(cb); };
    return true; })()`);
  // a press lands where the element is now: wait until it stands still (a menu still opening moves its cards) and is the
  // element under that point (nothing over it), else a slow machine presses beside it and closes the menu
  const press = async (expr, what) => {
    let at = null;
    for (const t0 = Date.now(); Date.now() - t0 < 5000;) {
      at = await b.ev(`(async () => { const el = ${expr}; if (!el) return null; el.scrollIntoView({ block: 'nearest' });
        const r1 = el.getBoundingClientRect(); await new Promise((r) => setTimeout(r, 120)); const r = el.getBoundingClientRect();
        const x = r.left + r.width / 2, y = r.top + r.height / 2, hit = document.elementFromPoint(x, y);
        return { x, y, still: Math.abs(r.left - r1.left) + Math.abs(r.top - r1.top) < 0.5 && r.width > 0, onTop: !!hit && (hit === el || el.contains(hit)) }; })()`);
      if (!at || (at.still && at.onTop)) break;
    }
    if (!at) { fail(`menu: ${what} not found`); return false; }
    for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) await b.send("Input.dispatchMouseEvent", { type, x: at.x, y: at.y, button: "left", clickCount: 1 });
    return true;
  };
  const look = () => b.ev("JSON.stringify([document.documentElement.getAttribute('data-m-theme'), document.documentElement.getAttribute('data-m-accent'), document.documentElement.getAttribute('data-theme')])");
  /** One change by a press: it lands, with the drip when `wave`, and the drip's picture goes again. */
  const change = async (expr, what, wave) => {
    await b.ev("(window.__wave.clear(), true)");
    const before = await look();
    if (!(await press(expr, what))) return;
    const landed = await until(`JSON.stringify([document.documentElement.getAttribute('data-m-theme'), document.documentElement.getAttribute('data-m-accent'), document.documentElement.getAttribute('data-theme')]) !== ${JSON.stringify(before)}`, 8000);
    const gone = await until("!document.documentElement.hasAttribute('data-m-wave') && !document.querySelector('.m-wave-shade, .m-wave-veil')", 8000);
    const seen = await b.ev("[...window.__wave].join(', ')");
    if (!landed) fail(`menu: ${what} did not change the look (${before})`);
    else if (wave && !/drip:drip/.test(seen)) fail(`menu: ${what} came without the drip (${seen || "nothing"})`);
    else if (!gone) fail(`menu: ${what}: the drip's picture stayed over the page`);
    else console.log(`✔ menu: ${what}${wave ? ` (${seen})` : ""}`);
  };
  const card = (name) => `[...document.querySelectorAll('.m-theme-menu [role=radio]')].find((x) => x.textContent.includes(${JSON.stringify(name)}))`;
  const opened = (await press("document.querySelector('.m-theme-menu-btn')", "the theme menu button")) && (await until("!!document.querySelector('.m-theme-menu [role=radio]')", 8000));
  if (!opened) fail("menu: the theme menu did not open");
  else {
    await change(card("Gece Mavisi"), "theme card Gece Mavisi", true);
    // the menu stays open: the next card at once
    await change(card("Neon"), "theme card Neon, menu still open", true);
    await change(`[...document.querySelectorAll('.m-theme-menu [role=radiogroup]')].at(-1)?.querySelector('[role=radio][aria-checked=false]')`, "an accent in the menu", false);
  }
  await b.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
  await sleep(500);
  await change("document.querySelector('.m-theme-toggle')", "the light / dark toggle", true);
  // and the menu opens again after all that
  if (!((await press("document.querySelector('.m-theme-menu-btn')", "the theme menu button")) && (await until("!!document.querySelector('.m-theme-menu [role=radio]')", 8000)))) fail("menu: the theme menu did not open again");
  else console.log("✔ menu: opens again");
} finally {
  if (b.errs.length) console.log(`page errors: ${b.errs.slice(0, 5).join(" | ")}`);
  await b.close();
}
if (fails.length) { console.error(`✖ ${fails.length} shell check(s) failed`); process.exit(1); }
console.log("✔ shell checks pass");
