<!-- Start-up, Svelte 5 (runes): the scenario harness mounts this component once (svelte mount + flushSync); a start
     re-creates the whole page inside a {#key} block, which tears down the previous page's DOM and effects and builds
     the page from the compiled template, the same work a fresh mount does. The counter is $state, reset with the page;
     a click goes through Svelte's own delegated event handler. Compiled with fragments: "tree" (tools/gen-bench.mjs → svelte.gen.js). -->
<script>
  import { flushSync } from "svelte";
  import { rowsFor, HEADS } from "./def.ts";
  let { data } = $props();
  let k = $state(0), n = $state(0);
  const rows = $derived(rowsFor(data.rows, k));
  export function step(next) {
    k = next; n = 0;
    flushSync();
    inc.click();
  }
  let inc = $state();
</script>

{#key k}
<div class="dash">
  <header class="hd"><h1>{data.title}</h1><span class="run">{k}</span><span class="count">{n}</span><button class="inc" type="button" bind:this={inc} onclick={() => n++}>+1</button></header>
  <nav class="nv"><ul>{#each data.nav as l}<li><a href={l.href}>{l.label}</a></li>{/each}</ul></nav>
  <section class="cards">{#each data.stats as s}<div class="card"><div class="lbl">{s.label}</div><div class="val">{s.value}</div><div class="delta">{s.delta}</div></div>{/each}</section>
  <table class="bt"><thead><tr>{#each HEADS as t}<th>{t}</th>{/each}</tr></thead><tbody>
    {#each rows as r (r.id)}<tr><td class="id">{r.id}</td><td><a href={"#u" + r.id}>{r.name}</a></td><td>{r.email}</td><td><span class={"badge " + r.status}>{r.status}</span></td><td class="amt">{r.amount}</td><td>{r.date}</td></tr>{/each}
  </tbody></table>
  <form class="fm">{#each data.fields as f}<div class="f"><label>{f.label}</label><input name={f.name} type={f.type}></div>{/each}<button type="button">Kaydet</button></form>
</div>
{/key}
