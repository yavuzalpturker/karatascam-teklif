import { paraFormatla, genelToplamHesapla, genelKdvHesapla } from "../utils/hesaplama";

export default function SepetTablosu({ sepet, onTemizle, onSil, onDuzenle, onTekrarEt, onTopluFiyatGuncelle }) {
  if (!sepet || sepet.length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#64748b", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
        Sepet boş. Yukarıdan ürün ekleyebilirsiniz.
      </div>
    );
  }

  const genelToplamlar = genelToplamHesapla(sepet);
  const genelKdvler = genelKdvHesapla(sepet);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
        <button 
          onClick={onTemizle}
          style={{ backgroundColor: "#475569", color: "white", border: "none", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600", transition: "background 0.2s" }}
        >
          🗑️ Sepeti Temizle
        </button>
      </div>

      <div style={{ overflowX: "auto", border: "1px solid #cbd5e1", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", backgroundColor: "white" }}>
          <thead>
            <tr style={{ backgroundColor: "#0f2942", textAlign: "left", color: "white" }}>
              <th style={{ padding: "12px 16px", fontWeight: "600", borderBottom: "2px solid #0b1d2e" }}>Ürün Açıklaması</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", borderBottom: "2px solid #0b1d2e" }}>Özel Açıklama</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", borderBottom: "2px solid #0b1d2e" }}>Ölçü / Miktar</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", borderBottom: "2px solid #0b1d2e" }}>KDV</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", borderBottom: "2px solid #0b1d2e" }}>Toplam Tutar</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", borderBottom: "2px solid #0b1d2e", textAlign: "center" }}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {sepet.map((satir, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #e2e8f0", backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                <td style={{ padding: "12px 16px", fontWeight: "500", color: "#1e293b" }}>{satir.urunAciklamasi}</td>
                <td style={{ padding: "12px 16px", color: "#64748b" }}>{satir.ozelAciklama || "-"}</td>
                <td style={{ padding: "12px 16px", color: "#334155", fontWeight: "500" }}>{satir.miktarDetay}</td>
                <td style={{ padding: "12px 16px", color: "#475569" }}>%{satir.kdvOrani}</td>
                <td style={{ padding: "12px 16px", fontWeight: "700", color: "#0f2942" }}>
                  {paraFormatla(satir.toplamTutar, satir.paraBirimi)}
                </td>
                <td style={{ padding: "12px 16px", textAlign: "center", whiteSpace: "nowrap" }}>
                  <div style={{ display: "inline-flex", gap: "6px", justifyContent: "center" }}>
                    <button 
                      onClick={() => onDuzenle(index, satir)}
                      style={{ backgroundColor: "#1e3a8a", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "500" }}
                    >
                      Düzenle
                    </button>
                    <button 
                      onClick={() => onTekrarEt(satir)}
                      style={{ backgroundColor: "#334155", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "500" }}
                    >
                      Tekrar
                    </button>
                    <button 
                      onClick={() => onSil(index)}
                      style={{ backgroundColor: "#991b1b", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "500" }}
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

      {/* KURUMSAL TOPLAM ALANI */}
      <div style={{ marginTop: "15px", padding: "20px 24px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #cbd5e1", display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-end", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        {Object.entries(genelToplamlar).map(([paraBirimi, tutar]) => {
          const kdvTutar = genelKdvler[paraBirimi] || 0;
          const kdvDahilToplam = tutar + kdvTutar;

          return (
            <div key={paraBirimi} style={{ textAlign: "right", fontSize: "16px", color: "#334155", fontWeight: "600" }}>
              <span>Ara Toplam ({paraBirimi}): {paraFormatla(tutar, paraBirimi)} + KDV</span>
              <span style={{ margin: "0 15px", color: "#cbd5e1" }}>|</span>
              <span>KDV: {paraFormatla(kdvTutar, paraBirimi)}</span>
              <span style={{ margin: "0 15px", color: "#cbd5e1" }}>|</span>
              <span style={{ fontSize: "19px", color: "#0f2942", fontWeight: "700" }}>KDV Dahil Toplam: {paraFormatla(kdvDahilToplam, paraBirimi)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}