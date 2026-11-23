// Showcase stage for PanelHeader: one panel whose bar follows the Playground values (playground.ts).
import { PanelHeader } from "march/components/layout/panel-header";
import { Button } from "march/components/actions/button";
import { IconButton } from "march/components/actions/icon-button";
import { Badge } from "march/components/data/badge";
import { settings, more, minus, Icon } from "march/icons";

export const code = `<PanelHeader icon={settings} title="Ayarlar" subtitle="Çalışma alanı" divider
  actions={<Button size="sm">Kaydet</Button>} onClose={() => $open = false} />
<PanelHeader as="footer" title="3 değişiklik" actions={<Button size="sm">Uygula</Button>} divider />
<PanelHeader drag title={$title} ref={(bar) => track(bar, move)} onClose={close} />   // pencere başlığı`

interface Values { kind: string; size: string; icon: boolean; subtitle: boolean; meta: boolean; actions: boolean; close: string; divider: boolean; tone: string; color: string; title: string }

export default function PanelHeaderDemo(props: { values: Values }) {
  let $closed = 0
  return <div class="sc-a6-panel">
    {() => {
      const v = { ...props.values }
      const foot = v.kind === "footer"
      const bar = <PanelHeader as={foot ? "footer" : "header"} size={v.size as "md"} divider={v.divider} tone={v.tone as "plain"}
        m:color={v.color === "none" ? undefined : v.color as "primary"}
        icon={v.icon ? settings : undefined}
        title={foot ? "3 değişiklik kaydedilmedi" : v.title}
        subtitle={v.subtitle ? "Çalışma alanı · herkese açık" : undefined}
        meta={v.meta ? <Badge>3</Badge> : undefined}
        actions={v.actions ? <><Button size="sm" variant={foot ? "primary" : "secondary"}>{foot ? "Uygula" : "Kaydet"}</Button><IconButton size="sm" icon={more} label="Diğer" /></> : undefined}
        close={v.close === "off" ? false : v.close === "own" ? <Icon of={minus} /> : true}
        closeLabel={v.close === "own" ? "Küçült" : undefined}
        onClose={() => $closed++} />
      const body = <div class="sc-a6-panel-body"><p class="m-muted">Panelin içeriği. Başlık çubuğunun her parçası seçeneklerden açılıp kapanır.</p>
        <p class="sc-demo-call">{() => `onClose: ${$closed} kez`}</p></div>
      return foot ? <>{body}{bar}</> : <>{bar}{body}</>
    }}
  </div>
}
