// Lazy part of the environment managers page: the Sync manager over its own Net with a mock server. No UI here, so
// the part downloads only net, the mock and the manager; the page draws the controls once it has arrived.
import { signal } from "hadi-march";
import { createNet } from "hadi-march/net";
import { reply } from "hadi-march/net/mock";
import { sync, configureSync } from "hadi-march/managers/sync";

/** What the mock server answers to POST /demo/notes. */
export type Answer = "ok" | "busy" | "reject";

export function startSyncDemo() {
  const n = createNet();
  const answer = signal<Answer>("ok");
  const received = signal<string[]>([]);
  const mock = n.mock({ "POST /demo/notes": (r: { body: { text: string } }) => {
    if (answer.peek() === "busy") return reply(503, { message: "Sunucu meşgul" });
    if (answer.peek() === "reject") return reply(422, { message: "Geçersiz not" });
    received.update((l) => [r.body.text, ...l].slice(0, 6));
    return { saved: true };
  } }, { delay: 400 });
  configureSync({ net: n, storageKey: "sc.sync.demo", retry: { delay: 1000, factor: 2, max: 8000, count: 5 } });
  return {
    sync,
    answer,
    received,
    online: n.online,
    setOnline: (v: boolean) => n.setOnline(v),
    setDelay: (ms: number) => mock.set({ delay: ms }),
    stop: () => configureSync({ net: null, storageKey: "m.sync" }),
  };
}
export type SyncDemoApi = ReturnType<typeof startSyncDemo>;
