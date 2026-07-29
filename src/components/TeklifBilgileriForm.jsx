import FirmaOtomatikTamamlama from "./FirmaOtomatikTamamlama";

export default function TeklifBilgileriForm({ teklif, onDegistir }) {
  function alanGuncelle(alan, deger) {
    onDegistir({ ...teklif, [alan]: deger });
  }

  return (
    <aside className="panel panel--sidebar" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "12px" }}>
      <h2 className="panel__baslik" style={{ marginBottom: "2px", fontSize: "15px" }}>Teklif Bilgileri</h2>

      <label className="alan" style={{ fontSize: "12px" }}>
        <span>Firma Adı</span>
        <FirmaOtomatikTamamlama
          deger={teklif.musteriAdi || ""}
          onSecim={(deger) => alanGuncelle("musteriAdi", deger)}
        />
      </label>

      <label className="alan" style={{ fontSize: "12px" }}>
        <span>İlgili Kişi</span>
        <input
          type="text"
          value={teklif.ilgiliKisi || ""}
          onChange={(e) => alanGuncelle("ilgiliKisi", e.target.value)}
          style={{ padding: "6px", fontSize: "12px" }}
        />
      </label>

      <label className="alan" style={{ fontSize: "12px" }}>
        <span>Proje Adı</span>
        <input
          type="text"
          value={teklif.projeAdi || ""}
          onChange={(e) => alanGuncelle("projeAdi", e.target.value)}
          style={{ padding: "6px", fontSize: "12px" }}
        />
      </label>

      <label className="alan" style={{ fontSize: "12px" }}>
        <span>Sipariş No (İmalat)</span>
        <input
          type="text"
          value={teklif.siparisNo || ""}
          onChange={(e) => alanGuncelle("siparisNo", e.target.value)}
          style={{ padding: "6px", fontSize: "12px" }}
        />
      </label>

      <label className="alan" style={{ fontSize: "12px" }}>
        <span>Teklif Tarihi</span>
        <input
          type="date"
          value={teklif.tarih ? new Date(teklif.tarih).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)}
          onChange={(e) => alanGuncelle("tarih", new Date(e.target.value))}
          style={{ padding: "6px", fontSize: "12px" }}
        />
      </label>

      <label className="alan" style={{ fontSize: "12px" }}>
        <span>Notlar</span>
        <textarea
          rows="2"
          value={teklif.notlar || ""}
          onChange={(e) => alanGuncelle("notlar", e.target.value)}
          placeholder="- Bu belge fatura yerine geçmez."
          style={{ width: "100%", padding: "5px", borderRadius: "5px", border: "1px solid #ccc", resize: "vertical", fontSize: "11px" }}
        />
      </label>

      <label className="alan" style={{ fontSize: "12px" }}>
        <span>İmzalayan Kişi</span>
        <input
          type="text"
          value={teklif.imzalayan || ""}
          onChange={(e) => alanGuncelle("imzalayan", e.target.value)}
          placeholder="Sercan Temel"
          style={{ padding: "6px", fontSize: "12px" }}
        />
      </label>

      <label className="alan" style={{ fontSize: "12px" }}>
        <span>Ödeme Şekli</span>
        <input
          type="text"
          value={teklif.odemeSekli || ""}
          onChange={(e) => alanGuncelle("odemeSekli", e.target.value)}
          placeholder="Peşin / 30 Gün"
          style={{ padding: "6px", fontSize: "12px" }}
        />
      </label>

      <label className="alan" style={{ fontSize: "12px" }}>
        <span>Sipariş Teslim Süresi</span>
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          <input
            type="text"
            value={teklif.teslimSuresi || ""}
            onChange={(e) => alanGuncelle("teslimSuresi", e.target.value)}
            placeholder="15 Gün"
            style={{ flex: 1, padding: "6px", fontSize: "12px" }}
          />
          <input
            type="date"
            onChange={(e) => {
              if (e.target.value) {
                const [yil, ay, gun] = e.target.value.split("-");
                alanGuncelle("teslimSuresi", `${gun}.${ay}.${yil}`);
              }
            }}
            title="Takvimden Tarih Seç"
            style={{
              width: "30px", height: "30px", cursor: "pointer", borderRadius: "4px",
              border: "1px solid #ccc", backgroundColor: "#f9f9f9", padding: "1px"
            }}
          />
        </div>
      </label>
    </aside>
  );
}