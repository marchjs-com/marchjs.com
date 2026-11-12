// The late part of the Messaging page: loaded on demand (its own chunk). It subscribes only when it arrives and still
// draws the latest sales at once (sticky channel); a click on a bar tells the page "this month" without knowing who listens.
import { BarChart } from "hadi-march/charts/bar.ts";
import { ch, type Sale } from "./channels.ts";

export default function SalesChart() {
  const sales = ch["sales.updated"].toSignal()
  const sel = ch["chart.select"].toSignal()
  return <div class="sc-msg-chart">
    <BarChart data={sales() ?? []} x="month" y="total" series={{ total: "Satış" }} format={["money", "TRY"] as const} height={220}
      title={sel() ? `Satış · seçili: ${sel()?.month}` : "Aylık satış"} legend={false}
      onSelect={(p: { datum: Sale | undefined }) => { if (p.datum) ch["chart.select"].emit({ month: p.datum.month }) }} />
  </div>
}
