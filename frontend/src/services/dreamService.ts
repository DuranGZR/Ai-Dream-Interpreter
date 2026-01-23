import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../config/api';

export interface Dream {
  id: string;
  userId: string;
  content: string;
  interpretation?: string;
  symbols?: Array<{ symbol: string; meaning: string }>;
  sentiment?: {
    score: number;
    label: string;
  };
  createdAt: string;
  isLocal?: boolean; // Misafir modunda local kayıt
}

export interface InterpretationResponse {
  interpretation: string;
  energy: number;
  symbols: Array<{ name: string; meaning: string; }>;
}

const DREAMS_STORAGE_KEY = '@dreams_storage';

class DreamService {
  // Rüya yorumlama isteği
  async interpretDream(dreamText: string, userId: string): Promise<InterpretationResponse> {
    try {
      console.log('🔮 Rüya yorumlama isteği gönderiliyor...');
      const response = await fetch(API_ENDPOINTS.interpret, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dreamText,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Rüya yorumu alındı');
      return data as InterpretationResponse;
    } catch (error) {
      console.error('❌ Rüya yorumlama hatası:', error);
      throw error;
    }
  }

  // Rüyayı kaydet (misafir için local, normal kullanıcı için backend)
  async saveDream(dream: Omit<Dream, 'id' | 'createdAt'>): Promise<Dream> {
    try {
      const isGuest = dream.userId.startsWith('guest-');

      if (isGuest) {
        // Misafir kullanıcı - local storage'a kaydet
        console.log('💾 Misafir modu - Rüya local storage\'a kaydediliyor...');
        const newDream: Dream = {
          ...dream,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          isLocal: true,
        };

        const existingDreams = await this.getLocalDreams();
        const updatedDreams = [newDream, ...existingDreams];
        await AsyncStorage.setItem(DREAMS_STORAGE_KEY, JSON.stringify(updatedDreams));

        console.log('✅ Rüya local storage\'a kaydedildi');
        return newDream;
      } else {
        // Normal kullanıcı - backend'e kaydet
        console.log('💾 Rüya backend\'e kaydediliyor...');
        const response = await fetch(API_ENDPOINTS.dreams, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dream),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Rüya backend\'e kaydedildi');
        return data;
      }
    } catch (error) {
      console.error('❌ Rüya kaydetme hatası:', error);
      throw error;
    }
  }

  // Local dreams'i getir
  async getLocalDreams(): Promise<Dream[]> {
    try {
      const dreamsJson = await AsyncStorage.getItem(DREAMS_STORAGE_KEY);
      if (dreamsJson) {
        return JSON.parse(dreamsJson);
      }
      return [];
    } catch (error) {
      console.error('❌ Local rüyalar yüklenemedi:', error);
      return [];
    }
  }

  // Local dreams'i kaydet
  async saveLocalDreams(dreams: Dream[]): Promise<void> {
    try {
      await AsyncStorage.setItem(DREAMS_STORAGE_KEY, JSON.stringify(dreams));
    } catch (error) {
      console.error('❌ Local rüyalar kaydedilemedi:', error);
      throw error;
    }
  }

  // Tüm rüyaları getir (misafir için local, normal için backend)
  // Tüm rüyaları getir (Cache destekli)
  async getDreams(userId: string): Promise<Dream[]> {
    const CACHE_KEY = `${DREAMS_STORAGE_KEY}_${userId}`;
    const isGuest = userId.startsWith('guest-');

    if (isGuest) {
      console.log('📖 Misafir modu - Local rüyalar yükleniyor...');
      const dreams = await this.getLocalDreams();
      return dreams;
    }

    try {
      console.log('📖 Backend\'den rüyalar yükleniyor...');
      const response = await fetch(`${API_ENDPOINTS.dreams}?userId=${userId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ ${data.length} rüya yüklendi (API)`);

      // Cache'i güncelle
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));

      return data;

    } catch (error) {
      console.warn('❌ API hatası, cache kontrol ediliyor:', error);

      // API hatası durumunda cache'den dön
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        console.log('📦 Cache\'den veri dönüldü');
        return JSON.parse(cached);
      }

      throw error;
    }
  }

  // Favori durumunu güncelle
  async toggleFavorite(dreamId: string, isFavorite: boolean): Promise<void> {
    try {
      const response = await fetch(`${API_ENDPOINTS.dreams}/${dreamId}/favorite`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isFavorite }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log('✅ Favori durumu güncellendi');
    } catch (error) {
      console.error('❌ Favori güncellenemedi:', error);
      throw error;
    }
  }

  // Rüya sil
  async deleteDream(dreamId: string, userId: string): Promise<void> {
    try {
      const isGuest = userId.startsWith('guest-');

      if (isGuest) {
        console.log('🗑️ Local rüya siliniyor...');
        const dreams = await this.getLocalDreams();
        const updatedDreams = dreams.filter(d => d.id !== dreamId);
        await AsyncStorage.setItem(DREAMS_STORAGE_KEY, JSON.stringify(updatedDreams));
        console.log('✅ Rüya silindi');
      } else {
        console.log('🗑️ Backend\'den rüya siliniyor...');
        const response = await fetch(API_ENDPOINTS.dreamById(dreamId), {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log('✅ Rüya silindi');
      }
    } catch (error) {
      console.error('❌ Rüya silinemedi:', error);
      throw error;
    }
  }
}

export default new DreamService();
