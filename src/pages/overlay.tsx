// Overlay and media: one MarchIDE page per component (Overlay: video, image, SVG, canvas and CSS effect layers that never take input).
// the LED components have their own entry (march/led): each demo is a lazy part here, so their code stays out of
// this route's chunk until an LED page opens
import { lazy } from "march/lazy";
import { Hub } from "../hub.tsx";
import { TOPICS } from "../topics/overlay.ts";
import { ComponentDemo } from "../component-demo.tsx";

const LedBoardDemo = lazy(() => import("../catalog/media/led-board/demo.tsx"), { placeholder: "card" });
const LedEyesDemo = lazy(() => import("../catalog/media/led-eyes/demo.tsx"), { placeholder: "card" });
const LedMatrixDemo = lazy(() => import("../catalog/media/led-matrix/demo.tsx"), { placeholder: "card" });
const PixelFontDemo = lazy(() => import("../catalog/media/pixel-font/demo.tsx"), { placeholder: "card" });
const PixelSpriteDemo = lazy(() => import("../catalog/media/pixel-sprite/demo.tsx"), { placeholder: "card" });

export default function OverlayPage(props: { params?: { rest?: string } }) {
  const RENDER: Record<string, () => unknown> = {
    "picture": () => <ComponentDemo folder="media/picture" title="Picture: resim ya da kendi düğümünüz" desc="Kapak, logo ve medya yuvalarının arkasındaki resim öğesi. Resim nesnesi tembel yüklenen bir img olur, hazır düğüm olduğu gibi çizilir; ilk ekran için hemen yükleme, sığdırma ve yedek içerik." />,
    "corner-mark": () => <ComponentDemo folder="media/corner-mark" title="CornerMark: köşe işareti" desc="Resmin, kartın ya da avatarın köşesindeki küçük yuvarlak işaret. Köşe, ikon, renk, boyut ve görünüm seçilir; hep görünür ya da yalnız üstüne gelince (klavye odağında da)." />,
    "overlay": () => <ComponentDemo folder="media/overlay" title="Overlay: efekt katmanı" desc="Kartın içinde, içeriğin arkasında ya da önünde; katman tıklama almaz, düğme çalışmaya devam eder." />,
    "media": () => <ComponentDemo folder="media/media" title="Media: resim, video, ses" desc="Kabına sığar, türü uzantıdan anlar; yüklenemezse yedek metin gösterir. Pencerede açmak için openMedia." />,
    "carousel": () => <ComponentDemo folder="media/carousel" title="Carousel: kaydır ve yaslan" desc="Geniş ekranda 1–4 slayt, telefonda bir slayt ve sonrakinin ucu; oklar uçlarda gizlenir, noktalar konumu gösterir." />,
    "led-board": () => <ComponentDemo folder="media/led-board" view={LedBoardDemo as never} title="LedBoard: eğlenceli LED pano" desc="Sahneleri değiştirin (karşılama, maç skoru, saat, gözler), yön, hız, efekt ve geçişi deneyin. Maç skorunda Gol düğmesine basın: değişen rakam yuvarlanır. Panoya odaklanıp Boşluk ile durdurun, oklarla sahne değiştirin." />,
    "led-eyes": () => <ComponentDemo folder="media/led-eyes" view={LedEyesDemo as never} title="LedEyes: canlı LED gözler" desc="İfadeyi ve ağzı seçin; gözler yaylanarak yeni ifadeye kayar, kendiliğinden kırpar ve bakınır. Sağdaki küçük yüz işaretçinizi izler." />,
    "led-matrix": () => <ComponentDemo folder="media/led-matrix" view={LedMatrixDemo as never} title="LedMatrix: LED nokta matrisi" desc="Resmi satır satır yazın (. sönük, r y g b renkli); LED biçimi, ışıma, sönük iz ve tarama çizgilerini deneyin. Hayat oyununda her adımda yalnız değişen LED'ler boyanır." />,
    "pixel-font": () => <ComponentDemo folder="media/pixel-font" view={PixelFontDemo as never} title="PixelFont: piksel yazı" desc="Türkçe harflerle yazın, :heart: gibi emojiler ekleyin; 5×7 ile kalın 8×8 arasında geçin." />,
    "pixel-sprite": () => <ComponentDemo folder="media/pixel-sprite" view={PixelSpriteDemo as never} title="PixelSprite: piksel çizim" desc="Hazır çizimlerden birini seçin, kare hızını ve görünümü değiştirin; hareketli olanlar motorun saatinde oynar." />,
  }
  return <Hub section="/overlay" topics={TOPICS} kicker="Hareket" title="Overlay" lead="Bir kapsayıcının içinde yaşayan katmanlar: sessiz döngülü video, resim, SVG, çizim işlevli canvas ya da CSS efekti (cam, gradyan, mesh, gürültü, vinyet, spot ışığı, ızgara, noktalar). Eklenme sırasıyla üst üste biner; arka plan katmanları içeriğin altında, front olanlar üstünde. Hiçbiri tıklama almaz: altındaki düğme ve alanlar çalışır." render={RENDER} params={props.params} />
}
