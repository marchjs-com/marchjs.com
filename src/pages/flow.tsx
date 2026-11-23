// Flow editor: FlowCanvas (node editor), FlowPalette (drag to add), FlowControls + FlowTimeline (run, pause, step,
// record) and ContextMenu — one live order flow that really runs: values travel along the edges, branches skip, a
// declined card shakes its node, the timeline records every step. JSON in and out through the readable schema.
import "./flow.css";
import { Kbd } from "march/ui";
import { FlowEditorStage } from "../catalog/composite/flow-canvas/editor.tsx";
// the flow components and ContextMenu have their own entries (march/flow, march/context-menu): their demos
// and option specs are imported here and drawn with the light Playground, so this route stays inside its budget
import FlowCanvasDemo, { code as canvasCode } from "../catalog/composite/flow-canvas/demo.tsx";
import canvasSpec from "../catalog/composite/flow-canvas/playground.ts";
import FlowControlsDemo, { code as controlsCode } from "../catalog/composite/flow-controls/demo.tsx";
import controlsSpec from "../catalog/composite/flow-controls/playground.ts";
import FlowPaletteDemo, { code as paletteCode } from "../catalog/composite/flow-palette/demo.tsx";
import paletteSpec from "../catalog/composite/flow-palette/playground.ts";
import ContextMenuDemo, { code as menuCode } from "../catalog/overlays/context-menu/demo.tsx";
import menuSpec from "../catalog/overlays/context-menu/playground.ts";
import { Demo, Section } from "../demo.tsx";
import { LitePlayground } from "../play-lite.tsx";

function LiveEditor() {
  return <Demo wide title="Canlı akış: HADİ sipariş akışı" desc="Çalıştır'a basın: sipariş tetikleyiciden geçer, tutara göre ödeme ya da elle onay yoluna ayrılır, iki yol birleşir. Kenarlarda değerler akar ve sayılır, çalışan düğüm parlar; 'Kart reddedilsin' açıkken ödeme düğümü sarsılır. Paletten sürükleyin, portları sürükleyerek bağlayın, sağ tıklayın."
    code={`const flow = createFlow({ types, doc })
const runner = createFlowRunner(flow)
<FlowControls runner={runner} flow={flow} />
<FlowPalette flow={flow} />
<FlowCanvas flow={flow} snap={16} minimap />
<FlowTimeline runner={runner} flow={flow} />
flow.load(JSON.parse(text), "İçe aktar")   // validateFlow ile denetlenir, tek geri alma adımı`}>
    <FlowEditorStage />
  </Demo>
}

function Keys() {
  const rows: [string, string][] = [
    ["Sürükle (boş alan)", "seçim kutusu · Space ya da orta tuşla kaydır"], ["Ctrl + tekerlek / iki parmak", "yakınlaştır"],
    ["Ok tuşları", "seçileni ızgara adımıyla taşı (Shift: 4 adım)"], ["Enter, Enter (port)", "klavyeyle bağla"],
    ["Ctrl+C · Ctrl+X · Ctrl+V · Ctrl+D", "kopyala, kes, yapıştır, çoğalt"], ["Ctrl+Z · Ctrl+Shift+Z", "geri al, yinele"],
    ["Ctrl+G · Ctrl+Shift+G", "grupla, grubu çöz"], ["Delete", "sil"], ["+ · − · 0 · Shift+L", "yakınlaştır, uzaklaştır, sığdır, yerleştir"],
    ["Shift+F10", "bağlam menüsü"],
  ]
  return <Demo title="Klavye" desc="Tuval tamamen klavyeyle kullanılır; seçim, bağlama, yapıştırma ve yerleşim ekran okuyucuya duyurulur.">
    <dl class="sc-flow-keys">{rows.map(([k, v]) => [<dt><Kbd>{k}</Kbd></dt>, <dd>{v}</dd>])}</dl>
  </Demo>
}

export default function FlowPage() {
  return <Section kicker="Karmaşık bileşenler" title="Akış editörü" lead="Düğüm tabanlı akışlar: sonsuz tuval, portlar ve bezier kenarlar, sürükle-bırak palet, geri alma ve pano, mini harita, otomatik yerleşim, gruplar; akış gerçekten çalışır ve her adımı zaman çizelgesine kaydeder.">
    <LiveEditor />
    <Demo wide title="FlowCanvas: seçenekler" desc="Boş alanda sürükleme seçim kutusu ya da kaydırma; ızgara adımı hem yapışmayı hem noktalı zemini değiştirir; mini harita ve düğüm içi alanlar açılıp kapanır." code={canvasCode}><LitePlayground spec={canvasSpec} view={FlowCanvasDemo} /></Demo>
    <Demo wide title="FlowControls ve zaman çizelgesi" desc="Çalıştır, duraklat, adım adım, sıfırla ve hız. Ödeme düğümünde 'Kart reddedilsin' açıkken düğüm sarsılır, sonrası atlanır, durum 'Hatayla bitti' olur." code={controlsCode}><LitePlayground spec={controlsSpec} view={FlowControlsDemo} /></Demo>
    <Demo wide title="FlowPalette: sürükleyerek ekle" desc="Kartı tuvale bırakın ya da odaklayıp Enter'a basın. Arama Türkçe harf ve aksan duyarsız." code={paletteCode}><LitePlayground spec={paletteSpec} view={FlowPaletteDemo} /></Demo>
    <Demo wide title="ContextMenu: sağ tık menüsü" desc="Menu ile aynı öğeler ve klavye; öğeler tıklanan hedefe göre değişir. Shift+F10 ya da Menü tuşu klavyeden açar." code={menuCode}><LitePlayground spec={menuSpec} view={ContextMenuDemo} /></Demo>
    <Keys />
  </Section>
}
