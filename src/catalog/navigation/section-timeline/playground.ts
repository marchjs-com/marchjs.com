import { definePlayground } from "../../spec.ts";
import type { SectionTimelineItem } from "march/components/navigation/section-timeline";

interface Values { items: readonly SectionTimelineItem[]; orientation: string; count: number; magnify: boolean; intro: boolean; reach: number; grow: number; wave: number; smooth: boolean; color: string; line: number }

// items is required (the sections): two lists to choose from, so the raw component in MarchIDE draws its dots; each
// target is a selector (the stage points every dot at its own box instead)
const list = (names: string[]): readonly SectionTimelineItem[] => names.map((label, i) => ({ label, target: `[data-sec="${i}"]` }));
/** A guide's chapters (the stage's default). */
export const GUIDE = list(["Giriş", "Kurulum", "Sinyaller", "Bileşenler", "Temalar", "Hareket", "Yönlendirici", "Formlar", "Tablolar", "Grafikler",
  "Çeviri", "Erişilebilirlik", "Güvenlik", "Test", "Derleme", "Yayın"]);
/** A novel's chapters. */
export const NOVEL = list(["Önsöz", "Liman", "Fırtına", "Ada", "Harita", "Mağara", "Hazine", "İhanet", "Kaçış", "Çöl",
  "Vaha", "Kervan", "Şehir", "Saray", "Dönüş", "Son söz"]);

export default definePlayground<Values>({
  options: [
    { key: "items", label: "Bölümler (items)", default: GUIDE, options: [{ value: GUIDE, label: "kılavuz" }, { value: NOVEL, label: "roman" }] },
    { key: "orientation", label: "Yön", default: "vertical", options: [{ value: "vertical", label: "dikey" }, { value: "horizontal", label: "yatay" }] },
    // an option of the stage (how many of the sections it draws), not a prop of the component
    { key: "count", label: "Bölüm sayısı", default: 8, min: 3, max: 16, step: 1, prop: false },
    { key: "magnify", label: "Büyüteç (fisheye)", default: true },
    { key: "intro", label: "Açılışta büyüteç gezsin (intro)", default: true, visibleWhen: (v) => v.magnify },
    { key: "reach", label: "Büyüteç erimi (px)", default: 130, min: 60, max: 240, step: 10, visibleWhen: (v) => v.magnify },
    { key: "grow", label: "Büyüyünce açılan yer (px)", default: 28, min: 0, max: 48, step: 2, visibleWhen: (v) => v.magnify },
    { key: "wave", label: "Renk dalgası süresi (ms, 0: hepsi birden)", default: 480, min: 0, max: 1200, step: 40 },
    { key: "line", label: "Okuma çizgisi (kutunun oranı)", default: 0.33, min: 0.1, max: 0.9, step: 0.01 },
    { key: "smooth", label: "Yumuşak kaydırma", default: true },
    { key: "color", label: "Renk", default: "primary", options: [{ value: "primary", label: "ana renk" }, { value: "brand-blue", label: "mavi" }, { value: "brand-green", label: "yeşil" }, { value: "brand-purple", label: "mor" }], prop: "m:color" },
  ],
});
