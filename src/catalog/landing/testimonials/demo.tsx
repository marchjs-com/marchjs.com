// Showcase stage for Testimonials: what people say about HADİ (sample quotes).
import { Testimonials, type Testimonial } from "march/landing";

export const code = `<Testimonials variant="wall" items={[
  { quote: "Yeni şehirde ilk arkadaşlarımı bir tanışma yemeğinde buldum.", name: "Deniz Arı", role: "İzmir", rating: 5 },
  …
]} />`

export const QUOTES: Testimonial[] = [
  { quote: "Yeni şehirde ilk arkadaşlarımı bir tanışma yemeğinde buldum.", name: "Deniz Arı", role: "İzmir", rating: 5 },
  { quote: "Koşu grubumuzu HADİ'de kurduk; her salı yeni biri katılıyor.", name: "Mert Kaya", role: "Etkinlik düzenleyici, İstanbul", rating: 5 },
  { quote: "Atölyemin biletlerini ayrı bir siteye gerek kalmadan sattım.", name: "Leyla Demir", role: "Seramik atölyesi, Ankara", rating: 5 },
  { quote: "Sohbet, akış, etkinlik: telefonumda artık tek uygulama var.", name: "Can Yıldız", role: "Eskişehir", rating: 4 },
  { quote: "Hafta sonu ne yapsak derdi bitti; yakındakilere bakıp çıkıyoruz.", name: "Ece Tan", role: "Bursa", rating: 5 },
  { quote: "Etkinlik öncesi görüntülü tanıştık, buluşmada kimse yabancı değildi.", name: "Arda Su", role: "Antalya", rating: 5 },
  { quote: "Premium'daki filtrelerle tam ilgimi çeken etkinlikleri buluyorum.", name: "Selin Ak", role: "HADİ Premium, İstanbul", rating: 5 },
  { quote: "Kitap kulübümüzün anılarını hikâyelerde paylaşıyoruz.", name: "Bora Er", role: "Kitap kulübü, Trabzon", rating: 5 },
]

export default function TestimonialsDemo(props: { values: { sample: number; variant: string; cols: number; rating: boolean; ratingColor: string; avatar: boolean; quotes: boolean } }) {
  return <div>
    {() => {
      const v = { ...props.values }
      return <Testimonials variant={v.variant as "grid"} cols={v.cols as 3} items={QUOTES.slice(0, v.sample)} avatar={v.avatar} quotes={v.quotes}
        rating={v.rating} ratingColor={v.ratingColor ? v.ratingColor as "brand-gold" : undefined} />
    }}
  </div>
}
