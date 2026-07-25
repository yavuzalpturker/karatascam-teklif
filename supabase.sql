-- Supabase SQL Editor içinde çalıştırın.

create table if not exists urunler (
  id uuid primary key default gen_random_uuid(),
  aciklama text not null,
  fiyat numeric(10, 2) not null,
  hesap_turu text not null check (hesap_turu in ('m2', 'adet')),
  created_at timestamptz default now()
);

-- Herkesin okumasına izin ver (uygulama anon key ile okuyor).
alter table urunler enable row level security;

create policy "Herkes urunleri okuyabilir"
  on urunler for select
  using (true);

-- Örnek veriler (orijinal Streamlit uygulamasındaki veritabanı ile aynı)
insert into urunler (aciklama, fiyat, hesap_turu) values
  ('Alüminyum ral boyalı sabit profilli, 10 mm temperli rodajlı düz camlı şekilli ofis bölme sistemi', 225.00, 'm2'),
  ('8 mm temperli düz camlı, Alüminyum ral boyalı profilli, koldan kilitlenebilir siyah gömmeli kahe kollu, 3 adet yaprak menteşeli çerçeveli cam kapı sistemi', 1250.00, 'adet');
