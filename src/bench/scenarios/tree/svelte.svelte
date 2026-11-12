<!-- One value deep in a large tree, Svelte 5 (runes): the tree is drawn by a recursive snippet (Svelte 5's way to
     recurse inside one component); the leaf values are a deep $state array, and each leaf reads only its own entry.
     A step assigns the target entry and Svelte updates only that text binding. Compiled with fragments: "tree"
     (tools/gen-bench.mjs → svelte.gen.js). -->
<script>
  let { data } = $props();
  const roots = data.roots;
  let values = $state(data.values.slice());
  export function step(v) { values[data.target] = v; }
</script>

{#snippet node(n)}
  {#if n.kids}
    <div class="n"><span class="l">{n.label}</span>{#each n.kids as c (c.id)}{@render node(c)}{/each}</div>
  {:else}
    <div class="n leaf"><span class="l">{n.label}</span><b class="v">{values[n.leaf]}</b></div>
  {/if}
{/snippet}

<div class="tree">{#each roots as c (c.id)}{@render node(c)}{/each}</div>
