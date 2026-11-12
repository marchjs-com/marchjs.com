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
