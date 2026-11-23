// Showcase stage for ExplodedView: a small card taken apart into its parts (Avatar, Badge, Button), or a Button opened
// into its layers. The same elements move: a click on a plate names it under the stage.
import { ExplodedView } from "march/components/layout/exploded-view";
import { Card } from "march/components/data/card";
import { Badge } from "march/components/data/badge";
import { Avatar } from "march/components/social/avatar";
import { Button } from "march/components/actions/button";
import { plus } from "march/icons";
import type { ColorToken } from "march/theme";

export const code = `<ExplodedView bind:open={$apart} onPick={(id) => $picked = id} active={$picked}
  parts={[{ selector: ".m-avatar", label: "Avatar" }, { selector: ".m-badge", label: "Badge" }, { selector: ".m-btn", label: "Button" }]}>
  <MemberCard />
</ExplodedView>
<ExplodedView open={$apart}><Button icon={plus}>Yeni proje</Button></ExplodedView>   // no parts: the layers of the element
<ExplodedView open layers={{ ring: false, surface: "Zemin" }} gap={32} tilt={{ x: 46, z: -24 }} motion="spring" tags={false} />`

const PARTS = [{ selector: ".m-avatar", label: "Avatar" }, { selector: ".m-badge", label: "Badge" }, { selector: ".m-btn", label: "Button" }]

export default function ExplodedViewDemo(props: { values: { open: boolean; mode: string; tags: boolean; gap: number; motion: string; ring: boolean; color: string } }) {
  let $picked = ""
  return <div class="sc-col">
    {() => {
      const v = { ...props.values }
      const color: ColorToken | undefined = v.color ? v.color as ColorToken : undefined
      const pick = (id: string): void => { $picked = id }
      return v.mode === "parts"
        ? <ExplodedView open={v.open} parts={PARTS} tags={v.tags} gap={v.gap} motion={v.motion as "smooth"} m:color={color} onPick={pick} active={$picked}>
          <Card style={{ inlineSize: "19rem", maxInlineSize: "100%" }}>
            <div class="sc-row"><Avatar name="Elif Arslan" /><strong>Elif Arslan</strong><Badge tone="success">Etkin</Badge></div>
            <p class="m-muted">Tasarım ekibi · 12 proje</p>
            <div class="sc-row"><Button size="sm" icon={plus}>Projeye ekle</Button><Button size="sm" variant="ghost">Profil</Button></div>
          </Card>
        </ExplodedView>
        : <ExplodedView open={v.open} tags={v.tags} gap={v.gap} motion={v.motion as "smooth"} m:color={color} layers={v.ring ? {} : { ring: false }} onPick={pick} active={$picked}>
          <Button icon={plus}>Yeni proje</Button>
        </ExplodedView>
    }}
    <p class="m-muted" aria-live="polite">{() => ($picked ? `Seçilen plaka: ${$picked}` : props.values.open ? "Bir plakaya tıkla: adı burada yazar." : "Ayrıkken parçalar plaka plaka yükselir; kapatınca aynı öğeler geri iner.")}</p>
  </div>
}
