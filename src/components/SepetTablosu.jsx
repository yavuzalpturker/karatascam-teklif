import { paraFormatla, genelToplamHesapla, genelKdvHesapla } from "../utils/hesaplama";

export default function SepetTablosu({ sepet, onTemizle, onSil, onDuzenle, onTekrarEt, onTopluFiyatGuncelle }) {
  if (!sepet || sepet.length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#64748b", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
        Sepet boş. Yukarıdan ürün ekleyebilirsiniz.
      </div>
    );
  }

  // Genel toplam ve KDV hesaplamaları
  const genelToplamlar = genelToplamHesapla(sepet);
  const genelKdvler = genelKdvHesapla(sepet);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
        <button 
          onClick={onTemizle}
          style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}
        >
          🗑️ Sepeti Temizle
        </button>
      </div>

      <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", backgroundColor: "white" }}>
          <thead>
            <tr style={{ backgroundColor: "#f1f5f9", textAlign: "left", color: "#334155" }}>
              <th style={{ padding: "12px", borderBottom: "2px solid #cbd5e1" }}>Ürün Açıklaması</th>
              <th style={{ padding: "12px", borderBottom: "2px solid #cbd5e1" }}>Özel Açıklama</th>
              <th style={{ padding: "12px", borderBottom: "2px solid #cbd5e1" }}>Ölçü / Miktar</th>
              <th style={{ padding: "12px", borderBottom: "2px solid #cbd5e1" }}>KDV</th>
              <th style={{ padding: "12px", borderBottom: "2px solid #cbd5e1" }}>Toplam Tutar</th>
              <th style={{ padding: "12px", borderBottom: "2px solid #cbd5e1", textAlign: "center" }}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {sepet.map((satir, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "12px", fontWeight: "500", color: "#1e293b" }}>{satir.urunAciklamasi}</td>
                <td style={{ padding: "12px", color: "#64748b" }}>{satir.ozelAciklama || "-"}</td>
                <td style={{ padding: "12px", color: "#0d9488", fontWeight: "600" }}>{satir.miktarDetay}</td>
                <td style={{ padding: "12px", color: "#475569" }}>%{satir.kdvOrani}</td>
                <td style={{ padding: "12px", fontWeight: "700", color: "#16a34a" }}>
                  {paraFormatla(satir.toplamTutar, satir.paraBirimi)}
                </td>
                <td style={{ padding: "12px", textAlign: "center", whiteSpace: "nowrap" }}>
                  <div style={{ display: "inline-flex", gap: "5px", justifyContent: "center" }}>
                    <button 
                      onClick={() => onDuzenle(index, satir)}
                      style={{ backgroundColor: "#3b82f6", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}
                    >
                      Düzenle
                    </button>
                    <button 
                      onClick={() => onTekrarEt(satir)}
                      style={{ backgroundColor: "#10b981", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}
                    >
                      Tekrar
                    </button>
                    <button 
                      onClick={() => onSil(index)}
                      style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}
                    >
                      Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DEV BOYUTLU ESKİ ORİJİNAL TOPLAM ALANI */}
      <div style={{ marginTop: "15px", padding: "20px 24px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #cbd5e1", display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-end" }}>
        {Object.entries(genelToplamlar).map(([paraBirimi, tutar]) => {
          const kdvTutar = genelKdvler[paraBirimi] || 0;
          const kdvDahilToplam = tutar + kdvTutar;

          return (
            <div key={paraBirimi} style={{ textAlign: "right", fontSize: "18px", color: "#0f2942", fontWeight: "bold" }}>
              <span>Ara Toplam ({paraBirimi}): {paraFormatla(tutar, paraBirimi)} + KDV</span>
              <span style={{ margin: "0 15px", color: "#94a3b8" }}>|</span>
              <span>KDV: {paraFormatla(kdvTutar, paraBirimi)}</span>
              <span style={{ margin: "0 15px", color: "#94a3b8" }}>|</span>
              <span style={{ fontSize: "20px", color: "#16a34a" }}>KDV Dahil Toplam: {paraFormatla(kdvDahilToplam, paraBirimi)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}