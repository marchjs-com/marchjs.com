// API examples of hadi-march/ui, Section … Steps (first part of the fourth alphabetical range of the subpath).
// Layout and rules: tools/api-examples.js. Each `run` is a small live demo of its `code`.
import { signal, onCleanup } from "hadi-march";
import { Section, Segmented, Select, Skeleton, Slider, Spacer, Spinner, Splitter, Stack, StatusBar, Stepper, Steps, Toggle, Button, Badge, type ColorToken } from "hadi-march/ui";
import { examples } from "./types.ts";
import { Out, Row } from "./_kit.tsx";
import { now, tl, COLORS } from "./_ui-d.ts";
import "./ui-d.css";
export { default as SIG } from "./ui-d.sig.gen.ts";

export default examples({
  "hadi-march/ui": {
    Section: {
      code: `<Section title="Güvenlik" description="Oturum ve parola ayarları"
  actions={<Button size="sm">Düzenle</Button>}>
  <Toggle label="İki adımlı doğrulama" />
</Section>`,
      play: { options: [{ key: "description", label: "Açıklama", default: true }, { key: "actions", label: "Eylem düğmesi", default: true }] },
      run: (p: { values: { description: boolean; actions: boolean } }) => {
        const on = signal(false), edits = signal(0)
        return <div class="sc-ex-stack">{() => { const { description, actions } = p.values; return <Section title="Güvenlik" description={description ? "Oturum ve parola ayarları" : undefined}
          actions={actions ? <Button size="sm" onClick={() => edits.update((x) => x + 1)}>Düzenle</Button> : undefined}>
          <Toggle value={on} label="İki adımlı doğrulama" />
        </Section> }}<Row><Out label="doğrulama" value={() => (on() ? "açık" : "kapalı")} /><Out label="düzenle" value={edits} /></Row></div>
      },
    },
    Segmented: {
      code: `const view = signal("list")
<Segmented value={view} options={[{ value: "list", label: "Liste" }, { value: "grid", label: "Izgara" }]} />`,
      play: { options: [{ key: "color", label: "Renk", default: "primary", options: COLORS }, { key: "disabled", label: "Devre dışı", default: false }] },
      run: (p: { values: { color: string; disabled: boolean } }) => {
        const view = signal<string | null>("list")
        const opts = [{ value: "list", label: "Liste" }, { value: "grid", label: "Izgara" }, { value: "board", label: "Pano" }]
        return <div class="sc-ex-stack">
          {() => { const { color, disabled } = p.values; return <Segmented aria-label="Görünüm" value={view} options={opts} color={color as ColorToken} disabled={disabled} /> }}
          <Out label="görünüm" value={view} />
        </div>
      },
    },
    Select: {
      code: `<Select value={city} placeholder="Şehir seçin"
  options={[{ value: 34, label: "İstanbul" }, { value: 6, label: "Ankara" }]} />
// the value keeps its type: 34, not "34"`,
      play: { options: [{ key: "more", label: "Uzun liste", default: false }, { key: "disabled", label: "Devre dışı", default: false }] },
      run: (p: { values: { more: boolean; disabled: boolean } }) => {
        const city = signal<number | null>(null)
        const base = [{ value: 34, label: "İstanbul" }, { value: 6, label: "Ankara" }, { value: 35, label: "İzmir" }]
        const extra = [{ value: 16, label: "Bursa" }, { value: 7, label: "Antalya" }, { value: 61, label: "Trabzon", disabled: true }]
        return <div class="sc-ex-stack">
          <Select aria-label="Şehir" value={city} placeholder="Şehir seçin" options={() => (p.values.more ? [...base, ...extra] : base)} disabled={p.values.disabled} />
          <Row><Out label="plaka" value={() => String(city())} /><Out label="tür" value={() => typeof city()} /></Row>
        </div>
      },
    },
    Skeleton: {
      code: `{() => (user() ? <Profile user={user()} /> : <Skeleton lines={3} />)}
<Skeleton block height="lg" colors="brand" />`,
      play: { options: [{ key: "block", label: "Blok", default: false }, { key: "lines", label: "Satır", default: 3, options: [1, 3, 5], visibleWhen: (v: { block: boolean }) => !v.block }, { key: "colors", label: "Renk", default: "", options: [{ value: "", label: "tema" }, { value: "single", label: "tek" }, { value: "brand", label: "HADİ" }] }] },
      run: (p: { values: { block: boolean; lines: number; colors: string } }) => {
        const ready = signal(false)
        let timer: ReturnType<typeof setTimeout> | undefined
        onCleanup(() => clearTimeout(timer))
        const load = () => { ready.set(false); clearTimeout(timer); timer = setTimeout(() => ready.set(true), 1200) }
        return <div class="sc-ex-stack">
          {() => { const { lines, block, colors } = p.values; return ready() ? <p>HADİ hesabı: 3 proje, 12 üye.</p> : <Skeleton lines={lines} block={block} height="lg" colors={(colors || undefined) as "single"} /> }}
          <Row><Button onClick={load}>Yükle (1,2 sn)</Button><Button variant="ghost" onClick={() => { clearTimeout(timer); ready.set(false) }}>İskelete dön</Button></Row>
        </div>
      },
    },
    Slider: {
      code: `<Slider value={volume} min={0} max={100} step={5} format={(v) => \`%\${v}\`} />`,
      play: { options: [{ key: "step", label: "Adım", default: 5, options: [1, 5, 25] }, { key: "money", label: "Para biçimi", default: false }] },
      run: (p: { values: { step: number; money: boolean } }) => {
        const v = signal(40)
        return <div class="sc-ex-stack">
          <Slider aria-label="Bütçe" value={v} min={0} max={100} step={p.values.step} format={(x: number) => (p.values.money ? tl(x * 100) : `%${x}`)} />
          <Row><Out label="değer" value={v} /><Button variant="ghost" size="sm" onClick={() => v.set(40)}>Sıfırla</Button></Row>
        </div>
      },
    },
    Spacer: {
      code: `<div class="bar">
  <strong>HADİ</strong>
  <Spacer />
  <Button>Giriş</Button>
</div>`,
      play: { options: [{ key: "spacer", label: "Spacer", default: true }] },
      run: (p: { values: { spacer: boolean } }) => {
        const clicks = signal(0)
        return <div class="sc-ex-stack">
          <div class="sc-ex-ui-d-bar"><strong>HADİ</strong>{() => (p.values.spacer ? <Spacer /> : null)}<Button size="sm" variant="ghost">Fiyatlar</Button><Button size="sm" variant="primary" onClick={() => clicks.update((x) => x + 1)}>Giriş</Button></div>
          <Out label="giriş tıklaması" value={clicks} />
        </div>
      },
    },
    Spinner: {
      code: `<Spinner size="sm" label="Kullanıcılar yükleniyor" />
<Spinner colors="brand" />`,
      play: { options: [{ key: "size", label: "Boyut", default: "md", options: ["sm", "md", "lg"] }, { key: "colors", label: "Renk", default: "", options: [{ value: "", label: "tema" }, { value: "brand", label: "HADİ" }, { value: "single", label: "tek" }] }] },
      run: (p: { values: { size: string; colors: string } }) => {
        const busy = signal(true), saved = signal("—")
        let timer: ReturnType<typeof setTimeout> | undefined
        onCleanup(() => clearTimeout(timer))
        const save = () => { busy.set(true); clearTimeout(timer); timer = setTimeout(() => { busy.set(false); saved.set(now()) }, 1500) }
        return <Row>
          {() => { const { size, colors } = p.values; return busy() ? <Spinner size={size as "md"} colors={(colors || undefined) as "brand"} label="Kaydediliyor" /> : <Badge tone="success">Kaydedildi</Badge> }}
          <Button onClick={save}>Kaydet</Button><Out label="son kayıt" value={saved} />
        </Row>
      },
    },
    Splitter: {
      code: `<Splitter start={<FileList />} end={<Preview />} initial={0.3} min={0.2}
  onChange={(share) => save("split", share)} />`,
      play: { options: [{ key: "orientation", label: "Yön", default: "horizontal", options: [{ value: "horizontal", label: "yatay" }, { value: "vertical", label: "dikey" }] }, { key: "min", label: "En küçük pay", default: 0.2, options: [{ value: 0.1, label: "%10" }, { value: 0.2, label: "%20" }, { value: 0.35, label: "%35" }] }] },
      run: (p: { values: { orientation: string; min: number } }) => {
        const share = signal(0.4)
        return <div class="sc-ex-stack">
          {() => { const { orientation, min } = p.values; return <Splitter class="sc-ex-ui-d-split" label="Panel ayırıcı" orientation={orientation as "horizontal"} min={min} initial={0.4}
            value={share} onChange={(s: number) => share.set(s)}
            start={<div class="sc-ex-ui-d-pane"><strong>Dosyalar</strong><span>Tutamacı sürükleyin ya da ok tuşlarını kullanın</span></div>}
            end={<div class="sc-ex-ui-d-pane sc-ex-ui-d-pane-alt"><strong>Önizleme</strong><span>Enter ile ilk paya döner</span></div>} /> }}
          <Row><Out label="ilk pay" value={() => `%${Math.round(share() * 100)}`} /><Button variant="ghost" size="sm" onClick={() => share.set(0.5)}>Ortala</Button></Row>
        </div>
      },
    },
    Stack: {
      code: `<Stack direction="row" gap={2} justify="between" wrap>
  <Badge>Tasarım</Badge><Badge>Yayın</Badge>
</Stack>`,
      play: { options: [{ key: "direction", label: "Yön", default: "row", options: [{ value: "row", label: "satır" }, { value: "column", label: "sütun" }] }, { key: "justify", label: "Yaslama", default: "start", options: [{ value: "start", label: "baş" }, { value: "center", label: "orta" }, { value: "between", label: "arada" }] }, { key: "gap", label: "Boşluk", default: 2, options: [0, 2, 5] }] },
      run: (p: { values: { direction: string; justify: string; gap: number } }) => {
        const tags = signal(["Tasarım", "Geliştirme", "Yayın"])
        const more = ["Destek", "Pazarlama", "Satış"]
        return <div class="sc-ex-stack">
          {() => { const { direction, justify, gap } = p.values; return <Stack class="sc-ex-ui-d-box" direction={direction as "row"} justify={justify as "start"} gap={gap} wrap>
            {tags().map((x, i) => <Badge color={(["brand-orange", "brand-blue", "brand-green", "brand-purple"] as const)[i % 4]}>{x}</Badge>)}
          </Stack> }}
          <Row><Button size="sm" disabled={() => tags().length >= 6} onClick={() => tags.update((l) => [...l, more[l.length - 3]!])}>Etiket ekle</Button><Button size="sm" variant="ghost" onClick={() => tags.set(tags.peek().slice(0, 3))}>Sıfırla</Button></Row>
        </div>
      },
    },
    StatusBar: {
      code: `<StatusBar label="Eşitleme" items={[
  { id: "net", text: () => (online() ? "Çevrim içi" : "Çevrim dışı"), tone: () => (online() ? "success" : "warn") },
  { id: "queue", side: "end", text: () => \`\${pending()} bekleyen\`, onSelect: flush },
]} />`,
      play: { options: [{ key: "online", label: "Çevrim içi", default: true }] },
      run: (p: { values: { online: boolean } }) => {
        const pending = signal(2), synced = signal("—")
        const flush = () => { if (!p.values.online) return; pending.set(0); synced.set(now()) }
        return <div class="sc-ex-stack">
          <StatusBar label="Eşitleme" items={[
            { id: "net", text: () => (p.values.online ? "Çevrim içi" : "Çevrim dışı"), tone: () => (p.values.online ? "success" : "warn") },
            { id: "user", text: "HADİ" },
            { id: "queue", side: "end", text: () => `${pending()} bekleyen`, tone: () => (pending() ? "info" : "neutral"), title: "Şimdi eşitle", onSelect: flush },
          ]} />
          <Row><Button size="sm" onClick={() => pending.update((x) => x + 1)}>Değişiklik yap</Button><Out label="son eşitleme" value={synced} /></Row>
        </div>
      },
    },
    Stepper: {
      code: `<Stepper steps={[{ title: "Sepet" }, { title: "Adres" }, { title: "Ödeme" }]} nav
  current={step} onSelect={(i) => step.set(i)} onFinish={order}
  panels={[<Cart />, <Address />, <Pay />]} />`,
      play: { options: [{ key: "nav", label: "İleri / geri düğmeleri", default: true }, { key: "vertical", label: "Dikey", default: false }] },
      run: (p: { values: { nav: boolean; vertical: boolean } }) => {
        const step = signal(0), done = signal("—")
        const panels = [<p>Sepette 2 ürün: {tl(840)}</p>, <p>Teslimat: HADİ Sok. 12, İstanbul</p>, <p>Kartla ödeme, 3 taksit</p>]
        return <div class="sc-ex-stack">
          {() => { const { nav, vertical } = p.values; return <Stepper steps={[{ title: "Sepet" }, { title: "Adres" }, { title: "Ödeme" }]} current={step} onSelect={(i: number) => step.set(i)}
            panels={panels} nav={nav} vertical={vertical} finishLabel="Siparişi ver" onFinish={() => done.set(now())} /> }}
          <Row><Out label="adım" value={() => step() + 1} /><Out label="sipariş" value={done} /></Row>
        </div>
      },
    },
    Steps: {
      code: `<Steps steps={[{ title: "Hesap" }, { title: "Ekip" }, { title: "Bitti" }]}
  current={step} onSelect={(i) => step.set(i)} m:color="brand-green" />`,
      play: { options: [{ key: "color", label: "Renk", default: "primary", options: COLORS }, { key: "vertical", label: "Dikey", default: false }] },
      run: (p: { values: { color: string; vertical: boolean } }) => {
        const step = signal(1)
        const steps = [{ title: "Hesap", description: "E-posta" }, { title: "Ekip", description: "Üyeler" }, { title: "Bitti" }]
        return <div class="sc-ex-stack">
          {() => { const { color, vertical } = p.values; return <Steps steps={steps} current={step} onSelect={(i: number) => step.set(i)} m:color={color as ColorToken} vertical={vertical} /> }}
          <Row><Button size="sm" variant="ghost" disabled={() => step() === 0} onClick={() => step.update((x) => x - 1)}>Geri</Button><Button size="sm" disabled={() => step() === 2} onClick={() => step.update((x) => x + 1)}>İleri</Button></Row>
        </div>
      },
    },
  },
})
