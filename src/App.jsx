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
  const [kullaniciRolu, setKullaniciRolu] = useState(null); // 'admin' veya 'calisan'

  useEffect(() => {
    const oturum = localStorage.getItem('karatas_oturum');
    const rol = localStorage.getItem('karatas_rol');
    if (oturum === 'aktif' && rol) {
      setGirisBasarili(true);
      setKullaniciRolu(rol);
    }
  }, []);

  const handleLogin = (durum, rol) => {
    if (durum) {
      localStorage.setItem('karatas_oturum', 'aktif');
      localStorage.setItem('karatas_rol', rol);
      setKullaniciRolu(rol);
      setGirisBasarili(true);
    }
  };

  const cikisYap = () => {
    localStorage.removeItem('karatas_oturum');
    localStorage.removeItem('karatas_rol');
    setGirisBasarili(false);
    setKullaniciRolu(null);
    setAktifSayfa("teklif"); // Çıkışta ana sayfaya at
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative', zIndex: 9999, alignItems: 'flex-end' }}>
            {kullaniciRolu === 'admin' && (
              <button 
                onClick={() => setAktifSayfa(aktifSayfa === "ayarlar" ? "teklif" : "ayarlar")} 
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  color: '#0f2942', // Sitenin lacivertine uyumlu
                  padding: '10px 20px', 
                  border: '1px solid rgba(255, 255, 255, 0.5)', 
                  borderRadius: '6px', 
                  cursor: 'pointer', 
                  fontWeight: '700',
                  fontSize: '14px',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                {aktifSayfa === "ayarlar" ? "📄 Teklif Ekranına Dön" : "⚙️ Ayarlar"}
              </button>
            )}

            <button 
              onClick={cikisYap} 
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                color: 'white', 
                padding: '8px 20px', 
                border: '1px solid rgba(255, 255, 255, 0.2)', 
                borderRadius: '6px', 
                cursor: 'pointer', 
                fontSize: '13px',
                fontWeight: '500',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s ease'
              }}
            >
              Çıkış Yap 🚪
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
                onTopluFiyatGuncelle={(yeniSepet) => setSepet(yeniSepet)}
              />

              <CiktiButonu teklif={teklif} sepet={sepet} />

              <GecmisTeklifler kullaniciRolu={kullaniciRolu} />
            </main>
          </>
        )}
      </div>
    </div>
  );
}