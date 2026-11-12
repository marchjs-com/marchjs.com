// Feedback: alerts, progress, skeleton, spinner, empty state, error box, loader, notice.
import { Alert, Progress, Skeleton, Spinner, Empty, ErrorBox, Button, Card, Loader, Grid, Stack } from "hadi-march/ui";
import { onCleanup } from "hadi-march";
import { ProgressRing } from "hadi-march/charts";
import { inbox, plus } from "hadi-march/icons";
import { Demo, Section } from "../demo.tsx";

export default function Feedback() {
  let $p = 35
  let $loading = true
  const tick = setInterval(() => { $p = $p >= 100 ? 0 : $p + 7 }, 900)
  onCleanup(() => clearInterval(tick))
  return <Section kicker="Bileşenler" title="Durumlar" lead="Her ekranın yükleniyor, boş ve hata hâli birinci sınıf: iskeletler gerçek düzeni taklit eder, boş durumlar bir sonraki adımı gösterir.">
    <Demo title="Uyarılar" desc="Dört ton; başlık, kapatma, kendi ikonu.">
      <Alert tone="info" title="Bakım penceresi">Pazar 03:00–03:30 arası ödeme sağlayıcısı bakımda.</Alert>
      <Alert tone="success">Domain doğrulandı, SSL sertifikası yüklendi.</Alert>
      <Alert tone="warn" title="Kota" dismissable>Bu ay depolamanın %90'ı kullanıldı.</Alert>
      <Alert tone="danger" title="Ödeme başarısız">Kartın reddedildi. Başka bir kart dene.</Alert>
    </Demo>
    <Demo title="İlerleme" desc="Belirli, belirsiz, tonlu, üç boyut.">
      <Progress value={$p} label="Yükleniyor" showValue />
      <Progress value={72} tone="success" label="Hedef" showValue size="lg" />
      <Progress value={91} tone="warn" label="Depolama" showValue size="sm" />
      <Progress label="Hazırlanıyor" />
    </Demo>
    <Demo wide title="Çok renkli göstergeler" desc="HADİ temasında ilerleme çubuğu, çark ve iskelet varsayılan olarak dört marka rengini taşır (öteki temalarda tek renk). colors ile renkler, paint ile dizilim seçilir: gradient, segments ya da cycle (renkler akar). Hareketi azalt tercihinde durağan."
      code={`<Progress value={60} />                                   // HADİ: four brand colors by default
<Progress value={60} paint="segments" />                  // equal colored parts
<Progress paint="cycle" />                                // indeterminate, colors flow
<Progress value={60} colors={["brand-blue", "brand-green"]} />
<Progress value={60} colors="single" />                   // one color
<ProgressRing value={72} colors="brand" />  <Spinner colors="brand" />`}>
      <div class="sc-multi">
        <Stack gap={3}>
          <Progress value={$p} label="Varsayılan (gradient)" showValue />
          <Progress value={$p} paint="segments" colors="brand" label="segments" showValue />
          <Progress paint="cycle" colors="brand" label="cycle (belirsiz)" />
          <Progress value={$p} colors={["brand-blue", "brand-green"]} label="İki renk" showValue />
          <Progress value={$p} colors="single" label="Tek renk" showValue />
        </Stack>
        <div class="sc-row">
          <ProgressRing value={$p} colors="brand" label="Gradient" />
          <ProgressRing value={$p} colors="brand" paint="segments" label="Segments" />
          <ProgressRing value={$p} colors="brand" paint="cycle" label="Cycle" />
          <Spinner size="lg" />
          <Spinner size="lg" colors="single" />
        </div>
        <Skeleton lines={3} />
      </div>
    </Demo>
    <Demo title="İskelet ve çark" desc="Yükleme sırasında düzen zıplamaz.">
      <div class="sc-row"><Button size="sm" on:click={() => { $loading = !$loading }}>{() => ($loading ? "Yüklemeyi bitir" : "Yeniden yükle")}</Button><Spinner size="sm" /><Spinner /><Spinner size="lg" /></div>
      {() => ($loading
        ? <Card><Stack gap={3}><div class="sc-row"><span class="hm-skel sc-skel-av" /><div class="sc-grow"><Skeleton lines={2} /></div></div><Skeleton block height="md" /></Stack></Card>
        : <Card title="Elif Yılmaz" subtitle="Ürün tasarımcısı"><p class="hm-muted">Veri geldi; iskelet aynı düzenin yerini aldı.</p></Card>)}
    </Demo>
    <Demo title="Boş durum" desc="İkon, başlık, açıklama ve eylem.">
      <Card><Empty icon={inbox} title="Gelen kutusu boş" action={[<Button variant="primary" icon={plus}>Yeni mesaj</Button>]}>Yeni bir konuşma başlat ya da bir ekip arkadaşını davet et.</Empty></Card>
    </Demo>
    <Demo title="Hata ve yükleyici" desc="ErrorBox yeniden dene düğmesiyle; Loader sayfa geçişlerinde.">
      <ErrorBox title="Veriler alınamadı" message="Sunucuya ulaşılamadı (503). Bağlantını kontrol et." retry={() => {}} />
      <Card><Loader text="Panolar hazırlanıyor…" /></Card>
    </Demo>
  </Section>
}
