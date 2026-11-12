<!-- Theme change, Svelte 5 (runes): the theme is a $state object, set as context for the component tree; every badge
     binds its class to theme.accent, so a change updates only those 2.000 class bindings. The scenario's Svelte app is
     a single component (only svelte.svelte is compiled), so the badges read the object this component provides
     instead of a child component's getContext(); getContext runs once when a component starts and is not part of
     the update. Compiled with fragments: "tree" (tools/gen-bench.mjs → svelte.gen.js). -->
<script>
  import { setContext } from "svelte";
  import { FIRST, badgeClass } from "./def.ts";
  let { data } = $props();
  const theme = $state({ accent: FIRST });
  setContext("theme", theme);
  export function step(accent) { theme.accent = accent; }
</script>

<div class="cards">
  {#each data as c (c.id)}
    <div class="card"><h3>{c.title}</h3><p>{c.text}</p><span class={badgeClass(theme.accent)}>#{c.id}</span></div>
  {/each}
</div>
