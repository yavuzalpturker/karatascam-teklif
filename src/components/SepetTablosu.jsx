import { genelToplamHesapla, paraFormatla } from "../utils/hesaplama";

export default function SepetTablosu({ sepet, onTemizle }) {
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

  return (
    <section className="panel">
      <h2 className="panel__baslik">Güncel Teklif İçeriği</h2>

      <table className="tablo">
        <thead>
          <tr>
            <th>Ürün Açıklaması</th>
            <th>Miktar / Detay</th>
            <th>Toplam Tutar</th>
          </tr>
        </thead>
        <tbody>
          {sepet.map((satir, index) => (
            <tr key={index}>
              <td>{satir.urunAciklamasi}</td>
              <td>{satir.miktarDetay}</td>
              <td>{paraFormatla(satir.toplamTutar, satir.paraBirimi)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {Object.entries(genelToplamlar).map(([paraBirimi, tutar]) => (
        <p className="genel-toplam" key={paraBirimi}>
          GENEL TOPLAM ({paraBirimi}) : {paraFormatla(tutar, paraBirimi)} + KDV
        </p>
      ))}

      <button className="buton buton--ikincil" onClick={onTemizle}>
        Listeyi Temizle
      </button>
    </section>
  );
}