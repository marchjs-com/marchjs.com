// Showcase stage for FileUpload: one or several files, what is accepted, and a simulated upload with progress.
import { FileUpload, type UploadFn } from "march/components/forms/file-upload";
import { Icon, trash } from "march/icons";
import { Button } from "march/components/actions/button";
import { computed, untrack } from "march";

export const code = `<FileUpload multiple accept="image/*" maxSize={5_000_000} label="Görselleri bırak ya da seç" />
<FileUpload bind:value={$urls} multiple upload={(file, { onProgress, signal }) => api.upload(file, onProgress, signal)} />
<FileUpload multiple hint="PNG ya da JPG, en çok 5 MB" preview={false} removeIcon={() => <Icon of={trash} />}
  labels={{ uploaded: "Yüklendi", cancel: "Vazgeç", tooLarge: (name, max) => \`\${name} çok büyük (en çok \${max})\` }} />`

// a pretend upload: progress in steps, cancellable through the signal. The steps are short right after the remove
// button was changed, so the finished row (where that button is) shows at once
let stepMs = 250

const fake: UploadFn<string> = (file, { onProgress, signal }) => new Promise((resolve, reject) => {
  let p = 0
  const id = setInterval(() => { p += 0.1; onProgress(Math.min(p, 1)); if (p >= 1) { clearInterval(id); resolve(`https://cdn.hadisosyal.com/${file.name}`) } }, stepMs)
  signal.addEventListener("abort", () => { clearInterval(id); reject(new Error("aborted")) })
})

// a sample file the demo drops into the zone, so that the options that show on a listed file (progress, preview, the
// remove button) can be seen without choosing a file: a small drawn image, or a PDF when only PDFs are accepted
const SAMPLE_IMAGE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="currentColor"/><circle cx="24" cy="24" r="10" fill="white"/></svg>`
const sample = (accept: string): File => (accept === ".pdf" ? new File(["%PDF-1.4"], "ornek-belge.pdf", { type: "application/pdf" }) : new File([SAMPLE_IMAGE], "ornek-gorsel.svg", { type: "image/svg+xml" }))

export default function FileUploadDemo(props: { values: { multiple: boolean; accept: string; upload: boolean; hint: string; preview: boolean; remove: string } }) {
  let host: HTMLElement | undefined
  let lastRemove: string | undefined
  // the same path as a real drop: the zone checks type and size, lists the file and starts the upload
  const addSample = () => {
    const zone = host?.querySelector(".m-drop")
    if (!zone) return
    const drop = new Event("drop", { bubbles: true, cancelable: true })
    Object.defineProperty(drop, "dataTransfer", { value: { files: [sample(props.values.accept)], types: ["Files"] } })
    zone.dispatchEvent(drop)
  }
  // these four are read when the control is built or when a file is added: the control is built again only when one of
  // them changes (the list starts over with the sample file); what is accepted and the hint stay live
  const once = computed(() => [props.values.multiple, props.values.upload, props.values.preview, props.values.remove].join("|"))
  return <div class="sc-stack" ref={(x: Element) => { host = x as HTMLElement }}>
    {() => {
      once()
      const removeNow = untrack(() => props.values.remove); stepMs = lastRemove !== undefined && removeNow !== lastRemove ? 20 : 250; lastRemove = removeNow
      queueMicrotask(addSample)
      return untrack(() => {
        const multiple = props.values.multiple, upload = props.values.upload, preview = props.values.preview, remove = props.values.remove
        return <FileUpload multiple={multiple} accept={props.values.accept || undefined} maxSize={5_000_000} upload={upload ? fake : undefined}
        label={multiple ? "Dosyaları bırak ya da seç" : "Bir dosya bırak ya da seç"}
        hint={props.values.hint === "off" ? false : props.values.hint === "own" ? "En çok 5 MB; görseller önerilir" : undefined} preview={preview}
        removeIcon={remove === "trash" ? () => <Icon of={trash} /> : undefined}
        labels={{ uploaded: "Yüklendi", cancel: "Vazgeç", max: (s: string) => `en çok ${s}`, remove: (n: string) => `${n} dosyasını kaldır` }} />
      })
    }}
    <div class="sc-row"><Button size="sm" variant="secondary" data-audit-try on:click={addSample}>Örnek dosya ekle</Button></div>
  </div>
}
