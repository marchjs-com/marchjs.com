// Buttons, menus, tooltips, badges, chips, avatars, cards, tabs.
import {
  Button, IconButton, ButtonGroup, Menu, Dropdown, Tooltip, CopyButton, Badge, Chip, Avatar, AvatarGroup, Card, LinkCard, IconTile, Tabs,
  Segmented, toast, action, Stack, Divider,
} from "hadi-march/ui";
import {
  plus, download, trash, edit, copy, more, settings, send, heart, star, bell, search, filter, users, zap, shieldCheck, sparkles, globe, logOut, arrowRight, check,
} from "hadi-march/icons";
import { Demo, Section } from "../demo.tsx";
import { ComponentDemo } from "../component-demo.tsx";

export default function Buttons() {
  let $saving = false
  let $tags = ["Tasarım", "Ürün", "Pazarlama", "Destek"]
  let $filters = new Set(["Açık"])
  let $view = "liste"
  const save = async () => { $saving = true; await new Promise((r) => setTimeout(r, 1200)); $saving = false; toast("Kaydedildi", { kind: "success" }) }
  const remove = action("Sil", async () => { await new Promise((r) => setTimeout(r, 400)) }, { icon: trash, danger: true, confirm: "Bu öğe silinsin mi? Bu işlem geri alınamaz.", success: "Silindi" })
  const toggleFilter = (f: string) => { const n = new Set($filters); if (n.has(f)) n.delete(f); else n.add(f); $filters = n }
  return <Section kicker="Bileşenler" title="Düğmeler ve rozetler" lead="Dört varyant, üç boyut; yükleniyor, devre dışı, odak halkası ve basma geri bildirimi. Hepsi klavyeyle tam kullanılır.">
    <Demo title="Varyantlar" desc="primary · secondary · ghost · danger"
      code={`<Button variant="primary" icon={plus}>Yeni</Button>
<Button>İkincil</Button>
<Button variant="ghost">Hayalet</Button>
<Button variant="danger" icon={trash}>Sil</Button>
<Button variant="dark">Onayla</Button>   // ink fill (HADİ navy)`}>
      <div class="sc-row"><Button variant="primary" icon={plus}>Yeni proje</Button><Button icon={download}>Dışa aktar</Button><Button variant="ghost" icon={send}>Paylaş</Button><Button variant="danger" icon={trash}>Sil</Button><Button variant="dark" icon={check}>Onayla</Button></div>
      <div class="sc-row"><Button variant="primary" disabled>Devre dışı</Button><Button disabled>Devre dışı</Button><Button variant="primary" iconEnd={arrowRight}>Devam</Button></div>
    </Demo>

    <Demo title="Boyutlar ve yükleniyor" desc="sm · md · lg; loading düğmeyi kilitler ve dönen çark gösterir."
      code={`let $saving = false
<Button variant="primary" loading={$saving} on:click={save}>{t\`Save\`}</Button>`}>
      <div class="sc-row"><Button size="sm" variant="primary">Küçük</Button><Button variant="primary">Orta</Button><Button size="lg" variant="primary">Büyük</Button></div>
      <div class="sc-row"><Button variant="primary" loading={$saving} on:click={save} icon={check}>{() => ($saving ? "Kaydediliyor…" : "Kaydet")}</Button><Button block variant="secondary">Tam genişlik</Button></div>
    </Demo>

    <Demo title="İkon düğmeleri ve gruplar" desc="Erişilebilir ad zorunlu; ipucu kendiliğinden.">
      <div class="sc-row">
        <IconButton icon={heart} label="Beğen" /><IconButton icon={star} label="Yıldızla" /><IconButton icon={bell} label="Bildirimler" /><IconButton icon={settings} label="Ayarlar" />
        <IconButton icon={trash} label="Sil" variant="danger" />
        <CopyButton text="npm i hadi-march" iconOnly label="Komutu kopyala" />
      </div>
      <div class="sc-row">
        <ButtonGroup attached label="Hizalama"><Button>Sol</Button><Button>Orta</Button><Button>Sağ</Button></ButtonGroup>
        <Segmented bind:value={$view} aria-label="Görünüm" options={[{ value: "liste", label: "Liste" }, { value: "kart", label: "Kart" }, { value: "takvim", label: "Takvim" }]} />
      </div>
    </Demo>

    <Demo title="Menüler, açılır panel, ipucu" desc="Ok tuşları, Home/End, Esc; action() ile onaylı silme ve bildirim."
      code={`const remove = action("Sil", api.remove, { icon: trash, danger: true, confirm: { title: "Silinsin mi?" } })
<Menu label="Eylemler" icon={more} items={[{ label: "Düzenle", icon: edit }, "-", remove]} />`}>
      <div class="sc-row">
        <Menu label="Eylemler" icon={more} items={[
          { label: "Düzenle", icon: edit, shortcut: "E", onSelect: () => toast("Düzenle") },
          { label: "Kopyala", icon: copy, shortcut: "mod+c", onSelect: () => toast("Kopyalandı", { kind: "success" }) },
          { label: "Paylaş", icon: share, onSelect: () => toast("Paylaşım bağlantısı hazır") },
          "-", remove,
        ]} />
        <Menu label="Hesap" variant="secondary" items={[{ label: "Dil: English", icon: globe }, { label: "Güvenlik", icon: shieldCheck }, "-", { label: "Çıkış yap", icon: logOut, danger: true }]} />
        <Dropdown label="Süzgeç" variant="secondary">
          <Stack gap={2}>
            <strong>Durum</strong>
            <div class="sc-row">{["Açık", "Bekliyor", "Çözüldü"].map((f) => <Chip selected={() => $filters.has(f)} on:click={() => toggleFilter(f)}>{f}</Chip>)}</div>
          </Stack>
        </Dropdown>
        <Tooltip text="Bu bir ipucu: odakla ya da üstüne gel"><Button variant="ghost" icon={sparkles}>Üstüme gel</Button></Tooltip>
      </div>
    </Demo>

    <Demo title="Rozetler ve çipler" desc="Ton, nokta, sayaç; seçilebilir süzgeç çipleri ve kaldırılabilir etiketler.">
      <div class="sc-row"><Badge>Nötr</Badge><Badge tone="primary">Vurgu</Badge><Badge tone="success" dot>Etkin</Badge><Badge tone="warn">Bekliyor</Badge><Badge tone="danger">Hata</Badge><Badge tone="info">Bilgi</Badge><Badge count={7} /><Badge count={128} /></div>
      <div class="sc-row">{["Açık", "Bekliyor", "Çözüldü", "Atanmamış"].map((f) => <Chip selected={() => $filters.has(f)} on:click={() => toggleFilter(f)}>{f}</Chip>)}</div>
      <div class="sc-row">
        <For each={$tags} key={(x: string) => x}>{(tag: () => string) => <Chip tone="primary" onRemove={() => { $tags = $tags.filter((x) => x !== tag()) }}>{tag()}</Chip>}</For>
        <Button size="sm" variant="ghost" icon={plus} on:click={() => { $tags = [...$tags, `Etiket ${$tags.length + 1}`] }}>Ekle</Button>
      </div>
    </Demo>

    <ComponentDemo folder="actions/chip" title="Chip: seçenekler" desc="Bileşen klasöründen (src/components/actions/chip) gelen demo: seçenekler playground.ts'den, kod docs.md'den. Renk yalnız süzgeç çipinde ya da primary tonda etkili olduğu için yalnız o zaman görünür." />

    <ComponentDemo folder="actions/made-with-march" title="MadeWithMarch: kredi satırı" desc="İsteğe bağlı: \"HADI March ve 💗 ile geliştirildi\". Lisans MIT olarak kalır; kullanmak rica, zorunluluk değil. Bağlantı adresi tek bir sabittedir (MARCH_URL)." />

    <Demo title="Avatarlar" desc="Baş harfler tema paletiyle; grup ve +N.">
      <div class="sc-row"><Avatar name="Elif Yılmaz" size="lg" /><Avatar name="Mert Demir" /><Avatar name="Zeynep Kaya" size="sm" />
        <AvatarGroup names={["Ada", "Linus", "Grace", "Zeynep", "Can", "Ece", "Onur"]} max={5} /></div>
    </Demo>

    <ComponentDemo folder="typography/kbd" title="Kbd: klavye kısayolu" desc="mod macOS'ta ⌘, ötekilerde Ctrl yazılır; kısayol dizisi key() ve kısayol listesiyle aynı biçimde okunur." />

    <Demo wide title="Kartlar ve sekmeler" desc="Card, LinkCard, IconTile; Tabs (alt çizgi kayar, panel yükselerek gelir).">
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
    </Demo>
  </Section>
}
