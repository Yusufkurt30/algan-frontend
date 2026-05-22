# TEKNİK DOKÜMANTASYON — Frontend UI

Bu belge, "algan-WEB" projesinin "algan-frontend" tarafındaki mimari yapısını, hiyerarşisini ve projeye entegre edilen yapay zeka ile kalite kontrol araçlarının akademik bağlamdaki verimliliğini açıklamaktadır.

## 1. İstemci-Sunucu (Client-Server) Mimarisi ve Haberleşme
Uygulama, modern web geliştirme standartlarına uygun olarak, İstemci (Frontend) ve Sunucu (Backend) katmanlarının birbirinden tamamen bağımsız çalıştığı (Decoupled Architecture) bir yapıda kurgulanmıştır.

* **Client Katmanı:** Tarayıcıda çalışan, Single Page Application (SPA) olarak React.js tabanlı, kullanıcının etkileşime geçtiği yüzdür.
* **Haberleşme Protokolü:** Veri transferi için standart RESTful API yapısı kullanılarak JSON formatında asenkron (Asynchronous) iletişim sağlanır.
* **Veri İstekleri (Fetch/Axios):** Tüm API çağrıları `Axios` kütüphanesi kullanılarak gerçekleştirilir. Bileşenlerin API detaylarını bilmesine gerek kalmadan veriye erişmesini sağlamak amacıyla API çağrıları Servis katmanında soyutlanmıştır. Bu da test edilebilirliği artırıp kod tekrarını (DRY Prensibi) azaltmıştır.

## 2. Klasör Hiyerarşisi (Tree Formatı) ve Temel İşlevler

Aşağıda projenin "Clean Code" felsefesine uygun olarak yeniden tasarlanmış klasör yapısı bulunmaktadır:

```
algan-frontend/
├── node_modules/             # Proje bağımlılıkları (otomatik oluşturulur)
├── public/                   # Statik varlıklar (Favicon, dışarıdan erişilebilir resimler)
├── src/
│   ├── assets/               # Proje içi kullanılan resimler, ikonlar
│   ├── components/           # Tekrar kullanılabilir UI bileşenleri (Sidebar, Modal vb.)
│   ├── pages/                # Ana sayfa görünümleri (Dashboard, Calendar, Login vb.)
│   ├── services/             # Backend ile haberleşen API çağrı dosyaları (api.js)
│   ├── context/              # (Varsa) Global state yönetimi için Context API dosyaları
│   ├── App.jsx               # Uygulamanın kök bileşeni ve routing/layout yapısı
│   ├── App.css               # Genel stil tanımlamaları
│   ├── index.css             # Tema ve CSS değişkenleri
│   └── main.jsx              # React uygulamasının DOM'a entegre edildiği giriş noktası
├── tests/                    # Birim (Unit) ve Entegrasyon test dosyaları
├── .gitignore                # Git takibine alınmayacak dosya ve klasörler
├── eslint.config.js          # Statik kod analizi (Linter) kuralları
├── package.json              # Proje bağımlılıkları ve npm script'leri
├── README.md                 # Proje genel dokümantasyonu
├── TEKNIK_DOKUMANTASYON.md   # Mimari ve akademik detayların belgesi
└── vite.config.js            # Vite build aracı konfigürasyonu
```

## 3. Yapay Zeka Destekli Yazılım Geliştirme Araçlarının Katkısı

Bu projenin geliştirilmesinde geleneksel yöntemlere ek olarak en modern teknolojik yaklaşımlar (Yapay Zeka Destekli Kodlama ve Otomatik Kod Analizi) entegre edilmiştir.

### LLM (Gemini Pro 3.1) Kullanımının Verimliliği
Gemini Pro 3.1 asistan olarak konumlandırılarak "Yazılım Yaşam Döngüsü" (SDLC) hızlandırılmıştır.
* **Mimari Dönüşüm:** Monolithik (tek dosya) olarak başlayan projenin Modüler Mimari'ye geçiş sürecinde refactoring stratejileri yapay zeka ile belirlenmiş, bağımlılıkların doğru ayrıştırılması sağlanmıştır.
* **Bilişsel Yükün Azaltılması:** Algoritmik veya sözdizimsel problemler için arama motorlarında saatler harcamak yerine, spesifik hatalar yapay zekaya yönlendirilerek geliştirme maliyeti düşürülmüştür.

### Kod Kalite Metrikleri (SonarCloud) Katkısı
* **Teknik Borç Yönetimi:** SonarCloud ile yapılan statik analizler sonucunda kod içerisindeki karmaşıklık (Cyclomatic Complexity), kullanılmayan değişkenler (Dead Code) ve zayıf hata yakalama pratikleri sistem tarafından işaretlenmiştir.
* **Akademik Standartlara Uyum:** Projedeki "Teknik Borç" yüzdesi, dersin temel hedeflerinden biri olan %5 seviyesinin altına çekilerek, bakım (maintenance) kolaylığı sağlanmış ve literatürdeki kaliteli yazılım standartları yakalanmıştır. Sonuç olarak, projenin okunabilirliği ve test edilebilirliği uluslararası mühendislik standartlarına ulaşmıştır.
