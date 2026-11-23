// Home page sections (a lazy part): social pieces as they are in an app (a post that can be liked, opened, shared),
// and an honest comparison: where MarchJS stands and where it does not.
import "./more.css";
import { PostCard, type Post } from "march/composite";
import { HonestCompare, Reveal } from "march/landing";
import { HOME_STATS as S } from "../../home-stats.gen.ts";
import { Head } from "../head.tsx";

// ── social ──────────────────────────────────────────────────────────────────────────────────────────────────────

const POSTS: readonly Post[] = [
  { id: "p1", author: { name: "Öykü", handle: "oyku", verified: true }, time: Date.now() - 1000 * 60 * 7, place: "İstanbul",
    text: "MarchJS ile bir hafta sonunda tüm panoyu yeniden yazdım. Açılış neredeyse anında, kod yarı yarıya kısaldı 🧡", likes: 128, comments: 14, shares: 6 },
  { id: "p2", author: { name: "Rüzgar", handle: "ruzgar" }, time: Date.now() - 1000 * 60 * 52,
    text: "Playground'da bileşeni yazdım, son derlemeyi zip olarak indirdim, CDN'den yükledim. Kurulum bile yapmadım.", likes: 86, comments: 9, shares: 3 },
]

function Social() {
  let $posts = [...POSTS]
  const like = (next: boolean, post: Post): void => {
    $posts = $posts.map((p) => (p.id === post.id ? { ...p, liked: next, likes: p.likes + (next ? 1 : -1) } : p))
  }
  return <section class="sc-sec" aria-labelledby="sc-social-h">
    <Head id="sc-social-h" kicker="Sosyal" color="brand-purple" title="Sosyal uygulama bileşenleri hazır" example="Bir sosyal uygulamanın parçaları hazır"
      lead="Gönderi kartı, beğeni patlaması, sohbet balonları, hikâye halkası, takip düğmesi: hepsi bir uygulamada nasılsa öyle, dokunmatikte de." />
    <Reveal class="sc-social" effect="up" stagger={120}>
      {/* the cards are made once (from the fixed list); only their post changes, so the like burst plays on the card you see */}
      {POSTS.map((p) => <PostCard post={() => $posts.find((x) => x.id === p.id) ?? p} onLike={like} />)}
    </Reveal>
  </section>
}

// ── an honest comparison ────────────────────────────────────────────────────────────────────────────────────────

const COLUMNS = [{ id: "us", name: "MarchJS" }, { id: "vdom", name: "Sanal DOM'lu çatılar" }, { id: "kits", name: "Bileşen paketleri" }]
const ROWS = [
  { label: "Yalnız değişen düğüm güncellenir", values: { us: true, vdom: false, kits: "partial" } },
  { label: "Çalışma zamanında bağımlılık yok", values: { us: true, vdom: false, kits: false } },
  { label: `${S.components} bileşen tek pakette`, values: { us: true, vdom: false, kits: "partial" } },
  { label: "Tarayıcıda IDE ve dışa aktarma", values: { us: true, vdom: false, kits: false } },
  { label: "Katı CSP, Trusted Types", values: { us: true, vdom: "partial", kits: "partial" } },
  { label: "Sağdan sola diller, çeviri", values: { us: true, vdom: "partial", kits: "partial" } },
  // counted honestly: where MarchJS is behind is a "no" for it (the summary says so too)
  { label: "Geniş topluluk ve hazır eklentiler", values: { us: false, vdom: true, kits: true }, note: "Burada gerideyiz: MarchJS yeni, topluluğu büyüyor." },
]

function Compare() {
  return <section class="sc-sec" aria-labelledby="sc-cmp-h">
    <Head id="sc-cmp-h" kicker="Dürüst karşılaştırma" color="brand-orange" title="Başka kütüphanelerle dürüst bir karşılaştırma" example="Nerede öndeyiz, nerede değiliz"
      lead="Yalnız iyi yanları değil, geride kaldığımız yeri de yazıyoruz. Seç, karar ver." />
    <Reveal class="sc-cmp sc-card" effect="up">
      <HonestCompare columns={COLUMNS} rows={ROWS} caption="MarchJS karşılaştırması" />
    </Reveal>
  </section>
}

export default function MorePeople() {
  return <>
    <Social />
    <Compare />
  </>
}
