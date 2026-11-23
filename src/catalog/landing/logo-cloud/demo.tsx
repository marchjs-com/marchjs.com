// Showcase stage for LogoCloud: sample community wordmarks as a grid or a ticker.
import { LogoCloud } from "march/components/landing/logo-cloud";
import { Wordmark, LOGO_NAMES } from "../demo-kit.tsx";

export const code = `<LogoCloud title="Bu topluluklar HADİ'de buluşuyor" variant="marquee" logos={[
  { name: "Kitap Kulübü", src: "/logos/kitap.svg", width: 120, height: 32 },
  { name: "Northwind", node: <NorthwindLogo /> },
]} />
<LogoCloud logos={logos} reveal="up" />     // grid: another entrance; reveal="none": the logos are simply there`

export default function LogoCloudDemo(props: { values: { sample: number; title: string; variant: string; mono: boolean; speed: number; reveal: string } }) {
  const logos = LOGO_NAMES.filter((name) => name !== "HADİ").map((name) => ({ name, node: <Wordmark name={name} /> }))
  return <div>
    {() => {
      const v = { ...props.values }
      return <LogoCloud title={v.title || undefined} variant={v.variant as "grid"} mono={v.mono} speed={v.speed} reveal={v.reveal as "fade"} logos={logos.slice(0, v.sample)} />
    }}
  </div>
}
