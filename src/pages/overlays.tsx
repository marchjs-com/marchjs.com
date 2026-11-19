// Overlays: Dialog, Drawer, confirm, prompt, reason, toast (undo), command palette.
import {
  Button, openDialog, openDrawer, confirm, prompt, askReason, toast, openPalette, Field, TextInput, Toggle, Stack, Kbd, Alert, Avatar, Badge, Divider,
} from "march/ui";
import { trash, edit, sliders, command, bell, check, alertTriangle, info, xCircle } from "march/icons";
import { Demo } from "../demo.tsx";
import { Hub } from "../hub.tsx";
import { ComponentDemo } from "../component-demo.tsx";
import { lazy } from "march/lazy";
// ContextMenu has its own entry (march/context-menu), so the card registry has no demo loader for it: its demo is a
// lazy part here (the menu stays out of this route's chunk); the option spec comes from the registry
const ContextMenuDemo = lazy(() => import("march/components/overlays/context-menu/demo.tsx"), { placeholder: "card" });

export default function Overlays(props: { params?: { rest?: string } }) {
  let $last = "—"
  const edit1 = () => openDialog((close) => {
    let $name = "Elif Yılmaz"
    let $public = true
    return <Stack gap={3}>
      <Field label="Görünen ad"><TextInput bind:value={$name} autofocus /></Field>
      <Toggle bind:value={$public} label="Profil herkese açık" />
      <div class="sc-row sc-row-end"><Button variant="ghost" on:click={() => close()}>Vazgeç</Button><Button variant="primary" on:click={() => close($name)}>Kaydet</Button></div>
    </Stack>
  }, { title: "Profili düzenle", size: "sm" }).then((v) => { if (v) { $last = `Kaydedildi: ${v}`; toast("Profil güncellendi", { kind: "success" }) } })
  const drawer = () => openDrawer(() => <Stack gap={3}>
    <Alert tone="info" title="Çekmece">Sağdan kayar; mobilde tam ekran. Esc ya da dışarı tıklama kapatır, odak içeride kalır.</Alert>
    {["Elif Yılmaz", "Mert Demir", "Zeynep Kaya", "Can Arslan"].map((n, i) => <div class="sc-row"><Avatar name={n} /><div class="sc-grow"><strong>{n}</strong><div class="m-muted">{i % 2 ? "Davetli" : "Etkin"}</div></div><Badge tone={i % 2 ? "info" : "success"} dot>{i % 2 ? "Davetli" : "Etkin"}</Badge></div>)}
  </Stack>, { title: "Ekip üyeleri" })
  const del = async () => { const ok = await confirm({ title: "Proje silinsin mi?", message: "Bütün görevler ve dosyalar kalıcı olarak silinir.", danger: true, ok: "Sil" }); $last = ok ? "Silindi" : "Vazgeçildi"; if (ok) toast("Proje silindi", { kind: "danger", action: { label: "Geri al", run: () => toast("Geri alındı", { kind: "success" }) } }) }
  const rename = async () => { const v = await prompt({ title: "Yeniden adlandır", label: "Yeni ad", value: "Yol haritası 2027" }); if (v) $last = `Yeni ad: ${v}` }
  const reason = async () => { const r = await askReason({ title: "Hesabı askıya al", min: 10 }); if (r) $last = `Gerekçe: ${typeof r === "string" ? r : JSON.stringify(r)}` }
  const RENDER: Record<string, () => unknown> = {
    "command-palette": () => <ComponentDemo folder="composite/command-palette" title="CommandPalette: komut ekleme" desc="Karmaşık bileşen: uygulamanın tek paleti; bu kart ekranda olduğu sürece kendi komutlarını ekler, kart kapanınca kaldırır. Düğmenin üstüne gelince pencere önden yüklenir. Parçaları aşağıdaki satırda." />,
    "dialog": () => <ComponentDemo folder="overlays/dialog" title="Dialog: boyut, alt çubuk, kapatma" desc="Odak pencerenin içinde döner, Escape en üsttekini kapatır, kapanınca odak açan düğmeye döner. Telefonda alttan yükselir." />,
    "toast": () => <ComponentDemo folder="overlays/toast" title="Toast: tür, geri al, süre" desc="Engellemeyen kısa ileti; en fazla beş üst üste. Geri al eylemi önce toast'ı kapatır, sonra çalışır." />,
    "drawer": () => <ComponentDemo folder="overlays/drawer" title="Drawer: dört kenar, sürükle, durma noktaları" desc="Başlangıç / bitiş kenarı yazı yönüne uyar (RTL'de yer değiştirir). Tutamaçtan ya da başlıktan sürükleyin; bırakınca en yakın durma noktasına oturur, kenara atınca kapanır. Modal kapalıyken sayfa kullanılabilir kalır." />,
    "popover": () => <ComponentDemo folder="overlays/popover" title="Popover: tetikleyici ve yüzen panel" desc="Panel tetikleyicinin yanına yerleşir, kenarda yön değiştirir; dışarı tıklama ya da Esc kapatır, odak içeri girer ve tetikleyiciye döner." />,
    "option-list": () => <ComponentDemo folder="forms/option-list" title="OptionList: seçenek listesi" desc="Radyo grubu, liste kutusu ya da komut menüsü; satırda ikon, etiket, açıklama, sondaki parça ve tik. Ok tuşlarıyla ya da bir alanın tuşlarıyla (aria-activedescendant) gezilir." />,
    "context-menu": () => <ComponentDemo folder="overlays/context-menu" title="ContextMenu: sağ tık menüsü" desc="Bir karta sağ tıklayın ya da odaklayıp Shift+F10'a (Menü tuşuna) basın. Öğeler tıklanan hedefe göre değişir; ok tuşları, Enter ve Esc Menu'deki gibi." view={ContextMenuDemo as never} />,
    "consent-banner": () => <ComponentDemo folder="composite/consent-banner" title="ConsentBanner: çerez onayı" desc="Reddet, Özelleştir ve Kabul et yan yana; Özelleştir tercihler panelini açar. Üçüncü taraf içerik izin verilene dek yer tutucuda bekler. Seçim bandı kapatır; 'Şeridi yeniden göster' geri getirir." />,
  }
  return <Hub section="/overlays" kicker="Bileşenler" title="Pencereler ve bildirimler" lead="Odak tuzağı, Esc ile kapanma, arka plan kaydırma kilidi, ekran okuyucu rolleri; mobilde alttan açılan sayfa. Hepsi Promise döndürür." render={RENDER} params={props.params} />
}
