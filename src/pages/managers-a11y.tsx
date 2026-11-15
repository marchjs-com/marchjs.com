// Accessibility managers, live: LayerManager (stack, top, Escape order, scroll lock), FocusManager (trap / restore,
// focus-visible, roving tabindex), HotkeyManager (scopes, sequences, pause, list), AnnouncerManager (live regions),
// AccessibilityManager (user preferences applied app-wide, page audit) and ShortcutHintManager (hold Alt, "?" help).
import "./managers-a11y.css";
import { onCleanup, effect, signal } from "march";
import { Button, Card, Badge, Field, Alert, Kbd, openDialog } from "march/ui";
import { Segmented, Toggle, TextInput } from "march/forms";
import { layer, type LayerHandle } from "march/managers/layer";
import { focus } from "march/managers/focus";
import { hotkeys } from "march/managers/hotkey";
import { announce, announcer } from "march/managers/announcer";
import { a11y, type A11yIssue } from "march/managers/accessibility";
import { AccessibilitySettings } from "march/managers/accessibility/ui";
import { shortcutHints, disposeShortcutHints } from "march/managers/shortcut-hint";
import { ShortcutHints } from "march/managers/shortcut-hint/ui";
import { Demo } from "../demo.tsx";
import { Hub } from "../hub.tsx";

const yes = (v: boolean) => <Badge tone={v ? "success" : "neutral"} dot>{v ? "evet" : "hayır"}</Badge>

// ------------------------------------------------------------------ Layer
function LayerDemo() {
  let $escape = true
  let $lock = false
  let n = 0
  const KIND_TR: Record<string, string> = { popover: "açılır kutu", menu: "menü", dialog: "diyalog", drawer: "çekmece", toast: "bildirim", fx: "efekt" }
  const where = (l: LayerHandle | null) => (!l ? "" : l.isTop() ? "en üstte" : "sıra " + (l.index() + 1))
  const open = (kind: "popover" | "menu" | "dialog" | "toast") => {
    const id = ++n
    const ref = signal<LayerHandle | null>(null)
    const card = (<div class={`sc-ly-card sc-ly-${kind}`} data-n={id % 5} role={kind === "dialog" ? "dialog" : "group"} aria-label={`${KIND_TR[kind]} ${id}`}>
      <strong>{KIND_TR[kind] + " #" + id}</strong>
      <span class="m-muted">{() => where(ref())}</span>
      <Button size="sm" variant="ghost" on:click={() => ref.peek()?.close()}>Kapat</Button>
    </div>) as HTMLElement
    const handle: LayerHandle = layer.open(kind, card, { label: `${kind} #${id}`, ...($escape && kind !== "toast" ? { onEscape: () => handle.close() } : {}), ...($lock ? { lockScroll: true } : {}) })
    ref.set(handle)
    if (kind === "toast") setTimeout(() => handle.close(), 4000)
  }
  return <>
    <Demo wide title="Katman: yığın, en üstteki ve Esc sırası" desc="Açılan her katman portal yığınına girer; sonuncusu üsttedir. Esc bir kerede yalnız en üstteki katmanı kapatır. Bildirim (toast) bandı her zaman üstte durur ama 'en üstteki' sayılmaz ve Esc almaz. Diyalog açıkken sayfa kaydırması kilitlenir."
      code={`const l = layer.open("popover", node, { onEscape: () => l.close(), lockScroll: false })
l.isTop()   l.index()   l.close()
layer.stack()   layer.top()   layer.modal()   layer.scrollLocked()
const unlock = layer.lockScroll()   // sayaçlı: son kilit açılınca sayfa yeniden kayar`}>
      <div class="sc-row">
        <Button data-audit-try on:click={() => open("popover")}>Açılır kutu aç</Button>
        <Button on:click={() => open("menu")}>Menü aç</Button>
        <Button variant="primary" on:click={() => open("dialog")}>Diyalog aç (kip)</Button>
        <Button variant="secondary" on:click={() => open("toast")}>Bildirim aç</Button>
        <Button variant="ghost" disabled={() => !layer.top()} on:click={() => layer.escape()}>Esc gibi kapat</Button>
      </div>
      <ol class="sc-ly-stack" aria-label="Katman yığını (alttan üste)">
        {() => layer.stack().filter((l) => l.label !== null || l.kind !== "fx").map((l) => <li data-top={layer.top()?.el === l.el ? "" : null}>
          <code>{l.kind}</code> {l.label ?? "(başka bir bileşen)"} {l.modal ? <Badge tone="warning">kip</Badge> : null} {l.escapable ? <Kbd keys="escape" /> : null}
        </li>)}
        {() => (layer.stack().some((l) => l.label !== null || l.kind !== "fx") ? null : <li class="m-muted">Açık katman yok.</li>)}
      </ol>
      <div class="sc-row"><span>Kip katman açık:</span>{() => yes(layer.modal())}<span>Kaydırma kilidi:</span>{() => yes(layer.scrollLocked())}</div>
      <p class="m-muted">{() => `Bundan sonra açılan katman: ${$escape ? "Esc ile kapanır" : "Esc ile kapanmaz (yalnız Kapat düğmesi)"}; açılır kutu ve menü kaydırmayı ${$lock ? "kilitler" : "kilitlemez"}.`}</p>
      <Card title="Seçenekler" subtitle="Layer">
        <Toggle bind:value={$escape} label="Esc ile kapanabilsin (onEscape)" />
        <Toggle bind:value={$lock} label="Açılır kutu ve menü de kaydırmayı kilitlesin (lockScroll)" />
      </Card>
    </Demo>
  </>
}

// ------------------------------------------------------------------ Focus
function FocusDemo() {
  let $trapped = false
  let release: (() => void) | null = null
  const box = (<div class="sc-fc-box" data-on={() => ($trapped ? "" : null)}>
    <p>{() => ($trapped ? "Tab ve Shift+Tab bu kutudan çıkamaz; dışarı tıklasan bile odak geri gelir." : "Tuzak kapalı.")}</p>
    <div class="sc-row">
      <Button size="sm">Birinci</Button>
      <Button size="sm">İkinci</Button>
      <Button size="sm" variant="primary" disabled={() => !$trapped} on:click={() => stop()}>Tuzaktan çık</Button>
    </div>
  </div>) as HTMLElement
  const start = () => { release = focus.trap(box); $trapped = true }
  const stop = () => { $trapped = false; queueMicrotask(() => { release?.(); release = null }) } // the opener is enabled again before focus returns to it
  onCleanup(() => release?.())
  const toolbar = <div class="sc-fc-toolbar" role="toolbar" aria-label="Biçim" focus:roving="horizontal">
    {["Kalın", "İtalik", "Altı çizili", "Üstü çizili", "Kod"].map((l) => <Button size="sm">{l}</Button>)}
  </div>
  const label = (el: Element | null) => !el ? "—" : (el.getAttribute("aria-label") || el.textContent || el.tagName.toLowerCase()).trim().slice(0, 40)
  return <>
    <Demo title="Odak tuzağı ve geri dönüş" desc="trap(): odak kutunun içinde döner; bırakınca odak tuzağı açan düğmeye döner. Tuzaklar yığılır: en yenisi etkindir."
      code={`const release = focus.trap(panel)   // ilk odaklanabilir öğeye geçer
release()                            // odak açan düğmeye döner
<div focus:trap>…</div>`}>
      <div class="sc-row"><Button variant="primary" disabled={() => $trapped} on:click={start}>Tuzağı başlat</Button><span class="m-muted">Odakta: {() => label(focus.active())}</span></div>
      {box}
    </Demo>
    <Demo title="Klavye mi fare mi: focus-visible" desc="Son giriş klavyeyse focus.visible() doğru olur ve <html data-m-focus-visible> yazılır; odak halkasını yalnız klavye kullanıcısına göstermek için. Tab'a bas, sonra fareyle tıkla."
      code={`focus.visible()    focus.modality()   // "keyboard" | "pointer"
html[data-m-focus-visible] :focus { outline: 2px solid var(--m-focus) }`}>
      <div class="sc-row"><span>Giriş:</span><Badge tone={() => (focus.visible() ? "info" : "neutral")}>{() => (focus.visible() ? "klavye" : "işaretçi")}</Badge></div>
    </Demo>
    <Demo title="Gezici odak (roving tabindex)" desc="Araç çubuğu tek bir Tab durağıdır; içinde ok tuşları, Home ve End gezer. Sağdan sola düzende sol ok 'sonraki' olur."
      code={`<div role="toolbar" focus:roving="horizontal">…</div>
focus.roving(list, { orientation: "vertical", wrap: true, onMove })`}>
      {toolbar}
      <p class="m-muted">Önce araç çubuğuna Tab ile gel, sonra ← → kullan; bir Tab daha araç çubuğundan çıkar.</p>
    </Demo>
  </>
}

// ------------------------------------------------------------------ Hotkey
function HotkeyDemo() {
  let $log: string[] = []
  let $editor = false
  let $exclusive = false
  let $paused = false
  let leave: (() => void) | null = null
  const log = (s: string) => { $log = [`${new Date().toLocaleTimeString()} · ${s}`, ...$log].slice(0, 6) }
  hotkeys.bind("shift+n", () => log("Yeni not (shift+n)"), { description: "Yeni not", group: "Vitrin" })
  hotkeys.bind("g h", () => log("Ana sayfaya git (g h)"), { description: "Ana sayfaya git (dizi)", group: "Vitrin" })
  hotkeys.bind("g d", () => log("Veri sayfasına git (g d)"), { description: "Veri sayfasına git (dizi)", group: "Vitrin" })
  hotkeys.bind("mod+b", () => log("Kalın (yalnız düzenleyici kapsamında)"), { description: "Kalın", group: "Düzenleyici", scope: "editor" })
  hotkeys.bind("mod+i", () => log("İtalik (yalnız düzenleyici kapsamında)"), { description: "İtalik", group: "Düzenleyici", scope: "editor" })
  const setScope = () => {
    leave?.(); leave = null
    if ($editor) leave = hotkeys.enter("editor", { exclusive: $exclusive })
  }
  onCleanup(() => { leave?.(); hotkeys.resume() })
  return <>
    <Demo wide title="Kısayol: kapsam, dizi ve duraklatma" desc="Tuşlar sayfanın her yerinde çalışır. 'g' sonra 'h' bir dizidir: g basılınca bekleyen tuş gösterilir. Düzenleyici kapsamına girince Ctrl/⌘+B ve +I açılır; özel kapsam genel kısayolları susturur. Bir alana yazarken ve kip bir katman açıkken kısayollar çalışmaz."
      code={`hotkeys.bind("g h", goHome, { description: "Ana sayfaya git" })
hotkeys.bind("mod+b", bold, { scope: "editor" })
const leave = hotkeys.enter("editor", { exclusive: true })
hotkeys.pending()   hotkeys.list()   hotkeys.pause()`}>
      <div class="sc-row">
        <span>Bekleyen:</span><Badge tone={() => (hotkeys.pending() ? "info" : "neutral")}>{() => hotkeys.pending() || "—"}</Badge>
        <span>Kapsamlar:</span><code>{() => hotkeys.scopes().join(" › ") || "genel"}</code>
        <span>Duraklatıldı:</span>{() => yes(hotkeys.paused())}
      </div>
      <table class="sc-hk-table">
        <thead><tr><th scope="col">Tuş</th><th scope="col">Ne yapar</th><th scope="col">Grup</th><th scope="col">Şimdi</th></tr></thead>
        <tbody>{() => hotkeys.list().map((k) => <tr data-off={k.active ? null : ""}><td>{k.combo.split(" ").map((c) => <Kbd keys={c} />)}</td><td>{k.description}</td><td>{k.group ?? "—"}</td><td>{yes(k.active)}</td></tr>)}</tbody>
      </table>
      <TextInput placeholder="Buraya yazarken kısayollar çalışmaz" aria-label="Deneme alanı" />
      <ul class="sc-mgr-log">{() => ($log.length ? $log.map((l) => <li>{l}</li>) : <li class="m-muted">Shift+N, g h ya da g d dene.</li>)}</ul>
    </Demo>
    <Card title="Seçenekler" subtitle="Hotkey">
      <Toggle bind:value={$editor} onChange={(v: boolean) => { $editor = v; setScope() }} label="Düzenleyici kapsamına gir" />
      {() => ($editor ? <Toggle bind:value={$exclusive} onChange={(v: boolean) => { $exclusive = v; setScope() }} label="Özel kapsam: genel kısayollar sussun" /> : null)}
      <Toggle bind:value={$paused} onChange={(v: boolean) => (v ? hotkeys.pause() : hotkeys.resume())} label="Tüm kısayolları duraklat" />
    </Card>
  </>
}

// ------------------------------------------------------------------ Announcer
const FRUITS = ["elma", "armut", "ayva", "kiraz", "vişne", "çilek", "kayısı", "şeftali", "erik", "incir", "nar", "üzüm"]
function AnnouncerDemo() {
  let $text = "Kaydedildi"
  let $q = ""
  const hits = () => FRUITS.filter((f) => f.includes($q.toLocaleLowerCase("tr")))
  effect(() => { const n = hits().length; if ($q) announce(`${n} sonuç`) })
  return <Demo wide title="Duyurucu: ekran okuyucuya canlı bildirim" desc="Odak yerinden oynamadan ekran okuyucu duyar: 'Kaydedildi', '3 sonuç', 'Bağlantı koptu'. Nazik (polite) okuyucunun sözünü bitirmesini bekler; acil (assertive) araya girer. Bölgeler katman yığınında görünmez durur; aynı metin art arda da okunur."
    code={`announce("Kaydedildi")
announce("Bağlantı koptu", { politeness: "assertive" })
announcer.history()   // son duyurular`}>
    <div class="sc-row">
      <TextInput bind:value={$text} aria-label="Duyuru metni" />
      <Button on:click={() => announce($text)}>Nazik duyur</Button>
      <Button variant="danger" on:click={() => announce($text, { politeness: "assertive" })}>Acil duyur</Button>
    </div>
    <Field label="Ara (sonuç sayısı duyurulur)"><TextInput bind:value={$q} placeholder="ör. er" /></Field>
    <p class="m-muted">{() => hits().join(", ") || "sonuç yok"}</p>
    <ul class="sc-mgr-log" aria-label="Son duyurular">{() => (announcer.history().length ? announcer.history().map((a) => <li><Badge tone={a.politeness === "assertive" ? "danger" : "info"}>{a.politeness === "assertive" ? "acil" : "nazik"}</Badge> {a.text}</li>) : <li class="m-muted">Henüz duyuru yok.</li>)}</ul>
  </Demo>
}

// ------------------------------------------------------------------ Accessibility
function AccessibilityDemo() {
  let $issues: A11yIssue[] = []
  let $ran = false
  const RULE_TR: Record<string, string> = { "img-alt": "Görselin alt metni yok", name: "Denetimin erişilebilir adı yok", label: "Form alanının etiketi yok", "duplicate-id": "Yinelenen id", tabindex: "Pozitif tabindex", "heading-order": "Başlık düzeyi atlandı", "hidden-focus": "aria-hidden içinde odaklanabilir öğe" }
  const sample = (<div class="sc-a11y-sample">
    <h4>Örnek kart</h4>
    <h6>Atlanan başlık düzeyi</h6>
    <img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" width="40" height="40" />
    <Button size="sm"></Button>
    <input class="m-input" placeholder="etiketsiz alan" />
    <a href="#sc-a11y-sample" tabindex="2">tabindex 2</a>
    <span id="sc-a11y-dup">a</span><span id="sc-a11y-dup">b</span>
  </div>) as HTMLElement
  const run = () => {
    for (const i of $issues) i.el.removeAttribute("data-sc-issue")
    $issues = a11y.audit(sample)
    for (const i of $issues) i.el.setAttribute("data-sc-issue", "")
    $ran = true
    announce(`${$issues.length} sorun bulundu`)
  }
  return <>
    <Demo wide title="Erişilebilirlik tercihleri: tüm uygulamada" desc="Seçimler bu cihazda saklanır ve hemen bütün vitrine uygulanır: hareket (sistem / azalt / tam — hareket motoru buna uyar), yazı boyutu, yüksek karşıtlık, bağlantı altı çizgisi, WCAG metin aralığı ve belirgin odak halkası."
      code={`a11y.set({ fontScale: 1.25, contrast: true })
a11y.prefs()   a11y.reset()
<AccessibilitySettings />   openAccessibilityPanel()   // march/managers/accessibility/ui`}>
      <AccessibilitySettings />
      <div class="sc-row"><Button variant="ghost" on:click={() => a11y.reset()}>Varsayılana dön</Button></div>
    </Demo>
    <Demo title="Sayfa denetimi" desc="audit(kök): alt metni olmayan görsel, adsız düğme, etiketsiz alan, yinelenen id, pozitif tabindex, atlanan başlık düzeyi ve aria-hidden içinde odaklanabilir öğe. Bulunanlar örnekte işaretlenir."
      code={`a11y.audit(document.body)   // [{ rule, message, el }]`}>
      {sample}
      <div class="sc-row">
        <Button variant="primary" on:click={run}>Örneği denetle</Button>
        <Button variant="ghost" on:click={() => { const n = a11y.audit(document.querySelector("main") ?? document.body).length; announce(`Bu sayfada ${n} sorun`); $issues = []; $ran = false; alertCount(n) }}>Bu sayfayı denetle</Button>
      </div>
      {() => ($ran ? ($issues.length ? <ul class="sc-mgr-log">{$issues.map((i) => <li><code>{i.rule}</code> {RULE_TR[i.rule] ?? i.message}</li>)}</ul> : <Alert tone="success">Sorun bulunamadı.</Alert>) : null)}
    </Demo>
  </>
}
const alertCount = (n: number) => { void openDialog(() => <p>{n ? `Bu sayfada ${n} olası sorun bulundu.` : "Bu sayfada sorun bulunamadı."}</p>, { title: "Sayfa denetimi", size: "sm" }) }

// ------------------------------------------------------------------ ShortcutHint
function ShortcutHintDemo() {
  let $log: string[] = []
  const say = (s: string) => { $log = [s, ...$log].slice(0, 4) }
  hotkeys.bind("shift+s", () => say("Paylaş (shift+s)"), { description: "Paylaş", group: "Vitrin" })
  hotkeys.bind("shift+e", () => say("Dışa aktar (shift+e)"), { description: "Dışa aktar", group: "Vitrin" })
  onCleanup(() => disposeShortcutHints())
  return <Demo wide title="Kısayol ipuçları" desc="Alt tuşunu yarım saniye basılı tut: kısayolu olan her öğenin yanında rozet çıkar (aria-keyshortcuts ya da data-hotkey). ? tuşu bütün kısayolların gruplu listesini açar; o an çalışmayanlar soluk görünür."
    code={`<ShortcutHints />                          // uygulamada bir kez
<button data-hotkey="shift+s">Paylaş</button>
shortcutHints.show()   shortcutHints.openHelp()`}>
    <ShortcutHints />
    <div class="sc-row">
      <Button data-hotkey="shift+s" aria-keyshortcuts="Shift+S" on:click={() => say("Paylaş (tık)")}>Paylaş</Button>
      <Button data-hotkey="shift+e" aria-keyshortcuts="Shift+E" on:click={() => say("Dışa aktar (tık)")}>Dışa aktar</Button>
      <Button data-hotkey="shift+n" aria-keyshortcuts="Shift+N">Yeni not</Button>
    </div>
    <div class="sc-row">
      <Button variant="secondary" on:click={() => (shortcutHints.visible() ? shortcutHints.hide() : shortcutHints.show())}>{() => (shortcutHints.visible() ? "Rozetleri gizle" : "Rozetleri göster")}</Button>
      <Button variant="primary" on:click={() => shortcutHints.openHelp()}>Kısayol listesi <Kbd keys="?" /></Button>
      <span class="m-muted"><Kbd keys="alt" /> basılı tut</span>
    </div>
    <ul class="sc-mgr-log">{() => ($log.length ? $log.map((l) => <li>{l}</li>) : <li class="m-muted">Shift+S ya da Shift+E dene.</li>)}</ul>
  </Demo>
}

export default function ManagersA11y(props: { params?: { rest?: string } }) {
  const RENDER: Record<string, () => unknown> = {
    "layer": () => <LayerDemo />,
    "focus": () => <FocusDemo />,
    "hotkey": () => <HotkeyDemo />,
    "announcer": () => <AnnouncerDemo />,
    "accessibility": () => <AccessibilityDemo />,
    "shortcut-hints": () => <ShortcutHintDemo />,
  }
  return <Hub section="/managers-a11y" kicker="Temel › Yöneticiler" title="Erişilebilirlik yöneticileri" lead="Katman, odak, kısayol, duyurucu, erişilebilirlik tercihleri ve kısayol ipuçları: tek örnek, ilk kullanımda başlar, tek yerden yapılandırılır. Hepsi klavye ve ekran okuyucu ile çalışır." render={RENDER} params={props.params} />
}
