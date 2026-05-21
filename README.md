# Algan Team Yönetim Sistemi — Frontend UI

Algan Team Yönetim Sistemi'nin kullanıcı dostu, dinamik ve modern arayüzüdür. Tarayıcı tabanlı bir Tek Sayfa Uygulaması (SPA) olarak tasarlanmıştır.

## 👥 Geliştirici Ekip (Takım Bilgileri)
* **Yusuf KURT** - 22247010 (Elektrik-Elektronik Mühendisliği)
* **Hüseyin UYGUN** - 21247076
* **Ramdan Almjaidi** - 21247814
* **Yiğit ÇALIŞKAN** - 22247048

## 🚀 Teknolojik Altyapı (Tech Stack)
* **Kütüphane:** React 19 (En güncel fiber mimari ve bileşen yapısı)
* **Build Aracı:** Vite 7 (Yüksek hızlı Hot Module Replacement - HMR desteği)
* **HTTP İstemcisi:** Axios (Backend REST API ile asenkron veri iletişimi)
* **Tasarım/Stil:** App.css (Modüler ve responsive saf CSS tasarımı)

## 🏗️ Mimari ve Durum Yönetimi (State Management)
* **Ayrık Mimari (Decoupled):** Temiz kod ve sürdürülebilirlik ilkeleri gereği frontend kod tabanı backend'den tamamen bağımsız bir repo olarak yapılandırılmıştır.
* **State Management:** Uygulama içi veri akışı, harici kütüphane karmaşasından uzak durularak React'ın yerleşik `useState` ve `useEffect` hook'ları ile kontrol edilmektedir.
* **Veri Güncelleme Stratejisi:** Oturum açıldıktan sonra `Promise.all` yapısıyla kullanıcılar, çalışma günleri ve loglar 5 saniyede bir paralel olarak arka planda senkronize edilir (`Polling` stratejisi).

## 🖥️ Sayfalar ve Rol Tabanlı Erişim Kontrolü
Sistem `admin`, `head` (birim lideri) ve `member` (takım üyesi) olmak üzere 3 farklı rolün yetkilerine göre dinamik olarak şekillenir:
1. **Ana Durum (Dashboard):** Kişisel performans istatistikleri ve aktif çalışma saati grafikleri.
2. **Gün Yönetimi (Calendar):** Yöneticiler için tekil veya toplu tarih aralığıyla çalışma günü planlama ekranı.
3. **Günlük Özet (Summary):** Seçili tarihte hangi üyelerin projede aktif olduğunun anlık listesi.
4. **Genel Performans (Logs):** Admin ve liderler için birim bazlı katılım analizi.
5. **Üyeler & Rapor (Members):** Üye CRUD işlemleri ve performans çıktısı.
6. **Yetkiler (Permissions):** `managedIds` yapısıyla belirli üyelere delegasyon / yoklama girme izni atama.

## ⚙️ Kurulum ve Çalıştırma
1. Bağımlılıkları yükleyin: `npm install`
2. `src/App.jsx` içerisindeki `API_URL` değişkeninin doğru backend adresini gösterdiğinden emin olun.
3. Geliştirme sunucusunu başlatın: `npm run dev`