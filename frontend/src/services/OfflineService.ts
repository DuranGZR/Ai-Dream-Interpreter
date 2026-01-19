import AsyncStorage from '@react-native-async-storage/async-storage';
// @ts-ignore
import NetInfo from '@react-native-community/netinfo';
import { API_ENDPOINTS } from '../config/api';

interface QueuedDream {
  id: string;
  dreamText: string;
  timestamp: number;
  retries: number;
}

export class OfflineService {
  private static QUEUE_KEY = 'offline_queue';
  private static MAX_RETRIES = 3;

  // İnternet bağlantısı kontrol et
  static async checkConnection(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  }

  // Rüyayı kuyruğa ekle (offline durumda)
  static async queueDream(dreamText: string): Promise<string> {
    try {
      const queue = await this.getQueue();
      const dreamId = Date.now().toString();

      const queuedDream: QueuedDream = {
        id: dreamId,
        dreamText,
        timestamp: Date.now(),
        retries: 0,
      };

      queue.push(queuedDream);
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));

      console.log('Rüya kuyruğa eklendi:', dreamId);
      return dreamId;
    } catch (error) {
      console.error('Kuyruğa ekleme hatası:', error);
      throw error;
    }
  }

  // Kuyruktaki rüyaları al
  static async getQueue(): Promise<QueuedDream[]> {
    try {
      const queueData = await AsyncStorage.getItem(this.QUEUE_KEY);
      return queueData ? JSON.parse(queueData) : [];
    } catch (error) {
      console.error('Kuyruk okuma hatası:', error);
      return [];
    }
  }

  // Kuyruktaki rüya sayısı
  static async getQueueCount(): Promise<number> {
    const queue = await this.getQueue();
    return queue.length;
  }

  // Kuyruktan rüya sil
  static async removeFromQueue(dreamId: string): Promise<void> {
    try {
      const queue = await this.getQueue();
      const filteredQueue = queue.filter(d => d.id !== dreamId);
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(filteredQueue));
    } catch (error) {
      console.error('Kuyruktan silme hatası:', error);
    }
  }

  // Kuyruktaki tüm rüyaları senkronize et
  static async syncQueue(): Promise<{ success: number; failed: number }> {
    const isOnline = await this.checkConnection();
    if (!isOnline) {
      console.log('İnternet bağlantısı yok, senkronizasyon atlandı');
      return { success: 0, failed: 0 };
    }

    const queue = await this.getQueue();
    let successCount = 0;
    let failedCount = 0;

    for (const dream of queue) {
      try {
        // API'ye gönder
        const response = await fetch(API_ENDPOINTS.interpret, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dreamText: dream.dreamText }),
        });

        if (response.ok) {
          // Başarılı, kuyruktan çıkar
          await this.removeFromQueue(dream.id);
          successCount++;
          console.log('Rüya senkronize edildi:', dream.id);
        } else {
          // Başarısız, retry sayısını artır
          dream.retries++;
          if (dream.retries >= this.MAX_RETRIES) {
            // Max retry aşıldı, kuyruktan çıkar
            await this.removeFromQueue(dream.id);
            console.log('Rüya max retry aşıldı:', dream.id);
          }
          failedCount++;
        }
      } catch (error) {
        console.error('Senkronizasyon hatası:', error);
        failedCount++;
      }
    }

    console.log(`Senkronizasyon tamamlandı: ${successCount} başarılı, ${failedCount} başarısız`);
    return { success: successCount, failed: failedCount };
  }

  // Otomatik senkronizasyon başlat (internet bağlandığında)
  static startAutoSync(): void {
    NetInfo.addEventListener(state => {
      if (state.isConnected) {
        console.log('İnternet bağlandı, senkronizasyon başlatılıyor...');
        this.syncQueue();
      }
    });
  }

  // Offline cache: Rüya geçmişini cache'le
  static async cacheDreams(dreams: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem('cached_dreams', JSON.stringify(dreams));
    } catch (error) {
      console.error('Cache hatası:', error);
    }
  }

  // Cache'den rüyaları al
  static async getCachedDreams(): Promise<any[]> {
    try {
      const cached = await AsyncStorage.getItem('cached_dreams');
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Cache okuma hatası:', error);
      return [];
    }
  }
}
