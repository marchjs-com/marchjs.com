// Overlays: Dialog, Drawer, confirm, prompt, reason, toast (undo), command palette.
import {
  Button, openDialog, openDrawer, confirm, prompt, askReason, toast, openPalette, Field, TextInput, Toggle, Stack, Kbd, Alert, Avatar, Badge, Divider,
} from "hadi-march/ui";
import { trash, edit, sliders, command, bell, check, alertTriangle, info, xCircle } from "hadi-march/icons";
import { Demo } from "../demo.tsx";
import { Hub } from "../hub.tsx";
import { ComponentDemo } from "../component-demo.tsx";

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
    {["Elif Yılmaz", "Mert Demir", "Zeynep Kaya", "Can Arslan"].map((n, i) => <div class="sc-row"><Avatar name={n} /><div class="sc-grow"><strong>{n}</strong><div class="hm-muted">{i % 2 ? "Davetli" : "Etkin"}</div></div><Badge tone={i % 2 ? "info" : "success"} dot>{i % 2 ? "Davetli" : "Etkin"}</Badge></div>)}
  </Stack>, { title: "Ekip üyeleri" })
  const del = async () => { const ok = await confirm({ title: "Proje silinsin mi?", message: "Bütün görevler ve dosyalar kalıcı olarak silinir.", danger: true, ok: "Sil" }); $last = ok ? "Silindi" : "Vazgeçildi"; if (ok) toast("Proje silindi", { kind: "danger", action: { label: "Geri al", run: () => toast("Geri alındı", { kind: "success" }) } }) }
  const rename = async () => { const v = await prompt({ title: "Yeniden adlandır", label: "Yeni ad", value: "Yol haritası 2027" }); if (v) $last = `Yeni ad: ${v}` }
  const reason = async () => { const r = await askReason({ title: "Hesabı askıya al", min: 10 }); if (r) $last = `Gerekçe: ${typeof r === "string" ? r : JSON.stringify(r)}` }
  const RENDER: Record<string, () => unknown> = {
    "dialog-drawer": () => <Demo title="Dialog ve çekmece" desc="openDialog / openDrawer: içerik bir fonksiyon, sonuç close(değer)."
    code={`const ad = await openDialog((close) => <Form … onSubmit={(v) => close(v.ad)} />, { title: "Profili düzenle" })
nst tamam = await confirm({ title: "Silinsin mi?", danger: true })`}>
    <div class="sc-row"><Button variant="primary" icon={edit} on:click={edit1}>Profili düzenle</Button><Button icon={sliders} on:click={drawer}>Çekmeceyi aç</Button></div>
    <div class="sc-row"><Button variant="danger" icon={trash} on:click={del}>Onaylı sil</Button><Button on:click={rename}>Metin iste</Button><Button on:click={reason}>Gerekçe iste</Button></div>
    <p class="hm-muted">Son sonuç: {$last}</p>
  </Demo>,
    "toasts": () => <Demo title="Bildirimler (toast)" desc="Dört tür, eylem düğmesi (geri al), kendiliğinden kapanma; ekran okuyucuya duyurulur."
    code={`toast("Kaydedildi", { kind: "success" })
ast("Silindi", { kind: "danger", action: { label: "Geri al", run: geriAl } })`}>
    <div class="sc-row">
      <Button icon={check} on:click={() => toast("Değişiklikler kaydedildi", { kind: "success" })}>Başarı</Button>
      <Button icon={info} on:click={() => toast("Yeni sürüm hazır: 2.4.0", { kind: "info" })}>Bilgi</Button>
      <Button icon={alertTriangle} on:click={() => toast("Kotanın %90'ı kullanıldı", { kind: "warn" })}>Uyarı</Button>
      <Button icon={xCircle} on:click={() => toast("Bağlantı koptu", { kind: "danger", action: { label: "Yeniden dene", run: () => toast("Bağlandı", { kind: "success" }) } })}>Hata</Button>
    </div>
  </Demo>,
    "palette": () => <Demo title="Komut paleti" desc="Sayfalar ve eylemler kendiliğinden kayıtlı; bulanık arama, Türkçe karakter katlama (ı/i, ş/s).">
    <div class="sc-row"><Button variant="primary" icon={command} on:click={openPalette}>Paleti aç</Button><span class="hm-muted">ya da</span><Kbd keys="mod+k" /></div>
    <Divider />
    <p class="hm-muted">Dene: "koyu", "neon", "tablo", "bildirim".</p>
  </Demo>,
    "command-palette": () => <ComponentDemo folder="composite/command-palette" title="CommandPalette: komut ekleme" desc="Karmaşık bileşen: uygulamanın tek paleti; bu kart ekranda olduğu sürece kendi komutlarını ekler, kart kapanınca kaldırır. Düğmenin üstüne gelince pencere önden yüklenir. Parçaları aşağıdaki satırda." />,
    "dialog": () => <ComponentDemo folder="overlays/dialog" title="Dialog: boyut, alt çubuk, kapatma" desc="Odak pencerenin içinde döner, Escape en üsttekini kapatır, kapanınca odak açan düğmeye döner. Telefonda alttan yükselir." />,
    "toast": () => <ComponentDemo folder="overlays/toast" title="Toast: tür, geri al, süre" desc="Engellemeyen kısa ileti; en fazla beş üst üste. Geri al eylemi önce toast'ı kapatır, sonra çalışır." />,
    "drawer": () => <ComponentDemo folder="overlays/drawer" title="Drawer: dört kenar, sürükle, durma noktaları" desc="Başlangıç / bitiş kenarı yazı yönüne uyar (RTL'de yer değiştirir). Tutamaçtan ya da başlıktan sürükleyin; bırakınca en yakın durma noktasına oturur, kenara atınca kapanır. Modal kapalıyken sayfa kullanılabilir kalır." />,
  }
  return <Hub base="/overlays" kicker="Bileşenler" title="Pencereler ve bildirimler" lead="Odak tuzağı, Esc ile kapanma, arka plan kaydırma kilidi, ekran okuyucu rolleri; mobilde alttan açılan sayfa. Hepsi Promise döndürür." render={RENDER} params={props.params} />
}
