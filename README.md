# 🌙 Rüya Yorumlayıcı (Dream Interpreter)

> **"Bilinçaltınızın Haritasını Çıkarın."**  
> Yapay Zeka destekli, psikolojik derinliği olan, modern ve güvenli bir rüya takip platformu.

![Expo](https://img.shields.io/badge/Expo-Go-000000?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-F55036?style=for-the-badge&logo=fastapi&logoColor=white)

---

## 📱 Uygulama Hakkında

Bu uygulama, sıradan bir "rüya tabirleri" uygulaması değildir. **Jung ve Freud** teorilerini modern yapay zeka ile harmanlayarak, kullanıcıya kendi bilinçaltı hakkında derin farkındalıklar kazandırmayı amaçlar. 

Sistemimiz, rüyalarınızı sadece "iyi" veya "kötü" olarak etiketlemez; içerisindeki sembolleri, duygusal tonu ve enerji seviyesini analiz eder.

---

## � Detaylı Özellikler (Ekran Ekran)

### 1. 🏠 Ana Ekran (Home Screen)
Rüya yolculuğunuzun başlangıç noktası.
*   **Hızlı Rüya Girişi:** Rüyalarınızı klavye ile yazabilir veya (yakında) sesli olarak anlatabilirsiniz.
*   **Dinamik Arka Plan:** Saate göre değişen atmosferik gradyanlar.
*   **Günlük İlham:** Her açılışta farklı bir motivasyon veya rüya gerçeği.

### 2. ⚡ Analiz & Sonuç Ekranı (Result Screen)
Yapay zekanın sihrini konuşturduğu yer.
*   **Yapay Zeka Yorumu:** Gemini 1.5 Flash (veya Groq Llama 3) tarafından üretilen 3-4 paragraflık derin psikolojik analiz.
*   **Enerji Puanı:** rüyanın ruhsal yükünü gösteren 0-100 arası bir skorbord.
*   **Sembol Tespiti:** Rüyada geçen önemli objeleri (örn: Yılan, Deniz, Uçmak) otomatik algılar ve listeler.
*   **Farkındalık (Awareness):** Günlük hayatınızda uygulayabileceğiniz tek cümlelik eylem tavsiyesi.

### 3. 📜 Rüya Geçmişi (History Screen)
Eski rüyalarınızın dijital arşivi.
*   **Filtreleme:** Pozitif, negatif veya nötr rüyaları ayıklayın.
*   **Arama:** İçerik veya sembol bazlı akıllı arama.
*   **Favoriler:** Sizin için önemli olan rüyaları yıldızlayın.

### 4. 📊 İstatistikler (Stats Screen)
Bilinçaltınızın veri dökümü.
*   **Duygu Analizi:** Son 30 günde rüyalarınız genel olarak ne hissettirdi?
*   **Sembol Frekansı:** En çok gördüğünüz 5 sembol nedir? (Örn: Sürekli "su" görüyorsanız duygusal bir yoğunluk yaşıyor olabilirsiniz).
*   **Enerji Grafiği:** Ruh halinizin zaman içindeki değişimi.

### 5. 📅 Takvim (Calendar Screen)
*   **Isı Haritası (Heatmap):** Hangi günlerde rüya gördüğünüzü görsel olarak takip edin.
*   **Rüya Sıklığı:** Hangi aylarda daha aktif rüya görüyorsunuz?

### 6. 👤 Profil (Profile Screen)
Siz ve tercihleriniz.
*   **Rozetler ve Seviyeler:** Rüya girdikçe "Acemi Kaşif"ten "Rüya Üstadı"na yükselin.
*   **Bulut Yedekleme:** Firebase entegrasyonu sayesinde telefon değiştirseniz bile verileriniz kaybolmaz.
*   **Gizlilik:** Hesabınızı ve verilerinizi tek tuşla silme imkanı (KVKK uyumlu).

---

---

---

## 🧠 Yapay Zeka Mimarisi (AI Core 3.0)

Uygulamanın kalbinde, standart LLM çağrılarının ötesine geçen, **4 Katmanlı Hibrit Bir Zeka** yatar.

### 1. 🕸️ Bağlamsal Hafıza (Contextual Awareness)
Yapay Zeka, rüyaları birbirinden bağımsız olaylar olarak görmez. Sizin **"Rüya Tarihçenizi"** bilir.
*   **Mekanizma:** Bir rüya gönderdiğinizde, sistem son 5 rüyanızı tarar, özetler ve "örüntüleri" yakalar.
*   **Örnek:** *"Geçen haftaki düşme rüyandan farklı olarak bu sefer uçuyorsun, bu bir özgüven artışı..."* diyebilir.

### 2. 🎭 Adaptif Kişilik (Adaptive Persona)
Herkesin rüya dili farklıdır. Sistem, sizin ruh halinize göre bir **"Rehber Maskesi"** takar.
*   **Mistik (The Oracle):** Spiritüel, enerji odaklı, kehanet tonunda konuşur.
*   **Analitik (Dr. Aether):** Psikolojik, Jungiyen analiz yapar.
*   **Rehber (The Guide):** Pratik, çözüm odaklı ve dostanedir.
*(Profil ayarlarından kişiliğinizi seçebilirsiniz)*

### 3. 📚 Bilgi Destekli Üretim (Knowledge-Based RAG)
Yapay zeka "halüsinasyon" görmez, çünkü literatüre bağlı kalır.
*   **Veri Tabanı:** Sistemde İslami, Bilimsel ve Mistik kaynaklardan derlenmiş binlerce sembol tanımı (JSON) bulunur.
*   **Akış:** Rüyanızdaki anahtar kelimeler (örn: "yılan", "diş") anında taranır -> Sözlük anlamları bulunur -> AI'a *"Bak, yılanın bu kültürdeki anlamı şudur, buna göre yorumla"* denir.
*   **Sonuç:** %100 tutarlı ve literatüre dayalı yorumlar.

### 4. 🔗 Zincirleme Düşünce (Chain of Thought - CoT)
Yapay Zeka, cevabı hemen "yapıştırmaz". Tıpkı bir insan uzman gibi önce **kendi içinde düşünür.**
*   **Adım 1 (Dedektif):** Rüyadaki somut kanıtları (objeler, renkler) listeler.
*   **Adım 2 (Analist):** Bu kanıtların psikolojik arketiplerini (Gölge, Anima) bulur.
*   **Adım 3 (Sentez):** Tüm bulguları birleştirip kullanıcıya nihai, derinlikli metni yazar.
*   **Farkı:** Bu yöntem, Multi-Agent sistem kalitesini **tek bir işlem maliyetiyle** (ücretsiz & hızlı) sunar.

---

## 🛠️ Teknik Mimari (Under the Hood)

Bu proje, ölçeklenebilirlik ve performans odaklı "Serverless" ve "Microservice-like" bir mimari ile tasarlanmıştır.

### Frontend
*   **Expo (React Native):** Cross-platform (iOS, Android, Web) çıktı alabilmek için.
*   **TypeScript:** Tip güvenliği ve hatasız kodlama için %100 TS kullanımı.
*   **State Management:** React Context API (Hafif ve hızlı).
*   **UI Library:** React Native Paper (Material Design) ve özel Lottie animasyonları.

### Backend (Node.js & Express)
*   **AI Orchestrator (AIFactory):**
    *   Sistem önce **Google Gemini** servisine (ücretsiz tier) istek atar.
    *   Hata durumunda saliseler içinde **Groq (Llama 3)** servisine geçer (Failover).
    *   İnternet yoksa **Local Demo Data** servisi devreye girer.
    *   Bu geçişler kullanıcıya hissettirilmez (Zero Downtime).
*   **Veritabanı:** Firebase Firestore (Realtime DB) - Kullanıcı verileri ve rüya kayıtları için.
*   **Güvenlik:** `.env` ile korunan API anahtarları.

---

## 📦 Kurulum Rehberi

### Adım 1: Depoyu İndirin
```bash
git clone https://github.com/KULLANICI_ADI/ruyayorumlayici.git
cd ruyayorumlayici
```

### Adım 2: Backend'i Ayağa Kaldırın
```bash
cd backend
npm install
# .env dosyanızı oluşturun (Örnek: .env.example)
npm run dev
Start-Process -FilePath "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -ArgumentList "-avd", "Pixel_4_API_35"
```

### Adım 3: Mobil Uygulamayı Başlatın
```bash
cd frontend
npm install
npx expo start
```
QR kodu okutun ve rüyalarınızı keşfetmeye başlayın!

---

## 🎓 Son Söz
Bu proje sadece bir yazılım değil; teknoloji ile psikolojinin kesişim noktasında duran bir "dijital rehber"dir. Geri bildirimlerinizle gelişmeye devam edecektir.

Keyifli rüyalar! ✨
