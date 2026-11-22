// Overlay and media: one MarchIDE page per component (Overlay: video, image, SVG, canvas and CSS effect layers that never take input).
import { Hub } from "../hub.tsx";
import { TOPICS } from "../topics/overlay.ts";
import { ComponentDemo } from "../component-demo.tsx";

export default function OverlayPage(props: { params?: { rest?: string } }) {
  const RENDER: Record<string, () => unknown> = {
    "picture": () => <ComponentDemo folder="media/picture" title="Picture: resim ya da kendi düğümünüz" desc="Kapak, logo ve medya yuvalarının arkasındaki resim öğesi. Resim nesnesi tembel yüklenen bir img olur, hazır düğüm olduğu gibi çizilir; ilk ekran için hemen yükleme, sığdırma ve yedek içerik." />,
    "corner-mark": () => <ComponentDemo folder="media/corner-mark" title="CornerMark: köşe işareti" desc="Resmin, kartın ya da avatarın köşesindeki küçük yuvarlak işaret. Köşe, ikon, renk, boyut ve görünüm seçilir; hep görünür ya da yalnız üstüne gelince (klavye odağında da)." />,
    "overlay": () => <ComponentDemo folder="media/overlay" title="Overlay: efekt katmanı" desc="Kartın içinde, içeriğin arkasında ya da önünde; katman tıklama almaz, düğme çalışmaya devam eder." />,
    "media": () => <ComponentDemo folder="media/media" title="Media: resim, video, ses" desc="Kabına sığar, türü uzantıdan anlar; yüklenemezse yedek metin gösterir. Pencerede açmak için openMedia." />,
    "carousel": () => <ComponentDemo folder="media/carousel" title="Carousel: kaydır ve yaslan" desc="Geniş ekranda 1–4 slayt, telefonda bir slayt ve sonrakinin ucu; oklar uçlarda gizlenir, noktalar konumu gösterir." />,
  }
  return <Hub section="/overlay" topics={TOPICS} kicker="Hareket" title="Overlay" lead="Bir kapsayıcının içinde yaşayan katmanlar: sessiz döngülü video, resim, SVG, çizim işlevli canvas ya da CSS efekti (cam, gradyan, mesh, gürültü, vinyet, spot ışığı, ızgara, noktalar). Eklenme sırasıyla üst üste biner; arka plan katmanları içeriğin altında, front olanlar üstünde. Hiçbiri tıklama almaz: altındaki düğme ve alanlar çalışır." render={RENDER} params={props.params} />
}
