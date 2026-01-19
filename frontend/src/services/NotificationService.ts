import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Notification Handler Ayarı (Uygulama açıkken de bildirim göster)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  } as Notifications.NotificationBehavior),
});

export class NotificationService {
  // 🟢 İzin İste (Android 13+ için runtime permission)
  static async requestPermission(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Bildirim izni reddedildi!');
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Permission request error:', error);
      return false;
    }
  }

  // ☀️ Günlük Hatırlatma (Her sabah 08:00)
  static async scheduleDailyReminder(): Promise<void> {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) return;

    // Önce eski bildirimleri temizle (duplicate olmasın)
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Yeni bildirimi kur
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "☀️ Günaydın! Rüyalarını Hatırlıyor Musun?",
        body: "Rüyaların silinmeden hemen kaydet. Bilinçaltının mesajını keşfet!",
        sound: true,
      },
      trigger: {
        hour: 8,
        minute: 0,
        repeats: true,
      } as Notifications.CalendarTriggerInput,
    });

    await AsyncStorage.setItem('notifications_enabled', 'true');
    console.log('✅ Günlük hatırlatma kuruldu (08:00)');
  }

  // 🔴 Bildirimleri İptal Et
  static async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.setItem('notifications_enabled', 'false');
    console.log('🚫 Tüm bildirimler iptal edildi');
  }

  // 🔍 Durum Kontrolü
  static async areNotificationsEnabled(): Promise<boolean> {
    const enabled = await AsyncStorage.getItem('notifications_enabled');
    return enabled === 'true';
  }

  // 🔔 Anlık Bildirim Gönder (Test vb. için)
  static async sendLocalNotification(title: string, body: string): Promise<void> {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: null, // Hemen gönder
    });
  }
}
