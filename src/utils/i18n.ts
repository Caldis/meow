// Tiny i18n table for UI strings. Keys map to per-language text; resolution
// tries the full tag (e.g. zh-cn), then the primary subtag (zh), then English.
// Brand names (Mos, Alipay/WeChat, PayPal, Buy Me a Coffee) are intentionally
// NOT translated. The mainland-only donate block (中国大陆 / 支付宝 / 微信 /
// 扫一扫) stays Chinese because it is only ever shown to Simplified-Chinese
// visitors. The cat's name follows the localized title (Meow / ニャン / Miaou …).
type Dict = Record<string, string>

const STRINGS: Record<string, Dict> = {
  'app.title': {
    zh: '大咪成长史',
    en: "Meow's Story",
    ja: 'ニャンの成長記',
    ko: '냥이 성장기',
    fr: "L'histoire de Miaou",
    de: 'Miezis Geschichte',
    es: 'La historia de Miau',
    pt: 'A história do Miau',
    it: 'La storia di Miao',
    ru: 'История Мяу',
    ar: 'قصة مياو',
    hi: 'म्याऊ की कहानी',
    th: 'เรื่องราวของเหมียว',
    vi: 'Câu chuyện của Meo',
    tr: "Miyav'ın Hikâyesi",
    nl: 'Het verhaal van Miauw',
  },
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
