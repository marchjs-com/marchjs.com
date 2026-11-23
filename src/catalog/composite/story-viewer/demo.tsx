// Showcase stage for StoryViewer: a story tray (StoryRing); a ring opens the viewer at that person, seen rings turn grey.
// The viewer reads the Playground values each time it opens: "Hikâyeleri baştan aç" shows a new choice.
import { computed, effect, untrack } from "march";
import { StoryViewer, type StoryGroup } from "march/components/composite/story-viewer";
import { StoryRing } from "march/components/social/story-ring";
import { PHOTO, USERS, minutesAgo } from "../../social/demo-data.ts";

export const code = `<StoryViewer open={$open} onClose={() => $open = false} groups={stories} start={$who}
  onSeen={(g, s) => seen.add(s.id)} onReply={(g, s, text) => send(g, text)} onLike={(g, s, on) => like(s, on)} />
<StoryViewer open={$open} onClose={close} groups={stories} arrows={false} pauseButton={false} time={false}
  labels={{ replyPlaceholder: (g) => g.name + " için bir şey yaz…", sent: "İletildi ✓" }} />`

const SCENES = ["dawn", "confetti", "sunset", "forest", "sea", "city", "coffee", "ride"]
const CAPTIONS = ["Sabah koşusu başladı!", "Kutlama zamanı 🎉", "Günün son ışıkları", "Orman yolu bugün çok sakin", "", "Gece turu", "", "Yeni rota"]
const GROUPS: StoryGroup[] = USERS.slice(0, 5).map((u, g) => ({
  id: u.id, name: u.name,
  items: Array.from({ length: 2 + (g % 3) }, (_, i) => { const k = (g * 3 + i) % SCENES.length; return { id: `${u.id}-${i}`, src: PHOTO(SCENES[k]!), alt: CAPTIONS[k] || "Hikâye", caption: CAPTIONS[k] || undefined, time: minutesAgo(20 + g * 55 + i * 9) } }),
}))

export default function StoryViewerDemo(props: { values: { open: boolean; people: number; duration: number; reply: boolean; like: boolean; start: string; progress: boolean; header: boolean; buttons: boolean; arrows: boolean; ownLabels: boolean } }) {
  let $open = false
  let $who = props.values.start
  let $seen = new Set<string>()
  let $liked = new Set<string>()
  let $log = ""
  // "Açık" opens or closes the viewer when it changes (the card does not open it by itself on load)
  const openOf = computed(() => props.values.open)
  let ready = false
  effect(() => { const on = openOf(); if (ready) untrack(() => { if (on) $who = props.values.start; $open = on }); ready = true })
  const groups = (): StoryGroup[] => GROUPS.slice(0, props.values.people)
  const allSeen = (g: StoryGroup) => g.items.every((s) => $seen.has(s.id))
  return <div class="sc-social-stories">
    <div class="sc-social-tray" role="list" aria-label="Hikâyeler">
      {() => groups().map((g) => <div role="listitem"><StoryRing name={g.name} label={USERS.find((u) => u.id === g.id)?.handle} state={() => (allSeen(g) ? "seen" : "new")} onClick={() => { $who = g.id; $open = true }} /></div>)}
    </div>
    <button type="button" class="sc-social-link" data-audit-try onClick={() => { $who = props.values.start; $open = true }}>Hikâyeleri baştan aç</button>
    <p class="sc-strip-label">{() => `Açılınca ${props.values.start === "u3" ? "üçüncü" : "ilk"} kişiden başlar; her hikâye ${props.values.duration / 1000} sn sürer.${props.values.reply && props.values.ownLabels ? " Yanıt alanı “… için bir şey yaz…” der, gönderince “İletildi ✓” yazar." : ""}`}</p>
    <p class="sc-strip-label" aria-live="polite">{() => $log}</p>
    {() => <StoryViewer open={() => $open} onClose={() => { $open = false }} groups={groups()} start={() => $who} duration={props.values.duration}
      progress={props.values.progress} avatar={props.values.header} time={props.values.header} pauseButton={props.values.buttons} closeButton={props.values.buttons} arrows={props.values.arrows}
      labels={props.values.ownLabels ? { replyPlaceholder: (g) => `${g.name} için bir şey yaz…`, sent: "İletildi ✓" } : undefined}
      onSeen={(_, s) => { if (!$seen.has(s.id)) $seen = new Set([...$seen, s.id]) }}
      liked={(_, s) => $liked.has(s.id)}
      onLike={props.values.like ? (_, s, on) => { const n = new Set($liked); on ? n.add(s.id) : n.delete(s.id); $liked = n } : undefined}
      onReply={props.values.reply ? (g, _, text) => { $log = `${g.name} kişisine yanıt: “${text}”` } : undefined} />}
  </div>
}
