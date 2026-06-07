// Tiny i18n table for UI strings. Keys map to per-language text; resolution
// tries the full tag (e.g. zh-cn), then the primary subtag (zh), then English.
// Brand names (Mos, Alipay/WeChat, PayPal, Buy Me a Coffee) are intentionally
// NOT translated. The mainland-only donate block (中国大陆 / 支付宝 / 微信 /
// 扫一扫) stays Chinese because it is only ever shown to Simplified-Chinese
// visitors. The cat's name follows the localized title (Meow / ニャン / Miaou …).
type Dict = Record<string, string>

const STRINGS: Record<string, Dict> = {
  // (The page title now comes from the subject name + per-language templates —
  // see resolveTitle below and src/config/site.config.ts.)
  // View modes — random (free scatter) / sequential (timeline) / stage (mosaic grid).
  'tab.random': {
    zh: '随心', en: 'Free', ja: '気まま', ko: '자유', fr: 'Libre', de: 'Frei',
    es: 'Libre', pt: 'Livre', it: 'Libero', ru: 'Свободно', ar: 'حر',
    hi: 'स्वच्छंद', th: 'อิสระ', vi: 'Tự do', tr: 'Serbest', nl: 'Vrij',
  },
  'tab.sequential': {
    zh: '时光', en: 'Timeline', ja: '時系列', ko: '시간순', fr: 'Chronologie',
    de: 'Zeitleiste', es: 'Cronología', pt: 'Cronologia', it: 'Cronologia',
    ru: 'Хронология', ar: 'زمني', hi: 'समयरेखा', th: 'ไทม์ไลน์',
    vi: 'Dòng thời gian', tr: 'Zaman çizgisi', nl: 'Tijdlijn',
  },
  'tab.stage': {
    zh: '拼图', en: 'Mosaic', ja: 'モザイク', ko: '모자이크', fr: 'Mosaïque',
    de: 'Mosaik', es: 'Mosaico', pt: 'Mosaico', it: 'Mosaico', ru: 'Мозаика',
    ar: 'فسيفساء', hi: 'मोज़ेक', th: 'โมเสก', vi: 'Ghép hình', tr: 'Mozaik',
    nl: 'Mozaïek',
  },
  // Mos dock tagline.
  'mos.tagline': {
    zh: '让鼠标变得顺滑',
    en: 'Smooth mouse scrolling',
    ja: 'マウスを滑らかに',
    ko: '부드러운 마우스 스크롤',
    fr: 'Défilement fluide de la souris',
    de: 'Sanftes Mausscrollen',
    es: 'Desplazamiento suave del ratón',
    pt: 'Rolagem suave do mouse',
    it: 'Scorrimento fluido del mouse',
    ru: 'Плавная прокрутка мыши',
    ar: 'تمرير سلس للفأرة',
    hi: 'माउस स्क्रॉल को स्मूद बनाएं',
    th: 'เลื่อนเมาส์ให้ลื่นไหล',
    vi: 'Cuộn chuột mượt mà',
    tr: 'Pürüzsüz fare kaydırma',
    nl: 'Soepel muisscrollen',
  },
  // Small note under Mos — a wink: this page's smooth scroll is that very feel.
  'mos.note': {
    zh: '感觉到这个页面滚动有什么不一样吗?',
    en: 'Notice the smooth scroll here?',
    ja: 'このスクロールの滑らかさ、気づいた?',
    ko: '이 페이지 스크롤 느껴봤나요?',
    fr: 'Tu sens ce défilement fluide ?',
    de: 'Spürst du das sanfte Scrollen?',
    es: '¿Notas el scroll suave aquí?',
    pt: 'Sentiu a rolagem suave aqui?',
    it: 'Senti lo scorrimento fluido?',
    ru: 'Заметили плавную прокрутку?',
    ar: 'لاحظت التمرير السلس هنا؟',
    hi: 'यहाँ स्मूद स्क्रॉल महसूस हुआ?',
    th: 'สังเกตการเลื่อนที่ลื่นไหลไหม?',
    vi: 'Cảm nhận cuộn mượt ở đây chứ?',
    tr: 'Buradaki pürüzsüz kaydırmayı fark ettin mi?',
    nl: 'Voel je het soepele scrollen hier?',
  },
  // Zmage dock tagline (react-zmage) — the site's own line: images expand in place.
  'zmage.tagline': {
    zh: '让每张图片原位展开',
    en: 'Expand every image in place',
    ja: 'すべての画像をその場で拡大',
    ko: '모든 이미지를 제자리에서 펼치기',
    fr: 'Agrandir chaque image sur place',
    de: 'Jedes Bild an Ort und Stelle vergrößern',
    es: 'Expande cada imagen en su lugar',
    pt: 'Expanda cada imagem no lugar',
    it: 'Espandi ogni immagine sul posto',
    ru: 'Разворачивайте каждое изображение на месте',
    ar: 'وسّع كل صورة في مكانها',
    hi: 'हर छवि को यथास्थान विस्तृत करें',
    th: 'ขยายทุกภาพในตำแหน่งเดิม',
    vi: 'Mở rộng mọi hình ảnh tại chỗ',
    tr: 'Her görüntüyü yerinde genişletin',
    nl: 'Vergroot elke afbeelding ter plaatse',
  },
  // Small note under Zmage — meow's lightbox (the photo wall's tap-to-zoom) is
  // built on react-zmage, so this is literally the same effect.
  'zmage.note': {
    zh: '和照片墙同款的点击缩放效果',
    en: 'The same tap-to-zoom as this wall',
    ja: 'この写真ウォールと同じタップ拡大',
    ko: '이 사진 벽과 같은 탭 확대',
    fr: 'Le même zoom au clic que ce mur',
    de: 'Derselbe Klick-Zoom wie hier',
    es: 'El mismo zoom al clic que el muro',
    pt: 'O mesmo zoom ao clique do mural',
    it: 'Lo stesso zoom al clic del muro',
    ru: 'Тот же зум по клику, что и здесь',
    ar: 'نفس تأثير التكبير بالنقر هنا',
    hi: 'इसी फोटो वॉल जैसा क्लिक-ज़ूम',
    th: 'ซูมแตะแบบเดียวกับกำแพงภาพนี้',
    vi: 'Cùng kiểu nhấp để phóng như tường ảnh',
    tr: 'Bu duvardaki tıkla-yakınlaştır efekti',
    nl: 'Dezelfde klik-zoom als deze muur',
  },
  // Dock caption above the project tiles (shown in a speech bubble).
  'dock.invite': {
    zh: '看看作者的其他作品 ❤️',
    en: 'More from the maker ❤️',
    ja: '作者の他の作品も ❤️',
    ko: '제작자의 다른 작품 ❤️',
    fr: "Autres créations de l'auteur ❤️",
    de: 'Mehr vom Entwickler ❤️',
    es: 'Más del autor ❤️',
    pt: 'Mais do autor ❤️',
    it: "Altri lavori dell'autore ❤️",
    ru: 'Другие работы автора ❤️',
    ar: 'أعمال أخرى للمؤلف ❤️',
    hi: 'लेखक की अन्य रचनाएँ ❤️',
    th: 'ผลงานอื่นของผู้สร้าง ❤️',
    vi: 'Tác phẩm khác của tác giả ❤️',
    tr: 'Geliştiricinin diğer işleri ❤️',
    nl: 'Meer van de maker ❤️',
  },
  // meow — this project's own repo.
  'meow.tagline': {
    zh: '大咪的照片墙',
    en: "Meow's photo wall",
    ja: 'ニャンのフォトウォール',
    ko: '냥이의 사진 벽',
    fr: 'Le mur photo de Miaou',
    de: 'Miezis Fotowand',
    es: 'El muro de fotos de Miau',
    pt: 'O mural de fotos do Miau',
    it: 'La parete fotografica di Miao',
    ru: 'Фотостена Мяу',
    ar: 'جدار صور مياو',
    hi: 'म्याऊ की फोटो दीवार',
    th: 'กำแพงภาพของเหมียว',
    vi: 'Tường ảnh của Meo',
    tr: "Miyav'ın foto duvarı",
    nl: 'Miauws fotomuur',
  },
  'meow.note': {
    zh: '想珍藏大咪的照片吗?',
    en: "Want to keep Meow's photos?",
    ja: 'ニャンの写真を集めたい?',
    ko: '냥이 사진을 간직할래요?',
    fr: 'Envie de garder ses photos ?',
    de: 'Die Fotos behalten?',
    es: '¿Quieres guardar sus fotos?',
    pt: 'Quer guardar as fotos dele?',
    it: 'Vuoi conservare le sue foto?',
    ru: 'Хотите сохранить эти фото?',
    ar: 'تريد الاحتفاظ بصورها؟',
    hi: 'इन तस्वीरों को सहेजें?',
    th: 'อยากเก็บภาพของเหมียวไหม?',
    vi: 'Muốn lưu giữ ảnh của Meo?',
    tr: 'Fotoğraflarını saklamak ister misin?',
    nl: "Wil je de foto's bewaren?",
  },
  // Donate — "feed the cat" (primary action) / "a little snack" (subtitle).
  'donate.feed': {
    zh: '喂胖大咪',
    en: 'Feed Meow',
    ja: 'ニャンにごはん',
    ko: '냥이 밥 주기',
    fr: 'Nourrir Miaou',
    de: 'Miezi füttern',
    es: 'Alimentar a Miau',
    pt: 'Alimentar o Miau',
    it: 'Sfamare Miao',
    ru: 'Покормить Мяу',
    ar: 'أطعم مياو',
    hi: 'म्याऊ को खिलाएं',
    th: 'ให้อาหารเหมียว',
    vi: 'Cho Meo ăn',
    tr: 'Miyav’ı besle',
    nl: 'Miauw voeren',
  },
  'donate.snack': {
    zh: '给大咪加餐',
    en: 'A snack for Meow',
    ja: 'ニャンにおやつ',
    ko: '냥이 간식 주기',
    fr: 'Une friandise pour Miaou',
    de: 'Ein Leckerli für Miezi',
    es: 'Una golosina para Miau',
    pt: 'Um petisco para o Miau',
    it: 'Uno spuntino per Miao',
    ru: 'Угостить Мяу',
    ar: 'وجبة خفيفة لمياو',
    hi: 'म्याऊ के लिए नाश्ता',
    th: 'ขนมสำหรับเหมียว',
    vi: 'Bữa phụ cho Meo',
    tr: 'Miyav’a atıştırmalık',
    nl: 'Een snack voor Miauw',
  },
  'donate.close': {
    zh: '关闭对话框',
    en: 'Close dialog',
    ja: 'ダイアログを閉じる',
    ko: '대화 상자 닫기',
    fr: 'Fermer la boîte de dialogue',
    de: 'Dialog schließen',
    es: 'Cerrar el diálogo',
    pt: 'Fechar a caixa de diálogo',
    it: 'Chiudi la finestra',
    ru: 'Закрыть диалог',
    ar: 'إغلاق مربع الحوار',
    hi: 'संवाद बंद करें',
    th: 'ปิดกล่องโต้ตอบ',
    vi: 'Đóng hộp thoại',
    tr: 'İletişim kutusunu kapat',
    nl: 'Dialoogvenster sluiten',
  },
}

export const t = (key: string, lang: string): string => {
  const dict = STRINGS[key]
  if (!dict) return key
  const l = (lang || 'en').toLowerCase()
  return dict[l] || dict[l.split('-')[0]] || dict.en || key
}

// ─── Page title templating ───────────────────────────────────────────────────
// Engine-owned per-language title templates. A site supplies only the subject's
// name (src/config/site.config.ts) and gets a localized title for free; an
// explicit per-language `title` override wins when a title isn't a mechanical
// "{name}'s Story". These templates + the 大咪 name map reproduce the exact
// previous app.title values in all 16 languages.
const TITLE_TEMPLATE: Dict = {
  zh: '{name}成长史',
  en: "{name}'s Story",
  ja: '{name}の成長記',
  ko: '{name} 성장기',
  fr: "L'histoire de {name}",
  de: '{name}s Geschichte',
  es: 'La historia de {name}',
  pt: 'A história do {name}',
  it: 'La storia di {name}',
  ru: 'История {name}',
  ar: 'قصة {name}',
  hi: '{name} की कहानी',
  th: 'เรื่องราวของ{name}',
  vi: 'Câu chuyện của {name}',
  tr: "{name}'ın Hikâyesi",
  nl: 'Het verhaal van {name}',
}

const pickLocale = (map: Record<string, string | undefined> | undefined, lang: string): string | undefined => {
  if (!map) return undefined
  const l = (lang || 'en').toLowerCase()
  return map[l] ?? map[l.split('-')[0]] ?? map.en
}

export const resolveTitle = (
  subject: { name: Record<string, string | undefined>; title?: Record<string, string | undefined> },
  lang: string,
): string => {
  const authored = pickLocale(subject.title, lang)
  if (authored) return authored
  const name = pickLocale(subject.name, lang) ?? subject.name.en ?? Object.values(subject.name)[0] ?? ''
  const l = (lang || 'en').toLowerCase()
  const tpl = TITLE_TEMPLATE[l] ?? TITLE_TEMPLATE[l.split('-')[0]] ?? TITLE_TEMPLATE.en
  return tpl.replace('{name}', name)
}
