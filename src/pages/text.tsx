// Text and hints: keyboard keys, clamped text, section labels, the credit line and tooltips (one MarchIDE page each).
import { Hub } from "../hub.tsx";
import { ComponentDemo } from "../component-demo.tsx";

export default function Text(props: { params?: { rest?: string } }) {
  const RENDER: Record<string, () => unknown> = {
    "kbd": () => <ComponentDemo folder="typography/kbd"title="Kbd: klavye kısayolu" desc="mod macOS'ta ⌘, ötekilerde Ctrl yazılır; kısayol dizisi key() ve kısayol listesiyle aynı biçimde okunur." />,
    "clamp-text": () => <ComponentDemo folder="typography/clamp-text" title="ClampText: katlanan metin" desc="Metin N satıra katlanır; yalnız sığmadığında &quot;devamı&quot; düğmesi çıkar, açılınca &quot;daha az&quot;. Dışarıdan denetlenebilir; metinler ve renk değişir, düğme kapatılabilir." />,
    "section-label": () => <ComponentDemo folder="typography/section-label" title="SectionLabel: panel içi grup başlığı" desc="Menü, palet, kenar çubuğu ve özellik ızgarasındaki küçük grup başlığı: ikon, sayı ve sonda eylem yuvası." />,
    "made-with-march": () => <ComponentDemo folder="actions/made-with-march" title="MadeWithMarch: kredi satırı" desc="İsteğe bağlı: &quot;March ve 💗 ile geliştirildi&quot;. Lisans MIT olarak kalır; kullanmak rica, zorunluluk değil. Bağlantı adresi tek bir sabittedir (MARCH_URL)." />,
    "tooltip": () => <ComponentDemo folder="overlays/tooltip" title="Tooltip: kısa ipucu" desc="Üstüne gelince kısa bir gecikmeyle, klavye odağında hemen görünür; aria-describedby ile bağlanır, Esc gizler." />,
  }
  return <Hub section="/text" kicker="Bileşenler" title="Metin ve ipuçları" lead="Metnin küçük parçaları: klavye kısayolu, katlanan uzun metin, panel içi grup başlığı, kredi satırı ve üstüne gelince beliren ipucu. Hepsi ekran okuyucuya doğru okunur." render={RENDER} params={props.params} />
}
