// Navigation: NavSidebar — title, a "search or ask" box (Ctrl K), a featured item with a live badge, recent items,
// collapsible categories (with counts, "expand/collapse all"). The showcase's own side menu is the same component.
import { NavSidebar, Button, Card, Kbd, Stack, OverflowText, Marquee, Segmented, Toggle, Field, Slider } from "hadi-march/ui";
import {
  inbox, users, crown, shieldCheck, hourglass, wallet, diamond, receipt, creditCard, image, flag, eye, barChart, gauge, globe, settings, store, truck, packageBox, plus, minus,
} from "hadi-march/icons";
import { Demo, Section } from "../demo.tsx";

const SAMPLES = [
  ["TR", "Haftalık etkinlik özeti: Kadıköy koşu grubu, Moda sahili buluşması ve akşam yemeği"],
  ["EN", "Weekly digest: Saturday running club, beach clean-up meetup and the community dinner"],
  ["AR", "ملخص الأسبوع: نادي الجري يوم السبت، لقاء تنظيف الشاطئ وعشاء المجتمع"],
  ["Karışık", "HADİ Sosyal — مرحبا بكم في المجتمع — welcome to the community"],
  ["Kısa", "Sığan metin kaymaz"],
] as const
const CATEGORY_ICONS = { "Üyeler ve roller": users, "Ekonomi ve ödemeler": wallet, "İçerik ve moderasyon": image, "Raporlar ve analiz": barChart, "Mağaza ve ticaret": store }
const ITEMS = [
  { id: "founders", label: "Kurucular", icon: crown, group: "Üyeler ve roller" },
  { id: "members", label: "Üyeler", icon: users, group: "Üyeler ve roller" },
  { id: "invites", label: "Davet bağlantıları ve toplu üye içe aktarma geçmişi", icon: users, group: "Üyeler ve roller" },
  { id: "roles", label: "Roller", icon: shieldCheck, group: "Üyeler ve roller" },
  { id: "waiting-room", label: "Bekleme Salonu", icon: hourglass, group: "Üyeler ve roller" },
  { id: "diamonds", label: "Elmas & Akçe", icon: diamond, group: "Ekonomi ve ödemeler" },
  { id: "payments", label: "Ödemeler", icon: creditCard, group: "Ekonomi ve ödemeler" },
  { id: "refunds", label: "İadeler", icon: receipt, group: "Ekonomi ve ödemeler" },
  { id: "moderation", label: "Moderasyon", icon: eye, group: "İçerik ve moderasyon" },
  { id: "reports", label: "Modere edilecek gönderiler", icon: flag, group: "İçerik ve moderasyon" },
  { id: "statistics", label: "İstatistik", icon: barChart, group: "Raporlar ve analiz" },
  { id: "operations", label: "Operasyon", icon: gauge, group: "Raporlar ve analiz" },
  { id: "usage-map", label: "Kullanım haritası", icon: globe, group: "Raporlar ve analiz" },
  { id: "store-settings", label: "Mağaza ayarları", icon: settings, group: "Mağaza ve ticaret" },
  { id: "couriers", label: "Kuryeler", icon: truck, group: "Mağaza ve ticaret" },
  { id: "store-products", label: "Mağaza ürünleri", icon: packageBox, group: "Mağaza ve ticaret" },
]

export default function Navigation() {
  let $waiting = 0
  let $picked = "—"
  let $trigger = "hover"
  let $resizable = true
  let $collapse = true
  let $startWidth = 280
  let $minWidth = 200
  let $maxWidth = 440
  let $liveWidth = 280
  let $mode = "bounce"
  const items = ITEMS.map((x) => ({ ...x, onSelect: () => { $picked = x.label } }))
  const featured = [{ id: "support", label: "Destek talepleri", icon: inbox, badge: () => $waiting,
    sub: () => ($waiting ? `${$waiting} talep yanıt bekliyor` : "Yanıt bekleyen talep yok"), onSelect: () => { $picked = "Destek talepleri" } }]
  return <Section kicker="Bileşenler" title="Gezinme" lead="NavSidebar: büyük panellerin kenar çubuğu. Arama kutusu bütün öğeleri süzer; son ziyaretler ve açık kategoriler hatırlanır; klavyeyle tam gezilir; dar ekranda çekmece, geniş ekranda ikon rayına daraltılır. Bu vitrinin sol menüsü de aynı bileşen.">
    <Demo wide title="Kurucu paneli kenar çubuğu" desc="Yaz: süzer (ö/o, ı/i katlanır). ↑ ↓ Home End gez, → kategoriyi aç, ← kapat ya da kategoriye dön, Enter seç. Rozet canlı: talep ekle."
      code={`<NavSidebar title="HADİ Kurucu Paneli"
  items={[{ id: "members", label: "Üyeler", icon: users, href: "/members", group: "Üyeler ve roller" }, …]}
  featured={[{ id: "support", label: "Destek talepleri", icon: inbox, href: "/support-tickets",
              badge: () => $pending, sub: () => $pending ? \`\${$pending} talep yanıt bekliyor\` : "Yanıt bekleyen talep yok" }]}
  recent={5} groupIcons={CATEGORY_ICONS} collapsible />`}>
      <div class="sc-sb-demo">
        <div class="sc-sb-frame">
          <NavSidebar items={items} featured={featured} title="HADİ Kurucu Paneli" groupIcons={CATEGORY_ICONS} storageKey="sc.sb.demo" hotkey={false} recent={5} palette={false} label="Örnek kenar çubuğu" />
        </div>
        <Card title="Durum">
          <Stack gap={3}>
            <p class="hm-muted">Seçilen: <strong>{$picked}</strong></p>
            <div class="sc-row"><Button size="sm" icon={plus} on:click={() => { $waiting++ }}>Talep ekle</Button><Button size="sm" variant="ghost" icon={minus} on:click={() => { $waiting = Math.max(0, $waiting - 1) }}>Yanıtla</Button></div>
            <p class="hm-muted">Bu vitrinin sol menüsünde <Kbd keys="mod+k" /> komut paletini açar; ray düğmesi menüyü ikonlara daraltır.</p>
          </Stack>
        </Card>
      </div>
    </Demo>

    <Demo wide title="Genişletilebilir kenar çubuğu" desc="İç kenardaki ince tutamağı sürükle (dokunmatikte de), çift tıkla: başlangıç genişliği. Tutamağa Tab ile gel: ← → 16 px (Shift: 64), Home/End en dar/en geniş. collapseBelow altına çekince yalnız ikon moduna geçer. Bu vitrinin sol menüsü de böyle."
      code={`<NavSidebar items={items} resizable width="18rem" minWidth={220} maxWidth={420}
  collapseBelow={150} persist onResize={(w) => console.log(w)} />`}>
      <div class="sc-row sc-row-between">
        <Toggle bind:value={$resizable} label="resizable" />
        <Toggle bind:value={$collapse} label="collapseBelow={150}" />
        <span class="hm-muted">Genişlik: <strong>{() => `${$liveWidth} px`}</strong></span>
      </div>
      <div class="sc-grid-controls">
        <Field label={() => `width (başlangıç): ${$startWidth} px`}><Slider bind:value={$startWidth} min={220} max={400} step={10} /></Field>
        <Field label={() => `minWidth – maxWidth: ${$minWidth} – ${$maxWidth} px`}><Stack gap={2}><Slider bind:value={$minWidth} min={160} max={300} step={10} /><Slider bind:value={$maxWidth} min={320} max={600} step={10} /></Stack></Field>
      </div>
      <div class="sc-resize-frame">
        {() => {
          const opts = { resizable: $resizable, width: $startWidth, minWidth: $minWidth, maxWidth: $maxWidth, collapseBelow: $collapse ? 150 : undefined }
          return <NavSidebar items={items} featured={featured} title="Panel" groupIcons={CATEGORY_ICONS} storageKey={`sc.sb.resize.${opts.width}.${opts.minWidth}.${opts.maxWidth}`} persist={false}
            hotkey={false} palette={false} label="Genişletilebilir örnek" collapsible={$collapse} {...opts} onResize={(w: number) => { $liveWidth = w }} />
        }}
        <div class="sc-resize-content"><p class="hm-muted">Sayfa içeriği: kenar çubuğu genişledikçe bu alan daralır.</p></div>
      </div>
    </Demo>

    <Demo wide title="Taşan metin: OverflowText ve Marquee" desc="Yalnız sığmayan metin kayar; sığan metin yerinde durur. Kenarlar mantıksal yönde solar; Arapça (RTL) ters yöne kayar; ekran okuyucu metni bir kez okur; azaltılmış harekette kaymaz, uç solar ve tam metin ipucunda. Yukarıdaki kenar çubuğunda uzun öğenin üzerine gel."
      code={`<OverflowText text={title} />                         // hover + odak, gidip gelir
<OverflowText trigger="visible" mode="loop" text={…} />  // endless ticker while visible
<OverflowText trigger="always" mode="once" speed={60} pause={800} />
<Marquee text="Duyuru · …" separator="✦" />          // trigger=visible, mode=loop`}>
      <div class="sc-row sc-row-between">
        <Segmented bind:value={$trigger} aria-label="Tetik" options={["hover", "focus", "always", "visible"].map((v) => ({ value: v, label: v }))} />
        <Segmented bind:value={$mode} aria-label="Mod" options={["bounce", "loop", "once"].map((v) => ({ value: v, label: v }))} />
      </div>
      {() => { const trigger = $trigger as "hover", mode = $mode as "bounce"; return <div class="sc-mq-list">
        {SAMPLES.map(([lang, text]) => <button type="button" class="sc-mq-row"><span class="sc-mq-lang">{lang}</span><OverflowText class="sc-mq-text" text={text} trigger={trigger} mode={mode} /></button>)}
      </div> }}
      <div class="sc-mq-ticker"><Marquee text="Yeni: HADİ March vitrini · Grid fill ve balance · Taşan metin · Dört resmi renk" separator="✦" speed={50} /></div>
    </Demo>
  </Section>
}
