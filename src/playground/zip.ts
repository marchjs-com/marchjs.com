// A zip of text files, written in the page (no library): each file stored as it is (no compression: a build is small
// and the zip opens everywhere), with its CRC-32 and a UTF-8 name; the folders come from the paths ("assets/app.js").
const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
const crc32 = (b: Uint8Array): number => {
  let c = 0xffffffff;
  for (const x of b) c = (CRC[(c ^ x) & 0xff] as number) ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

/** The zip of `files` (path → text) as a Blob. */
export function zip(files: Record<string, string>, when = new Date()): Blob {
  const enc = new TextEncoder(), parts: Uint8Array[] = [], dir: Uint8Array[] = [];
  // the time and date in DOS form
  const time = (when.getHours() << 11) | (when.getMinutes() << 5) | (when.getSeconds() >> 1);
  const date = ((when.getFullYear() - 1980) << 9) | ((when.getMonth() + 1) << 5) | when.getDate();
  let offset = 0;
  for (const [path, text] of Object.entries(files)) {
    const name = enc.encode(path), data = enc.encode(text), crc = crc32(data);
    const head = new DataView(new ArrayBuffer(30));
    head.setUint32(0, 0x04034b50, true); head.setUint16(4, 20, true); head.setUint16(6, 0x0800, true); // UTF-8 names
    head.setUint16(10, time, true); head.setUint16(12, date, true);
    head.setUint32(14, crc, true); head.setUint32(18, data.length, true); head.setUint32(22, data.length, true);
    head.setUint16(26, name.length, true);
    const entry = new DataView(new ArrayBuffer(46));
    entry.setUint32(0, 0x02014b50, true); entry.setUint16(4, 20, true); entry.setUint16(6, 20, true); entry.setUint16(8, 0x0800, true);
    entry.setUint16(12, time, true); entry.setUint16(14, date, true);
    entry.setUint32(16, crc, true); entry.setUint32(20, data.length, true); entry.setUint32(24, data.length, true);
    entry.setUint16(28, name.length, true); entry.setUint32(42, offset, true);
    parts.push(new Uint8Array(head.buffer), name, data);
    dir.push(new Uint8Array(entry.buffer), name);
    offset += 30 + name.length + data.length;
  }
  const size = dir.reduce((n, b) => n + b.length, 0), count = Object.keys(files).length;
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, count, true); end.setUint16(10, count, true);
  end.setUint32(12, size, true); end.setUint32(16, offset, true);
  return new Blob([...parts, ...dir, new Uint8Array(end.buffer)] as BlobPart[], { type: "application/zip" });
}
