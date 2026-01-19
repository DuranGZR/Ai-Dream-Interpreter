import { AIFactory } from './AIProvider';
import { analyzeSentiment } from './sentimentAnalysis';
import { extractSymbols, extractDreamContext } from './dreamSymbols';
import { getDemoInterpretation } from '../demoData';
import * as fs from 'fs';
import * as path from 'path';

interface Dream {
  id: string;
  userId: string;
  dreamText: string;
  interpretation: string;
  energy: number;
  symbols: string[];
  sentiment?: string;
  date: string;
  isFavorite: boolean;
}

// Rüya yorumlama fonksiyonu
export async function interpretDream(
  dreamText: string,
  userId?: string,
  persona?: string,
  userName?: string
): Promise<{ interpretation: string; energy: number; symbols: any[] }> {
  // 0. Geçmiş rüya bağlamını hazırla (Eğer userId varsa)
  let context = '';
  if (userId) {
    try {
      context = await getRecentDreamsContext(userId);
      if (context) {
        console.log('🧠 Geçmiş rüya bağlamı yüklendi:', context.substring(0, 50) + '...');
      }
    } catch (e) {
      console.error('Bağlam yükleme hatası:', e);
    }
  }

  // 0.5 RAG: Sembol Bağlamını Ekle (Knowledge Base)
  const symbolContext = extractDreamContext(dreamText);
  if (symbolContext) {
    console.log('📚 Sembol bağlamı bulundu ve eklendi.');
    // Mevcut bağlama ekle
    context = context
      ? `${context}\n\n${symbolContext}`
      : symbolContext;
  }

  // 1. Önce Gemini (Google) dene - En Hızlı & Bedava
  try {
    console.log(`🤖 Deneniyor: Gemini Pro (Stable) [Persona: ${persona || 'Default'}] [User: ${userName || 'Anonim'}]...`);
    const provider = AIFactory.createProvider('gemini-pro');
    return await provider.interpret(dreamText, context, persona, userName);
  } catch (geminiError) {
    console.error('❌ Gemini Hatası:', geminiError);
    console.log('🔄 Groq (Llama 3) yedeğine geçiliyor...');

    // 2. Hata verirse Groq (Llama 3) dene - Dünyanın en hızlısı (Yedek)
    try {
      const provider = AIFactory.createProvider('groq-llama-3');
      return await provider.interpret(dreamText, context, persona, userName);
    } catch (groqError) {
      console.error('❌ Groq Hatası:', groqError);

      // 3. Fallback: Demo data (Hiçbir AI çalışmazsa)
      console.log('⚠️  Tüm AI servisleri başarısız, demo moda geçiliyor...');
      const demoResponse = getDemoInterpretation(dreamText);
      return {
        interpretation: demoResponse.interpretation,
        energy: demoResponse.energy,
        symbols: demoResponse.symbols.map(s => ({ name: s.name, meaning: s.meaning || '' })),
      };
    }
  }
}

// Rüya geçmişini getir
export async function getDreamHistory(userId: string): Promise<Dream[]> {
  try {
    const dataPath = path.join(__dirname, '../../data/dreams.json');

    // Dosya yoksa boş array döndür
    if (!fs.existsSync(dataPath)) {
      return [];
    }

    const data = fs.readFileSync(dataPath, 'utf-8');
    const allDreams: Dream[] = JSON.parse(data);

    // Kullanıcının rüyalarını filtrele
    return allDreams.filter((dream) => dream.userId === userId);
  } catch (error) {
    console.error('Geçmiş getirme hatası:', error);
    return [];
  }
}

// Son 5 rüyayı getirip bağlam oluşturma
async function getRecentDreamsContext(userId: string): Promise<string> {
  try {
    const dreams = await getDreamHistory(userId);
    if (!dreams || dreams.length === 0) return '';

    // Tarihe göre yeniden eskiye sırala
    const sorted = dreams.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Son 5 rüya
    const recent = sorted.slice(0, 5);

    // Metin formatına dönüştür
    const summary = recent.map((d, i) => {
      return `RÜYA #${i + 1} (${new Date(d.date).toLocaleDateString()}):
      "Açıklama: ${d.dreamText.substring(0, 150)}..."
      "Semboller: ${d.symbols.join(', ')}"
      "Duygu Durumu: Enerji ${d.energy}/100`;
    }).join('\n\n');

    return `KULLANICI RÜYA GEÇMİŞİ (SON 5 RÜYA):\nBu bilgileri kullanıcının psikolojik durumunu ve rüya desenlerini anlamak için kullan:\n\n${summary}`;
  } catch (error) {
    console.error('Context oluşturma hatası:', error);
    return '';
  }
}

// Rüya kaydetme
export async function saveDream(dreamData: {
  userId: string;
  dreamText: string;
  interpretation: string;
  energy: number;
  symbols: string[];
}): Promise<Dream> {
  try {
    const dataPath = path.join(__dirname, '../../data/dreams.json');
    const dataDir = path.dirname(dataPath);

    // Data klasörü yoksa oluştur
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Mevcut rüyaları oku
    let allDreams: Dream[] = [];
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf-8');
      allDreams = JSON.parse(data);
    }

    // Yeni rüya oluştur
    const newDream: Dream = {
      id: `dream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: dreamData.userId,
      dreamText: dreamData.dreamText,
      interpretation: dreamData.interpretation,
      energy: dreamData.energy,
      symbols: dreamData.symbols,
      sentiment: analyzeSentiment(dreamData.dreamText),
      date: new Date().toISOString(),
      isFavorite: false,
    };

    // Listeye ekle
    allDreams.push(newDream);

    // Dosyaya kaydet
    fs.writeFileSync(dataPath, JSON.stringify(allDreams, null, 2), 'utf-8');

    return newDream;
  } catch (error) {
    console.error('Rüya kaydetme hatası:', error);
    throw error;
  }
}

// Rüya silme
export async function deleteDream(dreamId: string, userId: string): Promise<void> {
  try {
    const dataPath = path.join(__dirname, '../../data/dreams.json');

    if (!fs.existsSync(dataPath)) {
      throw new Error('Rüya bulunamadı');
    }

    const data = fs.readFileSync(dataPath, 'utf-8');
    let allDreams: Dream[] = JSON.parse(data);

    // Rüyayı bul ve kullanıcı kontrolü yap
    const dreamIndex = allDreams.findIndex(
      (dream) => dream.id === dreamId && dream.userId === userId
    );

    if (dreamIndex === -1) {
      throw new Error('Rüya bulunamadı veya yetkiniz yok');
    }

    // Rüyayı sil
    allDreams.splice(dreamIndex, 1);

    // Dosyaya kaydet
    fs.writeFileSync(dataPath, JSON.stringify(allDreams, null, 2), 'utf-8');
  } catch (error) {
    console.error('Rüya silme hatası:', error);
    throw error;
  }
}
