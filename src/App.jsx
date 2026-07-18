import { useState, useEffect } from "react";
import { useUrunler } from "./hooks/useUrunler";
import TeklifBilgileriForm from "./components/TeklifBilgileriForm";
import UrunEkleFormu from "./components/UrunEkleFormu";
import SepetTablosu from "./components/SepetTablosu";
import CiktiButonu from "./components/CiktiButonu";
import GecmisTeklifler from './components/GecmisTeklifler';
import Login from './components/Login';

export default function App() {
  
  const { urunler, yukleniyor, hata } = useUrunler();

  // --- ŞİFRE KORUMA SİSTEMİ BAŞLANGIÇ ---
  const [girisBasarili, setGirisBasarili] = useState(false);

  useEffect(() => {
    // Sayfa yenilendiğinde tekrar şifre sormasın diye oturumu kontrol ediyoruz
    const oturum = localStorage.getItem('karatas_oturum');
    if (oturum === 'aktif') {
      setGirisBasarili(true);
    }
  }, []);

  const handleLogin = (durum) => {
    if (durum) {
      localStorage.setItem('karatas_oturum', 'aktif');
      setGirisBasarili(true);
    }
  };

  const cikisYap = () => {
    localStorage.removeItem('karatas_oturum');
    setGirisBasarili(false);
  };
  // --- ŞİFRE KORUMA SİSTEMİ BİTİŞ ---

  const [teklif, setTeklif] = useState({
    musteriAdi: "BERFİN BULTAN MİMARLIK",
    ilgiliKisi: "Sn. Berfin Hanım Dikkatine,",
    projeAdi: "NUROL HOLDİNG / LUGAL OTEL",
    tarih: new Date(),
  });
  
  const [sepet, setSepet] = useState([]);

  // EĞER GİRİŞ YAPILMADIYSA SADECE GİRİŞ EKRANINI GÖSTER
  if (!girisBasarili) {
    return <Login onLogin={handleLogin} />;
  }

  // EĞER ŞİFRE DOĞRUYSA SENİN ORİJİNAL SİSTEMİNİ GÖSTER
  return (
    <div className="sayfa">
      <header className="ust-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px' }}>
        
        {/* SOL TARAF: Yazılar */}
        <div>
          <h1>KARATAŞCAM ŞİŞECAM</h1>
          <p>Kurumsal Fiyat Teklifi Oluşturma Sistemi</p>
        </div>

        {/* SAĞ TARAF: Logo ve Buton yanyana */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img 
            src="/logo3.jpg" 
            alt="Karataşcam Logo" 
            style={{ 
              height: '75px',     /* Fotoğraftaki gibi ideal boy */
              width: 'auto',      /* Zorla uzatma iptal, kendi orijinal oranında kalacak */
              objectFit: 'contain',  
              borderRadius: '4px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }} 
          />

          <button 
            onClick={cikisYap} 
            style={{ backgroundColor: 'transparent', color: 'white', padding: '6px 12px', border: '1px solid white', borderRadius: '4px', cursor: 'pointer' }}
          >
            Çıkış Yap
          </button>
        </div>

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

          <GecmisTeklifler />
        </main>
      </div>
    </div>
  );
}