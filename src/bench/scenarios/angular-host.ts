// Angular scenarios: one application (zoneless) for all of them; each scenario's root component is created on it.
// Steps run change detection at once (ApplicationRef.tick), as the benchmark app does.
import { createComponent, provideZonelessChangeDetection, type ApplicationRef, type Type } from "@angular/core"
import { createApplication } from "@angular/platform-browser"

let app: Promise<ApplicationRef> | null = null
/** The shared application (created on first use). */
export const application = (): Promise<ApplicationRef> => (app ??= createApplication({ providers: [provideZonelessChangeDetection()] }))

/** Creates `type` on <tag> in `host` with its inputs and renders it, synchronously. */
export function createRoot<C>(appRef: ApplicationRef, type: Type<C>, host: HTMLElement, tag: string, inputs: Record<string, unknown>) {
  const el = document.createElement(tag)
  host.append(el)
  const ref = createComponent(type, { environmentInjector: appRef.injector, hostElement: el })
  for (const k in inputs) ref.setInput(k, inputs[k])
  appRef.attachView(ref.hostView)
  appRef.tick()
  return {
    instance: ref.instance,
    el,
    /** applies a change and renders it now */
    now: (fn: () => void) => { fn(); appRef.tick() },
    destroy: () => { appRef.detachView(ref.hostView); ref.destroy(); el.remove() },
  }
}

export async function mountRoot<C>(type: Type<C>, host: HTMLElement, tag: string, inputs: Record<string, unknown>) {
  return createRoot(await application(), type, host, tag, inputs)
}
