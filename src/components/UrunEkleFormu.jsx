import { useState } from "react";
import { satirHesapla } from "../utils/hesaplama";

export default function UrunEkleFormu({ urunler, yukleniyor, hata, onEkle }) {
  const [arama, setArama] = useState("");
  const [secilenId, setSecilenId] = useState("");
  const [listeAcik, setListeAcik] = useState(false);
  
  const [ozelAciklama, setOzelAciklama] = useState("");

  // YENİ: En boy yerine direkt Miktar ve Birim seçtiriyoruz
  const [miktar, setMiktar] = useState(1);
  const [secilenBirim, setSecilenBirim] = useState("m²");

  const [birimFiyat, setBirimFiyat] = useState("");
  const [paraBirimi, setParaBirimi] = useState("USD");
  const [kdvOrani, setKdvOrani] = useState("20");

  const aciklamaBul = (u) => u?.Açıklama || u?.açıklama || u?.aciklama || u?.Aciklama || "İsimsiz Ürün";
  const koduBul = (u) => u?.Kodu || u?.kodu || u?.code || "";

  const filtrelenmisUrunler = urunler.filter((urun) => {
    if (arama.length < 3) return false;
    const aramaMetni = arama.toLocaleLowerCase("tr-TR");
    const tumBilgiler = Object.values(urun).join(" ").toLocaleLowerCase("tr-TR");
    return tumBilgiler.includes(aramaMetni);
  });

  const secilenUrun = urunler.find((u) => u.id === secilenId);
  const fiyatGecerliMi = Number(birimFiyat) > 0;

  const handleAramaDegisimi = (e) => {
    setArama(e.target.value);
    setSecilenId("");
    setListeAcik(true);
  };

  const handleUrunSec = (urun) => {
    setSecilenId(urun.id);
    setArama(`${koduBul(urun)} - ${aciklamaBul(urun)}`);
    setListeAcik(false);
  };

  function ekle() {
    if (!secilenUrun || !fiyatGecerliMi) return;

    const duzeltilmisUrun = {
      ...secilenUrun,
      "Ana Birim": secilenBirim.toUpperCase(), // Arka plandaki hesaplama şaşmasın diye birimi kilitliyoruz
      aciklama: aciklamaBul(secilenUrun),
      Açıklama: aciklamaBul(secilenUrun)
    };

    // Arka plandaki matematiksel formül bozulmasın diye en=100, boy=100 (yani 1 birim) gönderip 
    // senin girdiğin miktarla çarptırıyoruz. Sonuç kusursuz çıkacak.
    const satir = satirHesapla(duzeltilmisUrun, 100, 100, miktar, Number(birimFiyat), paraBirimi, Number(kdvOrani));

    // PDF'e gidecek özel verilerimizi satıra ekliyoruz
    satir.ozelAciklama = ozelAciklama;
    satir.miktar = miktar;
    satir.secilenBirim = secilenBirim;
    satir.birimFiyat = Number(birimFiyat);

    onEkle(satir);
    
    setBirimFiyat("");
    setArama("");
    setSecilenId("");
    setOzelAciklama(""); 
  }

  if (yukleniyor) {
    return (
      <section className="panel">
        <h2 className="panel__baslik">Ürün Ekleme Ekranı</h2>
        <p className="bilgi-metni">Ürün listesi yükleniyor, lütfen bekleyin…</p>
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
        <span>Ürün Ara ve Seç (En az 3 harf giriniz)</span>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Ürün adı veya kodu yazın..."
            value={arama}
            onChange={handleAramaDegisimi}
            autoComplete="off"
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
          
          {listeAcik && arama.length >= 3 && (
            <ul style={{ 
              position: "absolute", top: "100%", left: 0, right: 0, maxHeight: "250px", 
              overflowY: "auto", backgroundColor: "white", border: "1px solid #ccc", 
              borderRadius: "0 0 6px 6px", zIndex: 1000, padding: 0, margin: 0, listStyle: "none",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
            }}>
              {filtrelenmisUrunler.length === 0 ? (
                <li style={{ padding: "10px", color: "#666" }}>Ürün bulunamadı...</li>
              ) : (
                filtrelenmisUrunler.map((urun) => (
                  <li 
                    key={urun.id} 
                    onClick={() => handleUrunSec(urun)}
                    style={{ padding: "10px", borderBottom: "1px solid #eee", cursor: "pointer", fontSize: "14px" }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = "#f0f8ff"}
                    onMouseLeave={(e) => e.target.style.backgroundColor = "white"}
                  >
                    <strong>{koduBul(urun)}</strong> - {aciklamaBul(urun)}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </label>

      <label className="alan">
        <span>Ürün Açıklaması / Detay (PDF'teki Açıklama Sütununa Yazılır)</span>
        <input
          type="text"
          placeholder="Örn: 100x100 cm Rodajlı, Bizoteli veya Özel İmalat..."
          value={ozelAciklama}
          onChange={(e) => setOzelAciklama(e.target.value)}
          style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
        />
      </label>

      <div className="olcu-grid">
        <label className="alan">
          <span>Miktar</span>
          <input type="number" min="0.01" step="0.01" value={miktar} onChange={(e) => setMiktar(Number(e.target.value))} />
        </label>
        
        <label className="alan">
          <span>Birim</span>
          <select value={secilenBirim} onChange={(e) => setSecilenBirim(e.target.value)}>
            <option value="ad">Adet (ad)</option>
            <option value="m²">Metrekare (m²)</option>
            <option value="mt">Metretül (mt)</option>
          </select>
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
          Birim Fiyat (1 {secilenBirim} başına)
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