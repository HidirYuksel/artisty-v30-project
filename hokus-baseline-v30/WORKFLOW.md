# İki kişilik çalışma düzeni

## 1) Kurulum (her geliştirici)
```
git clone <depo>          # ya da bu klasörü bir Git deposuna koyun (aşağıya bkz.)
git checkout -b ISIM/ozellik-adi v30
sh tools/serve.sh 8080    # Hıdır: 8080 · diğer geliştirici: 8081 (ayrı port = ayrı tarayıcı hafızası!)
```
Tarayıcıda `http://localhost:8080/index.html`. Aynı bilgisayarda iki dalı açacaksanız **farklı port veya farklı tarayıcı profili** kullanın;
panel ayarları tarayıcı hafızasında tutulur ve aynı adreste karışır.

## 2) Dosya sahipliği (çakışmayı azaltır)
| Alan | Dosya |
|---|---|
| Stil | `src/css/style.css` |
| Davranış / panel / animasyon | `src/js/app.js` |
| Sayfa iskeleti, SVG'ler | `src/index.html` |
| Sabit ayarlar | `src/config/defaults.json` (+ `LOCKED_VALUES.md`) |
| Ses / görsel | `src/assets/**` (yolu kodda `'assets/…'` yazın; derleme gömer) |

`app.js` büyük bir dosya: **panel listesine (SEC) yalnızca kendi bölümünüzü ekleyin, mevcut satırları yeniden sıralamayın.**

## 3) Kurallar
1. **Kilitli değerlere dokunmayın** (`LOCKED_VALUES.md`). Değişecekse kişiye sorun.
2. **Ayar aktarımı (MIGS) eklemeyin** — kayıtlı ayarların üzerine yazar. Yeni ayar = sadece varsayılan değer. Aktarım gerekiyorsa tek kişi ekler, numarayı birlikte belirlersiniz (iki dal aynı `VER` numarasını almasın).
3. Küçük, sık commit. `main`'e doğrudan yazılmaz; birleştirmeyi tek kişi yapar.
4. Dosya adı: `releases/hokus-vNN-ISIM-konu.html` (iki kişi aynı `vNN` adını kullanmasın).
5. Her birleştirmeden önce: `python3 tools/build.py && node tools/smoke-test.js file://$PWD/dist/hokus.html`

## 4) Birleştirme akışı
1. A dalı bitirir → `main`'e birleşir → etiket (`v31`).
2. B dalı `main`'i kendi dalına çeker (`git merge main`), çakışmaları **kendi dalında** çözer, testi çalıştırır, sonra birleşir.
3. Çakışma çıkması beklenen yerler: panel listesi (SEC), `VER`/`MIGS`, varsayılan değerler. Bunlar küçük ve elle çözülür.
4. Birleşmiş sürümü 1992×1120 ve 2576×1441'de açıp kilitli ölçüleri gözle doğrulayın.

## 5) Tek dosya çıktı
```
python3 tools/build.py v31      # → dist/hokus-v31.html  (çift tıkla açılır, müşteriye/sunuma gider)
```
Onaylanan sürümü `releases/` altına kopyalayıp commit'leyin.

## 6) Kullanıcı ayarlarını (panel) yedekleme
Panelde ayar yaptıktan sonra **JSON dışa aktar**'ı kullanın ve `ayarlar/ISIM.json` olarak saklayın. Kalıcı olması gereken değerleri `src/config/defaults.json` ve `LOCKED_VALUES.md`'ye işleyin.

## 7) Claude ile çalışırken
- Her geliştirici **kendi sohbetinde**, ilk mesajda baz olarak `releases/hokus-v30.html` (veya güncel etiket) dosyasını yükler.
- Claude'dan her güncellemede **değişen bölümlerin listesini** isteyin.
- Proje dokümanlarına yazarken farklı yollar kullanın; aynı dosyanın üstüne yazılırsa diğer kişinin işi kaybolur.
