// The topics of /social (one page each, /social/<slug>): titles, one-line descriptions, groups. The section page loads
// only this file; src/topics.ts gathers every section for the menu, MarchIDE and the start-up titles.
import type { Topic } from "./types.ts";

export const TOPICS: readonly Topic[] = [
  { slug: "post-card", title: "Gönderi kartı", name: "PostCard", desc: "Fotoğraflara çift dokunun: büyük kalp belirir ve dört HADİ rengiyle patlar.", group: "Karmaşık bileşenler" },
  { slug: "feed", title: "Akış", name: "Feed", desc: "Sanal liste içinde gönderiler: yalnız ekrana yakın olanlar DOM'da.", group: "Karmaşık bileşenler" },
  { slug: "chat-thread", title: "Sohbet akışı", name: "ChatThread", desc: "Bir mesaj gönderin: balon yaylanarak yükselir, karşı taraf yazmaya başlar ve yanıtlar.", group: "Karmaşık bileşenler" },
  { slug: "chat-composer", title: "Mesaj yazma alanı", name: "ChatComposer", desc: "Boşken mikrofon (turuncu), yazınca gönder (mavi) düğmesine dönüşür.", group: "Karmaşık bileşenler" },
  { slug: "chat-bubble", title: "Mesaj balonu", name: "ChatBubble", desc: "Benim balonum Aktivite mavisi, karşı taraf kart rengi; aynı göndericinin ardışık mesajlarında yalnız…", group: "Sosyal" },
  { slug: "reply-quote", title: "Yanıt alıntısı", name: "ReplyQuote", desc: "Yanıtlanan mesaj: ad ve kısaltılmış metin renkli çubuğun arkasında; balonda alıntı, yazma alanında vazgeç düğmeli önizleme.", group: "Sosyal" },
  { slug: "typing-indicator", title: "Yazıyor göstergesi", name: "TypingIndicator", desc: "Üç nokta sırayla yükselir; kim yazıyorsa ekran okuyucuya bir kez söylenir.", group: "Sosyal" },
  { slug: "reaction-picker", title: "Tepki seçici", name: "ReactionPicker", desc: "Açılırken yaylanır, emojiler sırayla gelir; seçili olan yumuşak mavi dairede.", group: "Sosyal" },
  { slug: "story-viewer", title: "Hikâye görüntüleyici", name: "StoryViewer", desc: "Bir halkaya dokunun.", group: "Karmaşık bileşenler" },
  { slug: "story-ring", title: "Hikâye halkası", name: "StoryRing", desc: "Yeni hikâyede dört HADİ rengi, görülünce sakin çizgi, yakın arkadaşta yeşil.", group: "Sosyal" },
  { slug: "story-progress", title: "Hikâye ilerlemesi", name: "StoryProgress", desc: "Geçmişler dolu, sıradaki boş, şimdiki hareket motoruyla dolar.", group: "Sosyal" },
  { slug: "like-button", title: "Beğen düğmesi", name: "LikeButton", desc: "Kalp yayla zıplar, halka büyür, parçacıklar HADİ renkleriyle saçılır.", group: "Sosyal" },
  { slug: "media-grid", title: "Medya ızgarası", name: "MediaGrid", desc: "1, 2, 3, 4 ve daha fazla fotoğraf için ayrı yerleşim; fazlası son karede +N.", group: "Sosyal" },
  { slug: "count-roll", title: "Dönen sayı", name: "CountRoll", desc: "Yalnız değişen basamak döner: artınca yukarı, azalınca aşağı.", group: "Sosyal" },
  { slug: "virtual-list", title: "Sanal liste", name: "VirtualList", desc: "100.000 satır, her biri kendi yüksekliğinde: yalnız görünen pencere DOM'da.", group: "Veri gösterimi" },
  { slug: "profile-header", title: "Profil başlığı", name: "ProfileHeader", desc: "Kapak, hikâye halkalı avatar, ad ve biyografi, sayaçlı istatistikler.", group: "Karmaşık bileşenler" },
  { slug: "verified-mark", title: "Doğrulanmış rozeti", name: "VerifiedMark", desc: "Adın yanındaki onay rozeti: ekran okuyucu adını okur; ikonu, rengi ve boyutu değişir.", group: "Sosyal" },
  { slug: "follow-button", title: "Takip düğmesi", name: "FollowButton",desc: "Takip et → Takip ediliyor: genişlik yaylanır, dolgu çerçeveye döner, + tike çevrilir, dört renk parlar.", group: "Sosyal" },
  { slug: "avatar", title: "Avatar", name: "Avatar", desc: "Resim yoksa ya da yüklenemezse baş harfler; renk addan gelir. Hazır metin, ikon, sabit renk ve biçim.", group: "Sosyal" },
  { slug: "avatar-group", title: "Avatar grubu", name: "AvatarGroup", desc: "Üst üste binen avatarlar; sığmayanlar +N balonunda.", group: "Sosyal" },
];
