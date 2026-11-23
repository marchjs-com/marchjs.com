// Home page sections (a lazy part, loaded as they come near): forms that check as you type, every theme as a little
// page to pick, the icon wall with a search, layers (dialog, drawer, confirm, toast) and the command palette. Real
// components throughout.
import "./more.css";
import { Link } from "march/router";
import { Button, PasswordInput, TextInput, Toggle, ThemePreview, colorThemes, colorTheme, setColorTheme, toast, openDialog, openDrawer, confirm, openPalette, Kbd } from "march/ui";
import { Field } from "march/forms";
import { Reveal } from "march/components/landing/reveal";
import {
  Icon, arrowRight, bell, calendar, check, clock, cloud, code, copy, download, edit, eye, filter, flag, folder, gift, globe, grid,
  heart, home, image, link, lock, mail, mic, moon, music, phone, pin, play, plus, search, send, settings, shield, sparkles, star, sun, tag, trash, user, users, zap,
} from "march/icons";
import { HOME_STATS as S } from "../../home-stats.gen.ts";
import { Head } from "../head.tsx";

// ── forms ───────────────────────────────────────────────────────────────────────────────────────────────────────

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Forms() {
  let $name = ""
  let $email = ""
  let $password = ""
  let $news = true
  let $sent = false
  // each rule speaks as soon as there is something to judge (not on an empty field)
  const nameError = (): string | null => ($name && $name.trim().length < 2 ? "Adın en az iki harf olmalı" : null)
  const emailError = (): string | null => ($email && !EMAIL.test($email) ? "Bu bir e-posta adresine benzemiyor" : null)
  const strength = (): number => [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) => r.test($password)).length
  const passError = (): string | null => ($password && strength() < 3 ? "Daha güçlü olsun: uzunluk, büyük harf, rakam, işaret" : null)
  const ready = (): boolean => !!$name && !!$email && !!$password && !nameError() && !emailError() && !passError()
  const send = (e: Event): void => {
    e.preventDefault()
    if (!ready()) return
    $sent = true
    toast(`Hoş geldin ${$name.trim()}!`, { kind: "success" })
  }
  return <section class="sc-sec" aria-labelledby="sc-form-h">
    <Head id="sc-form-h" kicker="Formlar" color="brand-orange" title="Doğrulaması hazır formlar" example="Yazarken denetler, bekletmez"
      lead="Alanlar, kurallar, hata metinleri ve güç ölçer hazır. Şemadan form üretilir; sunucunun hatası doğru alanın altına düşer." />
    <Reveal class="sc-form" effect="up" stagger={110}>
      <form class="sc-form-card sc-card" on:submit={send} novalidate>
        <Field label="Adın" error={nameError()}><TextInput bind:value={$name} placeholder="Öykü" autocomplete="name" /></Field>
        <Field label="E-posta" error={emailError()}><TextInput bind:value={$email} type="email" placeholder="oyku@ornek.com" autocomplete="email" /></Field>
        <Field label="Parola" error={passError()}><PasswordInput bind:value={$password} autocomplete="new-password" /></Field>
        <div class="sc-form-meter" aria-hidden="true">{[0, 1, 2, 3].map((i) => <i class={() => (strength() > i ? `is-on is-${strength()}` : "")} />)}</div>
        <Toggle bind:value={$news}>Yeniliklerden haberdar et</Toggle>
        <Button type="submit" variant="primary" disabled={!ready()} iconEnd={arrowRight}>{() => ($sent ? "Kaydoldun" : "Kaydol")}</Button>
      </form>
      <ul class="sc-form-points">
        <li><Icon of={check} size="lg" /><span>Kurallar yazarken çalışır, boş alanı suçlamaz</span></li>
        <li><Icon of={shield} size="lg" /><span>Parola gücü dört basamakta ölçülür</span></li>
        <li><Icon of={zap} size="lg" /><span>Gönder düğmesi ancak her şey doğruyken açılır</span></li>
        <li><Icon of={sparkles} size="lg" /><span>Şemadan form: alanlar, kurallar ve hatalar tek yerden</span></li>
      </ul>
    </Reveal>
  </section>
}

// ── themes ──────────────────────────────────────────────────────────────────────────────────────────────────────

function Themes() {
  return <section class="sc-sec" aria-labelledby="sc-theme-h">
    <Head id="sc-theme-h" kicker="Temalar" color="brand-purple" title={`${S.themes} hazır tema`} example="Bir temaya dokun, bütün sayfa ona bürünsün"
      lead="Her biri renk, yazı tipi, köşe ve gölgeden oluşan bir kişilik. Birine dokun, bütün sayfa ona bürünür; kendi temanı da yazabilirsin." />
    <Reveal class="sc-themes" effect="scale" stagger={45}>
      {colorThemes().map((th) => <button type="button" class={() => `sc-theme${colorTheme() === th.id ? " is-on" : ""}`} aria-pressed={() => String(colorTheme() === th.id)}
        on:click={() => setColorTheme(th.id)}>
        <ThemePreview id={th.id} class="sc-theme-pv" />
        <span class="sc-theme-name">{th.name}</span>
      </button>)}
    </Reveal>
  </section>
}

// ── icons ───────────────────────────────────────────────────────────────────────────────────────────────────────

/** The wall: a few of the built-in icons with their names (search filters them). */
const WALL: readonly [string, unknown][] = Object.entries({
  bell, calendar, check, clock, cloud, code, copy, download, edit, eye, filter, flag, folder, gift, globe, grid,
  heart, home, image, link, lock, mail, mic, moon, music, phone, pin, play, plus, search, send, settings, shield, sparkles, star, sun, tag, trash, user, users, zap,
})

function Icons() {
  let $q = ""
  const shown = () => WALL.filter(([n]) => n.includes($q.trim().toLowerCase()))
  return <section class="sc-sec" aria-labelledby="sc-icon-h">
    <Head id="sc-icon-h" kicker="İkonlar" color="brand-blue" title={`${S.icons.total.toLocaleString("tr")} ikonluk bir ikon kütüphanesi`} example="Yalnız kullandığın ikon derlemeye girer"
      lead={`Yerleşik set ve ${S.icons.packs} açık kaynak paket (Lucide, Tabler, Phosphor…). Her ikon tek başına içe aktarılır; paketin geri kalanı derlemeye girmez.`} />
    <div class="sc-glyphs">
      <TextInput bind:value={$q} placeholder="İkon ara: heart, star, mail…" aria-label="İkon ara" class="sc-glyphs-search" />
      <div class="sc-glyphs-wall">
        {() => shown().map(([n, d]) => <span class="sc-glyph" title={n}><Icon of={d as never} size="xl" /><small>{n}</small></span>)}
        {() => (shown().length ? null : <p class="sc-glyphs-none">Bu adla bir ikon yok</p>)}
      </div>
      <Link href="/icons" class="sc-fast-link">Bütün ikonlar ve paketler</Link>
    </div>
  </section>
}

// ── layers ──────────────────────────────────────────────────────────────────────────────────────────────────────

function Layers() {
  const dialog = () => openDialog((close) => <div class="sc-layer-body">
    <p>Odak içeride tutulur, Esc kapatır, arkadaki sayfa kaymaz. Kapanınca odak düğmeye döner.</p>
    <Button variant="primary" on:click={() => close()}>Tamam</Button>
  </div>, { title: "Bir diyalog" })
  const drawer = () => openDrawer((close) => <div class="sc-layer-body">
    <p>Kenardan gelen çekmece: telefonda sürükleyerek kapanır.</p>
    <Button on:click={() => close()}>Kapat</Button>
  </div>, { title: "Bir çekmece", side: "end" })
  const ask = async () => { if (await confirm({ title: "Silinsin mi?", message: "Bu yalnız bir deneme; hiçbir şey silinmez.", danger: true, ok: "Sil" })) toast("Silindi (aslında silinmedi)", { kind: "info" }) }
  const LAYERS: readonly { icon: unknown; title: string; text: string; run: () => unknown }[] = [
    { icon: grid, title: "Diyalog", text: "Odak tuzağı, Esc, kaydırma kilidi", run: dialog },
    { icon: arrowRight, title: "Çekmece", text: "Kenardan gelir, sürükleyince kapanır", run: drawer },
    { icon: shield, title: "Onay", text: "Tehlikeli işlemden önce sorar", run: ask },
    { icon: bell, title: "Bildirim", text: "Üst üste dizilir, kendiliğinden kaybolur", run: () => toast("Kaydedildi", { kind: "success" }) },
  ]
  return <section class="sc-sec" aria-labelledby="sc-layer-h">
    <Head id="sc-layer-h" kicker="Katmanlar" color="brand-green" title="Diyalog, çekmece ve bildirim tek katman yöneticisinden" example="Bir dokunuşla açılır, doğru yere kapanır"
      lead="Diyalog, çekmece, onay ve bildirim: hepsi aynı katman yöneticisinden çıkar, birbirinin üstünde doğru sıralanır, erişilebilirlik kuralları hazırdır." />
    <Reveal class="sc-layers" effect="up" stagger={90}>
      {LAYERS.map((l) => <button type="button" class="sc-layer sc-card" on:click={() => void l.run()}>
        <span class="sc-layer-icon"><Icon of={l.icon as never} size="xl" /></span>
        <b>{l.title}</b><span>{l.text}</span><span class="sc-layer-go">Aç <span aria-hidden="true">→</span></span>
      </button>)}
    </Reveal>
  </section>
}

// ── the command palette ─────────────────────────────────────────────────────────────────────────────────────────

function Palette() {
  return <section class="sc-sec sc-pal-band" aria-labelledby="sc-pal-h">
    <div class="sc-pal-copy">
      <Head id="sc-pal-h" kicker="Klavye" color="brand-orange" title="Klavye kısayolları ve komut paleti" example="Her şey bir tuş uzakta"
        lead="Komut paleti, kısayollar, kısayol ipuçları: uygulamanın her eylemi klavyeyle bulunur ve çalıştırılır. Bu sayfada da açık." />
      <Button variant="primary" icon={search} on:click={openPalette}>Komut paletini aç <Kbd keys="mod+k" /></Button>
    </div>
    <div class="sc-pal-keys" aria-hidden="true">
      {["mod+k", "mod+s", "shift+?", "esc", "mod+z", "mod+shift+z"].map((k, i) => <span class={`sc-pal-key is-${(i % 4) + 1}`}><Kbd keys={k} /></span>)}
    </div>
  </section>
}

export default function MoreUi() {
  return <>
    <Forms />
    <Themes />
    <Icons />
    <Layers />
    <Palette />
  </>
}
