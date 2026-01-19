# 🔐 OAuth Setup Guide

Bu rehber, Google ve Apple OAuth girişlerini yapılandırmanız için adım adım talimatlar içerir.

## 🔥 Google OAuth Setup

### 1. Firebase Console Ayarları

1. Firebase Console'a gidin: https://console.firebase.google.com/
2. Projenizi seçin (`dream-interpreter1`)
3. **Authentication** → **Sign-in method**
4. **Google** provider'ı etkinleştir
5. **Web SDK configuration** → `Web client ID`'yi kopyalayın

### 2. Google Cloud Console - OAuth Client IDs Oluştur

1. Google Cloud Console: https://console.cloud.google.com/
2. Projenizi seçin
3. **APIs & Services** → **Credentials**
4. **Create Credentials** → **OAuth client ID**

#### a) iOS Client ID
- Application type: **iOS**
- Bundle ID: `com.dreaminterpreter.app`
- Client ID'yi kopyalayın

#### b) Android Client ID
- Application type: **Android**
- Package name: `com.dreaminterpreter.app`
- SHA-1 certificate fingerprint gerekli:

```bash
# Debug key için
cd android
./gradlew signingReport

# Veya keytool ile
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

SHA-1 hash'i ekleyin ve Client ID'yi kopyalayın

### 3. .env Dosyasını Güncelle

`frontend/.env` dosyasını açın ve Client ID'leri yapıştırın:

```env
GOOGLE_IOS_CLIENT_ID=1234567890-xxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_ANDROID_CLIENT_ID=1234567890-yyyyyyyyyyyyyyyy.apps.googleusercontent.com  
GOOGLE_WEB_CLIENT_ID=1234567890-zzzzzzzzzzzzzzzz.apps.googleusercontent.com
```

---

## 🍎 Apple Sign In Setup

### 1. Apple Developer Account Gereklilikleri

- Apple Developer Program üyeliği ($99/yıl)
- Bundle ID: `com.dreaminterpreter.app`

### 2. Apple Developer Portal Ayarları

1. Apple Developer: https://developer.apple.com/account/
2. **Certificates, Identifiers & Profiles**
3. **Identifiers** → App ID'nizi seçin
4. **Sign in with Apple** yeteneğini etkinleştir
5. Kaydet

### 3. app.json Güncelle

`frontend/app.json` dosyasında:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.dreaminterpreter.app",
      "usesAppleSignIn": true
    }
  }
}
```

### 4. EAS Build ile Kullanım

Apple Sign In sadece **production build** veya **TestFlight**'ta çalışır:

```bash
eas build --platform ios --profile production
```

---

## ✅ Test Etme

### Google Login Test

1. `npm start` ile uygulamayı başlatın
2. Login ekranında Google butonu tıklayın
3. Google hesabı seçin
4. İzin verin

### Apple Login Test

1. iOS cihazda production build yükleyin (TestFlight veya App Store)
2. Apple ile Giriş butonuna tıklayın
3. Face ID / Touch ID ile onaylayın

---

## 🐛 Sorun Giderme

### "Invalid Client" Hatası (Google)
- Client ID'lerin doğru kopyalandığından emin olun
- `.env` dosyasını kaydettiğinizden emin olun
- Metro bundler'ı yeniden başlatın: `npm start -- --reset-cache`

### "Unauthorized Request" Hatası (Android)
- SHA-1 fingerprint doğru mu kontrol edin
- Package name `com.dreaminterpreter.app` olmalı

### Apple Sign In Çalışmıyor
- Development modda çalışmaz, production build gerekir
- Bundle ID doğru olmalı
- Apple Developer'da yetenek etkin olmalı

---

## 📝 Notlar

- **Environment Variables**: Her değişiklikten sonra uygulamayı yeniden başlatın
- **Platform Specific**: Google her platformda çalışır, Apple sadece iOS'ta
- **Firebase Console**: Tüm provider'lar Firebase Console'da da görünmeli

---

## 🚀 Sonraki Adımlar

OAuth kurulumu tamamlandıktan sonra:

1. ✅ Test edin (her iki platform)
2. ✅ Production build alın
3. ✅ App Store / Play Store'a yükleyin
