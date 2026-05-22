# Algan Team Yönetim Sistemi — Frontend UI

Algan Team Yönetim Sistemi'nin kullanıcı dostu, dinamik ve modern arayüzüdür. Tarayıcı tabanlı bir Tek Sayfa Uygulaması (SPA) olarak tasarlanmıştır.

## Proje Amacı ve Genel Bakış
Bu proje, üniversitedeki "Yapay Zeka Destekli Yazılım Geliştirme" dersi için akademik bir ödev olarak hazırlanmıştır. Temel amacı, Algan İHA Takımı'nın çalışma günlerini, giriş/çıkış saatlerini ve devamsızlık durumlarını dijital ortamda şeffaf ve düzenli bir şekilde takip etmektir. Sistem, farklı yetki seviyelerindeki kullanıcıların (admin, head, member) rolleri çerçevesinde performans ve devamlılık analizi yapabilmesine olanak tanır.

## 👥 Geliştirici Ekip
* **Yusuf KURT** - 22247010 (Elektrik-Elektronik Mühendisliği)
* **Hüseyin UYGUN** - 21247076
* **Ramdan Almjaidi** - 21247814
* **Yiğit ÇALIŞKAN** - 22247048

## 🚀 Teknolojik Altyapı (Tech Stack)
* **React 19:** Kullanıcı arayüzünün (UI) bileşen tabanlı inşası, sayfa içi durum (state) yönetimi ve hızlı render işlemleri için kullanılmıştır.
* **Vite 7:** Geliştirme sürecini hızlandırmak, anında HMR (Hot Module Replacement) sunmak ve projenin üretim (production) sürümünü en verimli şekilde derlemek (build) için kullanılmıştır.
* **Axios (v1.13.2):** İstemci (Client) ile Sunucu (Server) arasındaki RESTful API asenkron haberleşmesini yönetmek için tercih edilmiştir.
* **Vanilla CSS (App.css & index.css):** Herhangi bir CSS framework'üne bağımlı kalmadan, modern, esnek ve "responsive" (mobil uyumlu) bir tasarım sunmak için kullanılmıştır.
* **Jest & React Testing Library:** Uygulamanın birim testlerini (unit test) yazarak kod güvenilirliğini ve test edilebilirliğini sağlamak için projeye entegre edilmiştir.

## 🏗️ Mimari ve Modüller
Frontend projemiz "Clean Code" ve "SOLID" prensipleri (özellikle Single Responsibility Principle - Tek Sorumluluk Prensibi) temel alınarak geliştirilmiştir.
* **Bileşenler (Components):** UI parçaları (Sidebar, tablolar, formlar) tekrar kullanılabilirlik açısından küçük, yönetilebilir bileşenlere ayrılmıştır.
* **Sayfalar (Pages):** `Dashboard`, `Calendar`, `Summary`, `Logs` ve `Settings` gibi ana görünümler kendi dosyalarında izole edilerek kodun okunabilirliği artırılmıştır.
* **Servisler (Services):** Tüm backend API istekleri (HTTP GET, POST vb.) `src/services/api.js` veya ilgili servis katmanlarında toplanarak UI bileşenleri veri çekme mantığından arındırılmıştır.
* **Durum Yönetimi (State Management):** Uygulama geneli durumlar React'in Hook yapısı kullanılarak prop-drilling'i engelleyecek şekilde tasarlanmıştır.

## 🤖 ZORUNLU İSTER 1: Yapay Zeka (Gemini Pro 3.1) Kullanımı
Projenin geliştirilme, kod üretimi ve mimari kurgulama süreçlerinde **Gemini Pro 3.1** aktif bir yapay zeka asistanı olarak kullanılmıştır:
* **Kod Üretimi ve Refactoring:** Başlangıçta tek ve büyük bir `App.jsx` dosyası (Monolith) olarak yazılan frontend kodu, Gemini Pro 3.1 yardımıyla analiz edilerek daha küçük ve sürdürülebilir sayfa/bileşen yapılarına (Clean Architecture) başarıyla dönüştürülmüştür.
* **Hata Ayıklama (Debugging):** Geliştirme esnasında karşılaşılan React hook bağımlılık hataları, asenkron veri çekme sorunları ve CSS düzenleme zorlukları Gemini ile interaktif bir şekilde çözülmüştür.
* **Test Yazımı:** Jest ve React Testing Library kullanılarak yazılan birim testlerin (Unit Tests) senaryolarının kurgulanmasında yapay zekanın veri üretme ve test şablonu oluşturma becerilerinden faydalanılmıştır.

## 📊 ZORUNLU İSTER 2: Kod Kalitesi ve SonarCloud.io Entegrasyonu
Projenin sürdürülebilirliğini sağlamak ve "Teknik Borç" oranını akademik kriter olan **%5'in altına** düşürmek için aşağıdaki adımlar uygulanmıştır:
* **Statik Kod Analizi:** Proje, **SonarCloud.io** platformunda analiz edilmiş, tüm "Code Smell", kod tekrarları ve güvenlik açıkları tespit edilmiştir.
* **Kod Kalitesi:** ESLint kuralları katılaştırılarak, tespit edilen hatalar giderilmiştir. Çıkan test sonuçlarına göre gereksiz değişkenler kaldırılmış, karmaşık fonksiyonlar basitleştirilmiştir. Böylece kodun kalitesi maksimum düzeye çıkarılmış ve test edilebilirliği artırılmıştır.

## ⚙️ Kurulum ve Çalıştırma Talimatları
1. **Gereksinimler:** Bilgisayarınızda Node.js yüklü olmalıdır.
2. Bağımlılıkları yüklemek için terminalde şu komutu çalıştırın:
   ```bash
   npm install
   ```
3. Backend sunucusunun çalıştığından emin olun (Varsayılan olarak `http://localhost:3000` portunda olmalıdır. `src/services/api.js` veya `App.jsx` içerisindeki `API_URL` değişkenini kontrol ediniz).
4. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```
5. Tarayıcınızda terminalde belirtilen adresi (genellikle `http://localhost:5173`) açarak projeyi görüntüleyebilirsiniz.