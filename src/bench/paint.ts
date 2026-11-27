// Time to the next paint, for the benchmark (not an animation, so not the motion engine: global speed or "stop all"
// must not change a measurement). A requestAnimationFrame callback runs just before the browser paints; a message
// posted from it is handled right after that paint.
export function afterPaint(): Promise<number> {
  return new Promise((done) => {
    requestAnimationFrame(() => {
      const ch = new MessageChannel()
      ch.port1.onmessage = () => { ch.port1.close(); done(performance.now()) }
      ch.port2.postMessage(0)
    })
  })
}

/** Like afterPaint, and also when the frame began (its requestAnimationFrame callback): from then to the end of the
 * paint the main thread was drawing the frame (style, layout, paint). */
export function afterPaintFrom(): Promise<{ frame: number; done: number }> {
  return new Promise((done) => {
    requestAnimationFrame(() => {
      const frame = performance.now()
      const ch = new MessageChannel()
      ch.port1.onmessage = () => { ch.port1.close(); done({ frame, done: performance.now() }) }
      ch.port2.postMessage(0)
    })
  })
}
/** The end of the current task and its microtasks (a library that renders in a microtask has drawn by then). */
export function afterTask(): Promise<number> {
  return new Promise((done) => { const ch = new MessageChannel(); ch.port1.onmessage = () => { ch.port1.close(); done(performance.now()) }; ch.port2.postMessage(0) })
}
