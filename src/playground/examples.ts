// The examples repository (github.com/marchjs-com/examples) pinned to a commit, served by jsDelivr: every MarchIDE
// page's files and its ide.json come from there. A commit's files never change, so jsDelivr and the browser keep them
// (immutable, a year); a new example reaches the site by moving this sha, which the examples-pin workflow does by itself within minutes of a merge into examples main (a pull request, ci, merge). connect-src in the CSP (build.mjs) allows
// https://cdn.jsdelivr.net. Small on purpose: shell-late loads it on every page to start the ide.json download early.

export const EXAMPLES = "https://cdn.jsdelivr.net/gh/marchjs-com/examples@46cf02e502b622dce124a743d3e6abbba10c1bae/";
/** A source's URL: examples:// becomes EXAMPLES; anything else is fetched as written. */
export const sourceUrl = (src: string): string => (src.startsWith("examples://") ? EXAMPLES + src.slice("examples://".length) : src);

let bundle: Promise<Readonly<Record<string, unknown>>> | null = null;
/**
 * Every page's ide.json in one file (the repository's root ide.json, keyed by "components/<page>"), read once a visit.
 * The site asks for it when idle on any page, so a MarchIDE page opened later finds it ready. A failed read is not
 * kept: the next call tries again.
 */
export function ideBundle(): Promise<Readonly<Record<string, unknown>>> {
  return (bundle ??= fetch(`${EXAMPLES}ide.json`)
    .then((r) => (r.ok ? (r.json() as Promise<Record<string, unknown>>) : Promise.reject(new Error(`ide.json: ${r.status}`))))
    .catch(() => { bundle = null; return {}; }));
}
