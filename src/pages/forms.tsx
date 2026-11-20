// Forms: one MarchIDE page per input (src/components/forms/<name>/), the form from a schema and the choice looks.
import { Hub } from "../hub.tsx";
import { ComponentDemo } from "../component-demo.tsx";

export default function Forms(props: { params?: { rest?: string } }) {
  const RENDER: Record<string, () => unknown> = {
    "row-tools": () => <ComponentDemo folder="forms/row-tools" title="RowTools: satır araçları" desc="Düzenlenebilir bir listenin satır sonundaki araçlar: yukarı taşı, aşağı taşı, sil. İlk satırda yukarı, son satırda aşağı kapanır; araçların alt kümesi, adları ve ikonları değişir." />,
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
