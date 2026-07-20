import { useState, useMemo } from 'react';

export default function M2FiyatHesaplayici() {
  const [satirlar, setSatirlar] = useState([{ id: 1, en: "", boy: "", adet: "1" }]);
  const [toplamFiyat, setToplamFiyat] = useState("");
  const [sonuc, setSonuc] = useState(null);
  const [hata, setHata] = useState("");

  const satirEkle = () => {
    setSatirlar([...satirlar, { id: Date.now(), en: "", boy: "", adet: "1" }]);
  };

  const satirSil = (id) => {
    if (satirlar.length > 1) {
      setSatirlar(satirlar.filter((s) => s.id !== id));
    }
  };

  const degerDegistir = (id, alan, deger) => {
    const sadeceRakam = deger.replace(/[^0-9.]/g, '');
    setSatirlar(satirlar.map((s) => (s.id === id ? { ...s, [alan]: sadeceRakam } : s)));
  };

  const toplamFiyatDegistir = (deger) => {
    const sadeceRakam = deger.replace(/[^0-9.]/g, '');
    setToplamFiyat(sadeceRakam);
  };

  const satirM2Listesi = useMemo(() => {
    return satirlar.map((s) => {
      const en = Number(s.en) || 0;
      const boy = Number(s.boy) || 0;
      const adet = Number(s.adet) || 1;
      const tekM2 = (en * boy) / 1000000;
      return tekM2 * adet;
    });
  }, [satirlar]);

  const genelToplamM2 = useMemo(
    () => satirM2Listesi.reduce((toplam, m2) => toplam + m2, 0),
    [satirM2Listesi]
  );

  const hesapla = () => {
    setHata("");
    const fiyat = Number(toplamFiyat) || 0;

    if (genelToplamM2 <= 0) {
      setHata("Lütfen en az bir satıra geçerli En ve Boy değeri girin.");
      return;
    }
    if (fiyat <= 0) {
      setHata("Lütfen toplam fiyatı girin.");
      return;
    }

    const m2BirimFiyati = fiyat / genelToplamM2;
    setSonuc({
      toplamM2: genelToplamM2.toFixed(3),
      m2Fiyati: m2BirimFiyati.toFixed(2),
      toplamFiyat: fiyat
    });
  };

  const temizle = () => {
    setSatirlar([{ id: Date.now(), en: "", boy: "", adet: "1" }]);
    setToplamFiyat("");
    setSonuc(null);
    setHata("");
  };

  const paraFormat = (deger) =>
    Number(deger).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div style={{
      position: "absolute",
      top: "85px", // Üst barın hemen altından başlar
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "#f1f5f9",
      zIndex: 999,
      padding: "30px 40px",
      boxSizing: "border-box",
      overflowY: "auto",
      fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        background: "#ffffff",
        padding: "40px",
        borderRadius: "16px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        border: "1px solid #e2e8f0"
      }}>

        {/* Başlık */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "15px", marginBottom: "8px" }}>
          <div style={{ flexShrink: 0, width: "50px", height: "50px", borderRadius: "12px", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px" }}>
            📐
          </div>
          <div>
            <h2 style={{ fontSize: "28px", color: "#0f172a", margin: 0, fontWeight: 700, lineHeight: 1.3 }}>
              Toplam Fiyattan m² Birim Fiyatı Bulma
            </h2>
            <p style={{ fontSize: "16px", color: "#64748b", marginTop: "6px", marginBottom: "0px", lineHeight: 1.5 }}>
              Ölçüleri ve verilen toplam fiyatı girin; camın/aynanın m² birim fiyatını otomatik hesaplayalım.
            </p>
          </div>
        </div>

        <hr style={{ border: "0", borderTop: "2px solid #e2e8f0", margin: "30px 0" }} />

        {/* Ölçü satırları (Yana doğru esneyen Grid Yapısı - Ekranı ful dolu gösterir) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px", marginBottom: "25px" }}>
          {satirlar.map((satir, index) => (
            <div
              key={satir.id}
              style={{
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                borderRadius: "12px",
                padding: "20px",
                boxSizing: "border-box",
                boxShadow: "0 2px 6px rgba(0,0,0,0.02)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "15px" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: "28px", height: "28px", borderRadius: "50%",
                  background: "#0f172a", color: "white", fontSize: "14px", fontWeight: 700
                }}>
                  {index + 1}
                </span>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {satirM2Listesi[index] > 0 && (
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "#0d9488", background: "#f0fdfa", padding: "5px 12px", borderRadius: "20px", border: "1px solid #99f6e4" }}>
                      {satirM2Listesi[index].toFixed(3)} m²
                    </span>
                  )}
                  <button
                    onClick={() => satirSil(satir.id)}
                    disabled={satirlar.length === 1}
                    aria-label="Satırı sil"
                    style={{
                      padding: "6px 14px",
                      backgroundColor: satirlar.length === 1 ? "#e2e8f0" : "#fee2e2",
                      color: satirlar.length === 1 ? "#94a3b8" : "#dc2626",
                      border: "none", borderRadius: "6px",
                      cursor: satirlar.length === 1 ? "not-allowed" : "pointer",
                      fontWeight: 600, fontSize: "13.5px"
                    }}
                  >
                    Sil
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 90px", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "13.5px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "6px" }}>En (mm)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="1130"
                    value={satir.en}
                    onChange={(e) => degerDegistir(satir.id, "en", e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "13.5px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "6px" }}>Boy (mm)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="1200"
                    value={satir.boy}
                    onChange={(e) => degerDegistir(satir.id, "boy", e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "13.5px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "6px" }}>Adet</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={satir.adet}
                    onChange={(e) => degerDegistir(satir.id, "adet", e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={satirEkle}
          style={{
            padding: "16px", backgroundColor: "#f0f9ff", color: "#0284c7",
            border: "2px dashed #38bdf8", borderRadius: "10px", cursor: "pointer",
            fontWeight: 700, width: "100%", marginBottom: "30px", fontSize: "16px"
          }}
        >
          ➕ Yeni Ölçü Satırı Ekle
        </button>

        {/* Genel toplam m² önizleme */}
        {genelToplamM2 > 0 && (
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "10px",
            padding: "16px 24px", marginBottom: "30px", fontSize: "17px"
          }}>
            <span style={{ color: "#334155", fontWeight: 700 }}>Toplam Alan (Tüm Satırlar)</span>
            <span style={{ color: "#0f172a", fontWeight: 800, fontSize: "20px" }}>{genelToplamM2.toFixed(3)} m²</span>
          </div>
        )}

        <hr style={{ border: "0", borderTop: "2px solid #e2e8f0", margin: "30px 0" }} />

        {/* Toplam fiyat + hesapla */}
        <div style={{ display: "flex", gap: "25px", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 2, minWidth: "300px" }}>
            <label style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", display: "block", marginBottom: "8px" }}>
              Bu Ölçüler İçin İstenen Toplam Fiyat (₺)
            </label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Örn: 13000"
              value={toplamFiyat}
              onChange={(e) => toplamFiyatDegistir(e.target.value)}
              style={{ ...inputStyle, padding: "18px", fontSize: "22px", fontWeight: 700, border: "2px solid #10b981", background: "#f8fafc" }}
            />
          </div>

          <button
            onClick={hesapla}
            style={{
              flex: 1, minWidth: "240px", padding: "20px", fontSize: "19px", backgroundColor: "#10b981", color: "white",
              border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 700,
              boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)"
            }}
          >
            🧮 Birim Fiyatı Hesapla
          </button>
        </div>

        {hata && (
          <div style={{ marginTop: "20px", padding: "16px 20px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#b91c1c", fontSize: "16px", fontWeight: 600 }}>
            {hata}
          </div>
        )}

        {/* Sonuç Ekranı */}
        {sonuc && (
          <div style={{ marginTop: "35px", padding: "35px", backgroundColor: "#f0fdf4", border: "2px solid #22c55e", borderRadius: "14px" }}>
            <h3 style={{ margin: "0 0 20px 0", color: "#166534", fontSize: "22px", fontWeight: 700, textAlign: "center" }}>
              ✅ Hesaplama Sonucu
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", textAlign: "center" }}>
              <div style={{ background: "white", borderRadius: "10px", padding: "20px", border: "1px solid #bbf7d0" }}>
                <div style={{ fontSize: "15px", color: "#166534", fontWeight: 600, marginBottom: "6px" }}>Toplam Alan</div>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#15803d" }}>{sonuc.toplamM2} m²</div>
              </div>
              <div style={{ background: "white", borderRadius: "10px", padding: "20px", border: "1px solid #bbf7d0" }}>
                <div style={{ fontSize: "15px", color: "#166534", fontWeight: 600, marginBottom: "6px" }}>m² Birim Fiyatı</div>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#15803d" }}>{paraFormat(sonuc.m2Fiyati)} ₺</div>
              </div>
              <div style={{ background: "white", borderRadius: "10px", padding: "20px", border: "1px solid #bbf7d0" }}>
                <div style={{ fontSize: "15px", color: "#166534", fontWeight: 600, marginBottom: "6px" }}>Toplam Fiyat</div>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#15803d" }}>{paraFormat(sonuc.toplamFiyat)} ₺</div>
              </div>
            </div>
            <button
              onClick={temizle}
              style={{
                marginTop: "25px", padding: "16px 25px", backgroundColor: "white", color: "#166534",
                border: "2px solid #166534", borderRadius: "8px", cursor: "pointer", fontWeight: 700,
                fontSize: "16px", width: "100%"
              }}
            >
              Yeni Hesaplama Yap
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "8px",
  border: "1px solid #94a3b8",
  fontSize: "16px",
  outline: "none",
  background: "white",
  boxSizing: "border-box"
};