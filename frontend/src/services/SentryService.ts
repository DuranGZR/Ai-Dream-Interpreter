// @ts-ignore
import * as Sentry from '@sentry/react-native';

// Sentry yapılandırması
export function initSentry() {
  // Expo Go'da Sentry devre dışı (development build gerekli)
  if (__DEV__) {
    console.log('Sentry devre dışı (Development mode)');
    return;
  }
  
  Sentry.init({
    dsn: '', // Sentry kullanmıyoruz, boş bıraktık
    debug: false,
    environment: __DEV__ ? 'development' : 'production',
    enableAutoSessionTracking: false,
    sessionTrackingIntervalMillis: 30000,
    
    // Hangi hataları yakalayacağımızı belirle
    beforeSend(event, hint) {
      // Development'ta hataları konsola da yazdır
      if (__DEV__) {
        console.error('Sentry error:', hint.originalException || hint.syntheticException);
      }
      return event;
    },

    // İzlenecek breadcrumb türleri
    enableNative: true,
    enableNativeCrashHandling: true,
    enableNativeNagger: true,
  });
}

// Manuel hata bildirimi
export function reportError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    contexts: context ? { custom: context } : undefined,
  });
}

// Manuel mesaj bildirimi
export function reportMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.captureMessage(message, level);
}

// Kullanıcı bilgisi ayarla
export function setUser(userId: string, email?: string, username?: string) {
  Sentry.setUser({
    id: userId,
    email,
    username,
  });
}

// Kullanıcı bilgisini temizle
export function clearUser() {
  Sentry.setUser(null);
}

// Breadcrumb ekle (kullanıcı aksiyonlarını takip için)
export function addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}

// Tag ekle (filtreleme için)
export function setTag(key: string, value: string) {
  Sentry.setTag(key, value);
}

// Context ekle (ek bilgi için)
export function setContext(key: string, value: Record<string, any>) {
  Sentry.setContext(key, value);
}

// Performance monitoring için transaction başlat
export function startTransaction(name: string, op: string) {
  // Sentry 7.x'te startTransaction kaldırıldı
  console.log(`Transaction: ${name} (${op})`);
  return null;
}

// API isteklerini izle
export async function monitorApiCall<T>(
  name: string,
  apiCall: () => Promise<T>
): Promise<T> {
  const transaction = startTransaction(name, 'http');
  
  try {
    const result = await apiCall();
    transaction.setStatus('ok');
    addBreadcrumb(`API Success: ${name}`, 'api', { status: 'ok' });
    return result;
  } catch (error) {
    transaction.setStatus('error');
    addBreadcrumb(`API Error: ${name}`, 'api', { error: String(error) });
    throw error;
  } finally {
    transaction.finish();
  }
}
