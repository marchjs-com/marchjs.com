// Showcase stage for CommandPalette: the app's palette (mounted once by the shell) with this card's commands added while
// the card is on screen; the trigger button opens it. Playground values swap the commands and the button text.
import { computed, onCleanup } from "march";
import { PaletteButton, registerCommands, type Command } from "march/composite";
import { toast } from "march/overlays";
import { fileText, download, copy, users, plus, command } from "march/icons";

export const code = `registerCommands([
  { id: "doc.new", title: "Yeni belge", group: "Belge", icon: fileText, shortcut: "mod+alt+n", run: create },
  { id: "doc.export", title: "PDF olarak dışa aktar", group: "Belge", keywords: "indir pdf", run: exportPdf },
])
<CommandPalette ask={(q) => api.intent(q)} placeholder="Sayfa ya da eylem ara…" />
<PaletteButton label="Komut ara…" />`

const done = (what: string) => () => toast(`${what}: demo eylemi çalıştı`, { kind: "success" })
const SETS: Record<string, Command[]> = {
  doc: [
    { id: "demo.doc.new", title: "Yeni belge", group: "Bu kart: belge", icon: fileText, run: done("Yeni belge") },
    { id: "demo.doc.export", title: "PDF olarak dışa aktar", group: "Bu kart: belge", icon: download, keywords: "indir pdf", run: done("Dışa aktarım") },
    { id: "demo.doc.copy", title: "Bağlantıyı kopyala", group: "Bu kart: belge", icon: copy, keywords: "paylaş link", run: done("Kopyalama") },
  ],
  team: [
    { id: "demo.team.invite", title: "Ekibe kişi davet et", group: "Bu kart: ekip", icon: plus, keywords: "üye ekle", run: done("Davet") },
    { id: "demo.team.list", title: "Ekip üyelerini göster", group: "Bu kart: ekip", icon: users, run: done("Üyeler") },
  ],
}

export default function CommandPaletteDemo(props: { values: { group: string; label: string; icon: string; kbd: boolean } }) {
  onCleanup(registerCommands(() => SETS[props.values.group] ?? []))
  // the icon and the shortcut hint are read once by the button: a new choice of these builds it again (the label stays live)
  const iconOf = computed(() => props.values.icon), kbdOf = computed(() => props.values.kbd)
  return <div class="sc-row">
    {() => {
      const icon = iconOf(), kbd = kbdOf()
      return <PaletteButton label={() => props.values.label} kbd={kbd} icon={icon === "off" ? false : icon === "own" ? command : undefined} />
    }}
    <span class="m-muted">Açın ve "{() => (props.values.group === "team" ? "davet" : "pdf")}" yazın</span>
  </div>
}
