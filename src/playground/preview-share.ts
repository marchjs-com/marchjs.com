// The preview frame's first script (playground/preview.html runs it before preview.js, so before March): what MarchIDE's
// preview toolbar sets on the page reaches the code in the frame.
// - The network speed: March's throttle keeps its state on globalThis (Symbol.for("march.netThrottle"), engine.ts). The
//   frame's state is the page's (its speed, its requests, its listeners: the toolbar's panel lists the frame's requests
//   too); only the wrapper of fetch / XMLHttpRequest is the frame's own (preview-frame.ts installs it), and its scope is
//   none: every call in the frame is the preview's.
// - The device (DevicePreview's sensors): navigator.onLine, getBattery, document.visibilityState / hidden, orientation,
//   devicePixelRatio and screen.orientation are read from the page, where the sensors answer the preview's calls (the
//   page's previewScope is true while the frame reads them), and the device's events (online, offline, visibilitychange,
//   deviceorientation, devicemotion…) fire in the frame too.
type Box = Record<PropertyKey, unknown>
const page = (() => { try { return globalThis.parent !== globalThis ? (globalThis.parent as unknown as typeof globalThis) : null } catch { return null } })()
if (page) {
  const KEY = Symbol.for("march.netThrottle")
  const top = page as unknown as Box
  // the page's state (made here when the page has not loaded the throttle yet: its engine takes the same object)
  const shared = (top[KEY] ??= { profile: {}, scope: null, bypass: 0, seq: 0, requests: [], listeners: new Set(), installs: 0, restore: null, raw: null }) as Box
  const own: Box = { scope: null, installs: 0, restore: null, raw: null }
  ;(globalThis as unknown as Box)[KEY] = new Proxy(own, {
    get: (_t, k) => (k in own ? own[k] : shared[k]),
    set: (_t, k, v) => { if (k in own) own[k] = v; else shared[k] = v; return true },
  })

  // a value read from the page while the page knows the call is the preview's
  const asPreview = <T>(read: () => T): T => {
    top["__marchPreviewCall"] = ((top["__marchPreviewCall"] as number | undefined) ?? 0) + 1
    try { return read() } finally { top["__marchPreviewCall"] = (top["__marchPreviewCall"] as number) - 1 }
  }
  const pass = (obj: object | null | undefined, from: () => object | null | undefined, key: string, bind = false): void => {
    if (!obj) return
    try {
      Object.defineProperty(obj, key, { configurable: true, enumerable: true, get: () => asPreview(() => {
        const src = from() as Box | null | undefined, v = src?.[key]
        return bind && typeof v === "function" ? (v as (...a: unknown[]) => unknown).bind(src) : v
      }) })
    } catch { /* not configurable here */ }
  }
  pass(navigator, () => page.navigator, "onLine")
  pass(navigator, () => page.navigator, "getBattery", true)
  pass(document, () => page.document, "visibilityState")
  pass(document, () => page.document, "hidden")
  pass(globalThis, () => page, "orientation")
  pass(globalThis, () => page, "devicePixelRatio")
  pass(screen.orientation, () => page.screen?.orientation, "type")
  pass(screen.orientation, () => page.screen?.orientation, "angle")

  // the device's events, played on the page by its sensors: the same events in the frame (copies: an event belongs to
  // one dispatch), the frame's own constructors where it has them
  const copy = (e: Event): Event => {
    const x = e as Event & Box, init = { bubbles: e.bubbles, cancelable: e.cancelable }
    if (e.type === "deviceorientation" && typeof DeviceOrientationEvent === "function") return new DeviceOrientationEvent(e.type, { ...init, alpha: x["alpha"] as number, beta: x["beta"] as number, gamma: x["gamma"] as number, absolute: !!x["absolute"] })
    if (e.type === "devicemotion" && typeof DeviceMotionEvent === "function") return new DeviceMotionEvent(e.type, { ...init, acceleration: x["acceleration"] as DeviceMotionEventAccelerationInit, accelerationIncludingGravity: x["accelerationIncludingGravity"] as DeviceMotionEventAccelerationInit, rotationRate: x["rotationRate"] as DeviceMotionEventRotationRateInit, interval: x["interval"] as number })
    return new Event(e.type, init)
  }
  const offs: (() => void)[] = []
  const relay = (from: EventTarget | null | undefined, to: EventTarget | null | undefined, types: string[]): void => {
    if (!from || !to) return
    for (const type of types) {
      const fn = (e: Event): void => { to.dispatchEvent(copy(e)) }
      from.addEventListener(type, fn)
      offs.push(() => from.removeEventListener(type, fn))
    }
  }
  relay(page, globalThis, ["online", "offline", "orientationchange", "deviceorientation", "devicemotion"])
  relay(page.document, document, ["visibilitychange"])
  relay(page.screen?.orientation, screen.orientation, ["change"])
  // the frame goes (its panel closed, the frame loaded again): the page no longer calls into it
  globalThis.addEventListener("pagehide", (e) => { if (e.isTrusted) for (const off of offs.splice(0)) off() })
}
export {}
