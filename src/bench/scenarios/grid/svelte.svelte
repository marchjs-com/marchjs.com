<!-- Data list, Svelte 5 (runes): the query, categories, sort and the running selection count and total are $state;
     the filtered list and the sorted view are two $derived; a keyed {#each} reuses rows by id. Selection is a $state
     array of flags that each row reads for its own record, so a toggle updates one row's class and the summary.
     Compiled with fragments: "tree" (tools/gen-bench.mjs → svelte.gen.js). -->
<script>
  import { CATS, SEL, matches, compare, fmtPrice, summary } from "./def.ts";
  let { data } = $props();
  let q = $state(""), cats = $state(CATS.map(() => true)), key = $state("id"), dir = $state(1);
  let count = $state(0), total = $state(0);
  const sel = $state(new Array(data.length).fill(false));
  const filtered = $derived.by(() => { const c = cats.slice(); return data.filter((r) => matches(r, q, c)); });
  const view = $derived(filtered.slice().sort(compare(key, dir)));
  function setSel(i, on) {
    if (sel[i] === on) return;
    sel[i] = on;
    count += on ? 1 : -1;
    total += on ? data[i].price : -data[i].price;
  }
  export function step(a) {
    if (a.t === "q") q = a.q;
    else if (a.t === "cat") cats[a.c] = a.on;
    else if (a.t === "sort") { key = a.key; dir = a.dir; }
    else if (a.t === "sel") setSel(a.i, a.on);
    else if (a.t === "all") for (const r of view) setSel(r.i, true);
    else for (let i = 0; i < sel.length; i++) setSel(i, false);
  }
</script>

<div>
  <p class="gsum">{summary(view.length, count, total)}</p>
  <table class="bt"><tbody>
    {#each view as r (r.id)}
      <tr class={sel[r.i] ? SEL : ""}><td class="id">{r.id}</td><td class="nm">{r.name}</td><td class="cat">{CATS[r.cat]}</td><td class="px">{fmtPrice(r.price)}</td><td class="st">{r.stock}</td></tr>
    {/each}
  </tbody></table>
</div>
