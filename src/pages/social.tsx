// Social: the social components (src/components/social and composite) in one page — a small social app built only
// from them, then one Playground per component (each card comes from the component folder: demo, options, code).
import "./social.css";
import { Section } from "../demo.tsx";
import { ComponentDemo } from "../component-demo.tsx";

export default function SocialPage() {
  return <Section kicker="Bileşenler" title="Sosyal" lead="Gönderi kartı, akış, hikâye, sohbet, yorum, profil, etkinlik ve bildirim bileşenleri. HADİ'nin dört rengi, hareket motoru ve tam klavye erişimi; her bileşenin kendi Playground'u var.">
    <ComponentDemo folder="composite/post-card" title="PostCard: gönderi kartı" desc="Fotoğraflara çift dokunun: büyük kalp belirir ve dört HADİ rengiyle patlar. Beğeni, yorum ve paylaşım sayıları yuvarlanarak değişir; uzun metin üç satırda katlanır." />
    <ComponentDemo folder="social/like-button" title="LikeButton: beğeni" desc="Kalp yayla zıplar, halka büyür, parçacıklar HADİ renkleriyle saçılır. Hareket motoru üstünde: Tümünü durdur, hız ve azaltılmış hareket buna da uyar." />
    <ComponentDemo folder="social/media-grid" title="MediaGrid: medya ızgarası" desc="1, 2, 3, 4 ve daha fazla fotoğraf için ayrı yerleşim; fazlası son karede +N. Görsel gelene kadar iskelet, sonra yumuşak belirme." />
    <ComponentDemo folder="social/count-roll" title="CountRoll: yuvarlanan sayaç" desc="Yalnız değişen basamak döner: artınca yukarı, azalınca aşağı. Yerel kısa biçim (1,2 B) ya da tam sayı." />
  </Section>
}
