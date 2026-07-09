import { useState } from "react";
import { useUrunler } from "./hooks/useUrunler";
import TeklifBilgileriForm from "./components/TeklifBilgileriForm";
import UrunEkleFormu from "./components/UrunEkleFormu";
import SepetTablosu from "./components/SepetTablosu";
import CiktiButonu from "./components/CiktiButonu";

export default function App() {
  const { urunler, yukleniyor, hata } = useUrunler();

  const [teklif, setTeklif] = useState({
    musteriAdi: "BERFİN BULTAN MİMARLIK",
    ilgiliKisi: "Sn. Berfin Hanım Dikkatine,",
    projeAdi: "NUROL HOLDİNG / LUGAL OTEL",
    tarih: new Date(),
  });

  const [sepet, setSepet] = useState([]);

  return (
    <div className="sayfa">
      <header className="ust-bar">
        <h1>KARATAŞCAM ŞİŞECAM</h1>
        <p>Kurumsal Fiyat Teklifi Oluşturma Sistemi</p>
      </header>

      <div className="govde">
        <TeklifBilgileriForm teklif={teklif} onDegistir={setTeklif} />

        <main className="ana-icerik">
          <UrunEkleFormu
            urunler={urunler}
            yukleniyor={yukleniyor}
            hata={hata}
            onEkle={(satir) => setSepet((mevcut) => [...mevcut, satir])}
          />

          <SepetTablosu sepet={sepet} onTemizle={() => setSepet([])} />

          <CiktiButonu teklif={teklif} sepet={sepet} />
        </main>
      </div>
    </div>
  );
}
