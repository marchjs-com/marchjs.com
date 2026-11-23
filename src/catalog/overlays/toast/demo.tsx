// Showcase stage for toast: the button shows a toast with the Playground values; the list below mirrors toast.list().
import { toast, ToastHost } from "march/overlays";
import { Button } from "march/actions";
import { star } from "march/icons";

export const code = `const id = toast("Dosya arşivlendi", { kind: "success", action: { label: "Geri al", run: () => restore() } })
toast("Bağlantı koptu", { kind: "danger", timeout: 0 })   // 0: kapatılana kadar kalır
toast.dismiss(id); toast.clear()
toast("Seviye atladın!", { icon: "🎉", closable: false, motion: "fade" })   // kendi ikonun, × yok, kendi hareketin
toast("Favorilere eklendi", { icon: star, color: "brand-purple" })`

const TEXT: Record<string, string> = { info: "Yeni sürüm hazır.", success: "Dosya arşivlendi.", warn: "Oturum 5 dakika içinde kapanacak.", danger: "Bağlantı koptu." }

const ICONS: Record<string, unknown> = { kind: undefined, own: star, emoji: "🎉", off: false }

export default function ToastDemo(props: { values: { position: string; kind: string; action: boolean; timeout: number; icon: string; closable: boolean; motion: string } }) {
  let $undone = 0
  const show = () => {
    const v = props.values
    toast(TEXT[v.kind] ?? TEXT.info, { kind: v.kind as "info", timeout: v.timeout, action: v.action ? { label: "Geri al", run: () => { $undone++ } } : undefined,
      icon: ICONS[v.icon], color: v.icon === "own" ? "brand-purple" : undefined, closable: v.closable, motion: v.motion as "spring" })
  }
  return <div class="sc-col">
    {() => <ToastHost position={props.values.position as "bottom-end"} />}
    <code class="sc-call">{() => { const v = props.values; return `toast("${TEXT[v.kind]}", { kind: "${v.kind}"${v.action ? `, action: { label: "Geri al", run }` : ""}, timeout: ${v.timeout}${v.timeout ? "" : " /* kapatılana kadar */"}${v.icon === "own" ? `, icon: star, color: "brand-purple"` : v.icon === "emoji" ? `, icon: "🎉"` : v.icon === "off" ? ", icon: false" : ""}${v.closable ? "" : ", closable: false"}${v.motion === "spring" ? "" : `, motion: "${v.motion}"`} })` }}</code>
    <div class="sc-row">
      <Button variant="primary" on:click={show}>{() => `Göster: ${TEXT[props.values.kind]}`}</Button>
      <Button on:click={() => toast.clear()}>Tümünü kapat</Button>
      <span class="sc-strip-label" aria-live="polite">{() => `Ekranda ${toast.list().length}${$undone ? ` · ${$undone} kez geri alındı` : ""}`}</span>
    </div>
  </div>
}
