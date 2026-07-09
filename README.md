# KARATAŞCAM Teklif Sistemi

Streamlit prototipinin React (Vite) + Supabase ile yeniden yazılmış hâli.

## Klasör Yapısı

```
src/
├── main.jsx                 giriş noktası
├── App.jsx                  state akışı, sayfa iskeleti
├── lib/supabaseClient.js    supabase bağlantısı
├── hooks/useUrunler.js      ürün listesini supabase'den çeker
├── utils/hesaplama.js       m2/adet tutar hesaplama (saf fonksiyonlar)
├── utils/pdfOlustur.js      pdfMake ile PDF üretimi
├── components/              form, tablo, buton bileşenleri
└── styles/index.css         tasarım
```

## Kurulum

```bash
npm install
cp .env.example .env
```

`.env` dosyasını kendi Supabase proje bilgilerinizle doldurun (Supabase Dashboard → Project Settings → API).

## Supabase Kurulumu

1. [supabase.com](https://supabase.com) üzerinde yeni bir proje oluşturun.
2. SQL Editor'de bu projedeki `supabase.sql` dosyasının içeriğini çalıştırın. Bu, `urunler` tablosunu oluşturur ve iki örnek ürünü ekler.
3. Yeni ürün eklemek/düzenlemek için Supabase'in Table Editor arayüzünü kullanabilirsiniz — kod değişikliği gerekmez.

## Logo

`public/logo.jpg` konumuna firma logosunu ekleyin. PDF üretimi logo bulamazsa hata vermez, logosuz devam eder.

## Geliştirme

```bash
npm run dev
```

## Canlıya Alma

Bu proje tamamen statik bir SPA'dır (backend gerektirmez, veriler Supabase üzerinden okunur). `npm run build` sonrası oluşan `dist/` klasörünü Vercel, Netlify veya benzeri herhangi bir statik hosting'e yükleyebilirsiniz. Ortam değişkenlerini (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) hosting panelinden tanımlamayı unutmayın.

## Notlar

- PDF üretimi tamamen tarayıcıda (`pdfmake`) yapılır, sunucu gerekmez.
- Türkçe karakterler pdfMake'in gömülü Roboto fontuyla desteklenir; orijinal koddaki `C:\Windows\Fonts` bağımlılığı kaldırıldı (bu zaten yalnızca Windows'ta çalışırdı).
- `sepet` mantığı orijinal Streamlit'teki `session_state.sepet` ile birebir aynı davranışı React state ile taklit eder.
