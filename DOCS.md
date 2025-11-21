\# Futures Bot Paneli Kullanım Rehberi



\## 1. Panele Erişim



\### Adım 1: Landing Sayfasından Panel'e Geçiş

\- Ana sayfada (`https://cursor-ile-basit-site-925.created.app`) herhangi bir \*\*"Panel"\*\*, \*\*"Hemen Başla"\*\* veya \*\*"Başla"\*\* butonuna tıklayın.

\- `/dashboard` sayfasına yönlendirileceksiniz.

\- Panel, bu sayfanın içinde \*\*iframe\*\* ile yüklenecektir.



\### Adım 2: Login İşlemi

Panel yüklendikten sonra login ekranında:



\- \*\*Kullanıcı Adı:\*\* `admin`

\- \*\*Şifre:\*\* `YeniSifre123`

\- \*\*"Giriş Yap"\*\* butonuna tıklayın.



> ⚠️ \*\*GÜVENLİK NOTU:\*\* İlk gerçek para denemesinden önce mutlaka şifrenizi değiştirin!



---



\## 2. Dashboard Bölümleri



\### 2.1 Bot Durumu

\- \*\*LIVE:\*\* Gerçek işlem modu – bot aktif olarak trade yapabilir.

\- \*\*TEST:\*\* Test modu – sadece simülasyon, gerçek para harcanmaz.



\### 2.2 Günlük PnL (Profit \& Loss)

\- O günün kar/zarar durumunu gösterir.

\- Yeşil değerler karı, kırmızı değerler zararı temsil eder.



\### 2.3 Toplam PnL

\- Bot’un başlangıcından itibaren toplam kar/zarar durumunu gösterir.

\- Uzun vadeli performansı takip etmek için kullanılır.



\### 2.4 ROI (Return on Investment)

\- Yatırım getiri oranı (%).

\- Başlangıç sermayesine göre kar/zarar yüzdesini gösterir.



\### 2.5 Açık Pozisyonlar

\- Şu anda aktif olan işlemleri listeler.

\- Görebileceğiniz bilgiler:

&nbsp; - Sembol

&nbsp; - Yön (LONG / SHORT)

&nbsp; - Giriş fiyatı

&nbsp; - Miktar

&nbsp; - SL Fiyatı / ROE

&nbsp; - Anlık kar/zarar



---



\## 3. Sık Karşılaşılan Durumlar



\### 3.1 “Açık pozisyon bulunamadı”

\- Normal bir durumdur – bot henüz sinyal bekliyor olabilir.

\- Pine Script algoritması uygun koşulları bulduğunda otomatik işlem açar.



\### 3.2 PnL Değerleri 0 Görünüyor

\- Bot henüz işlem yapmamış olabilir.

\- Veya TEST modunda olduğunuz için henüz anlamlı veri oluşmamıştır.



\### 3.3 Bağlantı Sorunları

\- Sayfayı yenileyin (\*\*F5\*\*).

\- Render’daki backend uykuda ise 30–60 saniye bekleyin ve tekrar deneyin.

\- İnternet bağlantınızı kontrol edin.



---



\## 4. Güvenlik Uyarıları



\### ✅ Yapmanız Gerekenler

\- İlk girişten sonra admin şifresini değiştirin.

\- Önce \*\*küçük bakiye\*\* ile test edin.

\- Binance API anahtarlarınızı kimseyle paylaşmayın.

\- Pozisyonlarınızı ve botu düzenli olarak kontrol edin.



\### ❌ Yapmamanız Gerekenler

\- Kaybetmeyi göze alamayacağınız parayla işlem yapmayın.

\- Botu uzun süre tamamen kontrolsüz bırakmayın.

\- API anahtarlarını kod içine veya ekran görüntülerine koymayın.



---



\## 5. Teknik Destek



Sorun yaşadığınızda:



1\. Paneli yenileyin.

2\. Farklı tarayıcıda deneyin.

3\. Backend’i kontrol edin: `https://cursor-futures-bot-panel.onrender.com/api/status`

4\. Geliştirici notları ve kod için GitHub repo’suna bakın:  

&nbsp;  `https://github.com/yasindural/cursor-bot`



---



\## 6. Risk Uyarı Banner Metni



Aşağıdaki metin, panel üstünde uyarı bandı olarak kullanılabilir:



```text

⚠️ RİSK UYARISI: Bu sistem otomatik futures işlemleri gerçekleştirir. Futures işlemleri yüksek risklidir ve tüm sermayenizi kaybedebilirsiniz. Bot sizin adınıza emir açabilir ve kapatabilir. Kullanımdan doğacak tüm mali sorumluluk kullanıcıya aittir. Sadece kaybetmeyi göze alabileceğiniz sermaye ile işlem yapın. 🚨



