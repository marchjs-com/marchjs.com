// Showcase stage for Pagination: a result list paged by the control (Playground values in playground.ts).
import { signal } from "march";
import { Pagination } from "march/navigation";
import type { ColorToken } from "march/theme";

export const code = `<Pagination bind:page={$page} pages={20} siblings={1} />
<Pagination bind:page={$page} pages={20} prev="‹ Geri" next="İleri ›" gap="·" m:color="brand-blue" />   // kendi metnin, işaretin, rengin
<Pagination bind:page={$page} pages={5} controls={false} gap={false} />                               // yalnız numaralar
<Pagination variant="simple" bind:page={$page} total={200} size={$size} sizes={[10, 20, 50]} onSize={(n) => $size = n} />
<Pagination variant="simple" hasPrev={$before != null} hasNext={$after != null} onPrev={older} onNext={newer} />   // imleç kipi`

export default function PaginationDemo(props: { values: { variant: string; pages: number; siblings: number; controls: boolean; prev: string; next: string; gap: string; color: string; info: boolean; status: boolean; sizes: readonly number[] | "" } }) {
  const page = signal(5)
  const chosen = signal(10)
  // rows per page: the chosen size while it is one of the Playground's sizes, else the first of them
  const size = (): number => { const list = props.values.sizes; return list && !list.includes(chosen()) ? list[0]! : chosen() }
  // cursor mode: the list only knows whether an older / newer batch exists
  const batch = signal(2)
  const clamp = (): number => Math.min(page(), props.values.pages)
  return <div class="sc-page-demo">
    <p class="m-muted">{() => (props.values.variant === "cursor" ? `Akış: ${batch()}. yığın (toplam bilinmiyor)` : `Sonuçlar ${(clamp() - 1) * size() + 1}–${clamp() * size()} · sayfa ${clamp()} / ${props.values.pages}`)}</p>
    {() => {
      const v = { ...props.values }, c = v.controls, g = v.gap, color = (v.color || undefined) as ColorToken
      const prev = v.prev || undefined, next = v.next || undefined
      if (v.variant === "cursor") return <Pagination variant="simple" hasPrev={() => batch() > 1} hasNext={() => batch() < 6} onPrev={() => batch.set(batch() - 1)} onNext={() => batch.set(batch() + 1)}
        controls={c} prev={prev} next={next} />
      if (v.variant === "simple") return <Pagination variant="simple" page={clamp} total={() => props.values.pages * size()} size={size} setPage={(p: number) => page.set(p)}
        sizes={v.sizes || undefined} onSize={(n: number) => chosen.set(n)} info={v.info} status={v.status} controls={c} prev={prev} next={next} />
      return <Pagination page={clamp} pages={() => props.values.pages} siblings={v.siblings} setPage={(p: number) => page.set(p)} m:color={color}
        controls={c} prev={prev} next={next}
        gap={g === "off" ? false : g === "own" ? "·" : undefined} />
    }}
  </div>
}
