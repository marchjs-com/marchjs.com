// API examples of hadi-march/ui, names "ACCENT_CHOICES" … "Button" (code-point order; the subpath is split over several
// files by name range). Layout and rules: tools/api-examples.js. Each `run` is a small live demo of its `code`;
// components have a Playground.
import { signal } from "hadi-march"
import {
  ACCENT_CHOICES, AccentPicker, Accordion, ActionButton, ActivityBar, Alert, AppShell, AuthLayout, Avatar,
  AvatarGroup, Badge, BottomNav, Brand, Breadcrumbs, Button, action, setAccent, accent, toast,
} from "hadi-march/ui"
import { home, compass, user, files, folder, users, plus, bell, star, shieldCheck, mail, download, trash, sparkles, lock, zap } from "hadi-march/icons"
import { examples } from "./types.ts"
import { Out, Log, Row } from "./_kit.tsx"
import "./ui-a.css"
export { default as SIG } from "./ui-a.sig.gen.ts"

const now = () => new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
/** A log signal and a writer that keeps its last `max` lines. */
const logOf = (max = 4) => { const lines = signal<string[]>([]); return [lines, (s: string) => lines.update((l) => [...l, `${now()} ${s}`].slice(-max))] as const }

export default examples({
  "hadi-march/ui": {
    ACCENT_CHOICES: {
      code: `ACCENT_CHOICES   // ["primary", "brand-orange", "brand-blue", … "neutral"]
<AccentPicker choices={ACCENT_CHOICES.filter((c) => c.startsWith("brand-"))} />`,
      run: () => {
        const pick = signal<string>(ACCENT_CHOICES[1]!)
        return <div class="sc-ex-stack">
          <div class="sc-ex-ui-a-swatches" role="radiogroup" aria-label="Vurgu seçenekleri">
            {ACCENT_CHOICES.map((c) => <button type="button" role="radio" class="sc-ex-ui-a-swatch" data-hm-color={c} aria-checked={() => String(pick() === c)} onClick={() => pick.set(c)}><span aria-hidden="true" />{c}</button>)}
          </div>
          <Row><Out label="seçenek sayısı" value={ACCENT_CHOICES.length} /><Out label="seçili" value={pick} /></Row>
          {() => <Row><Button variant="primary" color={pick() as never}>Kaydet</Button><Badge color={pick() as never} tone="primary">Yeni</Badge></Row>}
        </div>
      },
    },
    AccentPicker: {
      code: `<Toolbar>
  <ThemePicker />
  <AccentPicker label="Vurgu" placement="bottom-start" />
</Toolbar>`,
      play: { options: [
        { key: "set", label: "Seçenekler", default: "all", options: [{ value: "all", label: "hepsi" }, { value: "brand", label: "HADİ renkleri" }, { value: "semantic", label: "anlamsal" }] },
        { key: "placement", label: "Menü yönü", default: "bottom-start", options: [{ value: "bottom-start", label: "alt, baştan" }, { value: "bottom-end", label: "alt, sondan" }] },
      ] },
      run: (p: { values: { set: string; placement: "bottom-start" | "bottom-end" } }) => {
        const choices = () => ACCENT_CHOICES.filter((c) => p.values.set === "all" || (p.values.set === "brand" ? c === "primary" || c.startsWith("brand-") : !c.startsWith("brand-")))
        return <div class="sc-ex-stack">
          <Row>
            {() => <AccentPicker label="Vurgu" choices={choices()} placement={p.values.placement} />}
            <Button variant="ghost" disabled={() => accent() === "primary"} onClick={() => setAccent("primary")}>Temaya dön</Button>
          </Row>
          <Row><Out label="accent()" value={accent} /><Button variant="primary">Birincil düğme</Button><Badge tone="primary">vurgu</Badge></Row>
        </div>
      },
    },
    Accordion: {
      code: `<Accordion variant="contained" items={[
  { id: "plan", icon: star, title: "Plan", subtitle: "Pro", content: <PlanInfo /> },
  { id: "billing", icon: mail, title: "Fatura", content: <Billing /> },
]} open={["plan"]} />`,
      play: { options: [
        { key: "multiple", label: "Birden çok açık", default: false },
        { key: "variant", label: "Görünüm", default: "contained", options: [{ value: "separated", label: "ayrık" }, { value: "contained", label: "çerçeveli" }] },
        { key: "locked", label: "Son bölüm kilitli", default: true },
      ] },
      run: (p: { values: { multiple: boolean; variant: "separated" | "contained"; locked: boolean } }) => () => {
        const { multiple, variant, locked } = p.values
        return <Accordion multiple={multiple} variant={variant} open={["plan"]} items={[
          { id: "plan", icon: star, title: "Plan", subtitle: "Pro · aylık", content: <p>Acme ekibi 12 koltuk kullanıyor; sınırsız proje.</p> },
          { id: "billing", icon: mail, title: "Fatura", subtitle: "ayın 1'i", content: <p>Faturalar fatura@acme.example adresine gider.</p> },
          { id: "danger", icon: lock, title: "Hesabı kapat", disabled: locked, content: <p>Bu işlem geri alınamaz.</p> },
        ]} />
      },
    },
    ActionButton: {
      code: `const archive = action("Arşivle", (doc) => api.archive(doc.id), {
  confirm: (doc) => \`\${doc.name} arşivlensin mi?\`, success: "Arşivlendi", icon: download,
})
<ActionButton action={archive} args={[doc]} size="sm" />`,
      play: { options: [
        { key: "confirm", label: "Onay sor", default: true },
        { key: "danger", label: "Tehlikeli", default: false },
        { key: "iconOnly", label: "Yalnız ikon", default: false },
      ] },
      run: (p: { values: { confirm: boolean; danger: boolean; iconOnly: boolean } }) => {
        const [lines, log] = logOf()
        const done = signal(0)
        const docs = [{ name: "Teklif.pdf" }, { name: "Sözleşme.docx" }]
        return <div class="sc-ex-stack">
          {() => {
            const { confirm, danger, iconOnly } = p.values
            const run = action("Arşivle", (doc: { name: string }) => new Promise<string>((r) => setTimeout(() => r(doc.name), 700)), {
              confirm: confirm ? (doc: { name: string }) => `${doc.name} arşivlensin mi?` : undefined, danger, icon: danger ? trash : download,
              success: (n: string) => `${n} arşivlendi`, disabled: () => done() >= 3,
            })
            return <Row>{docs.map((d) => <ActionButton action={run} args={[d]} size="sm" iconOnly={iconOnly} onDone={(n) => { done.update((x) => x + 1); log(`bitti: ${n}`) }} />)}</Row>
          }}
          <Row><Out label="çalıştı" value={() => `${done()} / 3`} /><Button variant="ghost" size="sm" onClick={() => done.set(0)}>Sıfırla</Button></Row>
          <Log lines={lines} />
        </div>
      },
    },
    ActivityBar: {
      code: `<ActivityBar orientation="horizontal" collapsible={false} value={view()} onChange={view.set} items={[
  { id: "inbox", label: "Gelen", icon: mail, badge: () => unread() },
  { id: "files", label: "Dosyalar", icon: files },
]} />`,
      play: { options: [
        { key: "orientation", label: "Yön", default: "horizontal", options: [{ value: "vertical", label: "dikey" }, { value: "horizontal", label: "yatay" }] },
        { key: "collapsible", label: "Yeniden seçince kapat", default: true },
      ] },
      run: (p: { values: { orientation: "vertical" | "horizontal"; collapsible: boolean } }) => {
        const view = signal<string | null>("inbox"), unread = signal(3)
        const items = [
          { id: "inbox", label: "Gelen kutusu", icon: mail, badge: () => unread() },
          { id: "files", label: "Dosyalar", icon: files },
          { id: "people", label: "Kişiler", icon: users },
          { id: "new", label: "Yeni ileti", icon: plus, position: "end" as const, onSelect: () => unread.update((x) => x + 1) },
        ]
        const TITLE: Record<string, string> = { inbox: "Gelen kutusu", files: "Dosyalar", people: "Kişiler" }
        return () => <div class={`sc-ex-ui-a-ab sc-ex-ui-a-ab-${p.values.orientation}`}>
          <ActivityBar items={items} value={view} onChange={view.set} orientation={p.values.orientation} collapsible={p.values.collapsible} controls="sc-ex-ui-a-ab-view" label="Görünümler" />
          <div id="sc-ex-ui-a-ab-view" class="sc-ex-ui-a-ab-view">
            {() => (view() ? <><strong>{TITLE[view()!]}</strong>{view() === "inbox" ? <Button size="sm" variant="ghost" onClick={() => unread.set(0)}>Tümünü okundu say</Button> : null}</> : <span class="hm-muted">Yan görünüm kapalı</span>)}
          </div>
        </div>
      },
    },
    Alert: {
      code: `<Alert tone="warn" title="Depolama dolmak üzere" dismissable onDismiss={snooze}>
  2 GB alanın %92'si kullanılıyor.
</Alert>`,
      play: { options: [
        { key: "tone", label: "Ton", default: "warn", options: [{ value: "info", label: "bilgi" }, { value: "success", label: "başarı" }, { value: "warn", label: "uyarı" }, { value: "danger", label: "hata" }] },
        { key: "title", label: "Başlık", default: true },
        { key: "dismissable", label: "Kapatılabilir", default: true },
      ] },
      run: (p: { values: { tone: "info" | "success" | "warn" | "danger"; title: boolean; dismissable: boolean } }) => {
        const n = signal(0)
        const TEXT = { info: "Yeni sürüm hazır.", success: "Yedekleme tamamlandı.", warn: "2 GB alanın %92'si kullanılıyor.", danger: "Ödeme alınamadı." }
        return <div class="sc-ex-stack">
          {() => { n(); const { tone, title, dismissable } = p.values; return <Alert tone={tone} title={title ? "Acme hesabı" : undefined} dismissable={dismissable} onDismiss={() => toast("Uyarı kapatıldı")}>{TEXT[tone]}</Alert> }}
          <Button variant="ghost" size="sm" onClick={() => n.update((x) => x + 1)}>Yeniden göster</Button>
        </div>
      },
    },
    AppShell: {
      code: `<AppShell mainId="content" nav={<NavMenu items={items} />}
  header={<><h1>Raporlar</h1><Spacer /><UserMenu name="Ada" /></>}>
  <Outlet />
</AppShell>`,
      play: { options: [
        { key: "header", label: "Üst çubuk", default: true },
        { key: "nav", label: "Kenar çubuğu", default: true },
      ] },
      run: (p: { values: { header: boolean; nav: boolean } }) => {
        const page = signal("Raporlar")
        const PAGES = ["Raporlar", "Müşteriler", "Ayarlar"]
        return <div class="sc-ex-ui-a-frame">
          {() => { const { header, nav } = p.values; return <AppShell mainId="sc-ex-ui-a-main"
            nav={nav ? <nav class="sc-ex-ui-a-nav" aria-label="Acme">{PAGES.map((x) => <button type="button" aria-current={() => (page() === x ? "page" : null)} onClick={() => page.set(x)}>{x}</button>)}</nav> : null}
            header={header ? <div class="sc-ex-ui-a-head"><strong>{page}</strong><Avatar name="Ada Yılmaz" size="sm" /></div> : null}>
            <div class="sc-ex-ui-a-page"><p>{() => `${page()} sayfası`}</p><p class="hm-muted">Ana alan kayar; üst çubuk yerinde kalır.</p></div>
          </AppShell> }}
        </div>
      },
    },
    AuthLayout: {
      code: `<AuthLayout brand={<Brand name="Acme" mark={sparkles} />} title="Giriş yap" subtitle="Hesabınıza devam edin"
  aside={{ headline: "Ekibiniz tek yerde", points: [{ icon: shieldCheck, title: "Güvenli" }] }}>
  <LoginForm />
</AuthLayout>`,
      play: { options: [
        { key: "aside", label: "Tanıtım paneli", default: true },
        { key: "footer", label: "Alt bilgi", default: true },
      ] },
      run: (p: { values: { aside: boolean; footer: boolean } }) => {
        const email = signal(""), sent = signal(false)
        return <div class="sc-ex-ui-a-frame sc-ex-ui-a-auth">
          {() => { const { aside, footer } = p.values; return <AuthLayout brand={<Brand name="Acme" mark={sparkles} />} title="Giriş yap" subtitle="Bağlantıyı e-postanıza gönderelim"
            aside={aside ? { headline: "Ekibiniz tek yerde", text: "Projeler, belgeler ve sohbet.", points: [{ icon: shieldCheck, title: "Güvenli", text: "Parolasız giriş" }, { icon: zap, title: "Hızlı", text: "Saniyeler içinde" }] } : undefined}
            footer={footer ? <span class="hm-muted">Hesabınız yok mu? Kaydolun.</span> : undefined}>
            {() => (sent() ? <Alert tone="success">Bağlantı {email() || "adresinize"} gönderildi.</Alert> : <form class="sc-ex-stack" onSubmit={(e: Event) => { e.preventDefault(); sent.set(true) }}>
              <input class="hm-input" type="email" placeholder="ada@acme.example" aria-label="E-posta" value={email} onInput={(e: Event) => email.set((e.target as HTMLInputElement).value)} />
              <Button type="submit" variant="primary" block>Bağlantı gönder</Button>
            </form>)}
          </AuthLayout> }}
        </div>
      },
    },
    Avatar: {
      code: `<Avatar name="Ada Yılmaz" />                       // "AY", renk addan
<Avatar name="Linus" src={user.photo} size="lg" />  // görsel yoksa baş harfler`,
      play: { options: [
        { key: "size", label: "Boyut", default: "md", options: ["sm", "md", "lg"] },
        { key: "photo", label: "Bozuk görsel adresi", default: false },
      ] },
      run: (p: { values: { size: "sm" | "md" | "lg"; photo: boolean } }) => {
        const name = signal("Ada Yılmaz")
        return <div class="sc-ex-stack">
          <Row>
            <Avatar name={name} size={() => p.values.size} src={() => (p.values.photo ? "/yok/acme-avatar.png" : null)} />
            {["Grace Hopper", "Linus", "Acme Destek"].map((n) => <Avatar name={n} size={() => p.values.size} />)}
          </Row>
          <input class="hm-input" aria-label="Ad" value={name} onInput={(e: Event) => name.set((e.target as HTMLInputElement).value)} />
        </div>
      },
    },
    AvatarGroup: {
      code: `<AvatarGroup names={members.map((m) => ({ name: m.name, src: m.photo }))} max={3} size="md" />`,
      play: { options: [
        { key: "max", label: "En çok", default: 3, options: [2, 3, 5] },
        { key: "size", label: "Boyut", default: "sm", options: ["sm", "md", "lg"] },
      ] },
      run: (p: { values: { max: number; size: "sm" | "md" | "lg" } }) => {
        const ALL = ["Ada Yılmaz", "Grace Hopper", "Linus Torvalds", "Margaret Hamilton", "Alan Kay", "Barbara Liskov", "Ken Thompson"]
        const names = signal(ALL.slice(0, 5))
        return <div class="sc-ex-stack">
          {() => <AvatarGroup names={names} max={p.values.max} size={p.values.size} />}
          <Row>
            <Button size="sm" disabled={() => names().length >= ALL.length} onClick={() => names.update((l) => ALL.slice(0, l.length + 1))}>Üye ekle</Button>
            <Button size="sm" variant="ghost" disabled={() => !names().length} onClick={() => names.update((l) => l.slice(0, -1))}>Çıkar</Button>
            <Out label="üye" value={() => names().length} />
          </Row>
        </div>
      },
    },
    Badge: {
      code: `<Badge tone="success">Etkin</Badge>
<Badge count={unread} max={9} label="okunmamış" />   // 12 → "9+", 0 → gizli
<Badge dot tone="danger" />`,
      play: { options: [
        { key: "tone", label: "Ton", default: "primary", options: ["neutral", "primary", "success", "warn", "danger", "info"] },
        { key: "showZero", label: "0'ı göster", default: false },
      ] },
      run: (p: { values: { tone: "neutral" | "primary" | "success" | "warn" | "danger" | "info"; showZero: boolean } }) => {
        const n = signal(4)
        return <div class="sc-ex-stack">
          {() => { const { tone, showZero } = p.values; return <Row>
            <Badge tone={tone}>Etkin</Badge>
            <span class="sc-ex-ui-a-bell"><Button size="sm" icon={bell} aria-label="Bildirimler" /><Badge tone={tone} count={n} max={9} showZero={showZero} label="okunmamış" /></span>
            <Badge dot tone={tone} />
          </Row> }}
          <Row>
            <Button size="sm" onClick={() => n.update((x) => x + 3)}>+3</Button>
            <Button size="sm" variant="ghost" onClick={() => n.set(0)}>Sıfırla</Button>
            <Out label="count" value={n} />
          </Row>
        </div>
      },
    },
    BottomNav: {
      code: `<BottomNav variant="flat" labels={false} value={tab()} onChange={tab.set} items={[
  { id: "home", label: "Akış", icon: home },
  { id: "inbox", label: "Gelen", icon: mail, badge: () => unread() },
]} />`,
      play: { options: [
        { key: "variant", label: "Görünüm", default: "flat", options: [{ value: "floating", label: "yüzen" }, { value: "flat", label: "düz" }] },
        { key: "labels", label: "Etiketler", default: true },
        { key: "create", label: "Oluştur düğmesi", default: false },
      ] },
      run: (p: { values: { variant: "floating" | "flat"; labels: boolean; create: boolean } }) => {
        const tab = signal("home"), unread = signal(2)
        const [lines, log] = logOf(3)
        const items = [
          { id: "home", label: "Akış", icon: home },
          { id: "explore", label: "Keşfet", icon: compass },
          { id: "inbox", label: "Gelen", icon: mail, badge: () => unread() },
          { id: "me", label: "Profil", icon: user },
        ]
        return <div class="sc-ex-ui-a-phone">
          <div class="sc-ex-ui-a-screen"><Log lines={lines} label="Sekme günlüğü" /></div>
          {() => <BottomNav items={items} value={tab} onChange={(id) => { tab.set(id); if (id === "inbox") unread.set(0); log(`sekme: ${id}`) }}
            variant={p.values.variant} labels={p.values.labels} onCreate={p.values.create ? () => log("oluştur") : undefined} label="Acme" />}
        </div>
      },
    },
    Brand: {
      code: `<Brand mark={sparkles} name="Acme" sub="Yönetim" href="/" size="lg" />`,
      play: { options: [
        { key: "size", label: "Boyut", default: "md", options: ["md", "lg"] },
        { key: "sub", label: "Alt satır", default: "Yönetim", options: [{ value: "", label: "yok" }, { value: "Yönetim", label: "Yönetim" }, { value: "Test ortamı", label: "Test ortamı" }] },
        { key: "mark", label: "İşaret", default: "icon", options: [{ value: "icon", label: "ikon" }, { value: "text", label: "metin" }] },
      ] },
      run: (p: { values: { size: "md" | "lg"; sub: string; mark: string } }) => () => {
        const { size, sub, mark } = p.values
        return <Row><Brand mark={mark === "icon" ? sparkles : "A"} name="Acme" sub={sub || undefined} size={size} /></Row>
      },
    },
    Breadcrumbs: {
      code: `<Breadcrumbs label="Konum" items={() => path().map((p, i) => ({
  id: p, label: p, icon: i ? undefined : home, onSelect: () => path.set(path().slice(0, i + 1)),
}))} />`,
      play: { options: [{ key: "icons", label: "Klasör ikonları", default: true }] },
      run: (p: { values: { icons: boolean } }) => {
        const path = signal(["Acme", "Pazarlama", "2026", "Kampanya"])
        const items = () => path().map((x, i) => ({ id: `${i}-${x}`, label: x, icon: p.values.icons ? (i ? folder : home) : undefined, onSelect: () => path.set(path().slice(0, i + 1)) }))
        return <div class="sc-ex-stack">
          <Breadcrumbs label="Konum" items={items} />
          <Row>
            <Button size="sm" icon={plus} onClick={() => path.update((l) => [...l, ["Taslaklar", "Görseller", "Arşiv"][l.length % 3]!])}>Alt klasöre gir</Button>
            <Out label="derinlik" value={() => path().length} />
          </Row>
        </div>
      },
    },
    Button: {
      code: `<Button variant="primary" icon={download} loading={saving()} onClick={save}>Kaydet</Button>
<Button variant="ghost" size="sm" href="/docs">Belgeler</Button>`,
      play: { options: [
        { key: "variant", label: "Tür", default: "primary", options: ["primary", "secondary", "ghost", "danger", "dark"] },
        { key: "size", label: "Boyut", default: "md", options: ["sm", "md", "lg"] },
        { key: "icon", label: "İkon", default: true },
        { key: "block", label: "Tam genişlik", default: false },
      ] },
      run: (p: { values: { variant: "primary" | "secondary" | "ghost" | "danger" | "dark"; size: "sm" | "md" | "lg"; icon: boolean; block: boolean } }) => {
        const saving = signal(false), saved = signal(0)
        const save = () => { saving.set(true); setTimeout(() => { saving.set(false); saved.update((x) => x + 1) }, 900) }
        return <div class="sc-ex-stack">
          {() => { const { icon, block } = p.values; return <Button variant={() => p.values.variant} size={() => p.values.size} icon={icon ? download : undefined} block={block} loading={saving} onClick={save}>Kaydet</Button> }}
          <Out label="kaydedildi" value={saved} />
        </div>
      },
    },
  },
})
