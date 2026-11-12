// Router demo: a second page under the same layout (different toolbar buttons).
import { Portal } from "hadi-march";
import { Button, toast } from "hadi-march/ui";

export default function RouterAbout() {
  return <>
    <Portal to="toolbar" order={0}><Button size="sm" variant="secondary" on:click={() => toast("Hakkında sayfasının düğmesi", { kind: "info" })}>Paylaş</Button></Portal>
    <h3>Hakkında</h3>
    <p>Bu sekmeye geçince yalnız iç kısım değişti: yerleşim (not kutusu, yan panel) yerinde. Üst çubuktaki düğme de bu sayfanınki.</p>
  </>
}
