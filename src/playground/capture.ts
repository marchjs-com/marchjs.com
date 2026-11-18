// MarchIDE's preview capture: a picture (PNG) or a recording (WebM) of the preview panel, made with the browser's own
// tab capture (the browser asks first, every time) and cut to the preview's box (Region Capture where the browser has
// it, else the box's place in the frame). Nothing is uploaded: the file is saved on the user's computer.

type CropTargetCtor = { fromElement(el: Element): Promise<unknown> };
type CroppableTrack = MediaStreamTrack & { cropTo?: (t: unknown) => Promise<void> };

/** The current tab as a video stream, cut to `el` when the browser can (Region Capture); null when refused. */
async function tabStream(el: Element): Promise<{ stream: MediaStream; cropped: boolean } | null> {
  const md = navigator.mediaDevices as MediaDevices & { getDisplayMedia?: (o: object) => Promise<MediaStream> };
  if (!md?.getDisplayMedia) return null;
  let stream: MediaStream;
  try { stream = await md.getDisplayMedia({ video: { displaySurface: "browser" }, audio: false, preferCurrentTab: true, selfBrowserSurface: "include" } as object); }
  catch { return null; }
  const track = stream.getVideoTracks()[0] as CroppableTrack | undefined;
  const CT = (globalThis as { CropTarget?: CropTargetCtor }).CropTarget;
  if (track?.cropTo && CT) { try { await track.cropTo(await CT.fromElement(el)); return { stream, cropped: true }; } catch { /* the whole tab, cut below */ } }
  return { stream, cropped: false };
}
/** A video frame drawn on a canvas, cut to `el`'s box when the stream is the whole tab. */
async function frameOf(stream: MediaStream, el: Element, cropped: boolean): Promise<HTMLCanvasElement> {
  const v = document.createElement("video");
  v.muted = true; v.srcObject = stream;
  await v.play();
  await new Promise((r) => setTimeout(r, 120)); // the first frames can be blank
  const c = document.createElement("canvas"), r = el.getBoundingClientRect();
  if (cropped) { c.width = v.videoWidth; c.height = v.videoHeight; c.getContext("2d")!.drawImage(v, 0, 0); }
  else {
    const sx = v.videoWidth / globalThis.innerWidth, sy = v.videoHeight / globalThis.innerHeight;
    c.width = Math.round(r.width * sx); c.height = Math.round(r.height * sy);
    c.getContext("2d")!.drawImage(v, r.left * sx, r.top * sy, r.width * sx, r.height * sy, 0, 0, c.width, c.height);
  }
  v.pause(); v.srcObject = null;
  return c;
}
/** Saves a file the page made (a picture, a recording). */
function save(blob: Blob, name: string): void {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
const stamp = (): string => new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

/** A PNG of `el` (the preview), saved as `<name>-<time>.png`; false when the browser refused. */
export async function capturePicture(el: Element, name = "onizleme"): Promise<boolean> {
  const s = await tabStream(el);
  if (!s) return false;
  try {
    const c = await frameOf(s.stream, el, s.cropped);
    const blob = await new Promise<Blob | null>((res) => c.toBlob(res, "image/png"));
    if (blob) save(blob, `${name}-${stamp()}.png`);
    return !!blob;
  } finally { for (const t of s.stream.getTracks()) t.stop(); }
}

/**
 * Starts recording `el` (the preview); the returned stop() ends it and saves `<name>-<time>.webm`. Null when the
 * browser refused or cannot record. Ends by itself when the user stops sharing.
 */
export async function startRecording(el: Element, name = "onizleme", onEnd?: () => void): Promise<{ stop(): void } | null> {
  if (typeof MediaRecorder === "undefined") return null;
  const s = await tabStream(el);
  if (!s) return null;
  let out: MediaStream = s.stream, timer: ReturnType<typeof setTimeout> | undefined, drawing = true;
  // the whole tab: each frame cut to the preview's box on a canvas, the canvas recorded
  if (!s.cropped) {
    const v = document.createElement("video");
    v.muted = true; v.srcObject = s.stream; await v.play();
    const c = document.createElement("canvas"), g = c.getContext("2d")!;
    const draw = (): void => {
      const r = el.getBoundingClientRect(), sx = v.videoWidth / globalThis.innerWidth, sy = v.videoHeight / globalThis.innerHeight;
      const w = Math.round(r.width * sx), h = Math.round(r.height * sy);
      if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
      g.drawImage(v, r.left * sx, r.top * sy, r.width * sx, r.height * sy, 0, 0, w, h);
    };
    // a frame every ~33 ms while it records (a chain of timeouts: no animation, a copy of the tab's frames)
    const loop = (): void => { if (!drawing) return; draw(); timer = setTimeout(loop, 33); };
    loop();
    out = (c as HTMLCanvasElement & { captureStream(fps?: number): MediaStream }).captureStream(30);
  }
  const type = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
  const rec = new MediaRecorder(out, type ? { mimeType: type } : undefined), parts: Blob[] = [];
  rec.ondataavailable = (e) => { if (e.data.size) parts.push(e.data); };
  let ended = false;
  const finish = (): void => {
    if (ended) return;
    ended = true;
    drawing = false; clearTimeout(timer);
    for (const t of s.stream.getTracks()) t.stop();
    onEnd?.();
  };
  rec.onstop = () => { save(new Blob(parts, { type: "video/webm" }), `${name}-${stamp()}.webm`); finish(); };
  s.stream.getVideoTracks()[0]?.addEventListener("ended", () => { if (rec.state !== "inactive") rec.stop(); });
  rec.start(500);
  return { stop: () => { if (rec.state !== "inactive") rec.stop(); else finish(); } };
}
