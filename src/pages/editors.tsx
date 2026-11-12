// Editors: rich text, Markdown, JSON / tree, color and gradient, easing curve, keyframe timeline, image cropper. Each card
// is a component folder (src/components/…): demo + Playground + Code tab from the folder itself.
import "./editors.css";
import { Section } from "../demo.tsx";
import { ComponentDemo } from "../component-demo.tsx";

export default function Editors() {
  return <Section kicker="Bileşenler" title="Editörler" lead="Zengin metin, Markdown, JSON ağacı, renk ve gradyan, hareket eğrisi, anahtar kare zaman çizelgesi ve resim kırpma. Hepsi klavyeyle kullanılır, sağdan sola yazında aynalanır, geri alınabilir.">
    <ComponentDemo folder="composite/rich-text-editor" title="RichTextEditor: zengin metin, Markdown giriş/çıkış" desc="Metni seçip araç çubuğunu ya da Ctrl+B / I / K kısayollarını kullanın; satır başında # , - , 1. , > yazmak bloğu dönüştürür. @ ile kişi, : ile emoji önerilir. Başka bir siteden yapıştırılan içerik güvenli içerik çekirdeğinden geçer: yalnız izinli öğeler kalır. Ctrl+Z / Ctrl+Shift+Z editörün kendi geçmişini kullanır." />
    <ComponentDemo folder="composite/markdown-editor" title="MarkdownEditor: bölünmüş önizleme" desc="Solda Markdown, sağda canlı önizleme; aradaki tutamağı sürükleyin, iki bölme birlikte kayar. Listede Enter yeni madde açar, Tab girintiler; araç çubuğu ve Ctrl+B / I / K sözdizimini yazar ve Ctrl+Z ile geri alınır. Bir web sayfasından yapıştırılan biçimli metin Markdown'a dönüşür. Zengin sekmesi aynı metni RichTextEditor ile açar." />
    <ComponentDemo folder="composite/tree-editor" title="TreeEditor: JSON ağacı, tür rozetleri, doğrulama" desc="Değere çift tıklayın ya da Enter ile düzenleyin; rozete tıklayınca tür değişir (metin, sayı, doğru/yanlış, boş, nesne, liste). Satır sonundaki düğmeler ekler, çoğaltır, siler. Şemaya uymayan satırlar kırmızı işaretlenir; arama eşleşmeleri ve üst düğümlerini gösterir. Ctrl+Z / Ctrl+Shift+Z ağacın kendi geçmişini kullanır." />
    <ComponentDemo folder="composite/json-editor" title="JsonEditor: metin ve ağaç" desc="Aynı JSON iki görünümde: metinde satır/sütunlu hata ve Biçimlendir, ağaçta satır satır düzenleme. Şema iki görünümü de denetler; metin ayrıştırılamazken Ağaç sekmesi kapalıdır. Ağaç görünümü ilk açılışta yüklenir." />
  </Section>
}
