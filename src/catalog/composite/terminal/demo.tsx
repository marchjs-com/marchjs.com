// Showcase stage for Terminal: a few commands that show typed arguments, sub-commands, async work with Ctrl+C,
// colored output, tables, JSON and progress. Try: help, deploy staging, user list, theme hadi, motion, fetch, colors.
import { Terminal, TerminalWindow, ansi, type TerminalCommand as Command, type ColorScheme, type TerminalApi } from "march/components/composite/terminal";
import { signal, untrack, computed } from "march";
import { setColorTheme, colorThemes } from "march/ui";

export const code = `<Terminal prompt="hadi$ " persist="demo" welcome="[info] help yaz, Tab ile tamamla" commands={{
  deploy: { desc: "Yayınla", args: [{ name: "env", required: true, choices: ["staging", "prod"] }],
            run: async (a, io) => { const p = io.progress(a.args.env); … p.done(); io.success("Yayında") } },
  user: { desc: "Kullanıcılar", sub: { list: (_a, io) => io.table(users) } },
}} />`

const wait = (ms: number, signal: AbortSignal): Promise<void> => new Promise((ok, no) => { const t = setTimeout(ok, ms); signal.addEventListener("abort", () => { clearTimeout(t); no(new Error("iptal")) }, { once: true }) })
const USERS = [{ name: "Ayşe", role: "yönetici", status: ansi.green("aktif") }, { name: "Mert", role: "editör", status: ansi.yellow("davetli") }, { name: "Deniz", role: "okur", status: ansi.gray("pasif") }]

const COMMANDS: Record<string, Command> = {
  deploy: { desc: "Bir ortama yayınlar (Ctrl+C ile iptal)", args: [{ name: "env", required: true, choices: ["staging", "prod"], desc: "ortam" }], options: { force: { alias: "f", desc: "onay sorma" } },
    run: async (a, io) => {
      if (a.args["env"] === "prod" && !a.options["force"]) { io.warn("prod için --force gerekir"); return }
      const p = io.progress(`HADİ ${a.args["env"]} ortamına yükleniyor`)
      for (let i = 1; i <= 20; i++) { await wait(90, io.signal); p.set(i / 20) }
      p.done(`HADİ ${a.args["env"]} ortamında yayında`)
    } },
  user: { desc: "Kullanıcılar", sub: {
    list: { desc: "Listeler", run: (_a, io) => io.table(USERS.map((u) => [u.name, u.role, u.status]), ["ad", "rol", "durum"]) },
    add: { desc: "Ekler", args: [{ name: "name", required: true }, { name: "role", choices: ["yönetici", "editör", "okur"], default: "okur" }], run: (a, io) => io.success(`${a.args["name"]} (${a.args["role"]}) eklendi`) },
  } },
  theme: { desc: "Vitrin temasını değiştirir", args: [{ name: "id", choices: colorThemes().map((t) => t.id) }], run: (a, io) => { if (!a.args["id"]) { io.print(colorThemes().map((t) => t.id).join("  ")); return } setColorTheme(String(a.args["id"])); io.success(`tema: ${a.args["id"]}`) } },
  fetch: { desc: "Örnek veri çeker ve JSON ağacı gösterir", run: async (_a, io) => { const s = io.spinner("demo-api/users.json"); await wait(400, io.signal); s.done("geldi"); io.json({ users: USERS.map((u) => ({ name: u.name, role: u.role })), total: USERS.length }, 2) } },
  colors: { desc: "16 rengi gösterir", run: (_a, io) => { io.print(Object.entries(ansi).filter(([k]) => !["strip", "bold", "dim", "italic", "underline"].includes(k)).map(([k, f]) => (f as (s: string) => string)(k)).join(" ")); io.print(`${ansi.bold("kalın")} ${ansi.dim("soluk")} ${ansi.italic("eğik")} ${ansi.underline("altı çizili")}`) } },
  motion: { desc: "Bekleme çarkı", run: async (_a, io) => { const s = io.spinner("hareket motoru ısınıyor"); await wait(900, io.signal); s.done("hazır") } },
}

const SCHEMES: Record<string, ColorScheme> = { auto: "auto", surface: "surface", dark: "dark", light: "light",
  hadi: { bg: "#13233a", fg: "#f3f6fb", cursor: "#f2801f", colors: ["#13233a", "#ff6b6b", "#78be3a", "#f2801f", "#1d9ad6", "#a3338c", "#4cc3e0", "#d8e0ec", "#7d8ba3", "#ff8e8e", "#9bd468", "#ffa04d", "#53b8e6", "#c95db2", "#7fd6ea", "#ffffff"] } }

export default function TerminalDemo(props: { values: { window: string; scheme: string; background: string; cursor: string; prompt: string; blink: boolean; builtins: boolean; ownLabels: boolean } }) {
  const v = props.values
  const welcome = ["[info] March terminali: help yaz, Tab ile tamamla, ↑ geçmiş, Ctrl+R ara, Ctrl+C iptal", "Dene: deploy staging · user list · fetch · colors"]
  const open = signal(true)
  // read where the terminal is built: only a change of one of these (or putting it in a window) draws it again; the
  // scheme, background, cursor, prompt and the window's look stay live, so the output is kept
  const once = computed(() => [v.window === "none", v.blink, v.builtins, v.ownLabels].join("|"))
  const parts = () => ({ blink: v.blink, builtins: v.builtins, labels: v.ownLabels ? { notFound: (name: string) => `“${name}” diye bir komut yok. Şunları dene: deploy, user, fetch` } : undefined })
  // these two show only when a command runs: after one of them changes, the new terminal runs the command that shows it
  // (help lists the ready-made commands; an unknown word gets the "not found" text)
  let last = untrack(() => ({ builtins: v.builtins, ownLabels: v.ownLabels }))
  const showChange = (t: TerminalApi) => {
    const now = untrack(() => ({ builtins: v.builtins, ownLabels: v.ownLabels }))
    const line = now.builtins !== last.builtins ? "help" : now.ownLabels !== last.ownLabels ? "selam" : null
    last = now
    if (line) void t.exec(line)
  }
  return <div class="sc-term-demo">
    {() => { once(); return untrack(() => v.window === "none"
      ? <Terminal scheme={() => SCHEMES[v.scheme] ?? "auto"} background={() => v.background || undefined} cursor={v.cursor as "bar"} prompt={v.prompt}
          persist="showcase" commands={COMMANDS} welcome={welcome} ref={showChange} {...parts()} />
      // in a window: drag the title bar, drop it on an edge to dock, double click to fill; the area is this box
      : <div class="sc-term-desk">
          <TerminalWindow chrome={() => v.window as "hadi"} title="hadi@march: ~" x={16} y={16} width={560} windowHeight={300}
            open={() => open()} onClose={() => open.set(false)}
            scheme={() => SCHEMES[v.scheme] ?? "auto"} background={() => v.background || undefined} cursor={v.cursor as "bar"} prompt={v.prompt}
            persist="showcase" commands={COMMANDS} welcome={welcome} ref={showChange} {...parts()} />
          {() => (open() ? null : <button type="button" class="m-btn m-btn-sm sc-term-reopen" onClick={() => open.set(true)}>Terminali yeniden aç</button>)}
        </div>) }}
  </div>
}
