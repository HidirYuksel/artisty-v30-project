# Hokus — interaktif web önizleme · baseline v30

Tek dosyalık v30 HTML'i yönetilebilir parçalara ayrıldı; davranış birebir aynı.

```
src/
  index.html            sayfa iskeleti (+ inline SVG'ler)
  css/style.css         tüm stiller
  js/app.js             uygulama, panel (SEC), animasyonlar
  config/defaults.json  kalıcı/kilitli varsayılan ayarlar
  assets/
    audio/toggle-click.wav   toggle buton sesi
    img/ice.png               dondurma patlaması görseli
tools/
  build.py              src → TEK dosya HTML (dist/)
  serve.sh              yerel geliştirme sunucusu
  smoke-test.js         hızlı otomatik kontrol (Playwright)
docs/settings-reference.json   v30'un tüm varsayılanları (otomatik üretilmiş referans)
releases/hokus-v30.html        onaylı, çift tıkla açılan v30
LOCKED_VALUES.md · WORKFLOW.md · CHANGELOG.md
```

## Hızlı başlangıç
- **Sadece görmek:** `releases/hokus-v30.html` dosyasını tarayıcıda açın.
- **Geliştirmek:** `sh tools/serve.sh 8080` → http://localhost:8080/index.html (dosyalar ayrı yüklenir; JSON/ses için yerel sunucu gerekir, çift tıkla açmak yetmez).
- **Tek dosya üretmek:** `python3 tools/build.py v31`

Font: Adobe Fonts "Neue Haas Grotesk Text" (`index.html` içindeki Typekit bağlantısı).
Doğrulama: `releases/hokus-v30.html`, ayrılmadan önceki v30 ile birebir aynıdır (yalnızca `defaults` etiketi içeriği farklı: kilitli değerler JSON'dan gömülür).
