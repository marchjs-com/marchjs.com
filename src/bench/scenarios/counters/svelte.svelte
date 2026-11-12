<!-- Independent counters, Svelte 5 (runes): each counter is its own $state item; a step increments the fired counters
     and Svelte updates only their text. Compiled with fragments: "tree" (tools/gen-bench.mjs → svelte.gen.js). -->
<script>
  let { data } = $props();
  let counters = $state(data.map((c) => ({ id: c.id, n: 0 })));
  export function step(fired) {
    for (const i of fired) counters[i].n++;
  }
</script>

<div class="cg">
  {#each counters as c (c.id)}<span class="ct">{c.n}</span>{/each}
</div>
