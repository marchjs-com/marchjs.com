<!-- Derived values, Svelte 5 (runes): the fields are deep $state; each computed cell is an object whose value and
     class are $derived (class fields), so an edit re-runs only the deriveds that read that field and updates only
     their bindings. Compiled with fragments: "tree" (tools/gen-bench.mjs → svelte.gen.js). -->
<script>
  import { evalComp, compClass } from "./def.ts";
  let { data } = $props();
  let f = $state(data.fields.slice());
  const get = (i) => f[i];
  class Cell {
    c;
    value = $derived(evalComp(this.c, get));
    cls = $derived(compClass(this.c, this.value));
    constructor(c) { this.c = c; }
  }
  const comps = data.comps.map((c) => new Cell(c));
  export function step(e) { f[e.i] = e.v; }
</script>

<div class="dv">
  <div class="dv-fs">{#each f as v}<span class="dv-f">{v}</span>{/each}</div>
  <div class="dv-cs">{#each comps as c}<span class={c.cls}>{c.value}</span>{/each}</div>
</div>
