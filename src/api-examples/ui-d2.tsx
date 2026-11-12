// API examples of hadi-march/ui, StoryProgress … TimeInput.
// Layout and rules: tools/api-examples.js. Each `run` is a small live demo of its `code`.
import { signal, untrack } from "hadi-march";
import { StoryProgress, StoryRing, StoryViewer, Tab, Tabs, Textarea, TextInput, ThemeMenu, ThemePicker, ThemeSwatch, ThemeToggle, TimeInput, Button, theme, resolvedTheme, colorTheme, setColorTheme, accent, setAccent, type ColorToken, type StoryGroup } from "hadi-march/ui";
import { examples } from "./types.ts";
import { Out, Log, Row } from "./_kit.tsx";
import { tl, COLORS } from "./_ui-d.ts";
import "./ui-d.css";
export { default as SIG } from "./ui-d2.sig.gen.ts";

/** Puts the look (mode, color theme, accent) back the way it was when the example opened. */
function RestoreLook() {
  const saved = untrack(() => ({ mode: theme(), name: colorTheme(), accent: accent() }))
  const changed = () => theme() !== saved.mode || colorTheme() !== saved.name || accent() !== saved.accent
  return <Button variant="ghost" size="sm" disabled={() => !changed()} onClick={() => { theme.set(saved.mode); setColorTheme(saved.name); setAccent(saved.accent) }}>Görünümü geri al</Button>
}

const STORIES: StoryGroup[] = [
  { id: "acme", name: "Acme Koşu", items: [{ id: "a1", src: "media/social/dawn.svg", alt: "Şafakta dağlar", caption: "Sabah turu" }, { id: "a2", src: "media/social/ride.svg", alt: "Bisiklet" }] },
  { id: "ada", name: "Ada", items: [{ id: "b1", src: "media/social/sea.svg", alt: "Denizde yelkenli", caption: "Hafta sonu" }] },
  { id: "lin", name: "Linus", items: [{ id: "c1", src: "media/social/coffee.svg", alt: "Kahve fincanı" }, { id: "c2", src: "media/social/city.svg", alt: "Gece şehir" }] },
]

export default examples({
  "hadi-march/ui": {
    StoryProgress: {
      code: `<StoryProgress count={items.length} index={i} duration={4000}
  paused={holding} onDone={() => i.update((x) => x + 1)} />`,
      play: { options: [{ key: "duration", label: "Süre", default: 2000, options: [{ value: 1000, label: "1 sn" }, { value: 2000, label: "2 sn" }, { value: 4000, label: "4 sn" }] }, { key: "paused", label: "Duraklat", default: false }] },
      run: (p: { values: { duration: number; paused: boolean } }) => {
        const i = signal(0), laps = signal(0)
        const captions = ["Sabah turu", "Kahve molası", "Yeni rota", "Gün batımı"]
        return <div class="sc-stack">
          <StoryProgress count={4} index={i} duration={() => p.values.duration} paused={() => p.values.paused} onDone={() => { if (i.peek() === 3) laps.update((x) => x + 1); i.set((i.peek() + 1) % 4) }} />
          <Row><Out label="hikâye" value={() => `${i() + 1}/4 · ${captions[i()]}`} /><Out label="tur" value={laps} /><Button size="sm" variant="ghost" onClick={() => i.set(0)}>Başa sar</Button></Row>
        </div>
      },
    },
    StoryRing: {
      code: `<StoryRing name="Ada" label="ada" state={seen() ? "seen" : "new"}
  onClick={() => openStories("ada")} />`,
      play: { options: [{ key: "size", label: "Boyut", default: "md", options: ["sm", "md", "lg"] }, { key: "loading", label: "Yükleniyor", default: false }] },
      run: (p: { values: { size: string; loading: boolean } }) => {
        const seen = signal<string[]>([])
        const people = [{ id: "ada", name: "Ada", state: "new" }, { id: "acme", name: "Acme Koşu", state: "close" }, { id: "lin", name: "Linus", state: "new" }] as const
        return <div class="sc-stack">
          <div class="sc-ex-ui-d-tray">
            <StoryRing name="Siz" label="Hikâyen" add state="none" size={() => p.values.size as "md"} onClick={() => seen.set([])} />
            {people.map((x) => <StoryRing name={x.name} label={x.name} size={() => p.values.size as "md"} loading={() => p.values.loading}
              state={() => (seen().includes(x.id) ? "seen" : x.state)} onClick={() => seen.update((l) => (l.includes(x.id) ? l : [...l, x.id]))} />)}
          </div>
          <Out label="görüldü" value={() => seen().join(", ") || "—"} />
        </div>
      },
    },
    StoryViewer: {
      code: `<StoryViewer open={open} onClose={() => open.set(false)} groups={stories}
  start="ada" onSeen={(g, s) => markSeen(s.id)} onReply={(g, s, text) => send(g, text)} />`,
      play: { options: [{ key: "reply", label: "Yanıt alanı", default: true }, { key: "like", label: "Beğeni", default: true }] },
      run: (p: { values: { reply: boolean; like: boolean } }) => {
        const open = signal(false), start = signal("acme"), log = signal<string[]>([]), liked = signal<string[]>([])
        const add = (l: string) => log.update((x) => [...x.slice(-4), l])
        return <div class="sc-stack">
          <div class="sc-ex-ui-d-tray">{STORIES.map((g) => <StoryRing name={g.name} label={g.name} size="sm" onClick={() => { start.set(g.id); open.set(true) }} />)}</div>
          {() => { const { like, reply } = p.values; return <StoryViewer open={open} onClose={() => open.set(false)} groups={STORIES} start={start} duration={4000}
            onSeen={(g, s) => add(`görüldü: ${g.name} › ${s.id}`)}
            liked={(_, s) => liked().includes(s.id)}
            onLike={like ? (_, s, on) => { liked.update((l) => (on ? [...l, s.id] : l.filter((x) => x !== s.id))); add(`${on ? "beğenildi" : "beğeni kalktı"}: ${s.id}`) } : undefined}
            onReply={reply ? (g, _, text) => add(`${g.name} kişisine yanıt: ${text}`) : undefined} /> }}
          <Log lines={log} />
        </div>
      },
    },
    Tab: {
      code: `<Tabs>
  <Tab id="inbox" label="Gelen" badge={unread}>{() => <Inbox />}</Tab>
  <Tab id="sent" label="Giden">{() => <Sent />}</Tab>
</Tabs>`,
      play: { options: [{ key: "badge", label: "Sayı rozeti", default: true }, { key: "archive", label: "Arşiv sekmesi", default: true }] },
      run: (p: { values: { badge: boolean; archive: boolean } }) => {
        const unread = signal(3)
        return <div class="sc-stack">
          <Tabs label="Posta">
            <Tab id="inbox" label="Gelen" badge={() => (p.values.badge ? unread() : null)}>{() => <Row><span>{() => `${unread()} okunmamış ileti`}</span><Button size="sm" disabled={() => !unread()} onClick={() => unread.update((x) => x - 1)}>Birini oku</Button></Row>}</Tab>
            <Tab id="sent" label="Giden">{() => <p>Son gönderilen: Acme teklifi</p>}</Tab>
            <Tab id="archive" label="Arşiv" hidden={() => !p.values.archive}>{() => <p>Arşivde 128 ileti</p>}</Tab>
          </Tabs>
          <Button size="sm" variant="ghost" onClick={() => unread.update((x) => x + 1)}>Yeni ileti gelsin</Button>
        </div>
      },
    },
    Tabs: {
      code: `const tab = signal("profile")
<Tabs value={tab} onChange={(id) => tab.set(id)} tabs={[
  { id: "profile", label: "Profil", content: () => <Profile /> },
  { id: "billing", label: "Fatura", content: () => <Billing /> },
]} />`,
      play: { options: [{ key: "color", label: "Renk", default: "primary", options: COLORS }, { key: "panel", label: "Panel", default: true }] },
      run: (p: { values: { color: string; panel: boolean } }) => {
        const tab = signal<string | null>("profile")
        const tabs = [
          { id: "profile", label: "Profil", content: () => <p>Ada · ada@acme.test</p> },
          { id: "billing", label: "Fatura", content: () => <p>Acme Pro · aylık {tl(249)}</p> },
          { id: "team", label: "Ekip", badge: 4, content: () => <p>4 üye, 1 davet bekliyor</p> },
        ]
        return <div class="sc-stack">
          {() => { const { color, panel } = p.values; return <Tabs label="Hesap" tabs={tabs} value={tab} onChange={(id: string) => tab.set(id)} color={color as ColorToken} panel={panel} /> }}
          <Row><Out label="etkin" value={tab} /><Button size="sm" variant="ghost" onClick={() => tab.set("billing")}>Faturaya git</Button></Row>
        </div>
      },
    },
    Textarea: {
      code: `<Textarea value={note} rows={2} maxLength={280} placeholder="Notunuz…" />   // grows with the text`,
      play: { options: [{ key: "autosize", label: "Metinle büyü", default: true }, { key: "rows", label: "Satır", default: 2, options: [2, 4] }] },
      run: (p: { values: { autosize: boolean; rows: number } }) => {
        const note = signal("Acme toplantısı:\n- bütçe\n- takvim")
        return <div class="sc-stack">
          {() => { const { rows, autosize } = p.values; return <Textarea aria-label="Not" value={note} rows={rows} autosize={autosize} maxLength={280} placeholder="Notunuz…" /> }}
          <Row><Out label="karakter" value={() => `${note().length}/280`} /><Out label="satır" value={() => note().split("\n").length} /><Button size="sm" variant="ghost" onClick={() => note.update((x) => `${x}\n- yeni madde`)}>Satır ekle</Button></Row>
        </div>
      },
    },
    TextInput: {
      code: `<TextInput value={code} prefix="#" placeholder="Kupon"
  transform={(v) => v.toUpperCase()} maxLength={10} />`,
      play: { options: [{ key: "upper", label: "Büyük harfe çevir", default: true }, { key: "affix", label: "Ön ek", default: true }] },
      run: (p: { values: { upper: boolean; affix: boolean } }) => {
        const code = signal("")
        return <div class="sc-stack">
          {() => { const { affix, upper } = p.values; return <TextInput aria-label="Kupon" value={code} prefix={affix ? "#" : undefined} placeholder="Kupon kodu" maxLength={10}
            transform={upper ? (v: string) => v.toUpperCase() : undefined} /> }}
          <Row><Out label="değer" value={() => code() || "—"} /><Button size="sm" variant="ghost" onClick={() => code.set("ACME25")}>Örnek kod</Button></Row>
        </div>
      },
    },
    ThemeMenu: {
      code: `<ThemeMenu />                                         // mode, color theme and accent
<ThemeMenu themes={false} accents={["primary", "brand-blue"]} />`,
      play: { options: [{ key: "themes", label: "Renk temaları", default: true }, { key: "accents", label: "Vurgu", default: "brand", options: [{ value: "brand", label: "HADİ" }, { value: "all", label: "hepsi" }, { value: "none", label: "yok" }] }] },
      run: (p: { values: { themes: boolean; accents: string } }) => <div class="sc-stack">
        {() => { const { themes, accents } = p.values; return <ThemeMenu label="Görünüm" placement="bottom-start" themes={themes}
          accents={accents === "none" ? false : accents === "brand" ? ["primary", "brand-orange", "brand-blue", "brand-green", "brand-purple"] : undefined} /> }}
        <Row><Out label="mod" value={() => theme()} /><Out label="tema" value={colorTheme} /><Out label="vurgu" value={accent} /><RestoreLook /></Row>
      </div>,
    },
    ThemePicker: {
      code: `<ThemePicker label="Tema" placement="bottom-start" />`,
      play: { options: [{ key: "label", label: "Etiket", default: "Tema", options: ["Tema", "Görünüm", "Renkler"] }] },
      run: (p: { values: { label: string } }) => <div class="sc-stack">
        <ThemePicker label={() => p.values.label} placement="bottom-start" />
        <Row><Out label="tema" value={colorTheme} /><Out label="mod" value={() => theme()} /><RestoreLook /></Row>
      </div>,
    },
    ThemeSwatch: {
      code: `{colorThemes().map((x) => <button onClick={() => setColorTheme(x.id)}>
  <ThemeSwatch id={x.id} /> {x.name}
</button>)}`,
      play: { options: [{ key: "id", label: "Tema", default: "hadi", options: [{ value: "hadi", label: "HADİ" }, { value: "cream", label: "Krem" }, { value: "night", label: "Gece" }, { value: "neon", label: "Neon" }] }] },
      run: (p: { values: { id: string } }) => <div class="sc-stack">
        <div class="sc-ex-ui-d-swatch-big">{() => { const id = p.values.id; return <ThemeSwatch id={id} /> }}</div>
        <div class="sc-ex-ui-d-swatches">{["hadi", "cream", "night", "neon", "indigo", "minimal"].map((id) => <ThemeSwatch id={id} />)}</div>
        <Out label="id" value={() => p.values.id} />
      </div>,
    },
    ThemeToggle: {
      code: `<ThemeToggle />   // system → light → dark, saved for the next visit`,
      play: { options: [{ key: "readout", label: "Mod göstergesi", default: true }] },
      run: (p: { values: { readout: boolean } }) => <Row>
        <ThemeToggle />
        {() => (p.values.readout ? [<Out label="tercih" value={() => theme()} />, <Out label="etkin" value={() => { theme(); return resolvedTheme() }} />] : null)}
        <RestoreLook />
      </Row>,
    },
    TimeInput: {
      code: `<TimeInput value={time} min="09:00" max="18:00" step={900} />   // "HH:MM", 15-minute steps`,
      play: { options: [{ key: "step", label: "Adım", default: 900, options: [{ value: 60, label: "1 dk" }, { value: 900, label: "15 dk" }, { value: 1, label: "saniye" }] }, { key: "hours", label: "Mesai saatleri", default: true }] },
      run: (p: { values: { step: number; hours: boolean } }) => {
        const time = signal("10:30")
        const inHours = () => !p.values.hours || (time() >= "09:00" && time() <= "18:00")
        return <div class="sc-stack">
          {() => { const { step, hours } = p.values; return <TimeInput aria-label="Toplantı saati" value={time} step={step} min={hours ? "09:00" : undefined} max={hours ? "18:00" : undefined} invalid={!inHours()} /> }}
          <Row><Out label="değer" value={() => time() || "—"} /><Out label="mesai içinde" value={() => (inHours() ? "evet" : "hayır")} /><Button size="sm" variant="ghost" onClick={() => time.set("20:00")}>20:00</Button></Row>
        </div>
      },
    },
  },
})
