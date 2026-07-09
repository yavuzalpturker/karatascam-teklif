import { useState, useEffect } from "react";
import { satirHesapla } from "../utils/hesaplama";

export default function UrunEkleFormu({ urunler, yukleniyor, hata, onEkle }) {
  const [arama, setArama] = useState(""); // YENİ: Arama çubuğu için state
  const [secilenId, setSecilenId] = useState("");
  const [en, setEn] = useState(100);
  const [boy, setBoy] = useState(100);
  const [adet, setAdet] = useState(1);
  const [birimFiyat, setBirimFiyat] = useState("");
  const [paraBirimi, setParaBirimi] = useState("USD");
  const [kdvOrani, setKdvOrani] = useState("20");

  // YENİ: Arama metnine göre ürünleri filtreleme (Hem Kodu hem Açıklama içinde arar)
  const filtrelenmisUrunler = urunler.filter((urun) => {
    if (!arama) return true;
    const aramaMetni = arama.toLocaleLowerCase("tr-TR");
    const aciklama = (urun.aciklama || "").toLocaleLowerCase("tr-TR");
    const kodu = (urun.kodu || "").toLocaleLowerCase("tr-TR");
    
    return aciklama.includes(aramaMetni) || kodu.includes(aramaMetni);
  });

  // YENİ: Liste filtrelendiğinde ilk ürünü otomatik seçili hale getirme
  useEffect(() => {
    if (filtrelenmisUrunler.length > 0 && !filtrelenmisUrunler.find(u => u.id === secilenId)) {
      setSecilenId(filtrelenmisUrunler[0].id);
    }
  }, [filtrelenmisUrunler, secilenId]);

  const secilenUrun = urunler.find((u) => u.id === secilenId);
  const fiyatGecerliMi = Number(birimFiyat) > 0;

  function ekle() {
    if (!secilenUrun || !fiyatGecerliMi) return;
    
    const satir = satirHesapla(secilenUrun, en, boy, adet, Number(birimFiyat), paraBirimi, Number(kdvOrani));
    
    onEkle(satir);
    setBirimFiyat("");
    setArama(""); // Eklendikten sonra arama kutusunu da temizle ki yeni ürüne hazır olsun
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
        <span>Ürün Ara ve Seç</span>
        
        {/* YENİ: Arama Kutusu */}
        <input
          type="text"
          placeholder="Ürün adı veya kodu ile ara..."
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          style={{ 
            marginBottom: "8px", 
            width: "100%", 
            padding: "10px", 
            borderRadius: "6px", 
            border: "1px solid #ccc" 
          }}
        />
        
        {/* GÜNCELLENDİ: Ürün Seçim Kutusu */}
        <select 
          value={secilenId} 
          onChange={(e) => setSecilenId(e.target.value)}
          style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
        >
          {filtrelenmisUrunler.length === 0 ? (
            <option value="" disabled>Ürün bulunamadı...</option>
          ) : (
            filtrelenmisUrunler.map((urun) => (
              <option key={urun.id} value={urun.id}>
                {urun.kodu} - {urun.aciklama}
              </option>
            ))
          )}
        </select>
      </label>

      <div className="olcu-grid">
        <label className="alan">
          <span>En (cm)</span>
          <input type="number" min="0" step="10" value={en} onChange={(e) => setEn(Number(e.target.value))} />
        </label>
        <label className="alan">
          <span>Boy (cm)</span>
          <input type="number" min="0" step="10" value={boy} onChange={(e) => setBoy(Number(e.target.value))} />
        </label>
        <label className="alan">
          <span>Adet</span>
          <input type="number" min="1" step="1" value={adet} onChange={(e) => setAdet(Number(e.target.value))} />
        </label>
        
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
          Birim Fiyat ({secilenUrun?.hesap_turu === "ADET" ? "adet" : "m²"} başına)
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
          <select value={paraBirimi} onChange={(e) => setParaBirimi(e.target.value)} style={{ flex: "0 0 90px" }}>
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