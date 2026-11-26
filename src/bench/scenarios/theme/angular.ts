// Theme change, Angular: the theme is a service provided at the top (Angular's dependency injection, its context) and
// holds the accent as a signal; each card component injects it and binds its badge's class, so a change refreshes
// only the 2.000 card views. Compiled ahead of time with the benchmark app (tools/gen-bench.mjs →
// ../../apps/angular.gen.js).
import { ChangeDetectionStrategy, Component, Injectable, Input, inject, signal } from "@angular/core"
import { mountRoot } from "../angular-host.ts"
import { FIRST, badgeClass, type Card } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

@Injectable()
class Theme { readonly accent = signal(FIRST) }

@Component({
  selector: "div[thCard]", host: { class: "card" }, changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<h3>{{ c.title }}</h3><p>{{ c.text }}</p><span [class]="badge(theme.accent())">#{{ c.id }}</span>`,
})
class CardView { @Input({ required: true }) c!: Card; readonly theme = inject(Theme); readonly badge = badgeClass }

@Component({
  selector: "bench-theme", changeDetection: ChangeDetectionStrategy.OnPush, imports: [CardView], providers: [Theme],
  template: `<div class="cards">@for (c of cards; track c.id) {<div thCard [c]="c"></div>}</div>`,
})
class Cards { @Input({ required: true }) cards!: Card[]; readonly theme = inject(Theme) }

export async function mount(host: HTMLElement, data: Card[]): Promise<ScenarioApp> {
  const app = await mountRoot(Cards, host, "bench-theme", { cards: data })
  return { step: (a) => app.now(() => app.instance.theme.accent.set(a as string)), destroy: app.destroy }
}
