<!-- State at the top, Svelte 5 (runes): the unit and the focus are $state at the top and are passed down through the
     panel > group > item levels. The scenario's Svelte app is a single component (only svelte.svelte is compiled), so
     the levels are snippets, whose arguments Svelte passes as live values the way $props are. Only the measured items read the
     unit (one per group), so a unit step updates those 200 value text bindings; a focus step re-checks every item's class expression (it.id === focus) and writes only
     the two that changed (Svelte has no selector primitive). Compiled with fragments: "tree"
     (tools/gen-bench.mjs → svelte.gen.js). -->
<script>
  import { FIRST_UNIT, NO_FOCUS, fmt, itemClass } from "./def.ts";
  let { data } = $props();
  const panels = data.panels;
  let unit = $state(FIRST_UNIT);
  let focus = $state(NO_FOCUS);
  export function step(s) { if ("unit" in s) unit = s.unit; else focus = s.focus; }
</script>

{#snippet item(it, unit, focus)}
  <div class={itemClass(it.id === focus)}><span class="k">{it.label}</span><b class="v">{it.v === null ? `#${it.id}` : fmt(it.v, unit)}</b></div>
{/snippet}
{#snippet group(g, unit, focus)}
  <div class="grp"><h4>{g.title}</h4>{#each g.items as it (it.id)}{@render item(it, unit, focus)}{/each}</div>
{/snippet}
{#snippet panel(p, unit, focus)}
  <section class="pnl"><h3>{p.title}</h3><p class="note">{p.note}</p><div class="grps">{#each p.groups as g (g.id)}{@render group(g, unit, focus)}{/each}</div></section>
{/snippet}

<div class="deep">{#each panels as p (p.id)}{@render panel(p, unit, focus)}{/each}</div>
