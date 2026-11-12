<!-- Shared store, Svelte 5 (runes): one $state store object (app) holds all the cells; each cell binding reads
     app.cells[i], so it depends on that index only. Sections are a snippet. A step writes the 50 cells and Svelte
     updates only those bindings. Compiled with fragments: "tree" (tools/gen-bench.mjs → svelte.gen.js). -->
<script>
  import { sectionsOf } from "./def.ts";
  let { data } = $props();
  const app = $state({ cells: data.cells.slice() });
  const sections = sectionsOf(data.cells.length);
  export function step(writes) {
    for (const w of writes) app.cells[w.i] = w.v;
  }
</script>

{#snippet section(idx)}
  <div class="ss">{#each idx as i}<span class="sc">{app.cells[i]}</span>{/each}</div>
{/snippet}

<div class="sg">
  {#each sections as idx}{@render section(idx)}{/each}
</div>
