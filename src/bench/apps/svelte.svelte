<!-- Benchmark app: Svelte 5 (runes). Compiled ahead of time by the Svelte compiler with fragments: "tree"
     (tools/gen-bench.mjs → svelte.gen.js): the DOM is built with createElement, no HTML strings (Trusted Types). -->
<script>
  let rows = $state([]);
  let selected = $state(0);
  export function run(r) { rows = r; selected = 0; }
  export function add(r) { rows.push(...r); }
  export function update() { for (let i = 0; i < rows.length; i += 10) rows[i].label += " !!!"; }
  export function swap() { if (rows.length > 998) { const t = rows[1]; rows[1] = rows[998]; rows[998] = t; } }
  export function clear() { rows = []; selected = 0; }
  function remove(id) { rows.splice(rows.findIndex((r) => r.id === id), 1); }
</script>

<table class="bt"><tbody>
  {#each rows as row (row.id)}
    <tr class={selected === row.id ? "danger" : ""}>
      <td class="c1">{row.id}</td>
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions, a11y_missing_attribute -->
      <td class="c4"><a class="lbl" onclick={() => (selected = row.id)}>{row.label}</a></td>
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions, a11y_missing_attribute -->
      <td class="c1"><a class="rm" onclick={() => remove(row.id)}>×</a></td>
      <td class="c6"></td>
    </tr>
  {/each}
</tbody></table>
