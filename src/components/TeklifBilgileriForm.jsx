export default function TeklifBilgileriForm({ teklif, onDegistir }) {
  function alanGuncelle(alan, deger) {
    onDegistir({ ...teklif, [alan]: deger });
  }

  return (
    <aside className="panel panel--sidebar">
      <h2 className="panel__baslik">Teklif Bilgileri</h2>

      <label className="alan">
        <span>Firma Adı</span>
        <input
          type="text"
          value={teklif.musteriAdi}
          onChange={(e) => alanGuncelle("musteriAdi", e.target.value)}
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
        <span>Teklif Tarihi</span>
        <input
          type="date"
          value={teklif.tarih.toISOString().slice(0, 10)}
          onChange={(e) => alanGuncelle("tarih", new Date(e.target.value))}
        />
      </label>

      {/* YENİ: Notlar için geniş metin alanı */}
      <label className="alan">
        <span>Notlar (PDF'in altına eklenecek)</span>
        <textarea
          rows="7"
          value={teklif.notlar || ""}
          onChange={(e) => alanGuncelle("notlar", e.target.value)}
          placeholder="- Bu belge fatura yerine geçmez.&#10;- Fabrika teslim fiyatımızdır."
          style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", resize: "vertical" }}
        />
      </label>
    </aside>
  );
}