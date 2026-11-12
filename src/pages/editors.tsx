// Editors: rich text, Markdown, JSON / tree, color and gradient, easing curve, keyframe timeline, image cropper. Each card
// is a component folder (src/components/…): demo + Playground + Code tab from the folder itself.
import "./editors.css";
import { Section } from "../demo.tsx";
import { ComponentDemo } from "../component-demo.tsx";

export default function Editors() {
  return <Section kicker="Bileşenler" title="Editörler" lead="Zengin metin, Markdown, JSON ağacı, renk ve gradyan, hareket eğrisi, anahtar kare zaman çizelgesi ve resim kırpma. Hepsi klavyeyle kullanılır, sağdan sola yazında aynalanır, geri alınabilir.">
    <ComponentDemo folder="composite/rich-text-editor" title="RichTextEditor: zengin metin, Markdown giriş/çıkış" desc="Metni seçip araç çubuğunu ya da Ctrl+B / I / K kısayollarını kullanın; satır başında # , - , 1. , > yazmak bloğu dönüştürür. @ ile kişi, : ile emoji önerilir. Başka bir siteden yapıştırılan içerik güvenli içerik çekirdeğinden geçer: yalnız izinli öğeler kalır. Ctrl+Z / Ctrl+Shift+Z editörün kendi geçmişini kullanır." />
    <ComponentDemo folder="composite/markdown-editor" title="MarkdownEditor: bölünmüş önizleme" desc="Solda Markdown, sağda canlı önizleme; aradaki tutamağı sürükleyin, iki bölme birlikte kayar. Listede Enter yeni madde açar, Tab girintiler; araç çubuğu ve Ctrl+B / I / K sözdizimini yazar ve Ctrl+Z ile geri alınır. Bir web sayfasından yapıştırılan biçimli metin Markdown'a dönüşür. Zengin sekmesi aynı metni RichTextEditor ile açar." />
  </Section>
}
