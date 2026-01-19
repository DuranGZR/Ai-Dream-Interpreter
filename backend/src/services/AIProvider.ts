import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// AI Model türleri
export type AIModel = 'gpt-4o' | 'gpt-4-turbo' | 'gpt-3.5-turbo' | 'claude-3-opus' | 'gemini-pro' | 'gemini-flash' | 'groq-llama-3';

// AI Provider sınıfı
export interface AIProvider {
  interpret(dreamText: string, context?: string, persona?: string, userName?: string): Promise<{ interpretation: string; energy: number; symbols: any[] }>;
}

// OpenAI Provider
export class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: 'gpt-4o' | 'gpt-4-turbo' | 'gpt-3.5-turbo' = 'gpt-4o') {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async interpret(dreamText: string, context?: string, persona?: string): Promise<{ interpretation: string; energy: number; symbols: string[] }> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `Sen profesyonel bir rüya yorumcususun. Rüyaları psikolojik ve sembolik açıdan yorumla. 
            Yorumunu JSON formatında döndür: 
            { 
              "interpretation": "3-4 paragraf detaylı yorum", 
              "energy": 0-100 arası sayı (0=çok negatif, 50=nötr, 100=çok pozitif),
              "symbols": ["sembol1", "sembol2", "sembol3"]
            }`,
          },
          {
            role: 'user',
            content: `Bu rüyayı yorumla: ${dreamText}\n\n${context || ''}`,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        interpretation: result.interpretation || 'Yorum oluşturulamadı',
        energy: result.energy || 50,
        symbols: result.symbols || [],
      };
    } catch (error) {
      console.error('OpenAI hatası:', error);
      throw error;
    }
  }
}


// Groq Provider (Llama 3 - Ultra Hız)
export class GroqProvider implements AIProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'llama-3.3-70b-versatile') {
    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1'
    });
    this.model = model;
  }

  async interpret(dreamText: string, context?: string, persona?: string): Promise<{ interpretation: string; energy: number; symbols: string[] }> {
    try {
      console.log(`⚡ Groq model kullanılıyor: ${this.model}`);
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `Sen, Carl Jung, Sigmund Freud ve modern rüya psikolojisi konusunda uzmanlaşmış, derin içgörülere sahip mistik bir rüya bilgesisin. 
            
            GÖREVİN:
            Kullanıcının rüyasını "sembolik", "psikolojik" ve "manevi" açılardan derinlemesine analiz etmek. Yüzeysel tabirlerden kaçın.
            
            ÇIKTI FORMATI (SADECE JSON):
            { 
              "interpretation": "En az 3 paragraf süren DETAYLI analiz. 1. Paragraf: Rüyanın genel atmosferi ve duygusal analizi. 2. Paragraf: Sembollerin derin anlamları (Arketipler). 3. Paragraf: Kullanıcının gerçek hayatına yönelik somut tavsiyeler ve içgörüler.", 
              "energy": 0-100 arası sayı (Rüyanın potansiyel enerjisi),
              "symbols": ["sembol1", "sembol2", "sembol3", "sembol4"],
              "awareness": "Kullanıcının gün içinde kendine sorması gereken tek cümlelik, uyanış yaratacak derin bir soru veya olumlama."
            }`,
          },
          {
            role: 'user',
            content: `Bu rüyayı tüm derinliğiyle yorumla: ${dreamText}\n\n${context || ''}`,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');

      // Awareness alanını interpretation'a ekle
      let fullInterpretation = result.interpretation || 'Yorum oluşturulamadı';
      if (result.awareness) {
        fullInterpretation += `\n\n💫 ${result.awareness}`;
      }

      return {
        interpretation: fullInterpretation,
        energy: result.energy || 50,
        symbols: result.symbols || [],
      };
    } catch (error) {
      console.error('Groq hatası:', error);
      throw error;
    }
  }
}

// Claude Provider (Anthropic)
export class ClaudeProvider implements AIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async interpret(dreamText: string, context?: string, persona?: string): Promise<{ interpretation: string; energy: number; symbols: string[] }> {
    try {
      // TODO: Anthropic Claude API entegrasyonu
      // Şimdilik mock response
      return {
        interpretation: `[Claude] Bu rüya yorumlanıyor: ${dreamText.substring(0, 50)}...`,
        energy: 70,
        symbols: ['demo'],
      };
    } catch (error) {
      console.error('Claude hatası:', error);
      throw error;
    }
  }
}

// Gemini Provider (Google) - TAM ENTEGRASYON
import { AI_CONFIG } from '../config/ai_config';

// ... (other imports)

// Gemini Provider (Google) - TAM ENTEGRASYON
export class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI;
  private modelName: string;

  constructor(apiKey: string, modelName: string = 'gemini-pro') {
    this.client = new GoogleGenerativeAI(apiKey);
    this.modelName = modelName;
  }

  async interpret(dreamText: string, context?: string, persona?: string, userName?: string): Promise<{ interpretation: string; energy: number; symbols: string[] }> {
    try {
      console.log(`🤖 Gemini model kullanılıyor: ${this.modelName}`);

      // Get active persona from config dynamic switch
      const configPersonas = AI_CONFIG.personas as any;
      const personaKey = persona && configPersonas[persona] ? persona : AI_CONFIG.activePersona;

      const selectedPersona = configPersonas[personaKey] || configPersonas.DEEP_ANALYST;
      const params = AI_CONFIG.modelParams;

      console.log(`🎭 Aktif Persona: ${personaKey}`);
      console.log(`👤 Kullanıcı: ${userName || 'Anonim'}`);

      const model = this.client.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          temperature: params.temperature,
          topK: params.topK,
          maxOutputTokens: params.maxOutputTokens,
          responseMimeType: 'application/json' // 🟢 FORCE JSON MODE
        }
      });

      const prompt = `
${selectedPersona.role}

${selectedPersona.instructions}

### 👤 KULLANICI BİLGİSİ:
${userName ? `Kullanıcının adı: ${userName}. Yorumuna "Sevgili ${userName}," diye başla.` : 'Kullanıcı adı bilinmiyor. "Sevgili Rüya Yolcusu," diye başla.'}

### 🔮 RÜYA METNİ:
"""${dreamText}"""

${context ? `### 🧠 GEÇMİŞ RÜYA BAĞLAMI (Kişiselleştirme İçin):\n${context}` : ''}
`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      console.log('🔍 Gemini ham yanıt:', text.substring(0, 150) + '...');

      let parsed;
      try {
        // 1. Try direct parse
        parsed = JSON.parse(text);
      } catch (e1) {
        try {
          // 2. Try cleanup (markdown removal)
          let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          parsed = JSON.parse(cleanText);
        } catch (e2) {
          // 3. Try Auto-Fixing common JSON errors
          console.log('⚠️ JSON Parse Hatası, otomatik düzeltme deneniyor...');
          let dirty = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          dirty = dirty.replace(/(?<=:\s*"[^"]*)\n(?=[^"]*")/g, "\\n");

          try {
            parsed = JSON.parse(dirty);
          } catch (e3) {
            console.error('❌ JSON Kurtarılamadı.', e3);
            parsed = {
              interpretation: `Rüya yorumu alındı ancak teknik bir format hatası oluştu. İşte ham metin: ${text.substring(0, 500)}...`,
              energy: 50,
              symbols: [],
              awareness_message: "Teknik bir aksaklık oldu ancak içsel yolculuğunuz devam ediyor."
            };
          }
        }
      }

      // 🧠 Construct the Rich Professional Interpretation
      let fullInterpretation = parsed.interpretation || 'Yorum oluşturulamadı';

      // Şık bölüm başlıkları ile zenginleştir
      if (parsed.inner_journey) {
        fullInterpretation += `\n\n━━━━━━━━━━━━━━━━━━━━━━\n✨ İçsel Yolculuğun\n━━━━━━━━━━━━━━━━━━━━━━\n\n${parsed.inner_journey}`;
      }

      if (parsed.spiritual_practice) {
        fullInterpretation += `\n\n━━━━━━━━━━━━━━━━━━━━━━\n🌟 Bugünkü Rehberliğin\n━━━━━━━━━━━━━━━━━━━━━━\n\n${parsed.spiritual_practice}`;
      }

      if (parsed.awareness_message) {
        fullInterpretation += `\n\n💫 "${parsed.awareness_message}"`;
      }

      // Symbol normalization - always return array of objects
      let normalizedSymbols: any[] = [];
      if (Array.isArray(parsed.symbols)) {
        normalizedSymbols = parsed.symbols.map((s: any) => {
          if (typeof s === 'string') {
            return { name: s, meaning: '' };
          }
          return { name: s.name || s, meaning: s.meaning || '' };
        });
      }

      return {
        interpretation: fullInterpretation,
        energy: Math.max(0, Math.min(100, parsed.energy || 50)),
        symbols: normalizedSymbols,
      };
    } catch (error) {
      console.error('Gemini hatası:', error);
      throw error;
    }
  }
}

// AI Factory - Model seçimine göre provider döndürür
export class AIFactory {
  static createProvider(model: AIModel): AIProvider {
    const openaiKey = process.env.OPENAI_API_KEY;
    const claudeKey = process.env.CLAUDE_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    switch (model) {
      case 'gpt-4o':
        if (!openaiKey) throw new Error('OpenAI API key eksik');
        return new OpenAIProvider(openaiKey, 'gpt-4o');

      case 'gpt-4-turbo':
        if (!openaiKey) throw new Error('OpenAI API key eksik');
        return new OpenAIProvider(openaiKey, 'gpt-4-turbo');

      case 'gpt-3.5-turbo':
        if (!openaiKey) throw new Error('OpenAI API key eksik');
        return new OpenAIProvider(openaiKey, 'gpt-3.5-turbo');

      case 'claude-3-opus':
        if (!claudeKey) throw new Error('Claude API key eksik');
        return new ClaudeProvider(claudeKey);

      case 'gemini-pro':
        if (!geminiKey) throw new Error('Gemini API key eksik');
        // Using gemini-2.5-flash as it is the most stable and available model currently
        return new GeminiProvider(geminiKey, 'gemini-2.5-flash');

      case 'gemini-flash':
        if (!geminiKey) throw new Error('Gemini API key eksik');
        return new GeminiProvider(geminiKey, 'gemini-2.5-flash');

      case 'groq-llama-3':
        if (!groqKey) throw new Error('Groq API key eksik');
        return new GroqProvider(groqKey);

      default:
        // Varsayılan: Gemini 2.5 Flash (En yeni, en hızlı!)
        if (geminiKey) {
          return new GeminiProvider(geminiKey, 'gemini-2.5-flash');
        }
        // Gemini yoksa OpenAI
        if (openaiKey) {
          return new OpenAIProvider(openaiKey, 'gpt-4o');
        }
        throw new Error('Hiçbir AI provider yapılandırılmamış');
    }
  }

  // Mevcut modelleri listele
  static getAvailableModels(): AIModel[] {
    const models: AIModel[] = [];

    if (process.env.GEMINI_API_KEY) {
      models.push('gemini-flash', 'gemini-pro');
    }

    if (process.env.OPENAI_API_KEY) {
      models.push('gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo');
    }

    if (process.env.CLAUDE_API_KEY) {
      models.push('claude-3-opus');
    }

    if (process.env.GROQ_API_KEY) {
      models.push('groq-llama-3');
    }

    return models;
  }
}
