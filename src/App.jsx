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

// REVİZYON NUMARASI OLUŞTURMA YARDIMCI FONKSİYONU (-R1, -R2 TESPİTİ)
function teklifNoRevizeEt(mevcutTeklifNo) {
  if (!mevcutTeklifNo) return "";

  // Regex ile teklif nosunun sonunda zaten -R1, -R2 gibi bir ek var mı bakıyoruz
  const revizyonMatch = mevcutTeklifNo.match(/^(.*?)-R(\d+)$/i);

  if (revizyonMatch) {
    // Zaten revizyonlu (Örn: T-2026-0012-R1) -> R sayısını 1 artır
    const anaTeklifNo = revizyonMatch[1];
    const mevcutRevizyonSayisi = parseInt(revizyonMatch[2], 10);
    return `${anaTeklifNo}-R${mevcutRevizyonSayisi + 1}`;
  } else {
    // İlk defa revize ediliyor (Örn: T-2026-0012) -> -R1 ekle
    return `${mevcutTeklifNo}-R1`;
  }
}

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
    teklifNo: "", // Düzenlenen teklifin nosu
    tarih: new Date(),
  });
  
  // İKİ AYRI SEPET STATE'İ (1. Seçenek ve 2. Seçenek)
  const [sepet1, setSepet1] = useState([]);
  const [sepet2, setSepet2] = useState([]);
  
  // Ürünün hangi sepete ekleneceğini seçmek için (1 veya 2)
  const [aktifSepetNumarasi, setAktifSepetNumarasi] = useState(1);

  const [islemVerisi, setIslemVerisi] = useState(null);

  // Silme işlemleri
  const sepettenUrunSil = (silinecekIndex, sepetNo) => {
    if (sepetNo === 1) {
      setSepet1(sepet1.filter((_, index) => index !== silinecekIndex));
    } else {
      setSepet2(sepet2.filter((_, index) => index !== silinecekIndex));
    }
  };

  const handleGuncelle = (index, guncelSatir, sepetNo) => {
    if (sepetNo === 1) {
      const yeniSepet = [...sepet1];
      yeniSepet[index] = guncelSatir;
      setSepet1(yeniSepet);
    } else {
      const yeniSepet = [...sepet2];
      yeniSepet[index] = guncelSatir;
      setSepet2(yeniSepet);
    }
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

        {/* SAĞ TARAF: Logo ve Butonlar */}
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
                  color: '#0f2942',
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
              
              {/* HANGİ SEPETE EKLECEĞİNİ SEÇME SEKMELERİ */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', backgroundColor: '#e2e8f0', padding: '6px', borderRadius: '8px' }}>
                <button
                  type="button"
                  onClick={() => setAktifSepetNumarasi(1)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: aktifSepetNumarasi === 1 ? '#0f2942' : 'transparent',
                    color: aktifSepetNumarasi === 1 ? 'white' : '#475569',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  1. Seçenek [{sepet1.length} Ürün]
                </button>
                <button
                  type="button"
                  onClick={() => setAktifSepetNumarasi(2)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: aktifSepetNumarasi === 2 ? '#0f2942' : 'transparent',
                    color: aktifSepetNumarasi === 2 ? 'white' : '#475569',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  2. Seçenek [{sepet2.length} Ürün]
                </button>
              </div>

              <UrunEkleFormu
                urunler={urunler}
                yukleniyor={yukleniyor}
                hata={hata}
                onEkle={(satir) => {
                  if (aktifSepetNumarasi === 1) {
                    setSepet1((mevcut) => [...mevcut, satir]);
                  } else {
                    setSepet2((mevcut) => [...mevcut, satir]);
                  }
                }}
                islemVerisi={islemVerisi}
                onGuncelle={(index, guncelSatir) => {
                  const hedefSepetNo = islemVerisi?.sepetNo || 1;
                  handleGuncelle(index, guncelSatir, hedefSepetNo);
                }}
                onIptal={() => setIslemVerisi(null)}
              />

              {/* 1. SEÇENEK TABLOSU */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#0f2942', borderBottom: '2px solid #0f2942', paddingBottom: '8px', marginBottom: '15px', fontSize: '16px', fontWeight: '700' }}>
                  1. Seçenek
                </h3>
                <SepetTablosu 
                  sepet={sepet1} 
                  onTemizle={() => setSepet1([])} 
                  onSil={(index) => sepettenUrunSil(index, 1)} 
                  onDuzenle={(index, satir) => {
                    setIslemVerisi({ tip: "duzenle", index, satir, sepetNo: 1 });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onTekrarEt={(satir) => {
                    setIslemVerisi({ tip: "tekrar", satir, sepetNo: 1 });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onTopluFiyatGuncelle={(yeniSepet) => setSepet1(yeniSepet)}
                />
              </div>

              {/* 2. SEÇENEK TABLOSU */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#0f2942', borderBottom: '2px solid #0f2942', paddingBottom: '8px', marginBottom: '15px', fontSize: '16px', fontWeight: '700' }}>
                  2. Seçenek
                </h3>
                <SepetTablosu 
                  sepet={sepet2} 
                  onTemizle={() => setSepet2([])} 
                  onSil={(index) => sepettenUrunSil(index, 2)} 
                  onDuzenle={(index, satir) => {
                    setIslemVerisi({ tip: "duzenle", index, satir, sepetNo: 2 });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onTekrarEt={(satir) => {
                    setIslemVerisi({ tip: "tekrar", satir, sepetNo: 2 });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onTopluFiyatGuncelle={(yeniSepet) => setSepet2(yeniSepet)}
                />
              </div>

              {/* PDF'e her iki sepeti ve revize edilmiş teklif nosunu gönderiyoruz */}
              <CiktiButonu teklif={teklif} sepet={sepet1} sepet2={sepet2} />

              {/* GEÇMİŞ TEKLİFLER VE SEPETİ GERİ GETİRME KÖPRÜSÜ */}
              <GecmisTeklifler 
                kullaniciRolu={kullaniciRolu} 
                onSepetiYukle={(yuklenenTeklif, yuklenenSepet1, yuklenenSepet2) => {
                  const eskiTeklifNo = yuklenenTeklif.teklif_no || yuklenenTeklif.teklifNo || "";
                  const revizeTeklifNo = teklifNoRevizeEt(eskiTeklifNo);

                  setTeklif({
                    musteriAdi: yuklenenTeklif.musteri_adi || "",
                    ilgiliKisi: yuklenenTeklif.ilgili_kisi || "",
                    projeAdi: yuklenenTeklif.proje_adi || "",
                    notlar: yuklenenTeklif.notlar || "",
                    teklifNo: revizeTeklifNo, // Otomatik -R1, -R2 eklenmiş teklif no
                    tarih: new Date()
                  });
                  setSepet1(yuklenenSepet1 || []);
                  setSepet2(yuklenenSepet2 || []);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </main>
          </>
        )}
      </div>
    </div>
  );
}