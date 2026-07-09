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
    </aside>
  );
}
