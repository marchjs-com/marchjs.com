// Forms: form from a schema + validation, single fields, pickers, rating, wizard.
import { schema } from "hadi-march/schema";
import {
  Form, Field, TextInput, PasswordInput, NumberInput, MoneyInput, PhoneInput, Select, Combobox, MultiSelect, Checkbox, Toggle, RadioGroup, CheckboxGroup, Segmented,
  Slider, ColorInput, CodeInput, DatePicker, DateRangePicker, Textarea, FileUpload, Rating, Wizard, toast, Card, Grid,
} from "hadi-march/ui";
import { Icon, search } from "hadi-march/icons";
import { COLOR_TOKENS, type ColorToken } from "hadi-march/theme";
import { Progress, Badge, Button, Stack } from "hadi-march/ui";
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

/** One row of controls in one color token. */
function ColorRow(props: { color: ColorToken }) {
  let $on = true
  let $level = 60
  return <div class="sc-color-row" data-hm-color={props.color}>
    <code class="sc-color-name">{props.color}</code>
    <Toggle bind:value={$on} aria-label={`${props.color} anahtar`} />
    <Checkbox value={true} label="Seçili" />
    <Slider bind:value={$level} min={0} max={100} aria-label={`${props.color} kaydırıcı`} />
    <Progress value={$level} label="" size="sm" />
    <Badge tone="primary">Yeni</Badge>
    <Button variant="primary" size="sm">Kaydet</Button>
  </div>
}

export default function Forms() {
  let $accent: ColorToken = "primary"
  let $q = ""
  let $pw = ""
  let $n = 3
  let $city = "İstanbul"
  let $town = null
  let $langs = ["tr"]
  let $agree = true
  let $notify = true
  let $size = "m"
  let $days = ["pzt", "cum"]
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
    <Demo wide title="Bütün renkler" desc="Her tema tokenında aynı kontroller: anahtar, onay kutusu, kaydırıcı, ilerleme, rozet, düğme. Seçili zemin üstündeki işaretin rengi okunurluk kuralıyla seçilir.">
      <div class="sc-color-grid">{COLOR_TOKENS.filter((c) => c !== "warning").map((c) => <ColorRow color={c} />)}</div>
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
      <Field label="Günler" group><CheckboxGroup bind:value={$days} inline options={[{ value: "pzt", label: "Pzt" }, { value: "sal", label: "Sal" }, { value: "car", label: "Çar" }, { value: "per", label: "Per" }, { value: "cum", label: "Cum" }]} /></Field>
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
