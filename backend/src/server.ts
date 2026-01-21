import dotenv from 'dotenv';
import path from 'path';

// ÖNCE dotenv.config() çağrılmalı
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import NodeCache from 'node-cache';
import crypto from 'crypto';
import { getDemoInterpretation } from './demoData';
import { AIFactory } from './services/AIProvider';
import { interpretDream } from './services/dreamInterpreter';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Body size limiti

// Rate Limiting - API kötüye kullanım koruması
const interpretLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 20, // 15 dakikada max 20 istek
  message: { error: 'Çok fazla istek gönderdiniz. Lütfen 15 dakika sonra tekrar deneyin.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const dreamsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // 15 dakikada max 50 istek
  message: { error: 'Çok fazla istek gönderdiniz. Lütfen biraz bekleyin.' },
});

// Firebase Admin SDK yapılandırması
let db: any = null;
let firebaseInitialized = false;

try {
  // serviceAccount.json dosyasını kullan (ÖNERİLEN YÖNTEM)
  const serviceAccountPath = path.resolve(__dirname, '../serviceAccount.json');

  if (fs.existsSync(serviceAccountPath)) {
    console.log('📁 serviceAccount.json bulundu, Firebase başlatılıyor...');
    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    db = admin.firestore();
    firebaseInitialized = true;
    console.log('✅ Firebase Admin SDK başarıyla başlatıldı!');
  } else {
    console.warn('⚠️  serviceAccount.json dosyası bulunamadı - backend klasörüne ekleyin');
  }
} catch (error) {
  console.error('❌ Firebase Admin SDK hatası:', error);
  console.warn('⚠️  Firebase başlatılamadı - Yalnızca yorumlama çalışacak');
}

// Sembol veritabanını yükle
const symbolsPath = path.resolve(__dirname, '../data/dream_symbols.json');
const dreamSymbols = JSON.parse(fs.readFileSync(symbolsPath, 'utf-8'));

// Sembol analizi fonksiyonu
function analyzeSymbols(dreamText: string) {
  const foundSymbols: any[] = [];
  const lowerText = dreamText.toLowerCase();

  for (const [symbol, meanings] of Object.entries(dreamSymbols)) {
    if (lowerText.includes(symbol)) {
      foundSymbols.push({
        name: symbol.charAt(0).toUpperCase() + symbol.slice(1),
        meaning: (meanings as any).genel,
      });
    }
  }

  return foundSymbols;
}

// Enerji hesaplama (basit sentiment analizi)
function calculateEnergy(dreamText: string): number {
  const positiveWords = ['mutlu', 'güzel', 'huzur', 'sevinç', 'başarı', 'özgürlük', 'sevgi'];
  const negativeWords = ['korku', 'üzgün', 'kaygı', 'kayıp', 'düşmek', 'kaos', 'ölüm'];

  const lowerText = dreamText.toLowerCase();
  let score = 50; // Nötr başlangıç

  positiveWords.forEach(word => {
    if (lowerText.includes(word)) score += 5;
  });

  negativeWords.forEach(word => {
    if (lowerText.includes(word)) score -= 5;
  });

  return Math.max(0, Math.min(100, score));
}

// Cache sistemi (10 dakika TTL)
const cache = new NodeCache({
  stdTTL: 600, // 10 dakika
  checkperiod: 120, // Her 2 dakikada bir expired key'leri temizle
  useClones: false, // Performance için
});

// Cache hash helper - aynı rüya için aynı key üretir
function getCacheKey(text: string): string {
  return crypto.createHash('md5').update(text.toLowerCase().trim()).digest('hex');
}

// Cache istatistikleri için
let cacheHits = 0;
let cacheMisses = 0;

// Rate limiter (dakikada 10 istek) - ESKI, kullanılmıyor artık
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 dakika
  max: 10,
  message: { error: 'Çok fazla istek, lütfen bir dakika sonra tekrar deneyin' },
});

// API Endpoints

// Input validation helper
function validateDreamText(text: string): { valid: boolean; error?: string } {
  if (!text || typeof text !== 'string') {
    return { valid: false, error: 'Rüya metni gerekli' };
  }

  const trimmed = text.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Rüya metni boş olamaz' };
  }

  if (trimmed.length < 10) {
    return { valid: false, error: 'Rüya metni en az 10 karakter olmalı' };
  }

  if (trimmed.length > 5000) {
    return { valid: false, error: 'Rüya metni en fazla 5000 karakter olabilir' };
  }

  return { valid: true };
}

// 1. Rüya Yorumlama (Cache + Rate Limit + Validation) - Gemini Flash
app.post('/api/interpret', interpretLimiter, async (req, res) => {
  try {
    const { dreamText, userId, persona, userName } = req.body;

    // Input validation
    const validation = validateDreamText(dreamText);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const sanitizedText = dreamText.trim();

    // Cache kontrolü - MD5 hash ile (Persona da cache key'e eklenmeli!)
    const cacheKey = getCacheKey(sanitizedText + (userId || '') + (persona || ''));
    const cached = cache.get(cacheKey);

    if (cached) {
      cacheHits++;
      console.log(`✨ Cache HIT (${cacheHits}/${cacheHits + cacheMisses} = ${Math.round(cacheHits / (cacheHits + cacheMisses) * 100)}%)`);
      return res.json(cached);
    }

    cacheMisses++;
    console.log(`⏳ Cache MISS - AI çağrısı yapılıyor... (${cacheHits}/${cacheHits + cacheMisses})`);

    // Merkezi yorumlama servisini kullan (Persona ve UserName ile)
    const result = await interpretDream(sanitizedText, userId, persona, userName);

    // Response formatını frontend'in beklediği yapıya dönüştür
    const response = {
      interpretation: result.interpretation,
      energy: result.energy,
      symbols: result.symbols.map(s => typeof s === 'string' ? { name: s, meaning: '' } : s),
    };

    console.log('✅ Yorumlama servisi başarıyla yanıt döndü');

    // Cache'e kaydet
    cache.set(cacheKey, response);

    res.json(response);

  } catch (error) {
    console.error('Yorumlama hatası:', error);
    res.status(500).json({ error: 'Yorumlama sırasında hata oluştu' });
  }
});

// 2. Rüya Kaydetme (Rate Limited + Validation)
app.post('/api/dreams', dreamsLimiter, async (req, res) => {
  if (!firebaseInitialized || !db) {
    return res.status(503).json({ error: 'Firebase bağlantısı yok - Rüya kaydetme devre dışı' });
  }

  try {
    const { dreamText, interpretation, energy, symbols, date, userId } = req.body;

    // Validation
    if (!userId) {
      return res.status(400).json({ error: 'userId gerekli' });
    }

    const validation = validateDreamText(dreamText);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    if (!interpretation || typeof interpretation !== 'string') {
      return res.status(400).json({ error: 'Yorum gerekli' });
    }

    if (typeof energy !== 'number' || energy < 0 || energy > 100) {
      return res.status(400).json({ error: 'Geçersiz enerji değeri' });
    }

    const dreamRef = await db.collection('dreams').add({
      userId,
      dreamText: dreamText.trim(),
      interpretation: interpretation.trim(),
      energy,
      symbols: Array.isArray(symbols) ? symbols : [],
      date: date || new Date().toISOString(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isFavorite: false,
    });

    res.json({ id: dreamRef.id, message: 'Rüya kaydedildi' });
  } catch (error) {
    console.error('Kaydetme hatası:', error);
    res.status(500).json({ error: 'Rüya kaydedilemedi' });
  }
});

// 3. Rüyaları Listeleme (userId'ye göre + Rate Limited)
app.get('/api/dreams', dreamsLimiter, async (req, res) => {
  if (!firebaseInitialized || !db) {
    return res.json([]);  // Boş liste dön
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId gerekli' });
    }

    const dreamsSnapshot = await db.collection('dreams')
      .where('userId', '==', userId)
      .get();

    const dreams = dreamsSnapshot.docs
      .map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a: any, b: any) => {
        // createdAt'e göre azalan sıralama (client-side)
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 50); // İlk 50 kayıt

    res.json(dreams);
  } catch (error) {
    console.error('Listeleme hatası:', error);
    res.status(500).json({ error: 'Rüyalar yüklenemedi' });
  }
});

// 4. Rüya Silme (Rate Limited)
app.delete('/api/dreams/:id', dreamsLimiter, async (req, res) => {
  if (!firebaseInitialized || !db) {
    return res.status(503).json({ error: 'Firebase bağlantısı yok' });
  }

  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Geçersiz rüya ID' });
    }

    await db.collection('dreams').doc(id).delete();
    res.json({ message: 'Rüya silindi' });
  } catch (error) {
    console.error('Silme hatası:', error);
    res.status(500).json({ error: 'Rüya silinemedi' });
  }
});

// 5. Favori Toggle (Rate Limited)
app.patch('/api/dreams/:id/favorite', dreamsLimiter, async (req, res) => {
  if (!firebaseInitialized || !db) {
    return res.status(503).json({ error: 'Firebase bağlantısı yok' });
  }

  try {
    const { id } = req.params;
    const { isFavorite } = req.body;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Geçersiz rüya ID' });
    }

    if (typeof isFavorite !== 'boolean') {
      return res.status(400).json({ error: 'isFavorite boolean olmalı' });
    }

    await db.collection('dreams').doc(id).update({
      isFavorite,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ message: 'Favori durumu güncellendi', isFavorite });
  } catch (error) {
    console.error('Favori güncelleme hatası:', error);
    res.status(500).json({ error: 'Favori güncellenemedi' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Server başlatma - Local development için
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on:`);
    console.log(`   - Local: http://localhost:${PORT}`);
    console.log(`   - Network: http://10.62.8.112:${PORT}`);
    console.log(`📊 OpenAI API: ${process.env.OPENAI_API_KEY ? 'Configured ✅' : 'Missing ❌'}`);
    console.log(`🔥 Firebase: ${process.env.FIREBASE_PROJECT_ID ? 'Configured ✅' : 'Missing ❌'}`);
  });
}

// Vercel serverless export
export default app;
