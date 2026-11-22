// SEO: head tags per route (live), Open Graph / Twitter cards, JSON-LD builders, the page check and prerendering.
import { Field, TextInput, Textarea, Segmented, Toggle, Button, Card, Stack, Badge } from "march/ui";
import { installSeo, useHead, headTags, headToHtml, ld, checkHtml, formatIssues, resolveHead, type SeoIssue } from "march/seo";
import { onCleanup } from "march";
import { Demo } from "../demo.tsx";
import { Hub } from "../hub.tsx";
import { TOPICS } from "../topics/seo.ts";

const SAMPLE_BAD = `<html><head><title>Ürünler</title></head>
<body><h1>Ürünler</h1><img src="kapak.jpg"></body></html>`

export default function Seo(props: { params?: { rest?: string } }) {
  // route heads and useHead() from now on (the showcase turns it on only here; an app does it once at start-up)
  // jsonLd: false — this page runs under a Trusted Types CSP, where script text written at run time is blocked;
  // JSON-LD reaches such pages at build time (prerender) and is shown below instead
  installSeo({ titleTemplate: "%s · MarchJS", jsonLd: false, defaults: { og: { siteName: "MarchJS", locale: "tr_TR" }, twitter: {} } })

  let $title = "Kırmızı koşu ayakkabısı"
  let $desc = "Hafif, nefes alan üst yüzey ve yumuşak taban: günlük koşu için kırmızı ayakkabı, 36–46 numara."
  let $image = "https://shop.example/img/kirmizi.jpg"
  let $type = "product"
  let $live = true
  let $price = "1499.90"

  const $ld = $type === "product"
    ? ld.product({ name: $title, description: $desc, image: $image, price: $price, currency: "TRY", availability: "InStock", brand: "Örnek" })
    : $type === "article"
      ? ld.article({ headline: $title, description: $desc, image: $image, datePublished: "2026-11-01", author: "Editör" })
      : ld.website({ name: $title, url: "https://shop.example", search: "https://shop.example/ara?q={q}" })
  const crumbs = ld.breadcrumbs([["Ana sayfa", "/"], ["Ayakkabı", "/ayakkabi"], ["Kırmızı", "/ayakkabi/kirmizi"]], "https://shop.example")

  // the page's own head: title, description, cards and JSON-LD go into document.head while this page is open
  useHead(() => ($live ? { title: $title, description: $desc, og: { type: $type === "article" ? "article" : "website", image: { url: $image, alt: $title } }, twitter: { card: "summary_large_image" }, jsonLd: [$ld, crumbs] } : null))

  // what the same input would give on a site with history routing (canonical, absolute og:url)
  const $preview = headToHtml(resolveHead([{ titleTemplate: "%s · Mağaza" }, { title: $title, description: $desc, canonical: true, og: { image: $image }, twitter: {}, jsonLd: $ld }], { site: "https://shop.example", path: "/ayakkabi/kirmizi" }))

  let $html = SAMPLE_BAD
  let $issues: SeoIssue[] = checkHtml(SAMPLE_BAD)
  const runSample = () => { $issues = checkHtml($html) }
  let $pageIssues: SeoIssue[] = []
  const runPage = () => { $pageIssues = checkHtml(document.documentElement.outerHTML, { canonical: false }) }
  // once the page is on screen (its <h1> included)
  const first = setTimeout(runPage, 300)
  onCleanup(() => clearTimeout(first))

  const RENDER: Record<string, () => unknown> = {
    "live-head": () => <Demo wide title="Canlı head: useHead()" desc="Alanları değiştir: bu sayfanın <head> etiketleri anında güncellenir (sekme başlığına bak). Sayfadan çıkınca kendi etiketleri kalkar."
    code={`installSeo({ site: "https://shop.example", titleTemplate: "%s · Mağaza" })
useHead(() => ({
title: $title,
description: $desc,
og: { image: { url: $image, alt: $title } },
twitter: { card: "summary_large_image" },
jsonLd: ld.product({ name: $title, price: $price, currency: "TRY" }),
}))`}>
    <Stack gap={3}>
      <div class="sc-row">
        <Toggle bind:value={$live} label="Bu sayfanın head'ine yaz" />
        <Segmented bind:value={$type} aria-label="Sayfa türü" options={[{ value: "product", label: "Ürün" }, { value: "article", label: "Makale" }, { value: "website", label: "Site" }]} />
      </div>
      <Field label="Başlık"><TextInput bind:value={$title} /></Field>
      <Field label="Açıklama" help={`${$desc.length} karakter (50–160 önerilir)`}><Textarea bind:value={$desc} rows={2} /></Field>
      <div class="sc-row">
        <div class="sc-grow"><Field label="Görsel (og:image)"><TextInput bind:value={$image} /></Field></div>
        <Field label="Fiyat"><TextInput bind:value={$price} /></Field>
      </div>
      <Card>
        <p class="m-muted">document.head içinde şu an (useHead + rota):</p>
        <pre class="sc-seo-code">{headToHtml(headTags())}</pre>
      </Card>
    </Stack>
  </Demo>,
    "history-site": () => <Demo title="Geçmiş yönlendirmeli bir sitede" desc="Aynı girdi, site adresi ve yol ile: canonical ve og:url mutlak adres olur. Hash yönlendirmede otomatik canonical yazılmaz.">
    <pre class="sc-seo-code">{$preview}</pre>
  </Demo>,
    "json-ld": () => <Demo title="Üretilen JSON-LD" desc="ld.product / ld.article / ld.website ve ld.breadcrumbs: schema.org nesneleri. Metin </script> ile kapanamaz. Trusted Types CSP'li sayfalarda (bu vitrin gibi) JSON-LD derlemede yazılır: installSeo({ jsonLd: false }).">
    <pre class="sc-seo-code">{JSON.stringify([$ld, crumbs], null, 2)}</pre>
  </Demo>,
    "seo-check": () => <Demo wide title="march seo check" desc="Derlenen her sayfa için: eksik başlık, açıklama, canonical, alt metni, h1 ve geçersiz JSON-LD. Aynı denetim tarayıcıda da çalışır."
    code={`$ march build && march seo check
dist/index.html: error canonical          missing <link rel="canonical">
dist/product/index.html: warn  description-length description is 31 characters (aim for 50–160)
✖ 2 page(s): 1 error(s), 1 warning(s)`} lang="sh">
    <Stack gap={3}>
      <Field label="Denetlenecek HTML"><Textarea bind:value={$html} rows={3} /></Field>
      <div class="sc-row">
        <Button variant="primary" on:click={runSample}>Denetle</Button>
        <Button on:click={runPage}>Bu sayfayı denetle</Button>
      </div>
      <Report title="Örnek HTML" issues={$issues} />
      <Report title="Bu sayfa (canlı DOM)" issues={$pageIssues} />
    </Stack>
  </Demo>,
    "prerender": () => <Demo wide title="Ön işleme (prerender) ve hidrasyon" desc="march build, rotaları derleme sırasında HTML'e çevirir (head dahil) ve sitemap.xml ile robots.txt yazar; tarayıcıda hydrate() hazır sayfayı boş kare olmadan devralır. Bu vitrinin açılış sayfası da böyle gelir."
    code={`// march.config.js
export default {
seo: {
  site: "https://shop.example",
  prerender: true,              // parametresiz her rota (hash yönlendirmede yalnız açılış sayfası)
  sitemap: true,
  robots: { disallow: ["/yonetim"] },
  head: { jsonLd: ld.website({ name: "Mağaza", url: "https://shop.example" }) },
},
}
// main.tsx
hydrate(() => <Router />, document.getElementById("app"))
// bir rotanın head'i
createRouter({ routes: { "/product/:id": { load, head: (to) => ({ title: \`Ürün \${to.params.id}\` }) } } })`}>
    <p class="m-muted">Her rotanın kendi index.html dosyası var; adres başka bir rotayı gösterirse (404 yedeği, eski bir hash bağlantısı) ön işlenmiş içerik hemen kaldırılır, yanlış içerik görünmez.</p>
  </Demo>,
  }
  return <Hub section="/seo" topics={TOPICS} kicker="Temel" title="SEO" lead="Rota başına başlık ve meta, Open Graph ve Twitter kartları, JSON-LD, derlemede ön işleme (prerender), sitemap.xml ve robots.txt. Hepsi yönlendiriciyle bütünleşik." render={RENDER} params={props.params} />
}

function Report(props: { title: string; issues: SeoIssue[] }) {
  return <div class="sc-seo-report">
    <div class="sc-row">
      <strong>{props.title}</strong>
      <Badge tone={props.issues.some((i) => i.level === "error") ? "danger" : props.issues.length ? "warn" : "success"}>
        {props.issues.filter((i) => i.level === "error").length} hata · {props.issues.filter((i) => i.level === "warn").length} uyarı
      </Badge>
    </div>
    <pre class="sc-seo-code">{props.issues.length ? formatIssues("sayfa", props.issues) : "✔ sorun yok"}</pre>
  </div>
}
