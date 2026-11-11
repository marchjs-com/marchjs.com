// Gezinme: NavSidebar — başlık, "Ara ya da sor…" kutusu (Ctrl K), canlı rozetli öne çıkan öğe, son kullanılanlar,
// daraltılabilir kategoriler (sayılarla, "Tümünü aç/kapat"). Bu vitrinin kenar menüsü de aynı bileşen.
import { NavSidebar, Button, Card, Kbd, Stack, OverflowText, Marquee, Segmented } from "hadi-march/ui";
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
const ICONS = { "Üyeler ve roller": users, "Ekonomi ve ödemeler": wallet, "İçerik ve moderasyon": image, "Raporlar ve analiz": barChart, "Mağaza ve ticaret": store }
const ITEMS = [
  { id: "kurucular", label: "Kurucular", icon: crown, group: "Üyeler ve roller" },
  { id: "uyeler", label: "Üyeler", icon: users, group: "Üyeler ve roller" },
  { id: "davet", label: "Davet bağlantıları ve toplu üye içe aktarma geçmişi", icon: users, group: "Üyeler ve roller" },
  { id: "roller", label: "Roller", icon: shieldCheck, group: "Üyeler ve roller" },
  { id: "bekleme", label: "Bekleme Salonu", icon: hourglass, group: "Üyeler ve roller" },
  { id: "elmas", label: "Elmas & Akçe", icon: diamond, group: "Ekonomi ve ödemeler" },
  { id: "odemeler", label: "Ödemeler", icon: creditCard, group: "Ekonomi ve ödemeler" },
  { id: "iadeler", label: "İadeler", icon: receipt, group: "Ekonomi ve ödemeler" },
  { id: "moderasyon", label: "Moderasyon", icon: eye, group: "İçerik ve moderasyon" },
  { id: "sikayet", label: "Modere edilecek gönderiler", icon: flag, group: "İçerik ve moderasyon" },
  { id: "istatistik", label: "İstatistik", icon: barChart, group: "Raporlar ve analiz" },
  { id: "operasyon", label: "Operasyon", icon: gauge, group: "Raporlar ve analiz" },
  { id: "harita", label: "Kullanım haritası", icon: globe, group: "Raporlar ve analiz" },
  { id: "magaza", label: "Mağaza ayarları", icon: settings, group: "Mağaza ve ticaret" },
  { id: "kurye", label: "Kuryeler", icon: truck, group: "Mağaza ve ticaret" },
  { id: "urunler", label: "Mağaza ürünleri", icon: packageBox, group: "Mağaza ve ticaret" },
]

export default function Navigation() {
  let $waiting = 0
  let $picked = "—"
  let $trigger = "hover"
  let $mode = "bounce"
  const items = ITEMS.map((x) => ({ ...x, onSelect: () => { $picked = x.label } }))
  const featured = [{ id: "destek", label: "Destek talepleri", icon: inbox, badge: () => $waiting,
    sub: () => ($waiting ? `${$waiting} talep yanıt bekliyor` : "Yanıt bekleyen talep yok"), onSelect: () => { $picked = "Destek talepleri" } }]
  return <Section kicker="Bileşenler" title="Gezinme" lead="NavSidebar: büyük panellerin kenar çubuğu. Arama kutusu bütün öğeleri süzer; son ziyaretler ve açık kategoriler hatırlanır; klavyeyle tam gezilir; dar ekranda çekmece, geniş ekranda ikon rayına daraltılır. Bu vitrinin sol menüsü de aynı bileşen.">
    <Demo wide title="Kurucu paneli kenar çubuğu" desc="Yaz: süzer (ö/o, ı/i katlanır). ↑ ↓ Home End gez, → kategoriyi aç, ← kapat ya da kategoriye dön, Enter seç. Rozet canlı: talep ekle."
      code={`<NavSidebar title="HADİ Kurucu Paneli"
  items={[{ id: "uyeler", label: "Üyeler", icon: users, href: "/uyeler", group: "Üyeler ve roller" }, …]}
  featured={[{ id: "destek", label: "Destek talepleri", icon: inbox, href: "/destek-talepleri",
              badge: () => $bekleyen, sub: () => $bekleyen ? \`\${$bekleyen} talep yanıt bekliyor\` : "Yanıt bekleyen talep yok" }]}
  recent={5} groupIcons={KATEGORİ_İKONLARI} collapsible />`}>
      <div class="sc-sb-demo">
        <div class="sc-sb-frame">
          <NavSidebar items={items} featured={featured} title="HADİ Kurucu Paneli" groupIcons={ICONS} storageKey="sc.sb.demo" hotkey={false} recent={5} palette={false} label="Örnek kenar çubuğu" />
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

    <Demo wide title="Taşan metin: OverflowText ve Marquee" desc="Yalnız sığmayan metin kayar; sığan metin yerinde durur. Kenarlar mantıksal yönde solar; Arapça (RTL) ters yöne kayar; ekran okuyucu metni bir kez okur; azaltılmış harekette kaymaz, uç solar ve tam metin ipucunda. Yukarıdaki kenar çubuğunda uzun öğenin üzerine gel."
      code={`<OverflowText text={title} />                         // hover + odak, gidip gelir
<OverflowText trigger="visible" mode="loop" text={…} />  // görünürken sonsuz şerit
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
