// API examples of hadi-march/ui, names "ButtonGroup" … "ChoicePicker" (code-point order; the subpath is split over several
// files by name range). Layout and rules: tools/api-examples.js. Each `run` is a small live demo of its `code`;
// components have a Playground.
import { signal, computed } from "hadi-march"
import {
  Button, ButtonGroup, Calendar, Card, Carousel, ChatBubble, ChatComposer, ChatThread, Checkbox, CheckboxGroup, Chip,
  ChoicePicker, action,
} from "hadi-march/ui"
import { plus, zap } from "hadi-march/icons"
import { examples } from "./types.ts"
import { Out, Log, Row } from "./_kit.tsx"
import "./ui-a.css"
export { default as SIG } from "./ui-a2.sig.gen.ts"

const now = () => new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
const ago = (min: number) => Date.now() - min * 60_000
/** A log signal and a writer that keeps its last `max` lines. */
const logOf = (max = 4) => { const lines = signal<string[]>([]); return [lines, (s: string) => lines.update((l) => [...l, `${now()} ${s}`].slice(-max))] as const }
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
const addDays = (n: number) => iso(new Date(Date.now() + n * 86_400_000))

export default examples({
  "hadi-march/ui": {
    ButtonGroup: {
      code: `<ButtonGroup label="Hizalama" attached>
  <Button aria-pressed={align() === "start"} onClick={() => align.set("start")}>Sol</Button>
  <Button aria-pressed={align() === "center"} onClick={() => align.set("center")}>Orta</Button>
</ButtonGroup>`,
      play: { options: [{ key: "attached", label: "Bitişik", default: true }] },
      run: (p: { values: { attached: boolean } }) => {
        const align = signal<"start" | "center" | "end">("start")
        const OPTS = [["start", "Sol"], ["center", "Orta"], ["end", "Sağ"]] as const
        return <div class="sc-ex-stack">
          {() => <ButtonGroup label="Hizalama" attached={p.values.attached}>
            {OPTS.map(([v, l]) => <Button variant={() => (align() === v ? "primary" : "secondary")} aria-pressed={() => String(align() === v)} onClick={() => align.set(v)}>{l}</Button>)}
          </ButtonGroup>}
          <p class="sc-ex-ui-a-align" style={() => `text-align: ${align()}`}>HADİ bülteni · Kasım</p>
        </div>
      },
    },
    Calendar: {
      code: `<Calendar value={day} min={today} isDisabled={(d) => isWeekend(d)} onPick={(d) => book(d)} />`,
      play: { options: [
        { key: "weekends", label: "Hafta sonu kapalı", default: true },
        { key: "firstDay", label: "Hafta başı", default: 1, options: [{ value: 1, label: "Pazartesi" }, { value: 0, label: "Pazar" }] },
      ] },
      run: (p: { values: { weekends: boolean; firstDay: number } }) => {
        const day = signal<string | null>(null)
        const [lines, log] = logOf(2)
        const weekend = (d: string) => { const w = new Date(`${d}T12:00`).getDay(); return w === 0 || w === 6 }
        return <div class="sc-ex-stack">
          {() => { const { weekends, firstDay } = p.values; return <Calendar value={day} min={addDays(0)} firstDay={firstDay} isDisabled={weekends ? weekend : undefined} onPick={(d) => log(`randevu: ${d}`)} /> }}
          <Row><Out label="value" value={() => day() ?? "—"} /></Row>
          <Log lines={lines} />
        </div>
      },
    },
    Carousel: {
      code: `<Carousel label="Öne çıkanlar" perView={2}>
  {products.map((p) => <Card title={p.name}>{p.price}</Card>)}
</Carousel>`,
      play: { options: [{ key: "perView", label: "Görünen", default: 2, options: [1, 2, 3] }] },
      run: (p: { values: { perView: 1 | 2 | 3 } }) => {
        const SLIDES = [["Başlangıç", "₺0"], ["Ekip", "₺290"], ["Pro", "₺590"], ["Kurumsal", "Teklif"], ["Eğitim", "₺90"]]
        const pick = signal("—")
        return <div class="sc-ex-stack">
          {() => <Carousel label="Planlar" perView={p.values.perView}>
            {SLIDES.map(([n, price], i) => <div class="sc-ex-ui-a-slide" data-hm-color={(["brand-orange", "brand-blue", "brand-green", "brand-purple", "brand-pink"] as const)[i]}>
              <strong>{n}</strong><span>{price}</span><Button size="sm" onClick={() => pick.set(n!)}>Seç</Button>
            </div>)}
          </Carousel>}
          <Out label="seçilen plan" value={pick} />
        </div>
      },
    },
    ChatBubble: {
      code: `<ChatBubble text="Taslak hazır, bakar mısın?" sender="Ada" senderColor={2} time={msg.at}
  edited reactions={reactions()} onReact={toggle} onReactMenu={(el) => openPicker(el)} />`,
      play: { options: [
        { key: "mine", label: "Benim mesajım", default: false },
        { key: "position", label: "Dizideki yeri", default: "single", options: [{ value: "single", label: "tek" }, { value: "first", label: "ilk" }, { value: "last", label: "son" }] },
        { key: "edited", label: "Düzenlendi", default: true },
      ] },
      run: (p: { values: { mine: boolean; position: "single" | "first" | "last"; edited: boolean } }) => {
        const reactions = signal([{ emoji: "👍", count: 2, mine: false }, { emoji: "🎉", count: 1, mine: true }])
        const toggle = (emoji: string) => reactions.update((l) => {
          const r = l.find((x) => x.emoji === emoji)
          if (!r) return [...l, { emoji, count: 1, mine: true }]
          return l.map((x) => (x === r ? { ...x, mine: !x.mine, count: x.count + (x.mine ? -1 : 1) } : x)).filter((x) => x.count > 0)
        })
        const [lines, log] = logOf(2)
        return <div class="sc-stack sc-ex-ui-a-chat">
          <ChatBubble text="Taslak hazır, bakar mısın?" mine={() => p.values.mine} position={() => p.values.position} edited={() => p.values.edited}
            sender={() => (p.values.mine ? undefined : "Ada")} senderColor={2} time={ago(4)} status="read" reactions={reactions}
            onReact={toggle} onReply={() => log("yanıtla")} />
          <Row><Button size="sm" onClick={() => toggle("❤️")}>❤️ ekle / kaldır</Button></Row>
          <Log lines={lines} />
        </div>
      },
    },
    ChatComposer: {
      code: `<ChatComposer placeholder="Ekibe yaz…" emoji={false} disabled={offline()}
  onSend={(text) => post(text)} onTyping={() => channel.send("typing")} />`,
      play: { options: [
        { key: "emoji", label: "Emoji paneli", default: true },
        { key: "disabled", label: "Çevrim dışı", default: false },
        { key: "voice", label: "Sesli mesaj", default: false },
      ] },
      run: (p: { values: { emoji: boolean; disabled: boolean; voice: boolean } }) => {
        const [lines, log] = logOf(3)
        const typing = signal(0)
        return <div class="sc-stack sc-ex-ui-a-chat">
          <Log lines={lines} label="Gönderilenler" />
          {() => { const voice = p.values.voice; return <ChatComposer placeholder="Ekibe yaz…" emoji={() => p.values.emoji} disabled={() => p.values.disabled}
            onSend={(text) => log(`gönderildi: ${text}`)} onTyping={() => typing.update((x) => x + 1)}
            onVoice={voice ? (ms) => log(`ses kaydı: ${(ms / 1000).toFixed(1)} sn`) : undefined} /> }}
          <Out label="yazıyor sinyali" value={typing} />
        </div>
      },
    },
    ChatThread: {
      code: `<ChatThread label="HADİ destek" messages={messages} typing={typing}
  onRetry={(m) => resend(m)} runMinutes={5} />`,
      play: { options: [
        { key: "group", label: "Grup sohbeti", default: false },
        { key: "typing", label: "Yazıyor göstergesi", default: true },
      ] },
      run: (p: { values: { group: boolean; typing: boolean } }) => {
        type Msg = { id: string; text: string; mine?: boolean; time: number; status?: "sending" | "sent" | "delivered" | "read" | "failed"; senderId?: string; senderName?: string }
        const messages = signal<Msg[]>([
          { id: "1", text: "Merhaba, siparişim nerede?", mine: true, time: ago(9), status: "read" },
          { id: "2", text: "Kargoya verildi, yarın elinizde.", time: ago(8), senderId: "s", senderName: "HADİ Destek" },
          { id: "3", text: "Harika, teşekkürler!", mine: true, time: ago(2), status: "failed" },
        ])
        let id = 4
        const retry = (m: { id: string }) => messages.update((l) => l.map((x) => (x.id === m.id ? { ...x, status: "read" as const } : x)))
        return <div class="sc-stack sc-ex-ui-a-thread">
          <ChatThread label="HADİ destek" messages={messages} group={() => p.values.group} typing={() => (p.values.typing ? ["HADİ Destek"] : [])} onRetry={retry} runMinutes={5} />
          <Row>
            <Button size="sm" onClick={() => messages.update((l) => [...l, { id: String(id++), text: "Başka bir sorum var.", mine: true, time: Date.now(), status: "sent" }])}>Mesaj ekle</Button>
            <span class="hm-muted">Gitmeyen mesajda "yeniden dene"ye basın.</span>
          </Row>
        </div>
      },
    },
    Checkbox: {
      code: `<Checkbox bind:value={terms} label="Koşulları kabul ediyorum" hint="Zorunlu" />
<Checkbox variant="toggle" value={notify} onChange={notify.set}>Bildirimler</Checkbox>`,
      play: { options: [
        { key: "variant", label: "Görünüm", default: "classic", options: ["classic", "soft", "chip", "card", "toggle"] },
        { key: "size", label: "Boyut", default: "md", options: ["sm", "md", "lg"] },
      ] },
      run: (p: { values: { variant: "classic" | "soft" | "chip" | "card" | "toggle"; size: "sm" | "md" | "lg" } }) => {
        const items = [signal(true), signal(false), signal(false)]
        const all = computed(() => items.every((s) => s()))
        const some = computed(() => items.some((s) => s()) && !all())
        const LABELS = ["E-posta", "SMS", "Anlık bildirim"]
        return () => { const { variant, size } = p.values; return <div class="sc-ex-stack">
          <Checkbox variant={variant} size={size} value={all()} indeterminate={some()} onChange={(v) => items.forEach((s) => s.set(v))} label="Tümü" hint={() => `${items.filter((s) => s()).length} / 3 seçili`} />
          <div class="sc-ex-ui-a-indent">{items.map((s, i) => <Checkbox variant={variant} size={size} value={s} label={LABELS[i]} />)}</div>
        </div> }
      },
    },
    CheckboxGroup: {
      code: `<CheckboxGroup bind:value={days} inline variant="chip" colors="brand"
  options={[{ value: "mon", label: "Pzt" }, { value: "tue", label: "Sal" }, …]} />`,
      play: { options: [
        { key: "variant", label: "Görünüm", default: "chip", options: ["classic", "chip", "card"] },
        { key: "inline", label: "Yan yana", default: true },
        { key: "brand", label: "HADİ renkleri", default: false },
      ] },
      run: (p: { values: { variant: "classic" | "chip" | "card"; inline: boolean; brand: boolean } }) => {
        const days = signal<string[]>(["mon", "wed"])
        const OPTS = [{ value: "mon", label: "Pzt" }, { value: "tue", label: "Sal" }, { value: "wed", label: "Çar" }, { value: "thu", label: "Per" }, { value: "fri", label: "Cum", hint: "yarım gün" }]
        return <div class="sc-ex-stack">
          {() => { const { variant, inline, brand } = p.values; return <CheckboxGroup value={days} variant={variant} inline={inline} colors={brand ? "brand" : undefined} options={OPTS} aria-label="Çalışma günleri" /> }}
          <Out label="value" value={() => JSON.stringify(days())} />
        </div>
      },
    },
    Chip: {
      code: `{tags().map((t) => <Chip size="sm" onRemove={() => tags.set(tags().filter((x) => x !== t))}>{t}</Chip>)}`,
      play: { options: [
        { key: "tone", label: "Ton", default: "primary", options: ["neutral", "primary", "success", "info"] },
        { key: "size", label: "Boyut", default: "sm", options: ["sm", "md"] },
      ] },
      run: (p: { values: { tone: "neutral" | "primary" | "success" | "info"; size: "sm" | "md" } }) => {
        const tags = signal(["tasarım", "ürün", "hadi"])
        const draft = signal("")
        const add = (e: Event) => { e.preventDefault(); const v = draft().trim(); if (v && !tags().includes(v)) tags.update((l) => [...l, v]); draft.set("") }
        return <div class="sc-ex-stack">
          <Row>{() => tags().map((t) => <Chip tone={p.values.tone} size={p.values.size} onRemove={() => tags.update((l) => l.filter((x) => x !== t))}>{t}</Chip>)}</Row>
          <form class="sc-row" onSubmit={add}>
            <input class="hm-input sc-ex-ui-a-narrow" placeholder="Etiket ekle" aria-label="Etiket" value={draft} onInput={(e: Event) => draft.set((e.target as HTMLInputElement).value)} />
            <Button type="submit" size="sm" icon={plus}>Ekle</Button>
          </form>
        </div>
      },
    },
    ChoicePicker: {
      code: `<ChoicePicker bind:value={plan} options={["Aylık", "Yıllık"]} />            // segmented
<ChoicePicker bind:value={city} options={cities} />                          // 10+ → combobox`,
      play: { options: [
        { key: "count", label: "Seçenek sayısı", default: 3, options: [3, 8, 12] },
        { key: "kind", label: "Tür", default: "auto", options: [{ value: "auto", label: "kendiliğinden" }, { value: "segmented", label: "segmented" }, { value: "chips", label: "chips" }, { value: "combobox", label: "combobox" }] },
      ] },
      run: (p: { values: { count: number; kind: "auto" | "segmented" | "chips" | "combobox" } }) => {
        const CITIES = ["Ankara", "İstanbul", "İzmir", "Bursa", "Antalya", "Konya", "Adana", "Trabzon", "Eskişehir", "Samsun", "Kayseri", "Mersin"]
        const city = signal<string | null>("Ankara")
        return <div class="sc-ex-stack">
          {() => { const { count, kind } = p.values; return <ChoicePicker value={city} kind={kind} options={CITIES.slice(0, count)} aria-label="Şehir" /> }}
          <Out label="value" value={() => city() ?? "—"} />
        </div>
      },
    },
  },
})
