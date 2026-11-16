// Home page sections (a lazy part): the visual side. Charts beyond bars (a donut, a heat map and bars that glide when
// the data changes); a photo gallery that opens in a lightbox; a pricing table with a monthly / yearly switch and what
// people say; a social app (stories, follow, a chat that answers); Markdown written on one side and shown on the other.
// Real components throughout, nothing faked.
import "./visual.css";
import { computed, onCleanup } from "march";
import { appUrl } from "march/base";
import { reducedMotion } from "march/motion";
import { Button, Segmented, Textarea, Toggle, openDialog, toast } from "march/ui";
import { BarChart, Heatmap, PieChart, type PiePoint } from "march/charts";
import { markdownNodes } from "march/dom/markdown";
import { Icon, arrowLeft, arrowRight, bold, code, heart, italic, link, list, quote, refresh } from "march/icons";
import { Media } from "march/components/media/media";
import { MediaGrid, type MediaItem } from "march/components/social/media-grid";
import { StoryRing } from "march/components/social/story-ring";
import { FollowButton, type FollowState } from "march/components/social/follow-button";
import { ChatThread, type ChatMessage } from "march/components/composite/chat-thread";
import { ChatComposer } from "march/components/composite/chat-composer";
import { StoryViewer, type StoryGroup } from "march/components/composite/story-viewer";
import { Pricing, type PricingPlan } from "march/components/landing/pricing";
import { Testimonials } from "march/components/landing/testimonials";
import { Reveal } from "march/components/landing/index.ts";
import { Head } from "../head.tsx";
import { every } from "../clock.ts";

/** A small seeded random: the same numbers on every visit. */
const seeded = (seed: number) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296)
/** Run `fn` once after `ms` on the motion clock (a hidden tab waits); returns cancel. */
function later(ms: number, fn: () => void): () => void {
  const stop = every(ms, () => { stop(); fn() })
  return stop
}
const num = (n: number) => n.toLocaleString("tr")
const percent = new Intl.NumberFormat("tr", { style: "percent" })
const PHOTO = (name: string) => appUrl(`media/social/${name}.svg`)

// ── 1. charts beyond bars ───────────────────────────────────────────────────────────────────────────────────────

const KINDS = ["Koşu", "Bisiklet", "Yürüyüş", "Masa oyunu", "Kitap"]
const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]
const HOURS = ["08", "10", "12", "14", "16", "18", "20", "22"]
const PERIODS = [
  { value: "week", label: "Bu hafta", seed: 7, scale: 1 },
  { value: "last", label: "Geçen hafta", seed: 19, scale: 0.8 },
  { value: "month", label: "Bu ay", seed: 41, scale: 4 },
]
interface Slice { label: string; value: number }
interface Cell { x: string; y: string; value: number }
interface Day { day: string; signups: number; joins: number }

/** One period's numbers: the share of each kind, activity per day and hour (evenings and weekends busier), the week. */
function makeData(seed: number, scale: number): { pie: Slice[]; heat: Cell[]; bars: Day[] } {
  const r = seeded(seed)
  const pie = KINDS.map((label) => ({ label, value: Math.round((18 + r() * 80) * scale) }))
  const heat = DAYS.flatMap((y, di) => HOURS.map((x, hi) => {
    const busy = (hi >= 5 ? 1.8 : 1) * (di >= 5 ? 1.6 : 1)
    return { x, y, value: Math.round(r() * 22 * busy * scale) }
  }))
  const bars = DAYS.map((day, di) => {
    const signups = Math.round((30 + r() * 70) * (di >= 4 ? 1.4 : 1) * scale)
    return { day, signups, joins: Math.round(signups * (0.45 + r() * 0.4)) }
  })
  return { pie, heat, bars }
}

function Charts() {
  let $period = "week"
  let $spin = 0
  let $live = false
  let $slice = ""
  let $cell = ""
  const data = computed(() => {
    const p = PERIODS.find((x) => x.value === $period) ?? PERIODS[0]!
    return makeData(p.seed + $spin * 101, p.scale)
  })
  const total = () => data().pie.reduce((s, d) => s + d.value, 0)
  const peak = () => data().heat.reduce((a, c) => (c.value > a.value ? c : a), data().heat[0]!)
  // the live feed: new numbers every few seconds while the switch is on
  onCleanup(every(2200, () => { if ($live) $spin++ }))
  const pick = (p: PiePoint<Slice>) => { $slice = `${p.label}: ${num(p.value)} etkinlik, ${percent.format(p.share)}` }

  return <section class="sc-sec" aria-labelledby="sc-vs-charts-h">
    <Head id="sc-vs-charts-h" kicker="Grafik" color="brand-purple" title="Halka, ısı haritası ve çubuk grafikler" example="Çubuğun ötesi: halka, ısı haritası, kayan çubuklar"
      lead="Bir dilime dokun, bir hücrenin üstüne gel, efsaneden bir seriyi kapat. Dönemi değiştir: halka yeniden bölünür, çubuklar yeni boylarına süzülür. Hepsi SVG, hepsi erişilebilir, hepsi tek veri kaynağından." />
    <Reveal class="sc-vs-charts" effect="up">
      <div class="sc-vs-bar">
        <Segmented bind:value={$period} indicator="slide" aria-label="Dönem" options={PERIODS.map((p) => ({ value: p.value, label: p.label }))} />
        <Button variant="secondary" size="sm" icon={refresh} on:click={() => $spin++}>Yeni veri</Button>
        <Toggle bind:value={$live} m:color="brand-green">Canlı akış</Toggle>
      </div>
      <div class="sc-vs-chartgrid">
        <figure class="sc-vs-card sc-vs-pie">
          <figcaption class="sc-vs-cap">Etkinlik türleri</figcaption>
          <PieChart animate="spring" title="Etkinlik türlerinin payı" data={() => data().pie} donut={0.62} legend="bottom" height={260} onSelect={pick} />
          <p class="sc-vs-note" aria-live="polite">{() => $slice || `Toplam ${num(total())} etkinlik. Bir dilime dokun.`}</p>
        </figure>
        <figure class="sc-vs-card sc-vs-heat">
          <figcaption class="sc-vs-cap">Gün ve saate göre katılım</figcaption>
          <Heatmap animate="out" title="Gün ve saate göre katılım" data={() => data().heat} xDomain={HOURS} yDomain={DAYS} valueLabel="Katılım"
            xFormat={(v: unknown) => `${v}:00`} onSelect={(p) => { $cell = `${p.y} ${p.x}:00: ${num(p.value ?? 0)} katılım` }} />
          <p class="sc-vs-note" aria-live="polite">{() => $cell || `En yoğun an: ${peak().y} ${peak().x}:00, ${num(peak().value)} katılım.`}</p>
        </figure>
        <figure class="sc-vs-card sc-vs-bars">
          <figcaption class="sc-vs-cap">Kayıt ve katılım</figcaption>
          <BarChart title="Günlere göre kayıt ve katılım" data={() => data().bars} x="day" y={["signups", "joins"]}
            series={{ signups: "Kayıt", joins: "Katılım" }} animate="spring-wobbly" height={260} />
        </figure>
      </div>
    </Reveal>
  </section>
}

// ── 2. media: a gallery and its lightbox ────────────────────────────────────────────────────────────────────────

interface Shot extends MediaItem { caption: string; thumb: string }
const SHOTS: Shot[] = [
  { src: appUrl("media/dusk.jpg"), alt: "Alacakaranlıkta sahil", caption: "Alacakaranlık, sahil yürüyüşünün sonu", thumb: appUrl("media/dusk.jpg") },
  { src: appUrl("media/hadi-waves.webm"), kind: "video", alt: "HADİ dalgaları", caption: "HADİ dalgaları: video da galerinin parçası", thumb: appUrl("media/hadi-waves.jpg"), poster: appUrl("media/hadi-waves.jpg") },
  { src: PHOTO("sunset"), alt: "Tepelerin üstünde gün batımı", caption: "Tepelerin üstünde gün batımı", thumb: PHOTO("sunset"), width: 1200, height: 1500 },
  { src: PHOTO("sea"), alt: "Mavi denizde turuncu yelkenli", caption: "Mavi denizde turuncu yelkenli", thumb: PHOTO("sea"), width: 1500, height: 1000 },
  { src: PHOTO("city"), alt: "Gece şehir ışıkları", caption: "Gece, şehir ışıkları", thumb: PHOTO("city"), width: 1500, height: 1000 },
  { src: PHOTO("forest"), alt: "Orman yolu", caption: "Pazar sabahı orman yolu", thumb: PHOTO("forest"), width: 1200, height: 1500 },
  { src: PHOTO("coffee"), alt: "Üstten kahve fincanı", caption: "Koşudan sonra kahve", thumb: PHOTO("coffee"), width: 1200, height: 1200 },
  { src: PHOTO("confetti"), alt: "Dört renkli konfeti", caption: "Kutlama: dört renk konfeti", thumb: PHOTO("confetti"), width: 1080, height: 1920 },
]

/** The lightbox: the picture (or the video) large, previous / next (← → too), the caption, a strip of thumbnails. */
function Lightbox(props: { items: readonly Shot[]; start: number }) {
  let $at = props.start
  const n = props.items.length
  const go = (d: number) => { $at = ($at + d + n) % n }
  const cur = () => props.items[$at] ?? props.items[0]!
  const keys = (e: KeyboardEvent) => {
    const rtl = (e.currentTarget as Element).closest("[dir=rtl]") ? -1 : 1
    if (e.key === "ArrowRight") go(rtl)
    else if (e.key === "ArrowLeft") go(-rtl)
    else return
    e.preventDefault()
  }
  return <div class="sc-vs-lb" on:keydown={keys}>
    <div class="sc-vs-lb-stage">
      {() => { const it = cur(); return <Media class="sc-vs-lb-pic" src={it.src} kind={it.kind ?? "image"} alt={it.alt} poster={it.thumb} controls /> }}
      <button type="button" class="sc-vs-lb-nav sc-vs-lb-prev" aria-label="Önceki" on:click={() => go(-1)}><Icon of={arrowLeft} /></button>
      <button type="button" class="sc-vs-lb-nav sc-vs-lb-next" aria-label="Sonraki" on:click={() => go(1)}><Icon of={arrowRight} /></button>
    </div>
    <p class="sc-vs-lb-cap"><span>{() => cur().caption}</span><b>{() => `${$at + 1} / ${n}`}</b></p>
    <div class="sc-vs-lb-thumbs" role="group" aria-label="Kareler">
      {props.items.map((it, k) => <button type="button" class={() => `sc-vs-lb-thumb${$at === k ? " is-on" : ""}`} aria-pressed={() => String($at === k)}
        aria-label={it.alt ?? it.caption} on:click={() => { $at = k }}><img src={it.thumb} alt="" loading="lazy" /></button>)}
    </div>
  </div>
}
const openGallery = (start: number) => openDialog(() => <Lightbox items={SHOTS} start={start} />, { title: "Galeri", size: "lg", class: "sc-vs-lb-dialog" })

function Gallery() {
  let $max = "4"
  let $shape = "auto"
  let $likes = 0
  const like = () => { $likes++; toast(`Beğendin. Bu galeride ${num($likes)} beğeni.`) }
  return <section class="sc-sec" aria-labelledby="sc-vs-media-h">
    <Head id="sc-vs-media-h" kicker="Medya" color="brand-orange" title="Galeri ve ışık kutusuyla medya" example="Fotoğrafa dokun, galeri açılsın"
      lead={`${num(SHOTS.length)} kare, bir video dahil. Izgara kendini düzenler, fazlası "+N" olur; dokununca ışık kutusu açılır, oklarla gezilir. Çift dokunuş beğenir.`} />
    <Reveal class="sc-vs-media" effect="up">
      <div class="sc-vs-card sc-vs-gridcard">
        <MediaGrid items={SHOTS} max={() => Number($max)} shape={() => $shape as "auto"} gap="gap" label="Sahil buluşması"
          onOpen={(i) => openGallery(i)} onDoubleTap={like} />
      </div>
      <div class="sc-vs-card sc-vs-side">
        <span class="sc-vs-cap">Izgara</span>
        <Segmented bind:value={$max} indicator="slide" aria-label="Görünen kare" options={[{ value: "2", label: "İki" }, { value: "3", label: "Üç" }, { value: "4", label: "Dört" }]} />
        <span class="sc-vs-cap">Biçim</span>
        <Segmented bind:value={$shape} indicator="slide" aria-label="Kare biçimi" options={[{ value: "auto", label: "Kendi" }, { value: "square", label: "Kare" }, { value: "portrait", label: "Dikey" }]} />
        <Button variant="primary" on:click={() => openGallery(0)}>Galeriyi aç</Button>
        <p class="sc-vs-note"><Icon of={heart} /> {() => ($likes ? `${num($likes)} beğeni` : "Bir kareye çift dokun")}</p>
      </div>
    </Reveal>
  </section>
}

// ── 3. landing kit: pricing and what people say ─────────────────────────────────────────────────────────────────

const PRO = { monthly: 399, yearly: 319 }
const PLANS: PricingPlan[] = [
  { name: "Başlangıç", description: "Küçük bir kulüp için.", price: 0, features: ["Sınırsız etkinlik", "Sohbet ve hikâyeler", { label: "Özel alan adı", included: false }], cta: { label: "Ücretsiz başla" } },
  { name: "Topluluk Pro", description: "Büyüyen topluluklar için.", price: PRO, featured: true, badge: "En çok seçilen",
    features: ["Özel alan adı", "Ödemeli etkinlikler", "Gelişmiş istatistik", "Öncelikli destek"], cta: { label: "Pro'ya geç" } },
  { name: "Kurumsal", description: "Şirketler ve federasyonlar.", price: null, features: ["Tek oturum açma", "Denetim kaydı", "Ayrılmış sunucu"], cta: { label: "Bize yazın" } },
]
/** Months free when paying yearly, from the Pro prices. */
const FREE = Math.round(12 * (1 - PRO.yearly / PRO.monthly))
const tl = new Intl.NumberFormat("tr", { style: "currency", currency: "TRY", maximumFractionDigits: 0 })
const VOICES = [
  { quote: "Üyelik sayfamızı bir öğleden sonrada kurduk, fiyat tablosu hazır geldi.", name: "HADİ Koşu Kulübü", role: "Topluluk", rating: 5, avatar: PHOTO("ride") },
  { quote: "Yıllık plana geçen üye sayısı ikiye katlandı; anahtar çok net.", name: "Fotoğraf Atölyesi", role: "Atölye", rating: 5, avatar: PHOTO("city") },
  { quote: "Telefonda kartlar alt alta diziliyor, öne çıkan plan en üstte.", name: "Pazar Bisiklet Grubu", role: "Gönüllü ekip", rating: 4, avatar: PHOTO("sea") },
  { quote: "Hareketler zarif ama dikkat dağıtmıyor. Tam istediğimiz gibi.", name: "Kitap Kulübü", role: "Okuma grubu", rating: 5, avatar: PHOTO("coffee") },
  { quote: "Sıfır bağımlılık, hızlı açılıyor. Üyeler bekletilmiyor.", name: "Masa Oyunları Ekibi", role: "Topluluk", rating: 5, avatar: PHOTO("confetti") },
  { quote: "Kendi renklerimizi verdik, her parça uydu.", name: "Sahil Yürüyüşçüleri", role: "Yürüyüş grubu", rating: 4, avatar: PHOTO("sunset") },
]

function Landing() {
  let $period: "monthly" | "yearly" = "monthly"
  const saved = (PRO.monthly - PRO.yearly) * 12
  return <section class="sc-sec" aria-labelledby="sc-vs-landing-h">
    <Head id="sc-vs-landing-h" kicker="Satış sayfası" color="brand-green" title="Fiyat tablosu ve kullanıcı yorumları" example="Aylık ile yıllık arasında geç, fiyatlar yeni tutara yuvarlansın"
      lead="Aylık ve yıllık arasında geçince rakamlar yeni tutara yuvarlanır, öne çıkan plan parlar. Altında üyelerin sözleri iki şerit halinde akar. Hepsi tek satırlık bileşen." />
    <Reveal class="sc-vs-landing" effect="up">
      <div class="sc-vs-card sc-vs-pricing">
        <Pricing plans={PLANS} bind:period={$period} currency="TRY" saving={`${num(FREE)} ay bedava`} />
        <p class="sc-vs-note sc-vs-save" aria-live="polite">{() => ($period === "yearly"
          ? `Topluluk Pro ile yılda ${tl.format(saved)} cebinizde kalır.`
          : `Yıllığa geçin: ${num(FREE)} ay bizden.`)}</p>
      </div>
      <Testimonials class="sc-vs-voices" variant="marquee" items={VOICES} />
    </Reveal>
  </section>
}

// ── 4. social: stories, follow, a chat ──────────────────────────────────────────────────────────────────────────

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000)
const STORIES: StoryGroup[] = [
  { id: "kosu", name: "HADİ Koşu Kulübü", avatar: PHOTO("ride"), items: [
    { id: "k1", src: PHOTO("dawn"), alt: "Şafakta dağlar", time: minutesAgo(40), caption: "Şafak koşusu, herkes geldi" },
    { id: "k2", src: PHOTO("sunset"), alt: "Gün batımı", time: minutesAgo(12), caption: "Akşam turu da tamam" },
  ] },
  { id: "foto", name: "Fotoğraf Atölyesi", avatar: PHOTO("city"), items: [
    { id: "f1", src: PHOTO("city"), alt: "Gece şehir ışıkları", time: minutesAgo(90), caption: "Gece çekimi: uzun pozlama" },
  ] },
  { id: "bisiklet", name: "Pazar Bisiklet Grubu", avatar: PHOTO("sea"), items: [
    { id: "b1", src: PHOTO("forest"), alt: "Orman yolu", time: minutesAgo(200), caption: "Orman parkuru açıldı" },
    { id: "b2", src: PHOTO("sea"), alt: "Deniz", time: minutesAgo(150), caption: "Mola: deniz kenarı" },
  ] },
  { id: "kitap", name: "Kitap Kulübü", avatar: PHOTO("coffee"), items: [
    { id: "t1", src: PHOTO("coffee"), alt: "Kahve fincanı", time: minutesAgo(300), caption: "Bu ayın kitabı seçildi" },
  ] },
  { id: "oyun", name: "Masa Oyunları Ekibi", avatar: PHOTO("confetti"), items: [
    { id: "o1", src: PHOTO("confetti"), alt: "Konfeti", time: minutesAgo(25), caption: "Turnuva birincisi belli oldu" },
  ] },
]
const HANDLES: Record<string, string> = { kosu: "hadi.kosu", foto: "foto.atolye", bisiklet: "pazar.bisiklet", kitap: "kitap.kulubu", oyun: "masa.oyun" }
const PROFILE = { followers: 12480, posts: 316, events: 42 }
const REPLIES = [
  "Harika! Pazar sabahı sahilde görüşürüz 🏃",
  "Rotayı az önce paylaştım, bir bak.",
  "Kahveler benden ☕",
  "Yağmur yağarsa kapalı parkura geçeriz.",
]
const FIRST: ChatMessage[] = [
  { id: "m1", text: "Pazar koşusu için kimler geliyor?", time: minutesAgo(18), senderId: "kosu", senderName: "HADİ Koşu Kulübü", senderAvatar: PHOTO("ride") },
  { id: "m2", text: "Ben varım! Fotoğraf makinesini de getiririm 📷", time: minutesAgo(16), senderId: "foto", senderName: "Fotoğraf Atölyesi", senderAvatar: PHOTO("city"),
    reactions: [{ emoji: "🔥", count: 3 }] },
  { id: "m3", text: "Ben de geliyorum, sahil rotası mı?", time: minutesAgo(6), mine: true, status: "read" },
  { id: "m4", text: "Evet, Moda'dan başlıyoruz.", time: minutesAgo(5), senderId: "kosu", senderName: "HADİ Koşu Kulübü", senderAvatar: PHOTO("ride"),
    image: { src: PHOTO("sunset"), alt: "Sahilde gün batımı" } },
]

function Social() {
  let $seen: string[] = []
  let $loading = ""
  let $open = false
  let $start = "kosu"
  let $follow: FollowState = "follow"
  let $msgs: ChatMessage[] = FIRST
  let $typing: string[] = []
  let replyAt = 0
  const timers = new Set<() => void>()
  const after = (ms: number, fn: () => void) => { const stop = later(ms, () => { timers.delete(stop); fn() }); timers.add(stop) }
  onCleanup(() => timers.forEach((stop) => stop()))

  const openStory = (id: string) => {
    if (reducedMotion()) { $start = id; $open = true; return }
    $loading = id
    after(500, () => { $loading = ""; $start = id; $open = true })
  }
  const followers = () => PROFILE.followers + ($follow === "following" ? 1 : 0)
  const react = (m: ChatMessage, emoji: string) => {
    $msgs = $msgs.map((x) => {
      if (x.id !== m.id) return x
      const rs = [...(x.reactions ?? [])]
      const i = rs.findIndex((r) => r.emoji === emoji)
      const r = rs[i]
      if (!r) rs.push({ emoji, count: 1, mine: true })
      else if (r.mine) { if (r.count > 1) rs[i] = { ...r, count: r.count - 1, mine: false }; else rs.splice(i, 1) }
      else rs[i] = { ...r, count: r.count + 1, mine: true }
      return { ...x, reactions: rs }
    })
  }
  const send = (text: string) => {
    const id = `me${Date.now()}`
    $msgs = [...$msgs, { id, text, time: new Date(), mine: true, status: "sent" }]
    after(600, () => { $msgs = $msgs.map((x) => (x.id === id ? { ...x, status: "read" } : x)); $typing = ["HADİ Koşu Kulübü"] })
    after(2000, () => {
      $typing = []
      const text = REPLIES[replyAt++ % REPLIES.length]!
      $msgs = [...$msgs, { id: `r${Date.now()}`, text, time: new Date(), senderId: "kosu", senderName: "HADİ Koşu Kulübü", senderAvatar: PHOTO("ride") }]
    })
  }

  return <section class="sc-sec" aria-labelledby="sc-vs-social-h">
    <Head id="sc-vs-social-h" kicker="Sosyal" color="brand-blue" title="Hikâye, takip ve sohbet bileşenleri" example="Hikâye, takip, sohbet: gerçek bir uygulama gibi"
      lead="Halkaya dokun, hikâyeler açılsın; izlenen halka sakinleşir. Takip düğmesi şekil değiştirip renk saçar. Sohbete yaz: karşı taraf yazıyor görünür, sonra cevap verir. Bir mesaja tepki bırak." />
    <Reveal class="sc-vs-social" effect="up">
      <div class="sc-vs-card sc-vs-profile">
        <div class="sc-vs-tray" role="list" aria-label="Hikâyeler">
          <div role="listitem"><StoryRing name="Siz" state="none" add label="Hikâyen" onClick={() => toast("Hikâye eklemek için bir fotoğraf seç.")} /></div>
          {STORIES.map((g) => <div role="listitem"><StoryRing name={g.name} src={g.avatar} label={HANDLES[g.id]}
            state={() => ($seen.includes(g.id) ? "seen" : g.id === "kosu" ? "close" : "new")} loading={() => $loading === g.id}
            onClick={() => openStory(g.id)} /></div>)}
        </div>
        <div class="sc-vs-who">
          <StoryRing name="Fotoğraf Atölyesi" src={PHOTO("city")} size="lg" state={() => ($seen.includes("foto") ? "seen" : "new")} onClick={() => openStory("foto")} />
          <div class="sc-vs-whotext">
            <b>Fotoğraf Atölyesi</b>
            <span>@foto.atolye</span>
          </div>
          <FollowButton state={() => $follow} name="Fotoğraf Atölyesi" onChange={(s) => { $follow = s }} />
        </div>
        <dl class="sc-vs-counts">
          <div><dt>Gönderi</dt><dd>{num(PROFILE.posts)}</dd></div>
          <div><dt>Takipçi</dt><dd>{() => num(followers())}</dd></div>
          <div><dt>Etkinlik</dt><dd>{num(PROFILE.events)}</dd></div>
        </dl>
        <p class="sc-vs-note">{() => ($seen.length ? `${num($seen.length)} / ${num(STORIES.length)} hikâye izlendi.` : "Bir halkaya dokun.")}</p>
      </div>
      <div class="sc-vs-card sc-vs-chat">
        <div class="sc-vs-chathead"><b>Pazar koşusu</b><span>{() => `${num(new Set($msgs.map((m) => m.senderId ?? "me")).size)} kişi`}</span></div>
        <ChatThread class="sc-vs-thread" messages={() => $msgs} typing={() => $typing} group onReact={react} label="Pazar koşusu sohbeti" />
        <ChatComposer onSend={send} placeholder="Bir mesaj yaz" />
      </div>
    </Reveal>
    <StoryViewer open={() => $open} onClose={() => { $open = false }} groups={STORIES} start={() => $start}
      onSeen={(g) => { if (!$seen.includes(g.id)) $seen = [...$seen, g.id] }} />
  </section>
}

// ── 5. markdown: write on the left, see it on the right ─────────────────────────────────────────────────────────

const TEMPLATES = [
  { id: "event", label: "Duyuru", text: `# Pazar sabahı koşusu

**Moda sahili**, saat *08.30*. Tempo herkese göre, sonunda kahve var.

## Getirmeniz gerekenler

- Rahat ayakkabı
- Su şişesi
- İyi bir ruh hali

> Koşmak değil, birlikte koşmak güzel.

Rota ve harita: [marchjs.com](https://marchjs.com)
` },
  { id: "recipe", label: "Tarif", text: `# Koşu sonrası yulaf

Hazırlık süresi *beş dakika*, tok tutar.

1. Yulafı sütle ısıt
2. Muz ve tarçın ekle
3. Üstüne fındık serp

> İpucu: bir gece önceden hazırlarsan sabah sadece ısıtırsın.
` },
  { id: "code", label: "Kod", text: `# Bir sayaç

March'ta durum bir \`$\` ile başlar:

\`\`\`tsx
let $count = 0
<Button on:click={() => $count++}>{$count}</Button>
\`\`\`

---

**Bu kadar.** Abonelik yok, kanca yok.
` },
]

function MarkdownLive() {
  let $md = TEMPLATES[0]!.text
  let box: HTMLElement | undefined
  const grab = (el: Element) => { box = el as HTMLElement; return () => { box = undefined } }
  const words = () => $md.trim().split(/\s+/).filter(Boolean).length
  const heads = () => $md.split("\n").filter((l) => /^#{1,6}\s/.test(l)).length
  /** Wrap the selection (or a placeholder) in `before` / `after`, then select what was wrapped. */
  const wrap = (before: string, after: string, fill: string) => {
    const ta = box?.querySelector("textarea")
    if (!ta) return
    const s = ta.selectionStart, e = ta.selectionEnd
    const sel = $md.slice(s, e) || fill
    $md = $md.slice(0, s) + before + sel + after + $md.slice(e)
    queueMicrotask(() => { ta.focus(); ta.setSelectionRange(s + before.length, s + before.length + sel.length) })
  }
  /** Start the current line with `mark`. */
  const line = (mark: string) => {
    const ta = box?.querySelector("textarea")
    if (!ta) return
    const s = ta.selectionStart
    const at = $md.lastIndexOf("\n", s - 1) + 1
    $md = $md.slice(0, at) + mark + $md.slice(at)
    queueMicrotask(() => { ta.focus(); ta.setSelectionRange(s + mark.length, s + mark.length) })
  }
  const TOOLS = [
    { label: "Kalın", icon: bold, run: () => wrap("**", "**", "kalın") },
    { label: "İtalik", icon: italic, run: () => wrap("*", "*", "eğik") },
    { label: "Kod", icon: code, run: () => wrap("`", "`", "kod") },
    { label: "Bağlantı", icon: link, run: () => wrap("[", "](https://marchjs.com)", "bağlantı") },
    { label: "Liste", icon: list, run: () => line("- ") },
    { label: "Alıntı", icon: quote, run: () => line("> ") },
  ]

  return <section class="sc-sec" aria-labelledby="sc-vs-md-h">
    <Head id="sc-vs-md-h" kicker="Markdown" color="brand-gold" title="Canlı Markdown düzenleyici" example="Solda yaz, sağda gör"
      lead="Her tuşta yeniden çizilir, ama asla HTML dizesiyle değil: metindeki etiketler metin olarak kalır, bağlantılar güvenlik süzgecinden geçer. Bir şablon seç ya da kendin yaz." />
    <Reveal class="sc-vs-md" effect="up">
      <div class="sc-vs-card sc-vs-mdin" use:grab>
        <div class="sc-vs-mdbar">
          <div class="sc-vs-tools" role="toolbar" aria-label="Biçim">
            {TOOLS.map((t) => <button type="button" class="sc-vs-tool" title={t.label} aria-label={t.label} on:click={t.run}><Icon of={t.icon} /></button>)}
          </div>
          <div class="sc-vs-tpls">
            {TEMPLATES.map((t) => <Button variant="ghost" size="sm" on:click={() => { $md = t.text }}>{t.label}</Button>)}
          </div>
        </div>
        <Textarea class="sc-vs-mdarea" bind:value={$md} rows={16} autosize={false} mono tabIndent aria-label="Markdown metni" spellcheck={false} />
        <p class="sc-vs-note">{() => `${num(words())} kelime · ${num($md.length)} karakter · ${num(heads())} başlık`}</p>
      </div>
      <div class="sc-vs-card sc-vs-mdout" role="region" aria-label="Önizleme" tabindex="0">
        {() => markdownNodes($md)}
      </div>
    </Reveal>
  </section>
}

export default function MoreVisual() {
  return <>
    <Charts />
    <Gallery />
    <Landing />
    <Social />
    <MarkdownLive />
  </>
}
