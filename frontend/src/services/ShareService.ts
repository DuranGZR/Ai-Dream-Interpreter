import { Share, Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

export class ShareService {
  // Genel paylaşım (Native Share Sheet)
  static async shareDreamInterpretation(
    dreamText: string,
    interpretation: string,
    energy: number
  ): Promise<boolean> {
    try {
      const message = `🌙 *Rüyam:*\n"${dreamText}"\n\n🔮 *Yorum:*\n${interpretation}\n\n⚡ *Enerji:* ${energy}/100\n\n📱 *Rüya Yorumlayıcı AI* ile analiz edildi.\n#RüyaYorumlayıcı #AIRüya`;

      const result = await Share.share({
        message: message,
        title: 'Rüya Analizi'
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type: ' + result.activityType);
        } else {
          console.log('Shared successfully');
        }
        return true;
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
        return false;
      }
      return false;
    } catch (error: any) {
      console.error('❌ Paylaşım hatası:', error);
      return false;
    }
  }

  // WhatsApp'a özel (Aslında genel paylaşımı açar, kullanıcı seçer)
  static async shareToWhatsApp(
    dreamText: string,
    interpretation: string,
    energy: number
  ): Promise<boolean> {
    return this.shareDreamInterpretation(dreamText, interpretation, energy);
  }

  static async shareStats(
    totalDreams: number,
    avgEnergy: number,
    topSymbols: string[]
  ): Promise<boolean> {
    try {
      const message = `📊 *Rüya İstatistiklerim*\n\n✨ Toplam Rüya: ${totalDreams}\n⚡ Ortalama Enerji: ${avgEnergy}/100\n🔮 En Sık Semboller: ${topSymbols.join(', ')}\n\n#RüyaYorumlayıcı`;

      await Share.share({
        message: message,
        title: 'Rüya İstatistikleri'
      });
      return true;
    } catch (error: any) {
      console.error('❌ İstatistik paylaşım hatası:', error);
      return false;
    }
  }

  // PDF Paylaşımı (Basitleştirilmiş Text Export)
  static async shareAsPDF(dreams: any[]): Promise<boolean> {
    try {
      let content = '📚 RÜYA GEÇMİŞİM\n\n';

      dreams.forEach((dream, index) => {
        const date = new Date(dream.date).toLocaleDateString('tr-TR');
        content += `\n${index + 1}. RÜYA (${date})\n-------------------\n`;
        content += `📝 ${dream.dreamText}\n\n`;
        content += `⚡ Enerji: ${dream.energy}/100\n`;
      });

      // Text dosyası olarak kaydet ve paylaş
      const fileUri = FileSystem.documentDirectory + 'ruya_gecmisi.txt';
      await FileSystem.writeAsStringAsync(fileUri, content);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/plain',
          dialogTitle: 'Rüya Geçmişini Paylaş'
        });
        return true;
      } else {
        // Fallback to text share
        await Share.share({ message: content, title: 'Rüya Geçmişim' });
        return true;
      }
    } catch (error: any) {
      console.error('❌ Export hatası:', error);
      return false;
    }
  }
}
