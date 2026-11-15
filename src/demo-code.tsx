// A demo card's Code tab: the code widget point (CodeViewer + Copy + Fullscreen by default) and the highlighter. Its own
// lazy part, loaded on the first click on "Kod" (no page needs it to paint).
import { Widget, codeView } from "march/ui";

export default function DemoCode(props: { source: string; lang: string }) {
  return <Widget sources={[codeView]} input={{ source: props.source, lang: props.lang }} />
}
