// Showcase stage for Skeleton: lines, a block or a whole card while "loading"; the button swaps in the real content.
import { Skeleton } from "march/components/feedback/skeleton";
import { Button } from "march/components/actions/button";

export const code = `<Skeleton lines={3} />
<Skeleton block height="lg" />
<Skeleton shape="circle" />                       // avatar yer tutucusu
<Skeleton lines={4} shimmer={false} shortLast={false} label="Profil yükleniyor" />
{() => (loading() ? <Skeleton lines={2} colors="brand" /> : <Profile />)}`

export default function SkeletonDemo(props: { values: { label: string; mode: string; lines: number; height: string; colors: string; shimmer: boolean; shortLast: boolean } }) {
  let $loading = true
  return <div class="sc-col">
    <div class="sc-row"><Button size="sm" on:click={() => { $loading = !$loading }}>{() => ($loading ? "Yüklemeyi bitir" : "Yeniden yükle")}</Button></div>
    {() => {
      const v = props.values
      const colors = v.colors === "theme" ? undefined : (v.colors as "brand")
      if (!$loading) return <div class="sc-skel-real"><strong>HADİ</strong><p class="m-muted">Veri geldi; iskelet aynı düzenin yerini aldı ve hiçbir şey zıplamadı.</p></div>
      const shimmer = v.shimmer, shortLast = v.shortLast, label = v.label || undefined
      if (v.mode === "lines") return <Skeleton lines={v.lines} colors={colors} shimmer={shimmer} shortLast={shortLast} label={label} />
      if (v.mode === "profile") return <div class="sc-row"><Skeleton shape="circle" height={v.height as "md"} colors={colors} shimmer={shimmer} /><div class="sc-grow"><Skeleton lines={v.lines} colors={colors} shimmer={shimmer} shortLast={shortLast} label={label} /></div></div>
      if (v.mode === "block") return <Skeleton block height={v.height as "md"} colors={colors} shimmer={shimmer} />
      return <div class="sc-skel-card"><Skeleton block height={v.height as "md"} colors={colors} shimmer={shimmer} /><Skeleton lines={v.lines} colors={colors} shimmer={shimmer} shortLast={shortLast} label={label} /></div>
    }}
  </div>
}
