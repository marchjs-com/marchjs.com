// The topics of /editors (one page each, /editors/<slug>): titles, one-line descriptions, groups. The section page loads
// only this file; src/topics.ts gathers every section for the menu, MarchIDE and the start-up titles.
import type { Topic } from "./types.ts";

export const TOPICS: readonly Topic[] = [
  { slug: "rich-text", title: "Zengin metin", name: "RichTextEditor", desc: "Biçimli metin, bağlantı, liste; Markdown giriş ve çıkış.", group: "Metin" },
  { slug: "markdown", title: "Markdown düzenleyici", name: "MarkdownEditor", desc: "Solda Markdown, sağda canlı önizleme; bölmeler birlikte kayar.", group: "Metin" },
  { slug: "format-toolbar", title: "Biçimlendirme çubuğu", name: "FormatToolbar", desc: "Kalın, italik, başlık, liste, bağlantı, geri al: araçlar, adlar, ikonlar ve kısayol ipuçları sizin.", group: "Metin" },
  { slug: "editor-frame", title: "Editör çerçevesi", name: "EditorFrame", desc: "Kenar ve odak halkası, üst çubuk, yazma alanı, alt çubuk: kendi editörünüz için aynı görünüm.", group: "Metin" },
  { slug: "code", title: "Kod alanı", name: "CodeEditor", desc: "Yazdıkça renklenen kod, imleçte öneri listesi, parlayan ve altı çizilen aralıklar, durum satırı.", group: "Metin" },
  { slug: "json", title: "JSON düzenleyici", name: "JsonEditor", desc: "Aynı JSON metinde ve ağaçta; satır/sütunlu hata, biçimlendir.", group: "Veri" },
  { slug: "tree", title: "JSON ağacı", name: "TreeEditor", desc: "Satır satır düzenleme, tür rozetleri, şema doğrulaması, geri al.", group: "Veri" },
  { slug: "terminal", title: "Terminal", name: "Terminal", desc: "Komutlar, ANSI renkler, tablo ve JSON çıktısı; pencereli hâli.", group: "Veri" },
  { slug: "debugger", title: "Hata ayıklayıcı", name: "Debugger", desc: "Kesme noktası, adım adım, izlenenler, çağrı yığını; kayıtta zamanda geri.", group: "Veri" },
  { slug: "color", title: "Renk seçici", name: "ColorPicker", desc: "HSV alanı, saydamlık, göz damlası, paletler.", group: "Görsel" },
  { slug: "font", title: "Yazı tipi seçici", name: "FontPicker", desc: "Sistem ve Google yazı tipleri tek listede; arama, canlı önizleme, favoriler.", group: "Görsel" },
  { slug: "gradient", title: "Gradyan", name: "GradientEditor", desc: "Duraklar ve açı; CSS çıktısı.", group: "Görsel" },
  { slug: "image-cropper", title: "Resim kırpıcı", name: "ImageCropper", desc: "Döndürme, oran, yakınlaştırma, aynalama.", group: "Görsel" },
  { slug: "easing", title: "Hareket eğrisi", name: "EasingCurveEditor", desc: "cubic-bezier tutamakları, hazır eğriler, canlı önizleme.", group: "Hareket" },
  { slug: "keyframes", title: "Zaman çizelgesi", name: "KeyframeTimeline", desc: "Anahtar kareler, sürükleyerek zamanlama, kare başına eğri.", group: "Hareket" },
];
