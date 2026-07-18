import { useState } from "react";
import { satirHesapla } from "../utils/hesaplama";

export default function UrunEkleFormu({ urunler = [], yukleniyor, hata, onEkle }) {
  const [arama, setArama] = useState("");
  const [secilenId, setSecilenId] = useState("");
  const [listeAcik, setListeAcik] = useState(false);
  
  const [ozelAciklama, setOzelAciklama] = useState("");

  const [en, setEn] = useState("");
  const [boy, setBoy] = useState("");
  const [miktar, setMiktar] = useState("1"); // Başlangıç değerini yazı(string) yaptık
  const [secilenBirim, setSecilenBirim] = useState("m²");

  const [birimFiyat, setBirimFiyat] = useState("");
  const [paraBirimi, setParaBirimi] = useState("USD");
  const [kdvOrani, setKdvOrani] = useState("20");

  const aciklamaBul = (u) => u?.Açıklama || u?.açıklama || u?.aciklama || u?.Aciklama || "İsimsiz Ürün";
  const koduBul = (u) => u?.Kodu || u?.kodu || u?.code || "";

  const filtrelenmisUrunler = (urunler || []).filter((urun) => {
    if (arama.length < 3) return false;
    const aramaMetni = arama.toLocaleLowerCase("tr-TR");
    const tumBilgiler = Object.values(urun).join(" ").toLocaleLowerCase("tr-TR");
    return tumBilgiler.includes(aramaMetni);
  });

  // BURASI DEĞİŞTİ: Eğer secilenId "ozel_urun" ise, arama metninden sahte bir ürün objesi yaratıyoruz.
  const secilenUrun = secilenId === "ozel_urun" 
    ? { id: "ozel_urun", Kodu: "ÖZEL", Açıklama: arama.toUpperCase() }
    : (urunler || []).find((u) => u.id === secilenId);

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

  // BURASI EKLENDİ: Özel ürün seçme fonksiyonu
  const handleOzelUrunSec = () => {
    setSecilenId("ozel_urun");
    setListeAcik(false);
  };

  function ekle() {
    if (!secilenUrun || !fiyatGecerliMi) return;

    let hesaplananMiktar = Number(miktar) || 1;
    let ekstraAciklama = "";

    if (secilenBirim === "m²") {
      const enDegeri = Number(en) || 0;
      const boyDegeri = Number(boy) || 0;
      
      if (enDegeri === 0 || boyDegeri === 0) {
        alert("Lütfen geçerli En ve Boy cm değerlerini giriniz!");
        return;
      }
      
      hesaplananMiktar = ((enDegeri * boyDegeri) / 10000) * (Number(miktar) || 1);
      ekstraAciklama = ` (${enDegeri}x${boyDegeri} cm - ${Number(miktar) || 1} Adet)`;
    } 
    else if (secilenBirim === "mt") {
      const boyDegeri = Number(boy) || 0;

      if (boyDegeri === 0) {
        alert("Lütfen geçerli Uzunluk/Boy cm değerini giriniz!");
        return;
      }

      hesaplananMiktar = (boyDegeri / 100) * (Number(miktar) || 1);
      ekstraAciklama = ` (${boyDegeri} cm - ${Number(miktar) || 1} Adet)`;
    }

    const duzeltilmisUrun = {
      ...secilenUrun,
      "Ana Birim": secilenBirim.toUpperCase(), 
      aciklama: aciklamaBul(secilenUrun),
      Açıklama: aciklamaBul(secilenUrun)
    };

    const satir = satirHesapla(duzeltilmisUrun, 100, 100, hesaplananMiktar, Number(birimFiyat), paraBirimi, Number(kdvOrani));

    satir.ozelAciklama = ozelAciklama + ekstraAciklama;
    satir.miktar = Number(hesaplananMiktar.toFixed(3)); 
    satir.secilenBirim = secilenBirim;
    satir.birimFiyat = Number(birimFiyat);
    satir.birim = secilenBirim; 
    satir.Birim = secilenBirim;

    if (onEkle) {
      onEkle(satir);
    } 
    
    setBirimFiyat("");
    setArama("");
    setSecilenId("");
    setOzelAciklama(""); 
    setEn("");
    setBoy("");
    setMiktar("1"); // Form temizlenince yine string olarak 1 atıyoruz
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
                <li style={{ padding: "10px", color: "#666" }}>Veritabanında eşleşen ürün bulunamadı...</li>
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

              {/* BURASI EKLENDİ: Arama yapılmışsa her zaman en altta çıkan Özel Ürün Butonu */}
              {secilenId !== "ozel_urun" && (
                <li 
                  onClick={handleOzelUrunSec}
                  style={{ 
                    padding: "12px 10px", 
                    backgroundColor: "#e6fcff", 
                    borderTop: "2px solid #b3e6ff", 
                    cursor: "pointer", 
                    color: "#007099", 
                    fontWeight: "bold", 
                    textAlign: "center",
                    position: "sticky",
                    bottom: 0
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#cceeff"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "#e6fcff"}
                >
                  ➕ "{arama}" Özel Ürün Olarak Seç
                </li>
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
          <span>Birim Seçimi</span>
          <select value={secilenBirim} onChange={(e) => setSecilenBirim(e.target.value)}>
            <option value="m²">Metrekare (m²)</option>
            <option value="ad">Adet (ad)</option>
            <option value="mt">Metretül (mt)</option>
          </select>
        </label>

        {secilenBirim === "m²" ? (
          <>
            <label className="alan">
              <span>En (cm)</span>
              <input type="number" min="0" placeholder="Örn: 150" value={en} onChange={(e) => setEn(e.target.value)} />
            </label>
            <label className="alan">
              <span>Boy (cm)</span>
              <input type="number" min="0" placeholder="Örn: 200" value={boy} onChange={(e) => setBoy(e.target.value)} />
            </label>
            <label className="alan">
              <span>Adet</span>
              <input type="number" min="1" step="1" value={miktar} onChange={(e) => setMiktar(e.target.value)} />
            </label>
          </>
        ) : secilenBirim === "mt" ? (
          <>
            <label className="alan">
              <span>Uzunluk / Boy (cm)</span>
              <input type="number" min="0" placeholder="Örn: 200" value={boy} onChange={(e) => setBoy(e.target.value)} />
            </label>
            <label className="alan">
              <span>Adet</span>
              <input type="number" min="1" step="1" value={miktar} onChange={(e) => setMiktar(e.target.value)} />
            </label>
          </>
        ) : (
          <label className="alan">
            <span>Miktar</span>
            <input type="number" min="0.01" step="0.01" value={miktar} onChange={(e) => setMiktar(e.target.value)} />
          </label>
        )}
        
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