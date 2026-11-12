// Forms: form from a schema + validation, single fields, pickers, rating, wizard.
import { schema } from "hadi-march/schema";
import {
  Form, Field, TextInput, PasswordInput, NumberInput, MoneyInput, PhoneInput, Select, Combobox, MultiSelect, Checkbox, Toggle, RadioGroup, CheckboxGroup, Segmented,
  Slider, ColorInput, CodeInput, DatePicker, DateRangePicker, Textarea, FileUpload, Rating, Wizard, toast, Card, Grid,
} from "hadi-march/ui";
import { Icon, search, users, zap, shieldCheck, globe } from "hadi-march/icons";
import { COLOR_TOKENS, type ColorToken } from "hadi-march/theme";
import { Stack } from "hadi-march/ui";
import { Demo, Section } from "../demo.tsx";

const Signup = schema({
  name: { type: "text", label: "Ad soyad", required: true, max: 60, autocomplete: "name" },
  email: { type: "email", label: "E-posta", required: true },
  password: { type: "password", label: "Parola", required: true, min: 10, autocomplete: "new-password", help: "En az 10 karakter" },
  plan: { type: "pick", label: "Plan", options: [{ value: "free", label: "Ücretsiz" }, { value: "team", label: "Ekip" }], default: "team", control: "segmented" },
  seats: { type: "int", label: "Koltuk", min: 2, max: 500, default: 5, when: (v) => v.plan === "team" },
  budget: { type: "money", label: "Aylık bütçe", currency: "TRY", when: (v) => v.plan === "team" },
  birthday: { type: "date", label: "Doğum tarihi" },
  interests: { type: "multi", label: "İlgi alanları", options: ["Tasarım", "Mühendislik", "Satış", "Destek"] },
  newsletter: { type: "bool", label: "Ürün haberlerini gönder", control: "switch" },
})

const CITIES = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Konya", "Adana", "Gaziantep", "Kayseri", "Eskişehir", "Trabzon", "Samsun"].map((c) => ({ value: c, label: c }))

const HADI_COLORS = ["brand-orange", "brand-blue", "brand-green", "brand-purple"] as const
const COLOR_LABEL: Record<string, string> = { primary: "Birincil", "brand-orange": "Turuncu", "brand-blue": "Mavi", "brand-green": "Yeşil", "brand-purple": "Mor" }


const DAYS = [{ value: "mon", label: "Pzt" }, { value: "tue", label: "Sal" }, { value: "wed", label: "Çar" }, { value: "thu", label: "Per" }, { value: "fri", label: "Cum" }]
const PLANS = [
  { value: "free", label: "Ücretsiz", hint: "Bir kişi, temel özellikler", icon: users },
  { value: "team", label: "Ekip", hint: "10 kişiye kadar, paylaşılan alanlar", icon: zap },
  { value: "business", label: "Kurumsal", hint: "Tek oturum açma, denetim kaydı", icon: shieldCheck },
]
const VARIANTS = ["classic", "soft", "chip", "card", "toggle"] as const
const VARIANT_LABEL: Record<string, string> = { classic: "classic (cilalı)", soft: "soft (yumuşak)", chip: "chip (hap)", card: "card (kart)", toggle: "toggle (düğme)", segmented: "segmented" }

/** The same day picker in one variant (founder comparison). */
function DayPicker(props: { variant: (typeof VARIANTS)[number]; color?: ColorToken; colors?: "brand"; size?: "sm" | "md" | "lg"; shape?: "square" | "rounded" | "circle" }) {
  let $value = props.variant === "card" ? ["team"] : ["mon", "fri"]
  return <div class="sc-choice-case">
    <code class="sc-choice-name">{VARIANT_LABEL[props.variant]}</code>
    {props.variant === "card"
      ? <CheckboxGroup bind:value={$value} variant="card" options={PLANS.map((x) => ({ ...x }))} color={props.color} colors={props.colors} size={props.size} aria-label="Plan özellikleri" />
      : <CheckboxGroup bind:value={$value} inline variant={props.variant} options={DAYS} color={props.color} colors={props.colors} size={props.size} shape={props.shape} aria-label="Günler" />}
  </div>
}

export default function Forms() {
  let $accent: ColorToken = "primary"
  let $chVariant = "chip"
  let $chSize = "md"
  let $chShape = "rounded"
  let $chColor = "primary"
  let $chBrand = false
  let $plan = "team"
  let $partial = true
  let $q = ""
  let $pw = ""
  let $n = 3
  let $city = "İstanbul"
  let $town = null
  let $langs = ["tr"]
  let $agree = true
  let $notify = true
  let $size = "m"
  let $days = ["mon", "fri"]
  let $vol = 64
  let $color = "#f2801f"
  let $date = null
  let $range = null
  let $stars = 4
  let $about = ""
  let $phone = ""
  let $price = 1499.9
  return <div data-hm-color={$accent}><Section kicker="Bileşenler" title="Formlar" lead="Şemadan form: alanlar, doğrulama, koşullu alanlar ve tür bilgisi tek tanımdan. Bütün alanlar bind: ile iki yönlü bağlanır.">
    <Demo wide title="Form rengi" desc="Bir renk seç: sayfadaki bütün kontroller (odak, imleç, seçili metin, anahtar, onay kutusu, kaydırıcı, takvim, çipler, adımlar) bu renge geçer. Hata durumu her zaman kırmızı kalır. Yalnız tema tokenı seçilir; tema değişince uyum korunur."
      code={`<Form color="brand-blue" …>            // every field inside inherits
<Checkbox color="success" />               // one control
<CheckboxGroup color="brand-green" …>      // a group`}>
      <div class="sc-row">
        <Segmented bind:value={$accent} aria-label="Form rengi" options={["primary", ...HADI_COLORS].map((v) => ({ value: v, label: COLOR_LABEL[v] }))} />
        <Select bind:value={$accent} aria-label="Bütün renkler" options={COLOR_TOKENS.map((v) => ({ value: v, label: v }))} />
      </div>
    </Demo>
    <Demo wide title="Seçim kontrolleri: varyantları karşılaştır" desc="Aynı gün seçici beş görünümde. Kutu özel çizilir (gerçek input görünmez ama klavye, form ve ekran okuyucu için durur); tik çizilerek gelir, dolgu ortadan büyür, basınca hafifçe küçülür, odakta temalı halka. Hareketi azalt tercihinde animasyonsuz.">
      <div class="sc-choice-compare">
        {VARIANTS.map((v) => <DayPicker variant={v} />)}
      </div>
    </Demo>
    <Demo wide title="Seçim kontrolleri: seçenekler" desc="Varyant, boyut, köşe ve renk değiştir; HADİ renkleri açıkken her seçenek sırayla turuncu, mavi, yeşil, mor olur."
      code={`<CheckboxGroup variant="chip" size="md" shape="rounded" color="brand-blue" options={days} />
<CheckboxGroup variant="chip" colors="brand" options={days} />      // one HADİ color per option
<RadioGroup variant="card" options={[{ value, label, hint, icon }]} />
<Checkbox variant="soft" indeterminate label="Kısmen" />`}>
      <div class="sc-row">
        <Segmented bind:value={$chVariant} aria-label="Varyant" options={[...VARIANTS].map((v) => ({ value: v, label: v }))} />
        <Segmented bind:value={$chSize} aria-label="Boyut" options={["sm", "md", "lg"]} />
        <Segmented bind:value={$chShape} aria-label="Köşe" options={["square", "rounded", "circle"]} />
        <Select bind:value={$chColor} aria-label="Renk" options={COLOR_TOKENS.map((v) => ({ value: v, label: v }))} />
        <Toggle bind:value={$chBrand} label="HADİ renkleri (colors=brand)" />
      </div>
      {() => <DayPicker variant={$chVariant as "chip"} size={$chSize as "md"} shape={$chShape as "rounded"} color={$chColor as ColorToken} colors={$chBrand ? "brand" : undefined} />}
      <div class="sc-choice-compare">
        <div class="sc-choice-case"><code class="sc-choice-name">radio · {() => $chVariant === "toggle" ? "segmented" : $chVariant}</code>
          {() => <RadioGroup bind:value={$plan} inline={$chVariant !== "card"} variant={($chVariant === "toggle" ? "segmented" : $chVariant) as "chip"} size={$chSize as "md"} color={$chColor as ColorToken} colors={$chBrand ? "brand" : undefined}
            options={$chVariant === "card" ? PLANS : PLANS.map(({ value, label }) => ({ value, label }))} aria-label="Plan" />}</div>
        <div class="sc-choice-case"><code class="sc-choice-name">tek kutu · kısmi (indeterminate)</code>
          <Stack gap={2}>
            {() => <Checkbox bind:value={$partial} variant={($chVariant === "chip" || $chVariant === "card" || $chVariant === "toggle" ? "classic" : $chVariant) as "classic"} size={$chSize as "md"} shape={$chShape as "rounded"} color={$chColor as ColorToken} label="Bildirimleri al" />}
            <Checkbox value={true} indeterminate label="Bazı alt öğeler seçili" color={$chColor as ColorToken} />
            <Checkbox value={false} disabled label="Devre dışı" />
          </Stack></div>
      </div>
    </Demo>
    <Demo wide title="Şemadan form" desc="Koşullu alanlar (plan = ekip), canlı doğrulama, gönderimde yükleniyor; sunucu hatası alana düşer (deneme: …@taken.com)."
      code={`const SignUp = schema({
  email: { type: "email", required: true },
  plan:  { type: "pick", options: […], control: "segmented" },
  seats: { type: "int", min: 2, when: (v) => v.plan === "team" },
})
<Form schema={SignUp} layout="grid" cols={2} onSubmit={api.signUp} />`}>
      <Card>
        <Form schema={Signup} layout="grid" cols={2} submitLabel="Hesap oluştur"
          onSubmit={async (v: Record<string, unknown>) => {
            await new Promise((r) => setTimeout(r, 700))
            if (String(v.email).endsWith("@taken.com")) throw Object.assign(new Error("Reddedildi"), { fieldErrors: { email: "Bu adres zaten kayıtlı" } })
            toast(`Hoş geldin, ${v.name}!`, { kind: "success" })
          }} />
      </Card>
    </Demo>

    <Demo title="Metin alanları" desc="Ön ek ikonu, parola göster/gizle, sayı adımlayıcı, para birimi, telefon."
      code={`<Field label="E-posta"><TextInput bind:value={$mail} prefix={<Icon of={mail} />} /></Field>
<Field label="Fiyat"><MoneyInput bind:value={$price} currency="TRY" /></Field>`}>
      <Field label="Ara"><TextInput bind:value={$q} placeholder="Üye, sipariş, etiket…" prefix={<Icon of={search} />} /></Field>
      <Field label="Parola" help="Güçlü bir parola seç"><PasswordInput bind:value={$pw} /></Field>
      <Grid cols={2} gap={3}>
        <Field label="Adet"><NumberInput bind:value={$n} min={0} max={99} /></Field>
        <Field label="Fiyat"><MoneyInput bind:value={$price} currency="TRY" /></Field>
      </Grid>
      <Field label="Telefon"><PhoneInput bind:value={$phone} /></Field>
      <Field label="Hakkında" help={() => `${$about.length}/280`}><Textarea bind:value={$about} rows={3} max={280} placeholder="Kendinden kısaca bahset" /></Field>
    </Demo>

    <Demo title="Seçiciler" desc="Select, aranabilir Combobox, çoklu seçim; klavyeyle gezinme.">
      <Field label="Şehir"><Select bind:value={$city} options={CITIES} /></Field>
      <Field label="İlçe (aranabilir)"><Combobox bind:value={$town} options={["Kadıköy", "Beşiktaş", "Üsküdar", "Şişli", "Bakırköy", "Ataşehir", "Sarıyer", "Fatih"].map((x) => ({ value: x, label: x }))} placeholder="Yazmaya başla" /></Field>
      <Field label="Diller"><MultiSelect bind:value={$langs} options={[{ value: "tr", label: "Türkçe" }, { value: "en", label: "İngilizce" }, { value: "de", label: "Almanca" }, { value: "ar", label: "Arapça" }]} /></Field>
      <Field label="Beden" group><RadioGroup bind:value={$size} inline options={[{ value: "s", label: "S" }, { value: "m", label: "M" }, { value: "l", label: "L" }, { value: "xl", label: "XL" }]} /></Field>
      <Field label="Günler" group><CheckboxGroup bind:value={$days} inline variant="chip" options={[{ value: "mon", label: "Pzt" }, { value: "tue", label: "Sal" }, { value: "wed", label: "Çar" }, { value: "thu", label: "Per" }, { value: "fri", label: "Cum" }]} /></Field>
    </Demo>

    <Demo title="Anahtarlar, kaydırıcı, renk, puan" desc="Toggle, Checkbox, Slider, ColorInput, Rating (← → ile değişir).">
      <Toggle bind:value={$notify} label="Anlık bildirimler" />
      <Checkbox bind:value={$agree} label="Kullanım koşullarını okudum" />
      <Field label={() => `Ses: ${$vol}`}><Slider bind:value={$vol} min={0} max={100} /></Field>
      <Field label="Marka rengi"><ColorInput bind:value={$color} /></Field>
      <Field label="Puan" group><Rating bind:value={$stars} size="lg" /></Field>
      <p class="hm-muted">{() => `${$stars} yıldız · bildirim ${$notify ? "açık" : "kapalı"} · ${$agree ? "onaylandı" : "onay bekliyor"}`}</p>
    </Demo>

    <Demo title="Tarih ve kod" desc="Takvim açılır panel, tarih aralığı (hazır aralıklar), tek kullanımlık kod.">
      <Field label="Tarih"><DatePicker bind:value={$date} /></Field>
      <Field label="Rapor dönemi" group><DateRangePicker bind:value={$range} /></Field>
      <Field label="SMS kodu" group><CodeInput length={6} onComplete={(c: string) => toast(`Kod: ${c}`, { kind: "success" })} /></Field>
    </Demo>

    <Demo title="Dosya yükleme" desc="Sürükle bırak, tür ve boyut denetimi, önizleme.">
      <FileUpload multiple accept="image/*" maxSize={5_000_000} label="Görselleri bırak ya da seç" />
    </Demo>

    <Demo wide title="Adım adım sihirbaz" desc="Her adımın kendi şeması; ileri giderken doğrular, geri dönünce değerler korunur.">
      <Card>
        <Wizard steps={[
          { title: "Hesap", schema: schema({ email: { type: "email", label: "E-posta", required: true } }) },
          { title: "Profil", schema: schema({ name: { type: "text", label: "Görünen ad", required: true }, city: { type: "pick", label: "Şehir", options: CITIES } }) },
          { title: "Tercihler", schema: schema({ news: { type: "bool", label: "Haber bülteni", control: "switch" } }) },
        ]} submitLabel="Bitir" onSubmit={() => toast("Kurulum tamam!", { kind: "success" })} />
      </Card>
    </Demo>
  </Section></div>
}
