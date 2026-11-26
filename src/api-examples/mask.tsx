// API examples of march/mask (the input mask engine), march/mask/presets, march/mask/validators and the mask behavior
// (march/behaviors/mask). Layout and rules: tools/api-examples.js. Each `run` is a small live demo of its `code`: a
// masked field to type into, or the result of the pure function.
import { signal } from "march";
import { TextInput } from "march/ui";
import {
  pattern, dynamic, compile, formatMask, unmask, maskInfo, rawAt, displayAt, upper, lower, asciiDigits, TOKENS,
  number, numberSeparators, date, time, dateTime, dateFormatOf, text, maskInput, type Mask,
} from "march/mask";
import {
  phoneTR, tcKimlikNo, vknNo, plateTR, postalCode, email as emailMask, webUrl, cardNumber, cardExpiry, cardCvc,
  iban as ibanMask, dateField, birthDate, duration, timeRange, money, percent, unit, ipv4 as ipv4Mask, ipv6 as ipv6Mask,
  macAddress, hexColor, uuid, licenseKey, otp, semver, phone, loadPhoneFormats,
} from "march/mask/presets";
import { luhn, iban, ibanLength, tcKimlik, vkn, email, url, ipv4, ipv6 } from "march/mask/validators";
import { mask } from "march/behaviors/mask";
import { examples } from "./types.ts";
import { Out, Row } from "./_kit.tsx";
export { default as SIG } from "./mask.sig.gen.ts";

/** A masked TextInput and what the mask says about its value: the raw value, whether it is complete, its error. */
function Try(props: { mask: unknown; value?: string; label?: string; parsed?: boolean }) {
  const st = signal({ raw: "", complete: false, error: null as string | null, value: null as unknown, name: "" as string | undefined })
  return <div class="sc-stack">
    <TextInput mask={props.mask as Mask} value={props.value ?? ""} maskValue={props.parsed ? "parsed" : "raw"} aria-label={props.label ?? "Maskeli alan"}
      onMaskState={(s: { raw: string; complete: boolean; error: string | null; value: unknown; name?: string }) => st.set({ ...s })} />
    <Row>
      <Out label="raw" value={() => st().raw || "—"} />
      <Out label="tamam" value={() => (st().complete ? "evet" : "hayır")} />
      {props.parsed ? <Out label="value" value={() => JSON.stringify(st().value)} /> : null}
      <Out label="hata" value={() => st().error ?? "—"} />
      {() => (st().name ? <Out label="name" value={st().name} /> : null)}
    </Row>
  </div>
}
/** A field to type into and a pure result of its text. */
function Calc(props: { label: string; value: string; fn: (s: string) => unknown }) {
  const s = signal(props.value)
  return <Row><TextInput value={s} onChange={(v: string) => s.set(v)} aria-label={props.label} /><Out label="→" value={() => String(props.fn(s()))} /></Row>
}

export default examples({
  "march/mask": {
    pattern: {
      code: `pattern("(999) 999 99 99")                 // 9 digit, a letter, A capital, * either
pattern("AA-9{2,4}")                         // {n,m} repeats
pattern("99999[-9999]")                      // [ ] optional part
pattern("#HHHHHH", { tokens: { H: { test: /[0-9a-f]/i, transform: (c) => c.toUpperCase() } } })`,
      run: () => <Try mask={pattern("(999) 999 99 99")} label="Telefon deseni" />,
    },
    dynamic: {
      code: `dynamic([
  { match: /^3[47]/, mask: "9999 999999 99999", name: "amex" },
  { mask: "9999 9999 9999 9999" },
])   // or dynamic((raw) => raw.startsWith("1") ? "9-9-9" : "99 99")`,
      run: () => <Try mask={dynamic([{ match: /^3[47]/, mask: "9999 999999 99999", name: "amex" }, { mask: "9999 9999 9999 9999", name: "diğer" }])} value="3782" label="Dinamik maske" />,
    },
    compile: {
      code: `const m = compile("(999) 999 99 99")     // any spec → a Mask (cached)
m.format("5551234")                      // { text: "(555) 123 4", raw, complete: false, pos, rest }`,
      run: () => <Calc label="Ham değer" value="5551234" fn={(s) => JSON.stringify(compile("(999) 999 99 99").format(s.replace(/\D/g, "")).text)} />,
    },
    formatMask: {
      code: `formatMask("5551234567", "(999) 999 99 99")   // "(555) 123 45 67"   (tables, pipes, the server)`,
      run: () => <Calc label="Değer" value="5551234567" fn={(s) => formatMask(s, "(999) 999 99 99")} />,
    },
    unmask: {
      code: `unmask("(555) 123-45 67", "(999) 999 99 99")   // "5551234567"`,
      run: () => <Calc label="Metin" value="(555) 123-45 67" fn={(s) => unmask(s, "(999) 999 99 99")} />,
    },
    maskInfo: {
      code: `maskInfo("4242424242424242", cardNumber())   // { text: "4242 4242 4242 4242", complete: true, error: null, … }`,
      run: () => <Calc label="Kart" value="4242424242424241" fn={(s) => { const i = maskInfo(s, cardNumber()); return `${i.text} · ${i.complete ? "tamam" : "eksik"} · ${i.error ?? "hata yok"}` }} />,
    },
    rawAt: {
      code: `const f = compile("(999) 999").format("555123")   // "(555) 123"
rawAt(f, 6)   // 3: three raw characters lie before display position 6`,
      run: () => { const f = compile("(999) 999").format("555123"); return <Row>{[0, 1, 4, 6, 9].map((p) => <Out label={`rawAt(${p})`} value={rawAt(f, p)} />)}</Row> },
    },
    displayAt: {
      code: `displayAt(f, 3)   // 4: the caret after three raw characters ("(555|")`,
      run: () => { const f = compile("(999) 999").format("555123"); return <Row>{[0, 1, 3, 4, 6].map((n) => <Out label={`displayAt(${n})`} value={displayAt(f, n)} />)}</Row> },
    },
    upper: {
      code: `upper("istanbul", "tr")   // "İSTANBUL"`,
      run: () => <Calc label="Metin" value="istanbul ılık" fn={(s) => upper(s, "tr")} />,
    },
    lower: {
      code: `lower("IŞIK", "tr")   // "ışık"`,
      run: () => <Calc label="Metin" value="IŞIK İZMİR" fn={(s) => lower(s, "tr")} />,
    },
    asciiDigits: {
      code: `asciiDigits("٠١٢٣ ۴۵۶ ７８９")   // "0123 456 789"`,
      run: () => <Calc label="Rakamlar" value="٠١٢٣ ۴۵۶ ７８９" fn={asciiDigits} />,
    },
    TOKENS: {
      code: `pattern("A9", { tokens: { ...TOKENS, "#": { test: /[0-9a-f]/i } } })   // 9 a A * built in`,
      run: () => <Row>{Object.keys(TOKENS).map((k) => <Out label={k} value={String((TOKENS[k]!.test as RegExp).source)} />)}</Row>,
    },
    number: {
      code: `number({ decimals: 2, negative: true, max: 1e6, locale: "tr" })   // "-1.234,5"; raw "-1234.5"`,
      run: () => <Try mask={number({ decimals: 2, negative: true, max: 1e6, locale: "tr" })} parsed label="Sayı" />,
    },
    numberSeparators: {
      code: `numberSeparators("tr")   // { dec: ",", grp: "." }`,
      run: () => <Row>{["tr", "en", "de", "fr"].map((l) => <Out label={l} value={JSON.stringify(numberSeparators(l))} />)}</Row>,
    },
    date: {
      code: `date()                          // the locale's order; 31.02 and month 13 cannot be typed
date({ format: "YYYY-MM-DD" })   // parsed value: ISO "2026-03-14"`,
      run: () => <Try mask={date({ locale: "tr" })} parsed label="Tarih" />,
    },
    time: {
      code: `time()                     // "HH:mm", 24 hours; 7 → 07
time({ seconds: true })    // "HH:mm:ss"`,
      run: () => <Try mask={time()} parsed label="Saat" />,
    },
    dateTime: {
      code: `dateTime()   // "GG.AA.YYYY SS:DD"; value "2026-03-14T09:30"`,
      run: () => <Try mask={dateTime({ locale: "tr" })} parsed label="Tarih ve saat" />,
    },
    dateFormatOf: {
      code: `dateFormatOf("tr")      // "DD.MM.YYYY"
dateFormatOf("en-US")   // "MM/DD/YYYY"`,
      run: () => <Row>{["tr", "en-US", "de", "ja"].map((l) => <Out label={l} value={dateFormatOf(l)} />)}</Row>,
    },
    text: {
      code: `text({ allow: /[0-9a-f:]/i, case: "lower", check: (v) => (ipv6(v) ? null : "Geçersiz") })`,
      run: () => <Try mask={text({ allow: /^[a-zA-Z0-9-]$/, case: "lower", max: 20, check: (v) => (v.length >= 3 ? null : "En az 3 karakter") })} label="Kullanıcı adı" />,
    },
    maskInput: {
      code: `const ctl = maskInput(inputEl, "99.99.9999", { placeholder: "eager", onChange: (raw) => … })
ctl.state()   // { text, raw, complete, error, value }
ctl.undo(); ctl.redo(); ctl.set("01012026"); ctl.setMask(otherMask)`,
      run: () => {
        const raw = signal("")
        return <Row><TextInput aria-label="Kendi girdim" ref={(el: HTMLInputElement) => { maskInput(el, "99.99.9999", { placeholder: "eager", onChange: (v) => raw.set(String(v)) }) }} /><Out label="raw" value={() => raw() || "—"} /></Row>
      },
    },
  },
  "march/mask/presets": {
    phoneTR: { code: `<TextInput mask={phoneTR()} maskValue="parsed" />   // "(555) 123 45 67" → "+905551234567"`, run: () => <Try mask={phoneTR()} parsed label="Telefon" /> },
    phone: { code: `phone({ country: "GB" })   // "7700 900123" → "+447700900123"
phone()                      // international: the country from the calling code`, run: () => <Try mask={phone()} parsed value="447700900123" label="Uluslararası telefon" /> },
    loadPhoneFormats: {
      code: `await loadPhoneFormats()   // the country formats (one small chunk); phone() loads them itself`,
      run: () => { const n = signal("…"); void loadPhoneFormats().then((r) => n.set(`${r.length} ülke`)); return <Out label="biçimler" value={n} /> },
    },
    tcKimlikNo: { code: `tcKimlikNo()   // 11 digits, both check digits verified (test: 10000000146)`, run: () => <Try mask={tcKimlikNo()} value="10000000146" label="T.C. kimlik no" /> },
    vknNo: { code: `vknNo()   // 10 digits with the check digit`, run: () => <Try mask={vknNo()} label="VKN" /> },
    plateTR: { code: `plateTR()   // "34 ABC 123": province 01–81, 1–3 letters, 2–4 digits`, run: () => <Try mask={plateTR()} value="34abc123" label="Plaka" /> },
    postalCode: { code: `postalCode({ country: "TR" })   // 5 digits; "US" 12345[-6789], "CA" A1A 1A1…`, run: () => <Try mask={postalCode({ country: "CA" })} value="k1a0b1" label="Posta kodu (CA)" /> },
    email: { code: `email()   // no spaces, the format checked`, run: () => <Try mask={emailMask()} value="ada@example.com" label="E-posta" /> },
    webUrl: { code: `webUrl({ https: true })`, run: () => <Try mask={webUrl({ https: true })} value="https://marchjs.com" label="Web adresi" /> },
    cardNumber: { code: `<TextInput mask={cardNumber()} onMaskState={(s) => $type = s.name} />   // format only; Luhn checked`, run: () => <Try mask={cardNumber()} value="378282246310005" label="Kart numarası" /> },
    cardExpiry: { code: `cardExpiry()   // "MM/YY"; 4 → 04; a past month is an error`, run: () => <Try mask={cardExpiry()} value="0430" parsed label="Son kullanma" /> },
    cardCvc: { code: `cardCvc()   // 3 or 4 digits`, run: () => <Try mask={cardCvc()} label="CVC" /> },
    iban: { code: `iban({ country: "TR" })   // "TR33 0006 1005 1978 6457 8413 26", mod-97 checked
iban()                    // any country, its length from the registry`, run: () => <Try mask={ibanMask()} value="TR330006100519786457841326" label="IBAN" /> },
    dateField: { code: `dateField()   // the same as date(): the locale's order, ISO value`, run: () => <Try mask={dateField({ locale: "tr" })} parsed label="Tarih" /> },
    birthDate: { code: `birthDate()   // bday autofill, not in the future`, run: () => <Try mask={birthDate({ locale: "tr" })} parsed label="Doğum tarihi" /> },
    duration: { code: `duration()   // typed from the right: "130" → "1 sa 30 dk"; value: minutes`, run: () => <Try mask={duration({ locale: "tr" })} value="130" parsed label="Süre" /> },
    timeRange: { code: `timeRange()   // "09:00 – 17:30"; value ["09:00", "17:30"]`, run: () => <Try mask={timeRange()} value="09001730" parsed label="Saat aralığı" /> },
    money: { code: `money({ currency: "TRY" })   // "₺1.234,50"; value 1234.5`, run: () => <Try mask={money({ currency: "TRY", locale: "tr" })} parsed label="Tutar" /> },
    percent: { code: `percent()   // "%12,5" in Turkish, "12.5%" in English`, run: () => <Try mask={percent({ locale: "tr" })} parsed label="Yüzde" /> },
    unit: { code: `unit("kilogram")   // "12 kg"`, run: () => <Try mask={unit("kilogram", { locale: "tr", decimals: 1 })} parsed label="Ağırlık" /> },
    ipv4: { code: `ipv4()   // a dot after the third digit, each part ≤ 255`, run: () => <Try mask={ipv4Mask()} label="IPv4" /> },
    ipv6: { code: `ipv6()`, run: () => <Try mask={ipv6Mask()} value="2001:db8::1" label="IPv6" /> },
    macAddress: { code: `macAddress()   // "00:1A:2B:3C:4D:5E"`, run: () => <Try mask={macAddress()} value="001a2b3c4d5e" label="MAC" /> },
    hexColor: { code: `hexColor()   // "#FF8800", "#F80", "#FF880080"`, run: () => <Try mask={hexColor()} value="ff8800" parsed label="Renk" /> },
    uuid: { code: `uuid()`, run: () => <Try mask={uuid()} label="UUID" /> },
    licenseKey: { code: `licenseKey({ groups: 3, size: 4 })   // "AB12-CD34-EF56"`, run: () => <Try mask={licenseKey({ groups: 3, size: 4 })} label="Lisans anahtarı" /> },
    otp: { code: `otp({ length: 6 })   // one-time-code autofill`, run: () => <Try mask={otp()} label="Tek kullanımlık kod" /> },
    semver: { code: `semver()   // "1.4.2", "2.0.0-beta.1"`, run: () => <Try mask={semver()} value="1.4.2" label="Sürüm" /> },
  },
  "march/mask/validators": {
    luhn: { code: `luhn("4242 4242 4242 4242")   // true`, run: () => <Calc label="Numara" value="4242 4242 4242 4242" fn={luhn} /> },
    iban: { code: `iban("TR33 0006 1005 1978 6457 8413 26")   // true`, run: () => <Calc label="IBAN" value="TR33 0006 1005 1978 6457 8413 26" fn={iban} /> },
    ibanLength: { code: `ibanLength("TR")   // 26`, run: () => <Row>{["TR", "DE", "GB", "FR"].map((c) => <Out label={c} value={ibanLength(c)} />)}</Row> },
    tcKimlik: { code: `tcKimlik("10000000146")   // true (a format-valid test number)`, run: () => <Calc label="Kimlik no" value="10000000146" fn={tcKimlik} /> },
    vkn: { code: `vkn(value)   // the tax number's check digit`, run: () => <Calc label="VKN" value="1234567890" fn={vkn} /> },
    email: { code: `email("ada@example.com")   // true`, run: () => <Calc label="E-posta" value="ada@example.com" fn={email} /> },
    url: { code: `url("https://marchjs.com")   // true; url("http://x.com", { https: true }) false`, run: () => <Calc label="Adres" value="https://marchjs.com" fn={(s) => url(s)} /> },
    ipv4: { code: `ipv4("192.168.0.1")   // true`, run: () => <Calc label="IPv4" value="192.168.0.1" fn={ipv4} /> },
    ipv6: { code: `ipv6("2001:db8::1")   // true`, run: () => <Calc label="IPv6" value="2001:db8::1" fn={ipv6} /> },
  },
  "march/behaviors/mask": {
    mask: {
      code: `<input use:mask={"(999) 999 99 99"} />
<input use:mask={{ mask: cardNumber(), value: "parsed", onChange: (v) => … }} />`,
      run: () => {
        const raw = signal("")
        return <Row><TextInput aria-label="use:mask" ref={(el: HTMLInputElement) => { mask(el, { mask: "(999) 999 99 99", onChange: (v) => raw.set(String(v)) }) }} /><Out label="raw" value={() => raw() || "—"} /></Row>
      },
    },
  },
});
