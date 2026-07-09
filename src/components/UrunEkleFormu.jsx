import { useState, useEffect } from "react";
import { satirHesapla } from "../utils/hesaplama";

export default function UrunEkleFormu({ urunler, yukleniyor, hata, onEkle }) {
  const [secilenId, setSecilenId] = useState("");
  const [en, setEn] = useState(100);
  const [boy, setBoy] = useState(100);
  const [adet, setAdet] = useState(1);
  const [birimFiyat, setBirimFiyat] = useState("");
  const [paraBirimi, setParaBirimi] = useState("USD");
  
  // YENİ: KDV Oranı için state ekledik (Varsayılan 20)
  const [kdvOrani, setKdvOrani] = useState("20");

  useEffect(() => {
    if (!secilenId && urunler.length > 0) {
      setSecilenId(urunler[0].id);
    }
  }, [urunler, secilenId]);

  const secilenUrun = urunler.find((u) => u.id === secilenId);

  const fiyatGecerliMi = Number(birimFiyat) > 0;

  function ekle() {
    if (!secilenUrun || !fiyatGecerliMi) return;
    
    // DİKKAT: satirHesapla fonksiyonuna kdvOrani'nı da yolluyoruz. 
    // Birazdan hesaplama.js dosyasını da buna göre güncelleyeceğiz!
    const satir = satirHesapla(secilenUrun, en, boy, adet, Number(birimFiyat), paraBirimi, Number(kdvOrani));
    
    onEkle(satir);
    setBirimFiyat("");
  }

  if (yukleniyor) {
    return (
      <section className="panel">
        <h2 className="panel__baslik">Ürün Ekleme Ekranı</h2>
        <p className="bilgi-metni">Ürün listesi yükleniyor…</p>
      </section>
    );
  }

  if (hata) {
    return (
      <section className="panel">
        <h2 className="panel__baslik">Ürün Ekleme Ekranı</h2>
        <p className="hata-metni">Ürünler yüklenemedi: {hata}</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2 className="panel__baslik">Ürün Ekleme Ekranı</h2>

      <label className="alan">
        <span>Ürün Seçiniz</span>
        <select value={secilenId} onChange={(e) => setSecilenId(e.target.value)}>
          {urunler.map((urun) => (
            <option key={urun.id} value={urun.id}>
              {urun.aciklama}
            </option>
          ))}
        </select>
      </label>

      <div className="olcu-grid">
        <label className="alan">
          <span>En (cm)</span>
          <input
            type="number"
            min="0"
            step="10"
            value={en}
            onChange={(e) => setEn(Number(e.target.value))}
          />
        </label>
        <label className="alan">
          <span>Boy (cm)</span>
          <input
            type="number"
            min="0"
            step="10"
            value={boy}
            onChange={(e) => setBoy(Number(e.target.value))}
          />
        </label>
        <label className="alan">
          <span>Adet</span>
          <input
            type="number"
            min="1"
            step="1"
            value={adet}
            onChange={(e) => setAdet(Number(e.target.value))}
          />
        </label>
        
        {/* YENİ: KDV Oranı Seçim Alanı (Grid içine ekledik daha şık durur) */}
        <label className="alan">
          <span>KDV Oranı (%)</span>
          <select value={kdvOrani} onChange={(e) => setKdvOrani(e.target.value)}>
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="10">10</option>
            <option value="20">20</option>
          </select>
        </label>
      </div>

      <label className="alan">
        <span>
          Birim Fiyat ({secilenUrun?.hesap_turu === "adet" ? "adet" : "m²"} başına)
        </span>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Fiyatı girin"
            value={birimFiyat}
            onChange={(e) => setBirimFiyat(e.target.value)}
            style={{ flex: 1 }}
          />
          <select
            value={paraBirimi}
            onChange={(e) => setParaBirimi(e.target.value)}
            style={{ flex: "0 0 90px" }}
          >
            <option value="TRY">TL (₺)</option>
            <option value="USD">Dolar ($)</option>
            <option value="EUR">Euro (€)</option>
          </select>
        </div>
      </label>

      <button className="buton buton--birincil" onClick={ekle} disabled={!secilenUrun || !fiyatGecerliMi}>
        Hesapla ve Listeye Ekle
      </button>
    </section>
  );
}