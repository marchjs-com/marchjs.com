// API examples of hadi-march/seo (head tags; nothing is left changed in the page's own head), seo/hydrate and the safe
// content core (dom/safe, dom/sanitize, dom/to-markdown). Layout and rules: tools/api-examples.js.
import { signal, effect, onCleanup } from "hadi-march";
import { Button, Badge } from "hadi-march/ui";
import { _resetHead, _resetSeo, applyHead, checkHtml, formatIssues, headTags, headToHtml, installSeo, jsonLdText, ld, ogTags, resolveHead, scanTags, tagKey, twitterTags, useHead } from "hadi-march/seo";
import { hydrate, prerenderedFor } from "hadi-march/seo/hydrate";
import { RICH_SCHEMA } from "hadi-march/dom/safe";
import { BLOCKS, decodeEntities, normalizeBlocks, parseHtml, sanitizeNode } from "hadi-march/dom/sanitize";
import { toMarkdown } from "hadi-march/dom/to-markdown";
import { Out, Log, Row } from "./_kit.tsx";
import { J, now, lines, Text, Area, Pre, Tags } from "./_net.tsx";
import { examples } from "./types.ts";
export { default as SIG } from "./seo.sig.gen.ts";

/** An element from markup through the safe parser (never innerHTML). */
const box = (html: string, editable = false): HTMLElement => {
  const el = document.createElement("div");
  el.className = "sc-ex-net-box";
  if (editable) { el.contentEditable = "true"; el.setAttribute("role", "textbox"); el.setAttribute("aria-multiline", "true"); }
  el.append(parseHtml(html));
  return el;
};

/** Head examples that write tags use a draft document, and only while the page's own head is not managed by seo. */
const headBusy = (): boolean => headTags().length > 0;
const draftDoc = (): Document => document.implementation.createHTMLDocument("Taslak");
const headOf = (d: Document): string[] => [`<title>${d.title}</title>`, ...Array.from(d.head.children).filter((e) => e.localName !== "title").map((e) => `<${e.localName} ${e.getAttributeNames().filter((n) => n !== "data-m-head").map((n) => `${n}="${e.getAttribute(n)}"`).join(" ")}>`)];

const PAGE = `<!doctype html>
<html lang="tr">
<head>
  <title>HADİ Mağaza · Ayakkabılar</title>
  <meta name="viewport" content="width=device-width">
  <link rel="canonical" href="/ayakkabi">
</head>
<body><h1>Ayakkabılar</h1><img src="kapak.jpg"></body>
</html>`;

const RICH = `<h2>Sürüm notları</h2><p><b>HADİ</b> artık <i>daha hızlı</i>. <a href="https://hadisosyal.com/notlar">Ayrıntılar</a></p><ul><li>Yeni tablo</li><li>Koyu tema</li></ul>`;

export default examples({
  "hadi-march/seo": {
    _resetHead: {
      code: `afterEach(() => { _resetHead() })   // tests: forget what applyHead wrote`,
      run: () => {
        const out = signal<string[]>([])
        const go = () => {
          if (headBusy()) { out.set(["Bu sayfada head yönetimi etkin; test yardımcısı burada çalışmaz."]); return }
          const d = draftDoc()
          applyHead(resolveHead([{ title: "Taslak", description: "Önce yazılır" }]), {}, d)
          _resetHead()
          applyHead([], {}, d)
          out.set(["sıfırlamadan sonra applyHead([]) hiçbir şeyi silmedi:", ...headOf(d)])
        }
        return <div class="sc-ex-stack"><Button onClick={go}>Taslak belgede dene</Button><Pre text={() => out().join("\n")} /></div>
      },
    },
    _resetSeo: {
      code: `afterEach(() => { _resetSeo() })   // tests: drop installSeo options, route head and every useHead`,
      run: () => {
        const log = lines()
        const go = () => {
          if (headBusy()) { log.push("Bu sayfada SEO etkin; test yardımcısı burada çalışmaz."); return }
          useHead({ meta: [{ name: "x-ornek", content: "1" }] })
          log.push(`useHead sonrası: ${headTags().length} etiket`)
          _resetSeo()
          log.push(`_resetSeo sonrası: ${headTags().length} etiket`)
        }
        return <div class="sc-ex-stack"><Button onClick={go}>Ekle ve sıfırla</Button><Log lines={log} /></div>
      },
    },
    applyHead: {
      code: `applyHead(resolveHead([{ title: "Hakkında", description: "…" }]))
applyHead([])   // removes what it wrote, restores what it changed`,
      run: () => {
        const title = signal("Hakkımızda"), out = signal("—")
        const go = () => {
          if (headBusy()) { out.set("Bu sayfada head yönetimi etkin; örnek taslak belgeyi kullanamaz."); return }
          const d = draftDoc()
          applyHead(resolveHead([{ title: title(), description: "HADİ ekibi", og: { image: "https://hadisosyal.com/og.png" } }]), { lang: undefined }, d)
          const written = headOf(d)
          applyHead([], {}, d)
          out.set(`yazıldı:\n${written.join("\n")}\n\napplyHead([]) sonrası:\n${headOf(d).join("\n")}`)
        }
        return <div class="sc-ex-stack"><Row><Text label="Başlık" value={title} /><Button onClick={go}>Taslak belgeye yaz</Button></Row><Pre text={out} /></div>
      },
    },
    checkHtml: {
      code: `const issues = checkHtml(document.documentElement.outerHTML)
issues.filter((i) => i.level === "error")   // title, description, canonical, img alt …`,
      run: () => {
        const html = signal(PAGE)
        const issues = () => checkHtml(html())
        return <div class="sc-ex-stack"><Area label="HTML" value={html} />
          <Row><Button variant="ghost" onClick={() => html.set(html().replace("</head>", `  <meta name="description" content="HADİ mağazasında her mevsim için rahat ve şık ayakkabılar.">\n</head>`))}>Açıklama ekle</Button>
            <Out label="Hata" value={() => String(issues().filter((i) => i.level === "error").length)} /><Out label="Uyarı" value={() => String(issues().filter((i) => i.level === "warn").length)} /></Row>
          <Tags label="Sorunlar" items={() => issues().map((i) => `${i.level} · ${i.rule}`)} /></div>
      },
    },
    formatIssues: {
      code: `console.log(formatIssues("dist/index.html", checkHtml(html)))
// dist/index.html: error description        missing <meta name="description">`,
      run: () => {
        const file = signal("dist/ayakkabi.html")
        return <div class="sc-ex-stack"><Text label="Dosya" value={file} /><Pre text={() => formatIssues(file(), checkHtml(PAGE)) || "sorun yok"} /></div>
      },
    },
    headTags: {
      code: `headTags()   // the tags written to <head> now (reactive)
headTags().find((t) => t.key === "title")`,
      run: () => {
        let off: (() => void) | null = null
        const on = signal(false)
        const toggle = () => { if (off) { off(); off = null; on.set(false) } else { off = useHead({ meta: [{ name: "x-api-ornek", content: "acik" }] }); on.set(true) } }
        onCleanup(() => off?.())
        return <div class="sc-ex-stack"><Row><Button onClick={toggle}>{() => (on() ? "Etiketi kaldır" : "useHead ile etiket ekle")}</Button><Out label="Etiket" value={() => String(headTags().length)} /></Row>
          <Tags label="Etiketler" items={() => headTags().map((t) => t.key)} /></div>
      },
    },
    headToHtml: {
      code: `headToHtml(resolveHead([{ title: "Ürünler", og: {} }]))   // for prerendering
headToHtml(tags, { mark: true })   // data-m-head: adopted by the client`,
      run: () => {
        const title = signal("Ürünler"), mark = signal(false)
        return <div class="sc-ex-stack"><Row><Text label="Başlık" value={title} /><Button variant={() => (mark() ? "primary" : "secondary")} onClick={() => mark.set(!mark())}>mark</Button></Row>
          <Pre text={() => headToHtml(resolveHead([{ title: title(), description: "HADİ ürünleri", og: {}, twitter: {} }]), { mark: mark() })} /></div>
      },
    },
    installSeo: {
      code: `installSeo({
  site: "https://shop.hadisosyal.com",
  titleTemplate: "%s · HADİ",
  defaults: { og: { siteName: "HADİ" } },
})`,
      run: () => {
        const tpl = signal("%s · HADİ")
        return <div class="sc-ex-stack"><Row><Text label="titleTemplate" value={tpl} /><Out label="Kurulu" value={() => String(headBusy())} /></Row>
          <Out label="Ürünler sayfasının başlığı" value={() => { const t = resolveHead([{ titleTemplate: tpl() }, { title: "Ürünler" }]).find((x) => x.tag === "title"); return t && "text" in t ? t.text : "—" }} />
          <Out label="installSeo" value={`${typeof installSeo} (uygulama açılışında bir kez)`} /></div>
      },
    },
    jsonLdText: {
      code: `jsonLdText({ name: "</script><b>" })
// {"name":"\\u003c/script\\u003e\\u003cb\\u003e"} — can never close the element`,
      run: () => {
        const name = signal("HADİ </script><img src=x>")
        return <div class="sc-ex-stack"><Text label="Ad" value={name} /><Pre text={() => jsonLdText({ "@type": "Organization", name: name() })} /></div>
      },
    },
    ld: {
      code: `useHead({ jsonLd: [
  ld.product({ name: "Koşu ayakkabısı", price: 1499, currency: "TRY", availability: "InStock" }),
  ld.breadcrumbs([["Ana sayfa", "/"], ["Ayakkabı", "/ayakkabi"]], site),
] })`,
      run: () => {
        const kind = signal<"product" | "article" | "faq" | "breadcrumbs">("product")
        const data = () => ({
          product: () => ld.product({ name: "Koşu ayakkabısı", brand: "HADİ", price: 1499, currency: "TRY", availability: "InStock", rating: { value: 4.6, count: 128 } }),
          article: () => ld.article({ headline: "HADİ 2.0 çıktı", author: "Ada", datePublished: "2026-01-15" }),
          faq: () => ld.faq([["Kargo ücretli mi?", "500 TL üzeri ücretsiz."]]),
          breadcrumbs: () => ld.breadcrumbs([["Ana sayfa", "/"], ["Ayakkabı", "/ayakkabi"]], "https://shop.hadisosyal.com"),
        })[kind()]()
        return <div class="sc-ex-stack"><Row>{(["product", "article", "faq", "breadcrumbs"] as const).map((k) => <Button variant={() => (kind() === k ? "primary" : "secondary")} onClick={() => kind.set(k)}>{k}</Button>)}</Row><Pre text={() => JSON.stringify(data(), null, 1)} /></div>
      },
    },
    ogTags: {
      code: `ogTags({ title: "Koşu ayakkabısı", image: { url: "/og/shoe.png", width: 1200, height: 630 } })
// [{ property: "og:type", content: "website" }, { property: "og:title", … }, …]`,
      run: () => {
        const title = signal("Koşu ayakkabısı"), img = signal(true)
        return <div class="sc-ex-stack"><Row><Text label="Başlık" value={title} /><Button variant={() => (img() ? "primary" : "secondary")} onClick={() => img.set(!img())}>Görsel</Button></Row>
          <Tags label="og" items={() => ogTags({ title: title(), siteName: "HADİ", ...(img() ? { image: { url: "https://hadisosyal.com/og.png", width: 1200, height: 630 } } : {}) }).map((m) => `${m.property}=${m.content}`)} /></div>
      },
    },
    resolveHead: {
      code: `resolveHead([
  { titleTemplate: "%s · HADİ", og: { siteName: "HADİ" } },   // defaults
  { title: "Ayakkabılar", description: "…" },                 // the route
  { title: "Koşu ayakkabısı" },                               // a component: later wins
])`,
      run: () => {
        const comp = signal(true)
        const tags = () => resolveHead([{ titleTemplate: "%s · HADİ", og: { siteName: "HADİ" } }, { title: "Ayakkabılar", description: "Her mevsim için" }, comp() ? { title: "Koşu ayakkabısı" } : null], { site: "https://shop.hadisosyal.com", path: "/ayakkabi" })
        return <div class="sc-ex-stack"><Button variant={() => (comp() ? "primary" : "secondary")} onClick={() => comp.set(!comp())}>{() => (comp() ? "Bileşen kaynağı açık" : "Bileşen kaynağı kapalı")}</Button>
          <Pre text={() => headToHtml(tags())} /></div>
      },
    },
    scanTags: {
      code: `scanTags(html).filter((t) => t.name === "meta")   // start tags with attributes, no DOM`,
      run: () => {
        const html = signal(`<title>HADİ</title><meta name="description" content="Ayakkabı &amp; çanta"><img src="a.png" alt="">`)
        return <div class="sc-ex-stack"><Text label="HTML" value={html} /><Tags label="Etiketler" items={() => scanTags(html()).map((t) => `${t.name} ${t.text ?? J(t.attrs)}`)} /></div>
      },
    },
    tagKey: {
      code: `tagKey("meta", { name: "description" })          // "name:description"
tagKey("meta", { property: "og:title" })         // "property:og:title"
tagKey("link", { rel: "canonical", href: "/x" }) // "link:canonical"`,
      run: () => {
        const cases: [string, Record<string, string>][] = [["meta", { name: "description" }], ["meta", { property: "og:image" }], ["meta", { charset: "utf-8" }], ["link", { rel: "canonical", href: "/a" }], ["link", { rel: "alternate", hreflang: "en", href: "/en" }], ["script", { type: "module" }]]
        const pick = signal(0)
        return <div class="sc-ex-stack"><Row>{cases.map(([t, a], i) => <Button variant={() => (pick() === i ? "primary" : "ghost")} onClick={() => pick.set(i)}>{`${t} ${Object.values(a)[0]}`}</Button>)}</Row>
          <Out label="Anahtar" value={() => { const [t, a] = cases[pick()]!; return String(tagKey(t, a)) }} /></div>
      },
    },
    twitterTags: {
      code: `twitterTags({ site: "@hadisosyal", image: "https://hadisosyal.com/og.png" })
// card: "summary_large_image" because there is an image`,
      run: () => {
        const img = signal(true), site = signal("@hadisosyal")
        return <div class="sc-ex-stack"><Row><Text label="site" value={site} /><Button variant={() => (img() ? "primary" : "secondary")} onClick={() => img.set(!img())}>Görsel</Button></Row>
          <Tags label="twitter" items={() => twitterTags({ site: site(), title: "HADİ", ...(img() ? { image: "https://hadisosyal.com/og.png" } : {}) }).map((m) => `${m.name}=${m.content}`)} /></div>
      },
    },
    useHead: {
      code: `function Product(p: { item: Item }) {
  useHead(() => ({ title: p.item.name, description: p.item.summary }))   // removed with the component
  return <h1>{p.item.name}</h1>
}`,
      run: () => {
        const on = signal(false), desc = signal("HADİ: her mevsim için ayakkabı")
        useHead(() => (on() ? { description: desc() } : null))
        const current = () => { headTags(); return document.head.querySelector("meta[name=description]")?.getAttribute("content") ?? "(yok)" }
        return <div class="sc-ex-stack"><Row><Text label="Açıklama" value={desc} /><Button variant={() => (on() ? "primary" : "secondary")} onClick={() => on.set(!on())}>{() => (on() ? "Etkin" : "Kapalı")}</Button></Row>
          <Out label="Sayfanın meta description'ı" value={current} /></div>
      },
    },
  },
  "hadi-march/seo/hydrate": {
    hydrate: {
      code: `// index.html carries the prerendered page: <div id="app" data-m-prerender="/">…</div>
hydrate(() => <App />, document.getElementById("app")!)   // swaps in one step when ready`,
      run: () => {
        const host = box(""), status = signal("—")
        let stop: (() => void) | null = null
        const go = () => {
          stop?.()
          host.replaceChildren(...Array.from(parseHtml("<p><strong>Önceden yazılmış HTML</strong> (derlemede üretildi)</p>").childNodes))
          host.setAttribute("data-m-prerender", location.pathname)
          status.set("eski içerik görünüyor, uygulama arka planda çiziliyor…")
          const t0 = Date.now()
          stop = hydrate(() => <p>Canlı uygulama: {now()} · <Badge tone="success">etkileşimli</Badge></p>, host, { ready: () => { const ok = Date.now() - t0 > 1200; if (ok) status.set("tek adımda değiştirildi"); return ok } })
        }
        onCleanup(() => stop?.())
        go()
        return <div class="sc-ex-stack"><Row><Button onClick={go}>Yeniden dene</Button><Out label="Durum" value={status} /></Row>{host}</div>
      },
    },
    prerenderedFor: {
      code: `prerenderedFor(document.getElementById("app")!)   // true: the URL shows the prerendered route`,
      run: () => {
        const pre = signal(location.pathname)
        const el = () => { const e = document.createElement("div"); e.setAttribute("data-m-prerender", pre()); return e }
        return <div class="sc-ex-stack"><Row><Text label="data-m-prerender" value={pre} />{[location.pathname, "/baska-sayfa", "/motion"].map((p) => <Button variant="ghost" onClick={() => pre.set(p)}>{p}</Button>)}</Row>
          <Row><Out label="Adres" value={location.pathname} /><Out label="prerenderedFor" value={() => String(prerenderedFor(el()))} /></Row></div>
      },
    },
  },
  "hadi-march/dom/safe": {
    RICH_SCHEMA: {
      code: `parseHtml(html, RICH_SCHEMA)                        // the rich text allowlist (default)
parseHtml(html, { tags: { p: [], strong: [] } })   // your own, smaller one`,
      run: () => {
        const own = signal(false), src = `<h2>Başlık</h2><p><b>Kalın</b>, <i>eğik</i>, <a href="https://hadisosyal.com">bağlantı</a></p>`
        const out = box("")
        effect(() => { out.replaceChildren(parseHtml(src, own() ? { tags: { p: [], strong: [] }, rename: { b: "strong" } } : RICH_SCHEMA)) })
        return <div class="sc-ex-stack"><Row><Button variant={() => (own() ? "secondary" : "primary")} onClick={() => own.set(false)}>RICH_SCHEMA</Button><Button variant={() => (own() ? "primary" : "secondary")} onClick={() => own.set(true)}>Yalnız p + strong</Button></Row>
          {out}<Tags label="İzinli etiketler" items={() => Object.keys(RICH_SCHEMA.tags)} /></div>
      },
    },
  },
  "hadi-march/dom/sanitize": {
    BLOCKS: {
      code: `BLOCKS.has("p")      // true
BLOCKS.has("strong") // false (inline)`,
      run: () => {
        const tag = signal("blockquote")
        return <Row><Text label="Etiket" value={tag} />{["p", "span", "ul", "em", "figure"].map((t) => <Button variant="ghost" onClick={() => tag.set(t)}>{t}</Button>)}<Out label="Blok mu" value={() => String(BLOCKS.has(tag().toLowerCase()))} /></Row>
      },
    },
    decodeEntities: {
      code: `decodeEntities("Ayakkabı &amp; çanta &#x1F45F;")   // "Ayakkabı & çanta 👟"`,
      run: () => {
        const s = signal("Ayakkabı &amp; çanta &#x1F45F; &laquo;yeni&raquo; &hellip;")
        return <div class="sc-ex-stack"><Text label="Metin" value={s} /><Out label="Sonuç" value={() => decodeEntities(s())} /></div>
      },
    },
    normalizeBlocks: {
      code: `normalizeBlocks(editor)                    // inline runs → <p>, <div> flattened
normalizeBlocks(root, { topHeading: 2 })   // h1 → h2`,
      run: () => {
        const top = signal(false)
        const src = `serbest metin <b>kalın</b><div><h1>Başlık</h1><p>paragraf</p></div><li>yalnız madde</li>`
        const shape = (n: Node) => Array.from(n.childNodes).map((c) => c.nodeName.toLowerCase())
        const after = () => { const f = parseHtml(src); return shape(normalizeBlocks(f, top() ? { topHeading: 2 } : {})) }
        return <div class="sc-ex-stack"><Button variant={() => (top() ? "primary" : "secondary")} onClick={() => top.set(!top())}>topHeading: 2</Button>
          <Out label="Önce" value={shape(parseHtml(src)).join(" · ")} /><Out label="Sonra" value={() => after().join(" · ")} /></div>
      },
    },
    parseHtml: {
      code: `const frag = parseHtml(clipboardHtml)   // allowlisted nodes only, no innerHTML
editor.append(frag)`,
      run: () => {
        const html = signal(`<p onclick="steal()">Merhaba <b>Ada</b> <a href="javascript:alert(1)">tıkla</a> <a href="https://hadisosyal.com">site</a></p><script>steal()</script><iframe src="//x"></iframe>`)
        const out = box("")
        effect(() => { out.replaceChildren(parseHtml(html())) })
        return <div class="sc-ex-stack"><Area label="Gelen HTML" value={html} />{out}<Out label="Bağlantılar" value={() => { html(); return Array.from(out.querySelectorAll("a")).map((a) => a.getAttribute("href")).join(", ") || "(yok)" }} /></div>
      },
    },
    sanitizeNode: {
      code: `editor.addEventListener("paste", () => {
  queueMicrotask(() => editor.replaceChildren(sanitizeNode(editor)))
})`,
      run: () => {
        const ed = box(RICH, true), out = box("")
        const dirty = document.createElement("span")
        dirty.setAttribute("style", "color: red"); dirty.setAttribute("onmouseover", "steal()"); dirty.textContent = " (yapıştırılmış süslü metin)"
        ed.querySelector("p")?.append(dirty)
        const clean = () => out.replaceChildren(sanitizeNode(ed))
        clean()
        return <div class="sc-ex-stack"><p class="m-muted">Düzenle ya da bir şey yapıştır:</p>{ed}<Button onClick={clean}>sanitizeNode()</Button>{out}</div>
      },
    },
  },
  "hadi-march/dom/to-markdown": {
    toMarkdown: {
      code: `const md = toMarkdown(editor)   // "## Sürüm notları\\n\\n**HADİ** artık *daha hızlı*. …"
save({ body: md })`,
      run: () => {
        const ed = box(RICH, true), md = signal(toMarkdown(ed))
        ed.addEventListener("input", () => md.set(toMarkdown(ed)))
        return <div class="sc-ex-stack">{ed}<Pre text={md} /></div>
      },
    },
  },
})
