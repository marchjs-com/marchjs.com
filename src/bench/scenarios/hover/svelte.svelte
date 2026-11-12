<!-- Moving highlight, Svelte 5 (runes): the hovered index is $state and each row's class reads it. Svelte has no
     selector primitive, so a step re-runs every row's class binding (10.000 cheap comparisons) and writes only the two
     that changed. Compiled with fragments: "tree" (tools/gen-bench.mjs → svelte.gen.js). -->
<script>
  import { HOVER } from "./def.ts";
  let { data } = $props();
  let hovered = $state(-1);
  export function step(i) { hovered = i; }
</script>

<table class="bt"><tbody>
  {#each data as it, i (it.id)}
    <tr class={hovered === i ? HOVER : ""}><td class="id">{it.id}</td><td class="lbl">{it.label}</td></tr>
  {/each}
</tbody></table>
