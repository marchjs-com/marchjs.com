// API examples of march/audio, the one audio source behind the meters and audio views (their own examples: data.tsx
// for Gauge, Odometer, LevelMeter). Layout and rules: tools/api-examples.js. Each `run` is a small live demo of its `code`.
import { signal, onCleanup } from "march";
import { LevelMeter } from "march/data";
import { audioContext, audioSource, isAudioSource, mediaChain, toAudioSource } from "march/audio";
import { Button, Slider, Spectrum } from "march/ui";
import { examples } from "./types.ts";
import { Out, Row } from "./_kit.tsx";
export { default as SIG } from "./meters.sig.gen.ts";

export default examples({
  "march/audio": {
    audioSource: {
      code: `const demo = audioSource("demo")   // a synthesized loop: no file, no permission
await demo.start()                 // from a click
<Spectrum source={demo} />
demo.level() · demo.bands().bass · demo.channels()`,
      run: () => {
        const demo = audioSource("demo", { audible: true })
        onCleanup(() => demo.stop())
        return <div>
          <Row>
            <Button onClick={() => void (demo.active() ? demo.stop() : demo.start())}>{() => (demo.active() ? "Durdur" : "▶ Demo müziği")}</Button>
            <Out label="level" value={() => demo.level().toFixed(2)} />
            <Out label="bass" value={() => demo.bands().bass.toFixed(2)} />
          </Row>
          <Spectrum source={demo} height={80} />
        </div>
      },
    },
    toAudioSource: {
      code: `const src = toAudioSource(props.source)   // a source stays; "demo", an element, a number… becomes one
src.use(root)
src.onUpdate(() => draw(src.level()))`,
      run: () => {
        const n = signal(0.4)
        const src = toAudioSource(() => n())
        return <Row><Slider value={n} onChange={(x: number) => n.set(x)} min={0} max={1} step={0.01} aria-label="Ses" /><LevelMeter source={src} label="Ses" /></Row>
      },
    },
    isAudioSource: {
      code: `isAudioSource(audioSource("demo"))   // true
isAudioSource("demo")                  // false`,
      run: () => <Row><Out label="audioSource(…)" value={String(isAudioSource(audioSource(() => 0)))} /><Out label={`"demo"`} value={String(isAudioSource("demo"))} /></Row>,
    },
    audioContext: {
      code: `const ctx = audioContext()   // the one shared AudioContext, or null without Web Audio`,
      run: () => <Out label="audioContext()" value={() => { const c = audioContext(); return c ? `${c.sampleRate} Hz, ${c.state}` : "null" }} />,
    },
    mediaChain: {
      code: `const chain = mediaChain(video)!          // input → output → speakers
const eq = audioContext()!.createBiquadFilter()
chain.input.disconnect(chain.output)
chain.input.connect(eq).connect(chain.output)   // meters read output: they show the EQ'd sound`,
      run: () => <Out label="mediaChain" value="bir <audio> / <video> öğesinin ses yolu: { input, output }" />,
    },
  },
});
