// State at the top, Angular: the unit and the focus are signals at the top, passed down through Panel > Group > Item
// (OnPush components). Each item reads the unit only if it is measured, and its focus through a computed() that
// changes only for the item gaining or losing it (a selector made of signals), so a focus step refreshes two item
// views and a unit step the 200 measured ones. Compiled ahead of time with the benchmark app (tools/gen-bench.mjs →
// ../../apps/angular.gen.js).
import { ChangeDetectionStrategy, Component, Input, computed, signal, type OnInit, type Signal } from "@angular/core"
import { mountRoot } from "../angular-host.ts"
import { FIRST_UNIT, NO_FOCUS, itemText, itemClass, type Deep, type Step, type Item, type Group, type Panel } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

@Component({
  selector: "div[dpItem]", changeDetection: ChangeDetectionStrategy.OnPush, host: { "[class]": "cls()" },
  template: `<span class="k">{{ it.label }}</span><b class="v">{{ text() }}</b>`,
})
class ItemView implements OnInit {
  @Input({ required: true }) it!: Item
  @Input({ required: true }) unit!: Signal<string>
  @Input({ required: true }) focus!: Signal<number>
  cls!: Signal<string>
  text!: Signal<string>
  ngOnInit(): void {
    const it = this.it, on = computed(() => this.focus() === it.id)
    this.cls = computed(() => itemClass(on()))
    this.text = it.v === null ? signal(itemText(it, "")) : computed(() => itemText(it, this.unit()))
  }
}

@Component({
  selector: "div[dpGroup]", host: { class: "grp" }, changeDetection: ChangeDetectionStrategy.OnPush, imports: [ItemView],
  template: `<h4>{{ g.title }}</h4>@for (it of g.items; track it.id) {<div dpItem [it]="it" [unit]="unit" [focus]="focus"></div>}`,
})
class GroupView { @Input({ required: true }) g!: Group; @Input({ required: true }) unit!: Signal<string>; @Input({ required: true }) focus!: Signal<number> }

@Component({
  selector: "section[dpPanel]", host: { class: "pnl" }, changeDetection: ChangeDetectionStrategy.OnPush, imports: [GroupView],
  template: `<h3>{{ p.title }}</h3><p class="note">{{ p.note }}</p><div class="grps">@for (g of p.groups; track g.id) {<div dpGroup [g]="g" [unit]="unit" [focus]="focus"></div>}</div>`,
})
class PanelView { @Input({ required: true }) p!: Panel; @Input({ required: true }) unit!: Signal<string>; @Input({ required: true }) focus!: Signal<number> }

@Component({
  selector: "bench-deep", changeDetection: ChangeDetectionStrategy.OnPush, imports: [PanelView],
  template: `<div class="deep">@for (p of panels; track p.id) {<section dpPanel [p]="p" [unit]="unit" [focus]="focus"></section>}</div>`,
})
class DeepView { @Input({ required: true }) panels!: Panel[]; readonly unit = signal(FIRST_UNIT); readonly focus = signal(NO_FOCUS) }

export async function mount(host: HTMLElement, data: Deep): Promise<ScenarioApp> {
  const app = await mountRoot(DeepView, host, "bench-deep", { panels: data.panels })
  const { unit, focus } = app.instance
  return { step: (s) => app.now(() => { const x = s as Step; if ("unit" in x) unit.set(x.unit); else focus.set(x.focus) }), destroy: app.destroy }
}
