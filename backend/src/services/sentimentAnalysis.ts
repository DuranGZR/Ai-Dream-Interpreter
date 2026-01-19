// Basit sentiment analizi (duygu analizi)
// Rüya metnindeki duygusal tonu analiz eder

interface SentimentResult {
  score: number; // -1 (çok negatif) ile +1 (çok pozitif) arası
  label: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
  confidence: number;
}

// Pozitif kelimeler
const positiveWords = [
  'mutlu', 'sevinç', 'huzur', 'güzel', 'harika', 'başarı', 'aşk', 'sevgi',
  'umut', 'şans', 'kazanmak', 'gülmek', 'dans', 'şarkı', 'hediye', 'bayram',
  'güneş', 'ışık', 'çiçek', 'bahçe', 'cennet', 'melek', 'barış', 'dostluk',
  'zafer', 'övgü', 'onur', 'gurur', 'coşku', 'neşe', 'keyif', 'rahatlık',
];

// Negatif kelimeler
const negativeWords = [
  'üzgün', 'korku', 'endişe', 'kaygı', 'acı', 'ölüm', 'kaza', 'tehlike',
  'düşmek', 'kayıp', 'yalnız', 'terk', 'hastalık', 'ağrı', 'kötü', 'karanlık',
  'çığlık', 'ağlamak', 'öfke', 'kavga', 'savaş', 'kan', 'yara', 'cehennem',
  'şeytan', 'kabus', 'dehşet', 'panik', 'stres', 'depresyon', 'umutsuz',
];

// Yoğunlaştırıcı kelimeler
const intensifiers = ['çok', 'son derece', 'aşırı', 'muazzam', 'dehşet', 'harika'];

// Ters çeviriciler
const negators = ['değil', 'hiç', 'asla', 'yok'];

// Basit sentiment analizi
export function analyzeSentiment(text: string): string {
  const lowerText = text.toLowerCase();
  
  let positiveScore = 0;
  let negativeScore = 0;

  // Pozitif kelimeleri say
  positiveWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) {
      positiveScore += matches.length;
    }
  });

  // Negatif kelimeleri say
  negativeWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) {
      negativeScore += matches.length;
    }
  });

  // Toplam skorları karşılaştır
  const totalScore = positiveScore - negativeScore;
  const totalWords = positiveScore + negativeScore;

  // Etiket belirle
  if (totalWords === 0) return 'neutral';
  
  const ratio = totalScore / totalWords;

  if (ratio > 0.5) return 'very_positive';
  if (ratio > 0.1) return 'positive';
  if (ratio < -0.5) return 'very_negative';
  if (ratio < -0.1) return 'negative';
  
  return 'neutral';
}

// Detaylı sentiment analizi
export function analyzeSentimentDetailed(text: string): SentimentResult {
  const lowerText = text.toLowerCase();
  
  let positiveScore = 0;
  let negativeScore = 0;
  let wordCount = 0;

  // Kelimeleri ayır
  const words = lowerText.split(/\s+/);
  wordCount = words.length;

  // Her kelimeyi kontrol et
  words.forEach((word, index) => {
    // Pozitif kelime
    if (positiveWords.includes(word)) {
      let score = 1;
      
      // Önceki kelime yoğunlaştırıcı mı?
      if (index > 0 && intensifiers.includes(words[index - 1])) {
        score *= 1.5;
      }
      
      // Önceki kelime ters çevirici mi?
      if (index > 0 && negators.includes(words[index - 1])) {
        score *= -1;
      }
      
      positiveScore += score;
    }

    // Negatif kelime
    if (negativeWords.includes(word)) {
      let score = 1;
      
      // Önceki kelime yoğunlaştırıcı mı?
      if (index > 0 && intensifiers.includes(words[index - 1])) {
        score *= 1.5;
      }
      
      // Önceki kelime ters çevirici mi?
      if (index > 0 && negators.includes(words[index - 1])) {
        score *= -1;
      }
      
      negativeScore += score;
    }
  });

  // Skor hesapla (-1 ile +1 arası)
  const totalScore = positiveScore - negativeScore;
  const normalizedScore = Math.max(-1, Math.min(1, totalScore / Math.sqrt(wordCount)));

  // Etiket belirle
  let label: SentimentResult['label'];
  if (normalizedScore > 0.5) label = 'very_positive';
  else if (normalizedScore > 0.1) label = 'positive';
  else if (normalizedScore < -0.5) label = 'very_negative';
  else if (normalizedScore < -0.1) label = 'negative';
  else label = 'neutral';

  // Güven skoru
  const confidence = Math.abs(normalizedScore);

  return {
    score: normalizedScore,
    label,
    confidence,
  };
}

// Duygu etiketini Türkçe'ye çevir
export function translateSentimentLabel(label: SentimentResult['label']): string {
  const translations = {
    very_positive: 'Çok Pozitif',
    positive: 'Pozitif',
    neutral: 'Nötr',
    negative: 'Negatif',
    very_negative: 'Çok Negatif',
  };

  return translations[label];
}
