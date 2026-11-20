// Buttons, menus, tooltips, badges, chips, avatars, cards, tabs.
import "./buttons.css";
import { Hub } from "../hub.tsx";
import { ComponentDemo } from "../component-demo.tsx";

export default function Buttons(props: { params?: { rest?: string } }) {
  const RENDER: Record<string, () => unknown> = {
    "clamp-text": () => <ComponentDemo folder="typography/clamp-text" title="ClampText: katlanan metin" desc="Metin N satıra katlanır; yalnız sığmadığında &quot;devamı&quot; düğmesi çıkar, açılınca &quot;daha az&quot;. Dışarıdan denetlenebilir; metinler ve renk değişir, düğme kapatılabilir." />,
    "undo-redo": () => <ComponentDemo folder="actions/undo-redo" title="UndoRedo: geri al ve yinele" desc="Düzenleyici çubuğundaki düğme çifti. Geri alma geçmişini izler: yapılacak iş yoksa kapanır, ipucunda adımın adı ve kısayol yazar. +1 ve ×2 ile adım ekleyip deneyin." />,
    "button": () => <ComponentDemo folder="actions/button" title="Button: varyant, boyut, yükleniyor" desc="Beş varyant, üç boyut; yükleniyor düğmeyi kilitler ve ikonun yerinde çark döner. Alttaki ActionButton bir action()'ı onay ve bildirimle çalıştırır." />,
    "icon-button": () => <ComponentDemo folder="actions/icon-button" title="IconButton: yalnız ikon" desc="Erişilebilir ad zorunlu; aynı ad ipucu olarak da görünür. Kalp düğmesi aria-pressed ile açılıp kapanır." />,
    "button-group": () => <ComponentDemo folder="actions/button-group" title="ButtonGroup: ilişkili düğmeler" desc="Aralıklı ya da bitişik; bitişik şeritte yuvarlak uçlar RTL'de de dışta kalır." />,
    "scroll-to-top": () => <ComponentDemo folder="actions/scroll-to-top" title="ScrollToTop: başa dön" desc="Sayfa aşağı kayınca belirir, basınca yumuşakça başa döner; varsayılan olarak sayfa köşesine yerleşir. Burada kendi kaydırma kutusunda." />,
    "copy-button": () => <ComponentDemo folder="actions/copy-button" title="CopyButton: panoya kopyala" desc="Kopyalandı der ve bunu ekran okuyucuya duyurur; pano yoksa bildirimle söyler." />,
    "menu": () => <ComponentDemo folder="actions/menu" title="Menu ve Dropdown" desc="Ok tuşları, Home/End, Esc; kısayollar platforma göre yazılır, action() onaylı silme ve bildirimi getirir. Dropdown herhangi bir içeriği açar." />,
    "tooltip": () => <ComponentDemo folder="overlays/tooltip" title="Tooltip: kısa ipucu" desc="Üstüne gelince kısa bir gecikmeyle, klavye odağında hemen görünür; aria-describedby ile bağlanır, Esc gizler." />,
    "chip": () => <ComponentDemo folder="actions/chip" title="Chip: seçenekler" desc="Etiket hapı: düz, seçilebilir süzgeç ya da kaldırılabilir. Seçili işareti ve rengi değiştirilebilir; renk seçeneği yalnız etkili olduğu durumda (süzgeç çipi ya da primary ton) görünür." />,
    "made-with-march": () => <ComponentDemo folder="actions/made-with-march" title="MadeWithMarch: kredi satırı" desc="İsteğe bağlı: &quot;March ve 💗 ile geliştirildi&quot;. Lisans MIT olarak kalır; kullanmak rica, zorunluluk değil. Bağlantı adresi tek bir sabittedir (MARCH_URL)." />,
    "chevron": () => <ComponentDemo folder="actions/chevron" title="Chevron: açılınca dönen ok" desc="Dört yön, RTL'de aynalanır; open verilmezse içinde durduğu düğmenin aria-expanded değerini kendisi izler." />,
    "kbd": () => <ComponentDemo folder="typography/kbd"title="Kbd: klavye kısayolu" desc="mod macOS'ta ⌘, ötekilerde Ctrl yazılır; kısayol dizisi key() ve kısayol listesiyle aynı biçimde okunur." />,
    "secret": () => <ComponentDemo folder="typography/secret" title="Secret: gizli değer" desc="Göz düğmesi değerin tamamını gösterir; gizliyken gizli karakterler DOM'da yoktur. Aralıkları ve maskeyi Seçenekler'den değiştir." />,
    "section-label": () => <ComponentDemo folder="typography/section-label" title="SectionLabel: panel içi grup başlığı" desc="Menü, palet, kenar çubuğu ve özellik ızgarasındaki küçük grup başlığı: ikon, sayı ve sonda eylem yuvası." />,
  }
  return <Hub section="/buttons" kicker="Bileşenler" title="Düğmeler ve rozetler" lead="Dört varyant, üç boyut; yükleniyor, devre dışı, odak halkası ve basma geri bildirimi. Hepsi klavyeyle tam kullanılır." render={RENDER} params={props.params} />
}
