// Forms: form from a schema + validation, the choice looks side by side, then one card per input (src/components/forms/<name>/: demo, Playground, Code) and the wizard.
import { schema } from "march/schema";
import { Form, Checkbox, RadioGroup, CheckboxGroup, toast, Card } from "march/ui";
import { users, zap, shieldCheck } from "march/icons";
import type { ColorToken } from "march/theme";
import { shapesFor } from "march/ui";
import { Stack } from "march/ui";
import { Demo } from "../demo.tsx";
import { Hub } from "../hub.tsx";
import { Playground } from "../playground.tsx";
import { ComponentDemo } from "../component-demo.tsx";

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

const DAYS = [{ value: "mon", label: "Pzt" }, { value: "tue", label: "Sal" }, { value: "wed", label: "Çar" }, { value: "thu", label: "Per" }, { value: "fri", label: "Cum" }]
const PLANS = [
  { value: "free", label: "Ücretsiz", hint: "Bir kişi, temel özellikler", icon: users, meta: "₺0" },
  { value: "team", label: "Ekip", hint: "10 kişiye kadar, paylaşılan alanlar", icon: zap, meta: "₺499/ay" },
  { value: "business", label: "Kurumsal", hint: "Tek oturum açma, denetim kaydı ve öncelikli destek", icon: shieldCheck, meta: "Teklif al" },
]
const VARIANTS = ["classic", "soft", "chip", "card", "toggle"] as const
const VARIANT_LABEL: Record<string, string> = { classic: "classic (cilalı)", soft: "soft (yumuşak)", chip: "chip (hap)", card: "card (kart)", toggle: "toggle (düğme)", segmented: "segmented" }

/** The same day picker in one variant (side-by-side comparison). */
function DayPicker(props: { variant: (typeof VARIANTS)[number]; color?: ColorToken; colors?: "brand"; size?: "sm" | "md" | "lg"; shape?: "square" | "rounded" | "circle" }) {
  let $value = props.variant === "card" ? ["team"] : ["mon", "fri"]
  return <div class="sc-choice-case">
    <code class="sc-choice-name">{VARIANT_LABEL[props.variant]}</code>
    {props.variant === "card"
      ? <CheckboxGroup bind:value={$value} variant="card" options={PLANS.map((x) => ({ ...x }))} m:color={props.color} colors={props.colors} size={props.size} shape={props.shape} aria-label="Plan özellikleri" />
      : <CheckboxGroup bind:value={$value} inline variant={props.variant} options={DAYS} m:color={props.color} colors={props.colors} size={props.size} shape={props.shape} aria-label="Günler" />}
  </div>
}

export default function Forms(props: { params?: { rest?: string } }) {
  let $chVariant = "chip"
  let $chSize = "md"
  let $chShape = "rounded"
  let $chBrand = false
  let $plan = "team"
  let $partial = true
  const RENDER: Record<string, () => unknown> = {
    "row-tools": () => <ComponentDemo folder="forms/row-tools" title="RowTools: satır araçları" desc="Düzenlenebilir bir listenin satır sonundaki araçlar: yukarı taşı, aşağı taşı, sil. İlk satırda yukarı, son satırda aşağı kapanır; araçların alt kümesi, adları ve ikonları değişir." />,
    "choice-variants": () => <>
  <Demo wide title="Seçim kontrolleri: varyantları karşılaştır" desc="Aynı gün seçici beş görünümde. Kutu özel çizilir (gerçek input görünmez ama klavye, form ve ekran okuyucu için durur); tik çizilerek gelir, dolgu ortadan büyür, basınca hafifçe küçülür, odakta temalı halka. Hareketi azalt tercihinde animasyonsuz.">
    <div class="sc-choice-compare">
      {VARIANTS.map((v) => <DayPicker variant={v} />)}
    </div>
  </Demo>
  <Demo wide title="Seçim kontrolleri: seçenekler" desc="Varyant, boyut ve köşe değiştir. Renk üst çubuktaki Vurgu rengi seçicisinden gelir; HADİ renkleri açıkken her seçenek sırayla turuncu, mavi, yeşil, mor olur."
    code={`<CheckboxGroup variant="chip" size="md" shape="rounded" m:color="brand-blue" options={days} />
<CheckboxGroup variant="chip" colors="brand" options={days} />      // one HADİ color per option
<RadioGroup variant="card" options={[{ value, label, hint, icon }]} />
<Checkbox variant="soft" indeterminate label="Kısmen" />`}>
    <Playground options={[
      { label: "Varyant", get: () => $chVariant, set: (v: string) => { $chVariant = v }, options: [...VARIANTS] },
      { label: "Boyut", get: () => $chSize, set: (v: string) => { $chSize = v }, options: ["sm", "md", "lg"] },
      // only the corners this variant can have; hidden when it has a single one
      { label: "Köşe", get: () => $chShape, set: (v: string) => { $chShape = v }, options: () => shapesFor($chVariant as "chip", "checkbox"), visibleWhen: () => shapesFor($chVariant as "chip", "checkbox").length > 1 },
      { label: "HADİ renkleri (colors=brand)", get: () => $chBrand, set: (v: boolean) => { $chBrand = v } },
    ]}>
    <p class="m-muted sc-choice-note">{() => $chVariant === "card" ? "Kart köşesi yalnız square ya da rounded olabilir (kart yuvarlak olmaz)." : $chVariant === "chip" ? "chip: circle hap şeklidir; rounded ve square köşeleri keskinleştirir." : "Radio kutusu her zaman yuvarlaktır; köşe seçimi checkbox'ları ve chip / toggle / card biçimlerini etkiler."}</p>
    {() => <DayPicker variant={$chVariant as "chip"} size={$chSize as "md"} shape={$chShape as "rounded"} colors={$chBrand ? "brand" : undefined} />}
    <div class="sc-choice-compare">
      <div class="sc-choice-case"><code class="sc-choice-name">radio · {() => $chVariant === "toggle" ? "segmented" : $chVariant}</code>
        {() => <RadioGroup bind:value={$plan} inline={$chVariant !== "card"} variant={($chVariant === "toggle" ? "segmented" : $chVariant) as "chip"} size={$chSize as "md"} colors={$chBrand ? "brand" : undefined}
          options={$chVariant === "card" ? PLANS : PLANS.map(({ value, label }) => ({ value, label }))} aria-label="Plan" />}</div>
      <div class="sc-choice-case"><code class="sc-choice-name">tek kutu · kısmi (indeterminate)</code>
        <Stack gap={2}>
          {() => <Checkbox bind:value={$partial} variant={($chVariant === "chip" || $chVariant === "card" || $chVariant === "toggle" ? "classic" : $chVariant) as "classic"} size={$chSize as "md"} shape={$chShape as "rounded"} label="Bildirimleri al" />}
          <Checkbox value={true} indeterminate label="Bazı alt öğeler seçili" />
          <Checkbox value={false} disabled label="Devre dışı" />
        </Stack></div>
    </div>
    </Playground>
  </Demo>
  </>,
    "schema": () => <Demo wide title="Şemadan form" desc="Koşullu alanlar (plan = ekip), canlı doğrulama, gönderimde yükleniyor; sunucu hatası alana düşer (deneme: …@taken.com)."
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
  </Demo>,
    "text-input": () => <ComponentDemo folder="forms/text-input" />,
    "search-box": () => <ComponentDemo folder="forms/search-box" />,
    "textarea": () => <ComponentDemo folder="forms/textarea" />,
    "password": () => <ComponentDemo folder="forms/password-input" />,
    "phone": () => <ComponentDemo folder="forms/phone-input" />,
    "number": () => <ComponentDemo folder="forms/number-input" />,
    "select": () => <ComponentDemo folder="forms/select" />,
    "icon-picker": () => <ComponentDemo folder="forms/icon-picker" title="IconPicker: simge seçici" desc="Bir simgeyi ara, çiplerle süz, ızgaradan seç. Düğmeli ya da satır içi; seçilen simgenin adı değer olur." />,
    "combobox": () => <ComponentDemo folder="forms/combobox" />,
    "multi-select": () => <ComponentDemo folder="forms/multi-select" />,
    "choice-picker": () => <ComponentDemo folder="forms/choice-picker" />,
    "checkbox": () => <ComponentDemo folder="forms/checkbox" />,
    "checkbox-group": () => <ComponentDemo folder="forms/checkbox-group" />,
    "radio-group": () => <ComponentDemo folder="forms/radio-group" />,
    "segmented": () => <ComponentDemo folder="forms/segmented" />,
    "toggle": () => <ComponentDemo folder="forms/toggle" />,
    "slider": () => <ComponentDemo folder="forms/slider" />,
    "color-input": () => <ComponentDemo folder="forms/color-input" />,
    "swatch": () => <ComponentDemo folder="forms/swatch" title="Swatch: renk örneği" desc="Düz renk, gradyan, saydam renk ya da tema belirteci. Bir örneğe basınca seçilir; saydam renkler dama zemini üstünde görünür." />,
    "code": () => <ComponentDemo folder="forms/code-input" />,
    "calendar": () => <ComponentDemo folder="forms/calendar" />,
    "date": () => <ComponentDemo folder="forms/date-picker" />,
    "time": () => <ComponentDemo folder="forms/time-input" />,
    "date-time": () => <ComponentDemo folder="forms/date-time-input" />,
    "date-range": () => <ComponentDemo folder="forms/date-range-picker" />,
    "list-editor": () => <ComponentDemo folder="forms/list-editor" />,
    "key-value-editor": () => <ComponentDemo folder="forms/key-value-editor" />,
    "file-upload": () => <ComponentDemo folder="forms/file-upload" />,
    "rating": () => <ComponentDemo folder="forms/rating" title="Rating: yıldızla puan" desc="Radyo grubu: oklarla değişir (RTL'de aynalanır), üstüne gelince önizler; salt okunurken yarım yıldız gösterir." />,
    "wizard": () => <ComponentDemo folder="composite/wizard" title="Wizard: adım adım form" desc="Karmaşık bileşen: her adımın kendi şeması; ileri giderken doğrular, geri dönünce değerler korunur, önceki adımlar geçince sonraki adıma üstteki listeden atlanır. Parçaları aşağıdaki satırda." />,
  }
  return <Hub section="/forms" kicker="Bileşenler" title="Formlar" lead="Şemadan form: alanlar, doğrulama, koşullu alanlar ve tür bilgisi tek tanımdan. Bütün alanlar bind: ile iki yönlü bağlanır." render={RENDER} params={props.params} />
}
