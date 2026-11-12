// Social: the social components (src/components/social and composite) in one page — a small social app built only
// from them, then one Playground per component (each card comes from the component folder: demo, options, code).
import "./social.css";
import { Hub } from "../hub.tsx";
import { ComponentDemo } from "../component-demo.tsx";

export default function SocialPage(props: { params?: { rest?: string } }) {
  const RENDER: Record<string, () => unknown> = {
    "post-card": () => <ComponentDemo folder="composite/post-card" title="PostCard: gönderi kartı" desc="Fotoğraflara çift dokunun: büyük kalp belirir ve dört HADİ rengiyle patlar. Beğeni, yorum ve paylaşım sayıları yuvarlanarak değişir; uzun metin üç satırda katlanır." />,
    "feed": () => <ComponentDemo folder="composite/feed" title="Feed: akış" desc="Sanal liste içinde gönderiler: yalnız ekrana yakın olanlar DOM'da. Aşağı çekip bırakınca yenilenir, sona gelince sonraki sayfa iskeletle gelir; yeni gönderiler üstte hap olarak bekler." />,
    "chat-thread": () => <ComponentDemo folder="composite/chat-thread" title="ChatThread: sohbet" desc="Bir mesaj gönderin: balon yaylanarak yükselir, karşı taraf yazmaya başlar ve yanıtlar. Gülen yüzle tepki, balonu yana sürükleyerek ya da Yanıtla ile yanıt; yukarı kaydırınca yeni mesajlar ↓ düğmesinde bekler." />,
    "chat-composer": () => <ComponentDemo folder="composite/chat-composer" title="ChatComposer: mesaj alanı" desc="Boşken mikrofon (turuncu), yazınca gönder (mavi) düğmesine dönüşür. + menüsü açılınca 45° döner, emoji paneli imlece ekler, kayıt sayaç ve canlı dalga gösterir; Esc kaydı atar." />,
    "chat-bubble": () => <ComponentDemo folder="social/chat-bubble" title="ChatBubble: mesaj balonu" desc="Benim balonum Aktivite mavisi, karşı taraf kart rengi; aynı göndericinin ardışık mesajlarında yalnız sonuncuda kuyruk. Okundu tikleri, yanıt alıntısı, tepki çipleri; yalnız emoji büyür." />,
    "typing-indicator": () => <ComponentDemo folder="social/typing-indicator" title="TypingIndicator: yazıyor" desc="Üç nokta sırayla yükselir; kim yazıyorsa ekran okuyucuya bir kez söylenir." />,
    "reaction-picker": () => <ComponentDemo folder="social/reaction-picker" title="ReactionPicker: tepki seçici" desc="Açılırken yaylanır, emojiler sırayla gelir; seçili olan yumuşak mavi dairede. Ok tuşlarıyla gezilir, ızgara düzeni emoji paneli olur." />,
    "story-viewer": () => <ComponentDemo folder="composite/story-viewer" title="StoryViewer: hikâyeler" desc="Bir halkaya dokunun. Sol üçte bir geri, kalanı ileri; basılı tutunca durur; yana kaydırınca sonraki kişi; aşağı sürükleyince küçülüp kapanır. Klavyede ← → ve Boşluk." />,
    "story-ring": () => <ComponentDemo folder="social/story-ring" title="StoryRing: hikâye halkası" desc="Yeni hikâyede dört HADİ rengi, görülünce sakin çizgi, yakın arkadaşta yeşil. Yüklenirken halka döner; kendi halkanda + rozeti." />,
    "story-progress": () => <ComponentDemo folder="social/story-progress" title="StoryProgress: ilerleme çubukları" desc="Geçmişler dolu, sıradaki boş, şimdiki hareket motoruyla dolar. Duraklatınca yerinde durur; RTL'de sağdan dolar." />,
    "like-button": () => <ComponentDemo folder="social/like-button" title="LikeButton: beğeni" desc="Kalp yayla zıplar, halka büyür, parçacıklar HADİ renkleriyle saçılır. Hareket motoru üstünde: Tümünü durdur, hız ve azaltılmış hareket buna da uyar." />,
    "media-grid": () => <ComponentDemo folder="social/media-grid" title="MediaGrid: medya ızgarası" desc="1, 2, 3, 4 ve daha fazla fotoğraf için ayrı yerleşim; fazlası son karede +N. Görsel gelene kadar iskelet, sonra yumuşak belirme." />,
    "count-roll": () => <ComponentDemo folder="social/count-roll" title="CountRoll: yuvarlanan sayaç" desc="Yalnız değişen basamak döner: artınca yukarı, azalınca aşağı. Yerel kısa biçim (1,2 B) ya da tam sayı." />,
    "virtual-list": () => <ComponentDemo folder="data/virtual-list" title="VirtualList: sanal liste" desc="100.000 satır, her biri kendi yüksekliğinde: yalnız görünen pencere DOM'da. Satırlar ölçülür, üstteki satır büyüyünce içerik yerinde kalır; sona yaklaşınca onEndReached." />,
    "profile-header": () => <ComponentDemo folder="composite/profile-header" title="ProfileHeader: profil başlığı" desc="Kapak, hikâye halkalı avatar, ad ve biyografi, sayaçlı istatistikler. Takip et'e basınca düğme dönüşür ve takipçi sayısı birlikte yuvarlanır." />,
    "follow-button": () => <ComponentDemo folder="social/follow-button" title="FollowButton: takip et" desc="Takip et → Takip ediliyor: genişlik yaylanır, dolgu çerçeveye döner, + tike çevrilir, dört renk parlar. Gizli hesapta istek gönderilir; takip edilirken üzerine gelince kırmızı uyarır." />,
  }
  return <Hub base="/social" kicker="Bileşenler" title="Sosyal" lead="Gönderi kartı, akış, hikâye, sohbet, yorum, profil, etkinlik ve bildirim bileşenleri. HADİ'nin dört rengi, hareket motoru ve tam klavye erişimi; her bileşenin kendi Playground'u var." render={RENDER} params={props.params} />
}
