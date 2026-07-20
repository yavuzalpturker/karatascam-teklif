import { useState } from 'react';
import { paraFormatla } from '../utils/hesaplama';

export default function SepetTablosu({ sepet, onTemizle, onSil, onDuzenle, onTekrarEt, onTopluFiyatGuncelle }) {
  const [girilenToplamFiyat, setGirilenToplamFiyat] = useState("");
  const [hesaplananSonuc, setHesaplananSonuc] = useState(null);
  const [guncelSepet, setGuncelSepet] = useState(sepet);

  // Dışarıdan sepet güncellenirse local state'i de senkronize et
  const aktifSepet = guncelSepet.length > 0 ? guncelSepet : sepet;

  let toplamM2 = 0;
  aktifSepet.forEach((satir) => {
    const detay = satir.ozelAciklama || satir.miktarDetay || "";
    // m² değerini metnin içinden güvenle çekiyoruz (örn: "Toplam: 3.75 m²")
    const m2Match = detay.match(/Toplam:\s*([\d.]+)\s*m²/i);
    if (m2Match) {
      const m2 = Number(m2Match[1]);
      if (!isNaN(m2) && m2 > 0) {
        toplamM2 += m2;
      }
    } else {
      // Eğer miktarDetay doğrudan "3.75 m²" formatındaysa
      const duzMatch = detay.match(/^([\d.]+)\s*m²/i);
      if (duzMatch) {
        toplamM2 += Number(duzMatch[1]) || 0;
      }
    }
  });

  const birimFiyatHesaplaVeUygula = () => {
    const temizFiyatStr = girilenToplamFiyat.replace(/\./g, '').replace(',', '.');
    const toplamFiyat = Number(temizFiyatStr) || 0;

    if (toplamM2 > 0 && toplamFiyat > 0) {
      const m2BirimFiyati = toplamFiyat / toplamM2;
      setHesaplananSonuc(m2BirimFiyati);

      const yeniSepet = sepet.map((satir) => {
        let urunM2 = 0;
        const detay = satir.ozelAciklama || satir.miktarDetay || "";
        
        const m2Match = detay.match(/Toplam:\s*([\d.]+)\s*m²/i);
        if (m2Match) {
          urunM2 = Number(m2Match[1]);
        } else {
          const duzMatch = detay.match(/^([\d.]+)\s*m²/i);
          if (duzMatch) {
            urunM2 = Number(duzMatch[1]) || 0;
          }
        }

        const yeniToplamTutar = urunM2 * m2BirimFiyati;
        const yeniMiktarDetay = `${urunM2.toFixed(2)} m² × ${m2BirimFiyati.toFixed(2)} ₺`;

        return {
          ...satir,
          miktarDetay: yeniMiktarDetay,
          birimFiyat: m2BirimFiyati,
          toplamTutar: yeniToplamTutar
        };
      });

      setGuncelSepet(yeniSepet);
      if (onTopluFiyatGuncelle) {
        onTopluFiyatGuncelle(yeniSepet);
      }
    } else {
      alert(`Lütfen geçerli bir toplam fiyat girin!\nAlgılanan Toplam Alan: ${toplamM2.toFixed(2)} m²`);
    }
  };

  if (aktifSepet.length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#666", background: "#f9f9f9", borderRadius: "8px", margin: "20px 0" }}>
        Sepette henüz ürün bulunmuyor. Ürün ekleyerek teklif oluşturmaya başlayın.
      </div>
    );
  }

  return (
    <div style={{ marginTop: "20px", background: "white", padding: "20px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <h3 style={{ margin: 0, color: "#1f2937" }}>🛒 Teklif Sepeti</h3>
        <button 
          onClick={onTemizle} 
          style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}
        >
          🗑️ Sepeti Temizle
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
          <thead>
            <tr style={{ background: "#f3f4f6", borderBottom: "2px solid #e5e7eb" }}>
              <th style={{ padding: "10px" }}>Ürün Açıklaması</th>
              <th style={{ padding: "10px" }}>Özel Açıklama</th>
              <th style={{ padding: "10px", textAlign: "center" }}>Ölçü / Miktar</th>
              <th style={{ padding: "10px", textAlign: "center" }}>KDV</th>
              <th style={{ padding: "10px", textAlign: "right" }}>Toplam Tutar</th>
              <th style={{ padding: "10px", textAlign: "center" }}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {aktifSepet.map((satir, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "10px", fontWeight: "500" }}>{satir.urunAciklamasi}</td>
                <td style={{ padding: "10px", color: "#6b7280" }}>{satir.ozelAciklama || "-"}</td>
                <td style={{ padding: "10px", textAlign: "center", fontWeight: "bold", color: "#0d9488" }}>{satir.miktarDetay}</td>
                <td style={{ padding: "10px", textAlign: "center" }}>%{satir.kdvOrani}</td>
                <td style={{ padding: "10px", textAlign: "right", fontWeight: "bold", color: "#166534" }}>{paraFormatla(satir.toplamTutar, satir.paraBirimi)}</td>
                <td style={{ padding: "10px", textAlign: "center", display: "flex", gap: "6px", justifyContent: "center" }}>
                  <button onClick={() => onDuzenle(index, satir)} style={{ background: "#3b82f6", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>Düzenle</button>
                  <button onClick={() => onTekrarEt(satir)} style={{ background: "#10b981", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>Tekrar</button>
                  <button onClick={() => onSil(index)} style={{ background: "#ef4444", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* m² Birim Fiyat ve Otomatik Güncelleme Paneli */}
      <div style={{ marginTop: "25px", padding: "20px", background: "#f0fdf4", border: "2px solid #22c55e", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
        <div>
          <h4 style={{ margin: "0 0 5px 0", color: "#166534", fontSize: "16px" }}>📐 m² Birim Fiyat & Sepeti Güncelle</h4>
          <p style={{ margin: 0, fontSize: "13px", color: "#15803d" }}>
            Toplam Alan: <strong>{toplamM2.toFixed(2)} m²</strong> (Butona basınca her ürünün kendi m²'sine göre fiyatı yazılır)
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "#166534", marginBottom: "4px" }}>
              Toplam Fiyat (₺)
            </label>
            <input 
              type="text" 
              placeholder="Örn: 13500" 
              value={girilenToplamFiyat}
              onChange={(e) => setGirilenToplamFiyat(e.target.value)}
              style={{ padding: "10px", borderRadius: "6px", border: "1.5px solid #22c55e", fontSize: "16px", fontWeight: "bold", width: "130px", outline: "none", background: "white" }}
            />
          </div>

          <button 
            onClick={birimFiyatHesaplaVeUygula}
            style={{ backgroundColor: "#166534", color: "white", border: "none", padding: "11px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "14px", marginTop: "18px" }}
          >
            Fiyatları Güncelle
          </button>

          <div style={{ background: "white", padding: "10px 15px", borderRadius: "6px", border: "1px solid #bbf7d0", textAlign: "right", marginTop: "18px" }}>
            <span style={{ fontSize: "11px", display: "block", color: "#166534", fontWeight: "bold" }}>m² BİRİM FİYATI</span>
            <span style={{ fontSize: "20px", fontWeight: "800", color: "#15803d" }}>
              {hesaplananSonuc !== null ? `${hesaplananSonuc.toFixed(2)} ₺` : "0.00 ₺"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}