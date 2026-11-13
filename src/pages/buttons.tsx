// Buttons, menus, tooltips, badges, chips, avatars, cards, tabs.
import "./buttons.css";
import {
  Button, IconButton, Chip, Avatar, AvatarGroup, Card, LinkCard, IconTile, Tabs,
  Stack, Divider,
} from "hadi-march/ui";
import {
  plus, more, bell, search, filter, users, zap, shieldCheck,
} from "hadi-march/icons";
import { Demo } from "../demo.tsx";
import { Hub } from "../hub.tsx";
import { ComponentDemo } from "../component-demo.tsx";

export default function Buttons(props: { params?: { rest?: string } }) {
  let $tags = ["Tasarım", "Ürün", "Pazarlama", "Destek"]
  let $filters = new Set(["Açık"])
  const toggleFilter = (f: string) => { const n = new Set($filters); if (n.has(f)) n.delete(f); else n.add(f); $filters = n }
  const RENDER: Record<string, () => unknown> = {
    "button": () => <ComponentDemo folder="actions/button" title="Button: varyant, boyut, yükleniyor" desc="Beş varyant, üç boyut; yükleniyor düğmeyi kilitler ve ikonun yerinde çark döner. Alttaki ActionButton bir action()'ı onay ve bildirimle çalıştırır." />,
    "icon-button": () => <ComponentDemo folder="actions/icon-button" title="IconButton: yalnız ikon" desc="Erişilebilir ad zorunlu; aynı ad ipucu olarak da görünür. Kalp düğmesi aria-pressed ile açılıp kapanır." />,
    "button-group": () => <ComponentDemo folder="actions/button-group" title="ButtonGroup: ilişkili düğmeler" desc="Aralıklı ya da bitişik; bitişik şeritte yuvarlak uçlar RTL'de de dışta kalır." />,
    "scroll-to-top": () => <ComponentDemo folder="actions/scroll-to-top" title="ScrollToTop: başa dön" desc="Sayfa aşağı kayınca belirir, basınca yumuşakça başa döner; varsayılan olarak sayfa köşesine yerleşir. Burada kendi kaydırma kutusunda." />,
    "copy-button": () => <ComponentDemo folder="actions/copy-button" title="CopyButton: panoya kopyala" desc="Kopyalandı der ve bunu ekran okuyucuya duyurur; pano yoksa bildirimle söyler." />,
    "menu": () => <ComponentDemo folder="actions/menu" title="Menu ve Dropdown" desc="Ok tuşları, Home/End, Esc; kısayollar platforma göre yazılır, action() onaylı silme ve bildirimi getirir. Dropdown herhangi bir içeriği açar." />,
    "tooltip": () => <ComponentDemo folder="overlays/tooltip" title="Tooltip: kısa ipucu" desc="Üstüne gelince kısa bir gecikmeyle, klavye odağında hemen görünür; aria-describedby ile bağlanır, Esc gizler." />,
    "chips": () => <Demo title="Çipler" desc="Seçilebilir süzgeç çipleri ve kaldırılabilir etiketler.">
    <div class="sc-row">{["Açık", "Bekliyor", "Çözüldü", "Atanmamış"].map((f) => <Chip selected={() => $filters.has(f)} on:click={() => toggleFilter(f)}>{f}</Chip>)}</div>
    <div class="sc-row">
      <For each={$tags} key={(x: string) => x}>{(tag: () => string) => <Chip tone="primary" onRemove={() => { $tags = $tags.filter((x) => x !== tag()) }}>{tag()}</Chip>}</For>
      <Button size="sm" variant="ghost" icon={plus} on:click={() => { $tags = [...$tags, `Etiket ${$tags.length + 1}`] }}>Ekle</Button>
    </div>
  </Demo>,
    "chip": () => <ComponentDemo folder="actions/chip" title="Chip: seçenekler" desc="Bileşen klasöründen (src/components/actions/chip) gelen demo: seçenekler playground.ts'den, kod docs.md'den. Renk yalnız süzgeç çipinde ya da primary tonda etkili olduğu için yalnız o zaman görünür." />,
    "made-with-march": () => <ComponentDemo folder="actions/made-with-march" title="MadeWithMarch: kredi satırı" desc="İsteğe bağlı: &quot;March ve 💗 ile geliştirildi&quot;. Lisans MIT olarak kalır; kullanmak rica, zorunluluk değil. Bağlantı adresi tek bir sabittedir (MARCH_URL)." />,
    "avatars": () => <Demo title="Avatarlar" desc="Baş harfler tema paletiyle; grup ve +N.">
    <div class="sc-row"><Avatar name="Elif Yılmaz" size="lg" /><Avatar name="Mert Demir" /><Avatar name="Zeynep Kaya" size="sm" />
      <AvatarGroup names={["Ada", "Linus", "Grace", "Zeynep", "Can", "Ece", "Onur"]} max={5} /></div>
  </Demo>,
    "kbd": () => <ComponentDemo folder="typography/kbd" title="Kbd: klavye kısayolu" desc="mod macOS'ta ⌘, ötekilerde Ctrl yazılır; kısayol dizisi key() ve kısayol listesiyle aynı biçimde okunur." />,
    "cards-tabs": () => <Demo wide title="Kartlar ve sekmeler" desc="Card, LinkCard, IconTile; Tabs (alt çizgi kayar, panel yükselerek gelir).">
    <div class="sc-grid3">
      <Card title="Haftalık rapor" subtitle="Pazartesi 09:00'da gönderilir" actions={[<IconButton icon={more} label="Seçenekler" size="sm" />]} footer={<div class="sc-row sc-row-between"><span class="hm-muted">3 alıcı</span><Button size="sm">Düzenle</Button></div>}>
        <p class="hm-muted">Büyüme, etkin kullanıcılar ve gelir özetini ekibe e-postayla gönderir.</p>
      </Card>
      <Stack gap={2}>
        <LinkCard href="/data" icon={users} tone="primary" title="Üyeler" description="Ara, süz, toplu işlem" meta="48,2 B" />
        <LinkCard href="/charts" icon={zap} tone="warn" title="Canlı metrikler" description="Gerçek zamanlı grafikler" />
        <LinkCard href="/forms" icon={filter} tone="success" title="Formlar" description="Doğrulama ve sihirbaz" />
      </Stack>
      <Card title="Sekmeler">
        <Tabs label="Örnek sekmeler" tabs={[
          { id: "a", label: "Genel", content: <p class="hm-muted">Genel ayarlar burada.</p> },
          { id: "b", label: "Bildirimler", badge: 3, content: <div class="sc-row"><IconTile icon={bell} tone="info" /><span>3 yeni bildirim</span></div> },
          { id: "c", label: "Güvenlik", content: <div class="sc-row"><IconTile icon={shieldCheck} tone="success" /><span>İki adımlı doğrulama açık</span></div> },
        ]} />
      </Card>
    </div>
    <Divider label="ya da" />
    <div class="sc-row">{(["primary", "info", "success", "warn", "danger", "violet", "pink", "teal", "neutral"] as const).map((tone) => <IconTile icon={search} tone={tone} />)}</div>
  </Demo>,
  }
  return <Hub section="/buttons" kicker="Bileşenler" title="Düğmeler ve rozetler" lead="Dört varyant, üç boyut; yükleniyor, devre dışı, odak halkası ve basma geri bildirimi. Hepsi klavyeyle tam kullanılır." render={RENDER} params={props.params} />
}
