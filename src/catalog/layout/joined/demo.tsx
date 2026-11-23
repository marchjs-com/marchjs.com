// Showcase stage for Joined: direction, radius, frame and dividers follow the Playground values (playground.ts).
import { Joined } from "march/layout";
import { Card } from "march/data";
import { Button } from "march/actions";
import { TextInput } from "march/forms";

export const code = `<Joined>                                   // one under the other, one frame
  <Card title="Önizleme">…</Card>
  <CodeView code={code} lang="tsx" />
</Joined>
<Joined direction="horizontal" radius="full"> // side by side
  <TextInput placeholder="Ara…" /><Button variant="primary">Ara</Button>
</Joined>`

export default function JoinedDemo(props: { values: { direction: string; radius: number; border: boolean; dividers: boolean; parts: number } }) {
  return <div class="sc-col">
    {() => {
      const v = props.values
      const dir = v.direction as "vertical"
      return <Joined direction={dir} radius={v.radius as 2} border={v.border} dividers={v.dividers}>
        {["Önizleme", "Kod", "Notlar", "Geçmiş", "Paylaş"].slice(0, v.parts - 1).map((t) => <Card title={t}>Bir bütünün parçası: kendi çerçevesi yok</Card>)}
        <Button variant="ghost">Daha fazla</Button>
      </Joined>
    }}
    <Joined direction="horizontal" radius="full">
      <TextInput placeholder="Ara…" aria-label="Ara" />
      <Button variant="primary">Ara</Button>
    </Joined>
  </div>
}
