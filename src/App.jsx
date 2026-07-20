import { useState, useEffect } from "react";
import { useUrunler } from "./hooks/useUrunler";
import TeklifBilgileriForm from "./components/TeklifBilgileriForm";
import UrunEkleFormu from "./components/UrunEkleFormu";
import SepetTablosu from "./components/SepetTablosu";
import CiktiButonu from "./components/CiktiButonu";
import GecmisTeklifler from './components/GecmisTeklifler';
import Login from './components/Login';
import M2FiyatHesaplayici from './components/M2FiyatHesaplayici';
import Ayarlar from './components/Ayarlar';

export default function App() {
  
  const { urunler, yukleniyor, hata } = useUrunler();

  // Sayfalar arası geçişi sağlayan state (teklif, ayarlar, m2hesapla)
  const [aktifSayfa, setAktifSayfa] = useState("teklif");

  // --- ŞİFRE KORUMA SİSTEMİ BAŞLANGIÇ ---
  const [girisBasarili, setGirisBasarili] = useState(false);

  useEffect(() => {
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
    musteriAdi: "",
    ilgiliKisi: "",
    projeAdi: "",
    tarih: new Date(),
  });
  
  const [sepet, setSepet] = useState([]);
  const [islemVerisi, setIslemVerisi] = useState(null);

  const sepettenUrunSil = (silinecekIndex) => {
    setSepet(sepet.filter((_, index) => index !== silinecekIndex));
  };

  const handleGuncelle = (index, guncelSatir) => {
    const yeniSepet = [...sepet];
    yeniSepet[index] = guncelSatir;
    setSepet(yeniSepet);
  };

  if (!girisBasarili) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="sayfa">
      <header className="ust-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px' }}>
        
        <div>
          <h1>KARATAŞCAM ŞİŞECAM</h1>
          <p>Kurumsal Fiyat Teklifi Oluşturma Sistemi</p>
        </div>

        {/* SAĞ TARAF: Logo ve Butonlar (Z-Index Eklendi) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img 
            src="/logo3.jpg" 
            alt="Karataşcam Logo" 
            style={{ 
              height: '75px', 
              width: 'auto', 
              objectFit: 'contain', 
              borderRadius: '4px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }} 
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', zIndex: 9999 }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setAktifSayfa(aktifSayfa === "m2hesapla" ? "teklif" : "m2hesapla")} 
                style={{ backgroundColor: '#10b981', color: 'white', padding: '8px 14px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {aktifSayfa === "m2hesapla" ? "📄 Teklif Ekranına Dön" : "📏 m² Fiyat Bul"}
              </button>

              <button 
                onClick={() => setAktifSayfa(aktifSayfa === "ayarlar" ? "teklif" : "ayarlar")} 
                style={{ backgroundColor: '#fcd34d', color: '#1f2937', padding: '8px 14px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {aktifSayfa === "ayarlar" ? "📄 Teklif Ekranına Dön" : "⚙️ Ayarlar"}
              </button>
            </div>

            <button 
              onClick={cikisYap} 
              style={{ backgroundColor: 'transparent', color: 'white', padding: '6px 12px', border: '1px solid white', borderRadius: '4px', cursor: 'pointer', alignSelf: 'flex-end' }}
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </header>

      <div className="govde">
        {aktifSayfa === "ayarlar" ? (
          <Ayarlar />
        ) : aktifSayfa === "m2hesapla" ? (
          <M2FiyatHesaplayici />
        ) : (
          <>
            <TeklifBilgileriForm teklif={teklif} onDegistir={setTeklif} />

            <main className="ana-icerik">
              <UrunEkleFormu
                urunler={urunler}
                yukleniyor={yukleniyor}
                hata={hata}
                onEkle={(satir) => setSepet((mevcut) => [...mevcut, satir])}
                islemVerisi={islemVerisi}
                onGuncelle={handleGuncelle}
                onIptal={() => setIslemVerisi(null)}
              />

              <SepetTablosu 
                sepet={sepet} 
                onTemizle={() => setSepet([])} 
                onSil={sepettenUrunSil} 
                onDuzenle={(index, satir) => {
                  setIslemVerisi({ tip: "duzenle", index, satir });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onTekrarEt={(satir) => {
                  setIslemVerisi({ tip: "tekrar", satir });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />

              <CiktiButonu teklif={teklif} sepet={sepet} />

              <GecmisTeklifler />
            </main>
          </>
        )}
      </div>
    </div>
  );
}