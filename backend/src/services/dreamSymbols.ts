import * as fs from 'fs';
import * as path from 'path';

// Rüya sembolü veri yapısı (JSON'dan gelen)
interface SymbolDetail {
  pozitif: string;
  negatif: string;
  genel: string;
}

interface SymbolMapping {
  [key: string]: SymbolDetail;
}

// Emoji haritası (Görsel zenginlik için statik tutuyoruz)
const EMOJI_MAP: { [key: string]: string } = {
  'su': '💧', 'ateş': '🔥', 'uçmak': '🕊️', 'düşmek': '⬇️', 'yılan': '🐍',
  'köpek': '🐕', 'kedi': '🐈', 'ev': '🏠', 'araba': '🚗', 'ölüm': '💀',
  'bebek': '👶', 'para': '💵', 'deniz': '🌊', 'dağ': '⛰️', 'ay': '🌙',
  'güneş': '☀️', 'yıldız': '⭐', 'kuş': '🐦', 'ağaç': '🌳', 'ayna': '🪞',
  'kapı': '🚪', 'merdiven': '🪜', 'diş': '🦷', 'saç': '💇', 'göz': '👁️',
  'yemek': '🍽️', 'ekmek': '🍞', 'kitap': '📖', 'yol': '🛣️'
};

// JSON verisini yükle (Cache'li)
let cachedSymbols: SymbolMapping | null = null;

function loadSymbolData(): SymbolMapping {
  if (cachedSymbols) return cachedSymbols;

  try {
    const dataPath = path.join(__dirname, '../../data/dream_symbols.json');
    if (fs.existsSync(dataPath)) {
      const rawData = fs.readFileSync(dataPath, 'utf-8');
      cachedSymbols = JSON.parse(rawData);
      return cachedSymbols!;
    }
  } catch (error) {
    console.error('Sembol dosyası okuma hatası:', error);
  }
  return {};
}

// Rüyadaki sembolleri bul ve detaylarını getir
export function extractDreamContext(dreamText: string): string {
  const symbols = loadSymbolData();
  const lowerText = dreamText.toLowerCase();

  const foundContexts: string[] = [];

  Object.keys(symbols).forEach(symbolKey => {
    // Basit eşleşme kontrolü (Geliştirilebilir: Regex, kök bulma vb.)
    if (lowerText.includes(symbolKey)) {
      const detail = symbols[symbolKey];
      foundContexts.push(
        `- ${symbolKey.toUpperCase()} (${EMOJI_MAP[symbolKey] || '✨'}):\n` +
        `  * Genel: ${detail.genel}\n` +
        `  * Pozitif: ${detail.pozitif}\n` +
        `  * Negatif: ${detail.negatif}`
      );
    }
  });

  if (foundContexts.length === 0) return '';

  return `📚 SEMBOL SÖZLÜĞÜNDEN REFERANSLAR (Kullanıcının rüyasında tespit edilenler):\n` +
    foundContexts.join('\n\n');
}

// Frontend için sembol listesi (Eski fonksiyon uyumluluğu)
export function extractSymbols(dreamText: string): string[] {
  const symbols = loadSymbolData();
  const lowerText = dreamText.toLowerCase();
  return Object.keys(symbols).filter(key => lowerText.includes(key));
}

export function getAllSymbols(): any[] {
  const symbols = loadSymbolData();
  return Object.keys(symbols).map(key => ({
    symbol: key,
    meaning: symbols[key].genel,
    emoji: EMOJI_MAP[key] || '✨'
  }));
}

