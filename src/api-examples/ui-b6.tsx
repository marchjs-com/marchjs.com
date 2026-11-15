// API examples of march/ui, names "KeyValue" … "Loader" (code-point order; the neighbouring ranges: ui-b*.tsx).
// Layout and rules: tools/api-examples.js. Each `run` is a small live demo of its `code`; components have Playground options.
import { signal } from "march";
import {
  KeyValue, Button, Empty, Loader, KeyframeTimeline, KeyValueEditor, LikeButton, LinkCard, ListDetail, ListEditor,
} from "march/ui";
import { folder, edit, inbox } from "march/icons";
import { examples } from "./types.ts";
import { Out, Row } from "./_kit.tsx";
import { wait } from "./_ui-b.tsx";
import "./ui-b.css";
export { default as SIG } from "./ui-b6.sig.gen.ts";

export default examples({
  "march/ui": {
    KeyframeTimeline: {
      code: `const anim = signal({ duration: 1500, tracks: [
  { id: "a", target: "Kart", prop: "x", keys: [{ at: 0, value: 0 }, { at: 1500, value: 120 }] },
] })
<KeyframeTimeline value={anim} snap={100} loop />`,
      play: { options: [{ key: "snap", label: "Yakalama", default: 100, options: [{ value: 0, label: "kapalı" }, { value: 50, label: "50 ms" }, { value: 100, label: "100 ms" }] }, { key: "stage", label: "Sahne", default: true }] },
      run: (p: { values: { snap: number; stage: boolean } }) => {
        const anim = signal({ duration: 1500, tracks: [
          { id: "a", target: "Kart", prop: "x" as const, color: "brand-orange" as const, keys: [{ at: 0, value: 0 }, { at: 1500, value: 120 }] },
          { id: "b", target: "Kart", prop: "opacity" as const, color: "brand-blue" as const, keys: [{ at: 0, value: 0.2 }, { at: 600, value: 1 }] },
        ] })
        return <div class="sc-ex-stack">
          {() => { const s = p.values.snap, st = p.values.stage; return <KeyframeTimeline value={anim} snap={s} stage={st} aria-label="Kart animasyonu" /> }}
          <Out label="Anahtar kare" value={() => anim().tracks.reduce((n, t) => n + t.keys.length, 0)} />
        </div>
      },
    },
    KeyValueEditor: {
      code: `<KeyValueEditor bind:value={$headers} keyPlaceholder="Başlık" valuePlaceholder="Değer" />
// { "X-Team": "hadi", "Retry": "3" }`,
      play: { options: [{ key: "numbers", label: "Sayıları dönüştür", default: true }] },
      run: (p: { values: { numbers: boolean } }) => {
        const headers = signal<Record<string, string | number>>({ "X-Team": "hadi", Retry: 3 })
        return <div class="sc-ex-stack">
          {() => { const n = p.values.numbers; return <KeyValueEditor value={headers} numbers={n} keyPlaceholder="Başlık" valuePlaceholder="Değer" aria-label="İstek başlıkları" /> }}
          <Out label="Değer" value={() => JSON.stringify(headers())} />
        </div>
      },
    },
    LikeButton: {
      code: `<LikeButton liked={() => post.liked} count={() => post.likes}
  onToggle={(next) => like(post.id, next)} />`,
      play: { options: [{ key: "size", label: "Boyut", default: "md", options: ["sm", "md", "lg"] }, { key: "burst", label: "Parçacık", default: true }, { key: "colors", label: "Parçacık rengi", default: "brand", options: [{ value: "brand", label: "HADİ" }, { value: "single", label: "tek" }], visibleWhen: (v: { burst: boolean }) => v.burst }] },
      run: (p: { values: { size: "sm" | "md" | "lg"; burst: boolean; colors: "brand" | "single" } }) => {
        const liked = signal(false), count = signal(41)
        return <Row>
          <LikeButton liked={liked} count={count} size={() => p.values.size} burst={() => p.values.burst} colors={() => p.values.colors}
            onToggle={(next) => { liked.set(next); count.update((n) => n + (next ? 1 : -1)) }} />
          <Out label="beğenildi" value={() => String(liked())} />
        </Row>
      },
    },
    LinkCard: {
      code: `<LinkCard href="/settings/team" icon={users} tone="info" title="Ekip"
  description="Üyeler ve roller" meta={() => \`\${members.length} üye\`} />`,
      play: { options: [{ key: "tone", label: "Ton", default: "info", options: [{ value: "info", label: "bilgi" }, { value: "success", label: "başarı" }, { value: "violet", label: "mor" }] }, { key: "meta", label: "Sağdaki bilgi", default: true }] },
      run: (p: { values: { tone: "info" | "success" | "violet"; meta: boolean } }) => {
        const n = signal(3)
        return <div class="sc-ex-stack">
          <LinkCard href="/forms" icon={edit} tone={() => p.values.tone} title="Formlar" description="Alanlar, doğrulama ve şemalar" meta={() => (p.values.meta ? `${n()} örnek` : null)} />
          <LinkCard href="/layout" icon={folder} tone={() => p.values.tone} title="Yerleşim" description="Izgara, yığın ve paneller" meta={() => (p.values.meta ? "yeni" : null)} />
          <Row><Button size="sm" variant="ghost" onClick={() => n.update((x) => x + 1)}>Sayıyı artır</Button></Row>
        </div>
      },
    },
    ListDetail: {
      code: `<ListDetail selected={() => $sel} onBack={() => $sel = null}
  list={<List items={orders} onSelect={(o) => $sel = o} />}
  detail={() => <OrderView order={$sel} />} />`,
      play: { options: [{ key: "back", label: "Geri düğmesi (dar ekran)", default: true }, { key: "empty", label: "Özel boş görünüm", default: false }] },
      run: (p: { values: { back: boolean; empty: boolean } }) => {
        const orders = [{ id: "A-101", who: "Ada", total: "₺1.250" }, { id: "A-102", who: "Deniz", total: "₺480" }, { id: "A-103", who: "HADİ", total: "₺9.900" }]
        const sel = signal<(typeof orders)[number] | null>(null)
        return <div class="sc-ex-ui-b-ld">
          {() => { const b = p.values.back, e = p.values.empty; return <ListDetail selected={sel} {...(b ? { onBack: () => sel.set(null) } : {})} listLabel="Siparişler"
            empty={e ? <Empty icon={inbox} title="Bir sipariş seç" /> : undefined}
            list={<div class="sc-ex-stack">{orders.map((o) => <Button variant={() => (sel()?.id === o.id ? "primary" : "ghost")} aria-pressed={() => String(sel()?.id === o.id)} onClick={() => sel.set(o)}>{o.id} · {o.who}</Button>)}</div>}
            detail={() => <KeyValue items={() => (sel() ? { "Sipariş": sel()!.id, "Müşteri": sel()!.who, "Tutar": sel()!.total } : {})} />} /> }}
        </div>
      },
    },
    ListEditor: {
      code: `<ListEditor bind:value={$tags} max={5} placeholder="Etiket ekle" />   // Enter adds, duplicates skipped`,
      play: { options: [{ key: "unique", label: "Tekrarı engelle", default: true }, { key: "max", label: "En çok", default: 5, options: [3, 5, 10] }] },
      run: (p: { values: { unique: boolean; max: number } }) => {
        const tags = signal<string[]>(["tasarım", "web"])
        return <div class="sc-ex-stack">
          {() => { const u = p.values.unique, m = p.values.max; return <ListEditor value={tags} unique={u} max={m} placeholder="Etiket ekle" addLabel="Ekle" aria-label="Etiketler" /> }}
          <Out label="Değer" value={() => JSON.stringify(tags())} />
        </div>
      },
    },
    Loader: {
      code: `<Show when={loading()} fallback={<Table rows={rows} />}><Loader text="Kullanıcılar yükleniyor…" /></Show>
<div style="position: relative"><Table /><Loader overlay /></div>   // over the content`,
      play: { options: [{ key: "overlay", label: "İçeriğin üstünde", default: true }, { key: "text", label: "Metin", default: true }] },
      run: (p: { values: { overlay: boolean; text: boolean } }) => {
        const busy = signal(false)
        const load = async () => { busy.set(true); await wait(1500); busy.set(false) }
        return <div class="sc-ex-stack">
          <Row><Button onClick={load} disabled={busy}>Yenile</Button></Row>
          <div class="sc-ex-ui-b-loader">
            {() => (busy() && !p.values.overlay ? null : <KeyValue items={{ "Kullanıcı": 128, "Etkin": 97, "Bekleyen": 4 }} />)}
            {() => busy() && <Loader overlay={p.values.overlay} {...(p.values.text ? { text: "Kullanıcılar yükleniyor…" } : {})} />}
          </div>
        </div>
      },
    },
  },
})
