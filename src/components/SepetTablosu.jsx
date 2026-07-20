import { genelToplamHesapla, genelKdvHesapla, paraFormatla } from "../utils/hesaplama";

export default function SepetTablosu({ sepet, onTemizle, onSil, onDuzenle, onTekrarEt }) {
  if (sepet.length === 0) {
    return (
      <section className="panel">
        <h2 className="panel__baslik">Güncel Teklif İçeriği</h2>
        <p className="bilgi-metni">
          Listede ürün bulunmadığı için çıktı menüsü gizlenmiştir. Lütfen yukarıdan ürün hesaplayıp ekleyin.
        </p>
      </section>
    );
  }

  const genelToplamlar = genelToplamHesapla(sepet);
  const genelKdvler = genelKdvHesapla(sepet);

  return (
    <section className="panel">
      <h2 className="panel__baslik">Güncel Teklif İçeriği</h2>

      <table className="tablo">
        <thead>
          <tr>
            <th>Ürün Açıklaması</th>
            <th>Miktar / Detay</th>
            <th>Toplam Tutar</th>
            <th style={{ textAlign: "center", minWidth: "180px" }}>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {sepet.map((satir, index) => (
            <tr key={index}>
              <td>{satir.urunAciklamasi}</td>
              <td>{satir.miktarDetay}</td>
              <td>{paraFormatla(satir.toplamTutar, satir.paraBirimi)}</td>
              <td style={{ textAlign: "center" }}>
                
                {/* BUTONLAR BURAYA YAN YANA GELDİ */}
                <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                  <button 
                    onClick={() => onTekrarEt(satir)}
                    style={{ backgroundColor: "#6b7280", color: "white", border: "none", padding: "6px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}
                    title="Aynı ürünü formda tekrar aç"
                  >
                    Tekrar Et
                  </button>
                  <button 
                    onClick={() => onDuzenle(index, satir)}
                    style={{ backgroundColor: "#3b82f6", color: "white", border: "none", padding: "6px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}
                    title="Bu satırı düzenle"
                  >
                    Düzenle
                  </button>
                  <button 
                    onClick={() => onSil(index)}
                    style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "6px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}
                    title="Bu ürünü sepetten çıkar"
                  >
                    Sil
                  </button>
                </div>

              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {Object.entries(genelToplamlar).map(([paraBirimi, tutar]) => {
        const kdvTutari = genelKdvler[paraBirimi] || 0;
        const kdvDahilToplam = tutar + kdvTutari;

        return (
          <div key={paraBirimi} style={{ textAlign: "right", marginTop: "10px", fontSize: "16px", fontWeight: "bold" }}>
            <p style={{ margin: "2px 0" }}>Toplam: {paraFormatla(tutar, paraBirimi)}</p>
            <p style={{ margin: "2px 0" }}>KDV Toplamı: {paraFormatla(kdvTutari, paraBirimi)}</p>
            <p style={{ margin: "5px 0", color: "#007099", borderTop: "2px solid #ccc", paddingTop: "5px" }}>
              GENEL TOPLAM (KDV DAHİL): {paraFormatla(kdvDahilToplam, paraBirimi)}
            </p>
          </div>
        );
      })}

      <button className="buton buton--ikincil" onClick={onTemizle} style={{ marginTop: "15px" }}>
        Listeyi Temizle
      </button>
    </section>
  );
}