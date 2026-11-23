// Showcase stage for Faq.
import { Faq, type FaqItem } from "march/landing";
import { Button } from "march/actions";

export const code = `<Faq layout="split" search title="Sık sorulanlar" lead="…" contact={<Button variant="secondary">Bize yaz</Button>}
  items={[{ q: "HADİ ücretsiz mi?", a: "Evet. Premium isteğe bağlı." }, …]} />
<Faq search items={…} count={false} reveal="none"
  labels={{ search: "Bir kelime yaz", empty: "Bulamadık. Bize yaz.", count: (shown, total) => \`\${shown} / \${total}\` }} />`

export const FAQ: FaqItem[] = [
  { q: "HADİ ücretsiz mi?", a: "Evet. Etkinlik keşfetmek, katılmak, sohbet ve akış ücretsiz. HADİ Premium isteğe bağlı ek özellikler sunar.", keywords: "fiyat premium para" },
  { q: "Telefonda mı, tarayıcıda mı?", a: "İkisinde de. Uygulamayı indirebilir ya da tarayıcıdan hiçbir şey kurmadan kullanabilirsin.", keywords: "uygulama indir web" },
  { q: "Kendi etkinliğimi nasıl kurarım?", a: "Ne, nerede, ne zaman ve kaç kişi: birkaç adımda yayında. İstersen bilet de satabilirsin." },
  { q: "Tanışma yemekleri nedir?", a: "Ortak ilgi alanı olan birkaç kişinin aynı masada buluştuğu yemekler. Yerini ayırırsın, gerisini HADİ ayarlar.", keywords: "yemek tanışma masa" },
  { q: "Etkinlik iptal olursa ne olur?", a: "Katılanlara hemen bildirim gider; biletli etkinliklerde iade düzenleyicinin koşullarına göre yapılır.", keywords: "iade iptal bilet" },
  { q: "Güvende miyim?", a: "Profilleri doğrulama, şikâyet ve engelleme her ekranda bir dokunuş uzağında.", keywords: "güvenlik engelle şikayet" },
]

export default function FaqDemo(props: { values: { sample: number; title: string; lead: string; layout: string; search: boolean; multiple: boolean; texts: boolean; count: boolean; reveal: string } }) {
  return <div>
    {() => {
      const v = { ...props.values }
      return <Faq layout={v.layout as "split"} search={v.search} multiple={v.multiple} count={v.count} reveal={v.reveal as "up"}
        labels={v.texts ? { search: "Bir kelime yaz: bilet, yemek, iptal…", empty: "Bunu bulamadık. Bize yaz, yanıtlayalım.", count: (shown: number, total: number) => `${total} sorudan ${shown} tanesi` } : undefined}
        items={FAQ.slice(0, v.sample)} title={v.title || undefined} lead={v.lead || undefined} contact={<Button variant="secondary">Bize yaz</Button>} />
    }}
  </div>
}
