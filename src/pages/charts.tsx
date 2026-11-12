// Charts: stats, line/area (zoom), bar, pie, bar list, heatmap, progress ring. Colors come from the theme.
import { LineChart, AreaChart, BarChart, PieChart, Stat, BarList, Heatmap, ProgressRing, Sparkline } from "hadi-march/charts";
import { Card, Button, Grid } from "hadi-march/ui";
import { users, activity, diamond, message, plus } from "hadi-march/icons";
import { Demo, Section } from "../demo.tsx";

const DAY = 864e5, start = Date.UTC(2026, 9, 13);
const wave = (i: number, base: number, amp: number, k: number) => Math.round(base + amp * Math.sin((i + k) / 3) + (amp / 2) * Math.cos((i * 7 + k) / 5) + i * base * 0.006);

export default function Charts() {
  let $rows = Array.from({ length: 30 }, (_, i) => ({ day: start + i * DAY, revenue: wave(i, 1200, 260, 1), expenses: wave(i, 760, 180, 4), active: wave(i, 8200, 700, 2) }))
  const addDay = () => { const n = $rows.length; $rows = [...$rows.slice(1), { day: $rows[n - 1].day + DAY, revenue: wave(n + 30, 1300, 300, 1), expenses: wave(n + 30, 800, 200, 4), active: wave(n + 30, 8800, 800, 2) }] }
  const channels = [{ label: "Uygulama", value: 4200 }, { label: "Web", value: 2900 }, { label: "Davet", value: 1800 }, { label: "Kampanya", value: 950 }, { label: "Diğer", value: 610 }]
  const heat: { h: number; d: number; v: number }[] = []
  for (let d = 0; d < 7; d++) for (let h = 0; h < 24; h++) heat.push({ h, d, v: Math.max(0, Math.round((d < 5 ? 40 : 25) * Math.sin(((h - 6) / 24) * Math.PI) + ((h * 7 + d * 3) % 9))) })
  const days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]
  return <Section kicker="Bileşenler" title="Grafikler" lead="SVG, erişilebilir (ekran okuyucu için veri tablosu, klavyeyle nokta gezme), tema paletiyle renklenir. Veri sinyalse grafik kendiliğinden güncellenir.">
    <Demo wide title="Göstergeler" desc="Stat: değer, önceki döneme göre değişim, eğilim çizgisi."
      code={`<Stat icon={users} label="Toplam üye" value={48210} delta={0.214} spark={seri} hint="önceki döneme göre" />`}>
      <Grid cols={4} gap={4}>
        <Card><Stat icon={users} label="Toplam üye" value={48210} delta={0.214} hint="önceki döneme göre" spark={$rows.map((r) => r.active)} /></Card>
        <Card><Stat icon={activity} label="Günlük active" value={9640} delta={0.068} hint="önceki döneme göre" spark={$rows.map((r) => r.active)} /></Card>
        <Card><Stat icon={diamond} label="Gelir" value={$rows.reduce((s, r) => s + r.revenue, 0)} delta={0.105} format={["money", "TRY"]} spark={$rows.map((r) => r.revenue)} /></Card>
        <Card><Stat icon={message} label="Gider" value={$rows.reduce((s, r) => s + r.expenses, 0)} delta={-0.031} invert format={["money", "TRY"]} spark={$rows.map((r) => r.expenses)} /></Card>
      </Grid>
    </Demo>

    <Demo wide title="Çizgi ve alan" desc="Sürükleyerek yakınlaştır; noktalar arasında ← → ile gez. Yeni gün ekle: grafik akar.">
      <div class="sc-row"><Button size="sm" icon={plus} on:click={addDay}>Gün ekle</Button></div>
      <Grid cols={2} gap={4}>
        <Card title="Gelir ve expenses"><LineChart data={$rows} x="day" y={["revenue", "expenses"]} series={{ revenue: "Gelir", expenses: "Gider" }} format={["money", "TRY"]} xFormat="date" zoom height={240} title="Gelir ve expenses" /></Card>
        <Card title="Etkin kullanıcı"><AreaChart data={$rows} x="day" y="active" series={{ active: "Etkin" }} xFormat="date" height={240} title="Etkin kullanıcı" legend={false} /></Card>
      </Grid>
    </Demo>

    <Demo title="Çubuk" desc="Gruplu ya da yatay.">
      <BarChart data={$rows.slice(-7)} x={(r: { day: number }) => new Date(r.day).toLocaleDateString("tr", { weekday: "short" })} y={["revenue", "expenses"]} series={{ revenue: "Gelir", expenses: "Gider" }} title="Son 7 gün" height={220} />
    </Demo>
    <Demo title="Pasta ve halka" desc="Donut ortasında toplam; dilimler odaklanabilir.">
      <div class="sc-row sc-row-center">
        <PieChart data={channels} donut title="Kanal payı" legend="right" width={340} height={210} />
      </div>
    </Demo>
    <Demo title="Çubuk listesi ve halkalar" desc="BarList, ProgressRing, Sparkline.">
      <BarList data={channels} title="Kanallar" format="number" />
      <div class="sc-row"><ProgressRing value={82} label="Sağlık" /><ProgressRing value={57} label="Hedef" /><ProgressRing value={23} label="Risk" /><Sparkline data={$rows.map((r) => r.revenue)} width={160} height={40} area /></div>
    </Demo>
    <Demo title="Isı haritası" desc="Gün × saat yoğunluğu (tema vurgusunun tonları).">
      <Heatmap data={heat} x="h" y="d" value="v" yFormat={(d: number) => days[d]} title="Etkinlik" />
    </Demo>
  </Section>
}
