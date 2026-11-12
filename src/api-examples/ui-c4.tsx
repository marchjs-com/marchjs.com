// API examples of hadi-march/ui, names PostCard … PullToRefresh (code-point order). Layout and rules: tools/api-examples.js.
// Each `run` is a small live demo of its `code`; components re-create themselves for options they read once.
import { signal } from "hadi-march";
import { PostCard, PostSkeleton, ProfileHeader, Progress, PropertyGrid, PullToRefresh, Button } from "hadi-march/ui";
import { examples } from "./types.ts";
import { Out, Log, Row } from "./_kit.tsx";
import "./ui-c.css";
export { default as SIG } from "./ui-c4.sig.gen.ts";

const photo = (name: string) => `media/social/${name}.svg`
const PICS = [
  { src: photo("sea"), alt: "Mavi denizde turuncu yelkenli", width: 1500, height: 1000 },
  { src: photo("forest"), alt: "Orman yolu", width: 1200, height: 1500 },
  { src: photo("coffee"), alt: "Üstten kahve fincanı", width: 1200, height: 1200 },
  { src: photo("city"), alt: "Gece şehir ışıkları", width: 1500, height: 1000 },
  { src: photo("ride"), alt: "Bisiklet çizimi", width: 1500, height: 1000 },
  { src: photo("sunset"), alt: "Tepelerin üstünde gün batımı", width: 1200, height: 1500 },
]
/** A log signal and a function that appends a line (keeps the last six). */
const logger = () => { const lines = signal<string[]>([]); return [lines, (l: string) => lines.update((x) => [...x.slice(-5), l])] as const }
const opts = (...pairs: [unknown, string][]) => pairs.map(([value, label]) => ({ value, label }))

export default examples({
  "hadi-march/ui": {
    PostCard: {
      code: `<PostCard post={post} onLike={(liked) => post.set({ ...post(), liked, likes: post().likes + (liked ? 1 : -1) })}
  onComment={(p) => openThread(p.id)} />`,
      play: { options: [
        { key: "variant", label: "Görünüm", default: "card", options: opts(["card", "kart"], ["flat", "düz"]) },
        { key: "clamp", label: "Metin satırı", default: 2, options: opts([2, "2"], [0, "hepsi"]) },
      ] },
      run: (p: { values: { variant: "card" | "flat"; clamp: number } }) => {
        const [lines, add] = logger()
        const post = signal({
          id: "p1", author: { name: "HADİ Kahve Atölyesi", handle: "hadi.kahve", verified: true }, time: Date.now() - 42 * 60_000, place: "Kadıköy",
          text: "Cuma akşamı demleme atölyesi var. Yeni çekirdekleri birlikte tadacağız, filtre kahve ve soğuk demleme yöntemlerini adım adım deneyeceğiz. Kontenjan 12 kişi; kayıt için profildeki bağlantıyı kullanın.",
          media: [PICS[2]!], likes: 18, liked: false, comments: 4, shares: 1,
        })
        return <div class="sc-ex-ui-c-stack">
          <PostCard post={post} variant={() => p.values.variant} clamp={() => p.values.clamp}
            onLike={(liked) => { post.set({ ...post(), liked, likes: post().likes + (liked ? 1 : -1) }); add(liked ? "beğenildi" : "beğeni geri alındı") }}
            onComment={() => add("yorumlar açıldı")} onShare={() => add("paylaş")} />
          <Log lines={lines} />
        </div>
      },
    },
    PostSkeleton: {
      code: `<Await for={loadPost(id)} loading={<PostSkeleton media />}>
  {(post) => <PostCard post={post} />}
</Await>`,
      play: { options: [
        { key: "media", label: "Fotoğraf yeri", default: true },
        { key: "variant", label: "Görünüm", default: "card", options: opts(["card", "kart"], ["flat", "düz"]) },
      ] },
      run: (p: { values: { media: boolean; variant: "card" | "flat" } }) => {
        const n = signal(1)
        return <div class="sc-ex-ui-c-stack">
          <Row><Button onClick={() => n.update((x) => (x % 3) + 1)}>Yer tutucu sayısı</Button><Out label="adet" value={n} /></Row>
          {() => { const media = p.values.media, variant = p.values.variant
            return Array.from({ length: n() }, () => <PostSkeleton media={media} variant={variant} />) }}
        </div>
      },
    },
    ProfileHeader: {
      code: `<ProfileHeader user={club} follow={state()} onFollow={state.set} cover="sm"
  onStat={(which) => openList(which)} />`,
      play: { options: [
        { key: "self", label: "Kendi profilim", default: false },
        { key: "cover", label: "Kapak", default: "sm", options: opts(["none", "yok"], ["sm", "kısa"], ["md", "orta"]) },
      ] },
      run: (p: { values: { self: boolean; cover: "none" | "sm" | "md" } }) => {
        const [lines, add] = logger()
        const follow = signal<"follow" | "following" | "requested">("follow")
        const user = () => ({ name: "Pazar Bisiklet Grubu", handle: "pazar.bisiklet", cover: photo("ride"), bio: "Her pazar 08.00 · sahil yolu · her seviyeye açık", story: "new" as const,
          posts: 128, followers: 2400 + (follow() === "following" ? 1 : 0), following: 87 })
        return <div class="sc-ex-ui-c-stack">
          <ProfileHeader user={user} self={() => p.values.self} cover={() => p.values.cover} follow={follow}
            onFollow={(s) => { follow.set(s); add(`takip: ${s}`) }} onMessage={() => add("mesaj")} onEdit={() => add("düzenle")} onStat={(w) => add(`liste: ${w}`)} />
          <Log lines={lines} />
        </div>
      },
    },
    Progress: {
      code: `<Progress value={done()} max={total} label="Yükleniyor" showValue />
<Progress />   // indeterminate`,
      play: { options: [
        { key: "tone", label: "Ton", default: "primary", options: opts(["primary", "birincil"], ["success", "başarı"], ["warn", "uyarı"]) },
        { key: "size", label: "Boyut", default: "md", options: ["sm", "md", "lg"] },
        { key: "showValue", label: "Yüzde", default: true },
      ] },
      run: (p: { values: { tone: "primary" | "success" | "warn"; size: "sm" | "md" | "lg"; showValue: boolean } }) => {
        const done = signal(3)
        return <div class="sc-ex-ui-c-stack">
          {() => { const size = p.values.size, showValue = p.values.showValue
            return <Progress value={done} max={8} label={() => `${done()} / 8 dosya`} tone={() => p.values.tone} size={size} showValue={showValue} /> }}
          <Row><Button onClick={() => done.update((x) => Math.min(8, x + 1))}>Bir dosya yükle</Button><Button variant="ghost" onClick={() => done.set(0)}>Sıfırla</Button></Row>
        </div>
      },
    },
    PropertyGrid: {
      code: `<PropertyGrid label="Düğme özellikleri" value={props} history={false} properties={[
  { key: "text", label: "Metin" },
  { key: "variant", label: "Görünüm", type: "segmented", options: ["primary", "secondary"] },
  { key: "disabled", label: "Devre dışı", type: "switch" },
]} />`,
      play: { options: [
        { key: "layout", label: "Yerleşim", default: "auto", options: opts(["auto", "yan yana"], ["stacked", "üst üste"]) },
        { key: "search", label: "Arama alanı", default: false },
      ] },
      run: (p: { values: { layout: "auto" | "stacked"; search: boolean } }) => {
        const v = signal<Record<string, unknown>>({ text: "Kaydet", variant: "primary", size: "md", disabled: false })
        return <div class="sc-ex-ui-c-stack">
          <div class="sc-ex-ui-c-box"><Row>{() => <Button variant={v().variant as "primary"} size={v().size as "md"} disabled={!!v().disabled}>{String(v().text || "…")}</Button>}</Row></div>
          {() => { const layout = p.values.layout, search = p.values.search
            return <PropertyGrid label="Düğme özellikleri" value={v} history={false} dirty={false} layout={layout} search={search} properties={[
              { key: "text", label: "Metin", group: "İçerik" },
              { key: "variant", label: "Görünüm", type: "segmented", options: ["primary", "secondary", "ghost"], group: "Stil" },
              { key: "size", label: "Boyut", type: "segmented", options: ["sm", "md", "lg"], group: "Stil" },
              { key: "disabled", label: "Devre dışı", type: "switch", group: "Durum" },
            ]} /> }}
        </div>
      },
    },
    PullToRefresh: {
      code: `<PullToRefresh onRefresh={() => api.get("/feed").then(setItems)}>
  <FeedList items={items()} />
</PullToRefresh>`,
      play: { options: [
        { key: "threshold", label: "Eşik", default: 72, options: opts([48, "48 px"], [72, "72 px"], [120, "120 px"]) },
        { key: "disabled", label: "Kapalı", default: false },
      ] },
      run: (p: { values: { threshold: number; disabled: boolean } }) => {
        const items = signal(["HADİ: yeni sezon duyurusu", "Kitap kulübü: bu ayın kitabı", "Koşu grubu: pazar rotası"])
        const phase = signal("idle")
        let n = 0
        const refresh = () => new Promise<void>((done) => setTimeout(done, 700))
          .then(() => items.update((l) => [`Yeni gönderi ${++n}`, ...l]))
        return <div class="sc-ex-ui-c-stack">
          <Out label="durum" value={phase} />
          {() => { const threshold = p.values.threshold
            return <PullToRefresh class="sc-ex-ui-c-scroll" threshold={threshold} disabled={() => p.values.disabled} onPhase={(x) => phase.set(x)} onRefresh={refresh}>
              <ul class="sc-ex-ui-c-list">{() => items().map((x) => <li>{x}</li>)}</ul>
            </PullToRefresh> }}
          <p class="hm-muted">Listeyi en üstte aşağı çekip bırakın.</p>
        </div>
      },
    },
  },
})
