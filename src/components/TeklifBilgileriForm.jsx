import FirmaOtomatikTamamlama from "./FirmaOtomatikTamamlama";

export default function TeklifBilgileriForm({ teklif, onDegistir }) {
  function alanGuncelle(alan, deger) {
    onDegistir({ ...teklif, [alan]: deger });
  }

  return (
    <aside className="panel panel--sidebar" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <h2 className="panel__baslik" style={{ marginBottom: "4px" }}>Teklif Bilgileri</h2>

      <label className="alan">
        <span>Firma Adı</span>
        <FirmaOtomatikTamamlama
          deger={teklif.musteriAdi}
          onSecim={(deger) => alanGuncelle("musteriAdi", deger)}
        />
      </label>

      <label className="alan">
        <span>İlgili Kişi</span>
        <input
          type="text"
          value={teklif.ilgiliKisi}
          onChange={(e) => alanGuncelle("ilgiliKisi", e.target.value)}
        />
      </label>

      <label className="alan">
        <span>Proje Adı</span>
        <input
          type="text"
          value={teklif.projeAdi}
          onChange={(e) => alanGuncelle("projeAdi", e.target.value)}
        />
      </label>

      <label className="alan">
        <span>Sipariş No (İmalat)</span>
        <input
          type="text"
          value={teklif.siparisNo || ""}
          onChange={(e) => alanGuncelle("siparisNo", e.target.value)}
        />
      </label>

      <label className="alan">
        <span>Teklif Tarihi</span>
        <input
          type="date"
          value={teklif.tarih.toISOString().slice(0, 10)}
          onChange={(e) => alanGuncelle("tarih", new Date(e.target.value))}
        />
      </label>

      {/* Notlar alanı küçültüldü (rows 7'den 3'e düşürüldü) */}
      <label className="alan">
        <span>Notlar</span>
        <textarea
          rows="3"
          value={teklif.notlar || ""}
          onChange={(e) => alanGuncelle("notlar", e.target.value)}
          placeholder="- Bu belge fatura yerine geçmez."
          style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #ccc", resize: "vertical", fontSize: "12px" }}
        />
      </label>

      <label className="alan">
        <span>İmzalayan Kişi</span>
        <input
          type="text"
          value={teklif.imzalayan || ""}
          onChange={(e) => alanGuncelle("imzalayan", e.target.value)}
          placeholder="Sercan Temel"
        />
      </label>

      <label className="alan">
        <span>Ödeme Şekli</span>
        <input
          type="text"
          value={teklif.odemeSekli || ""}
          onChange={(e) => alanGuncelle("odemeSekli", e.target.value)}
          placeholder="Örn: Peşin / 30 Gün Vadeli"
        />
      </label>

      {/* SİPARİŞ TESLİM SÜRESİ (Net Yan Yana Metin Kutusu + Belirgin Takvim Butonu) */}
      <label className="alan">
        <span>Sipariş Teslim Süresi</span>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <input
            type="text"
            value={teklif.teslimSuresi || ""}
            onChange={(e) => alanGuncelle("teslimSuresi", e.target.value)}
            placeholder="Örn: 15 Gün"
            style={{ flex: 1 }}
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
              width: "36px",
              height: "34px",
              cursor: "pointer",
              borderRadius: "4px",
              border: "1px solid #ccc",
              backgroundColor: "#f9f9f9",
              padding: "2px"
            }}
          />
        </div>
      </label>
    </aside>
  );
}