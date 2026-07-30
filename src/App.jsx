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
import OnayYonetimi from './components/OnayYonetimi';

function teklifNoRevizeEt(mevcutTeklifNo) {
  if (!mevcutTeklifNo) return "";
  const revizyonMatch = mevcutTeklifNo.match(/^(.*?)-R(\d+)$/i);
  if (revizyonMatch) {
    const anaTeklifNo = revizyonMatch[1];
    const mevcutRevizyonSayisi = parseInt(revizyonMatch[2], 10);
    return `${anaTeklifNo}-R${mevcutRevizyonSayisi + 1}`;
  } else {
    return `${mevcutTeklifNo}-R1`;
  }
}

export default function App() {
  const { urunler, yukleniyor, hata } = useUrunler();
  const [aktifSayfa, setAktifSayfa] = useState("teklif");

  const [girisBasarili, setGirisBasarili] = useState(false);
  const [kullaniciRolu, setKullaniciRolu] = useState(null);

  useEffect(() => {
    const oturum = sessionStorage.getItem('karatas_oturum');
    const rol = sessionStorage.getItem('karatas_rol');
    if (oturum === 'aktif' && rol) {
      setGirisBasarili(true);
      setKullaniciRolu(rol);
    }
  }, []);

  const handleLogin = (durum, rol) => {
    if (durum) {
      sessionStorage.setItem('karatas_oturum', 'aktif');
      sessionStorage.setItem('karatas_rol', rol);
      setKullaniciRolu(rol);
      setGirisBasarili(true);
    }
  };

  const cikisYap = () => {
    sessionStorage.removeItem('karatas_oturum');
    sessionStorage.removeItem('karatas_rol');
    setGirisBasarili(false);
    setKullaniciRolu(null);
    setAktifSayfa("teklif");
  };

  const [teklif, setTeklif] = useState({
    musteriAdi: "",
    ilgiliKisi: "",
    projeAdi: "",
    teklifNo: "",
    siparisNo: "",
    odemeSekli: "",
    tarih: new Date(),
    onayDurumu: "onaylandi"
  });
  
  const [sepet1, setSepet1] = useState([]);
  const [sepet2, setSepet2] = useState([]);

  // --- GERİ AL (UNDO) İÇİN GEÇMİŞ (HISTORY) STATE'LERİ ---
  const [sepet1Gecmis, setSepet1Gecmis] = useState([]);
  const [sepet2Gecmis, setSepet2Gecmis] = useState([]);

  const [aktifSepetNumarasi, setAktifSepetNumarasi] = useState(1);
  const [islemVerisi, setIslemVerisi] = useState(null);

  // --- GÜVENLİ SEPET GÜNCELLEME VE GERİ AL FONKSİYONLARI ---
  const sepetGuncelle1 = (yeniSepet) => {
    setSepet1Gecmis(prev => [...prev, sepet1]);
    setSepet1(yeniSepet);
  };

  const sepetGuncelle2 = (yeniSepet) => {
    setSepet2Gecmis(prev => [...prev, sepet2]);
    setSepet2(yeniSepet);
  };

  const geriAl1 = () => {
    if (sepet1Gecmis.length === 0) return;
    const oncekiHal = sepet1Gecmis[sepet1Gecmis.length - 1];
    setSepet1(oncekiHal);
    setSepet1Gecmis(prev => prev.slice(0, prev.length - 1));
  };

  const geriAl2 = () => {
    if (sepet2Gecmis.length === 0) return;
    const oncekiHal = sepet2Gecmis[sepet2Gecmis.length - 1];
    setSepet2(oncekiHal);
    setSepet2Gecmis(prev => prev.slice(0, prev.length - 1));
  };

  const secenekleriYerDegistir = () => {
    setSepet1Gecmis(prev => [...prev, sepet1]);
    setSepet2Gecmis(prev => [...prev, sepet2]);
    const geciciSepet = [...sepet1];
    setSepet1([...sepet2]);
    setSepet2(geciciSepet);
  };

  const sepettenUrunSil = (silinecekIndex, sepetNo) => {
    if (sepetNo === 1) {
      sepetGuncelle1(sepet1.filter((_, index) => index !== silinecekIndex));
    } else {
      sepetGuncelle2(sepet2.filter((_, index) => index !== silinecekIndex));
    }
  };

  const handleGuncelle = (index, guncelSatir, sepetNo) => {
    if (sepetNo === 1) {
      const yeniSepet = [...sepet1];
      yeniSepet[index] = guncelSatir;
      sepetGuncelle1(yeniSepet);
    } else {
      const yeniSepet = [...sepet2];
      yeniSepet[index] = guncelSatir;
      sepetGuncelle2(yeniSepet);
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
            <p style={{ margin: 0 }}>Kurumsal Fiyat Teklifi Oluşturma Sistemi</p>
            <span style={{ 
              backgroundColor: '#0f2942', 
              color: 'white', 
              padding: '2px 8px', 
              borderRadius: '4px', 
              fontSize: '11px', 
              fontWeight: '700',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              border: '1px solid rgba(255,255,255,0.25)'
            }}>
              {kullaniciRolu === 'admin' ? 'YÖNETİCİ' : 'PERSONEL'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img 
            src="/logo3.jpg" 
            alt="Karataşcam Logo" 
            style={{ height: '75px', width: 'auto', objectFit: 'contain', borderRadius: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', zIndex: 9999, alignItems: 'flex-end' }}>
            {kullaniciRolu === 'admin' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setAktifSayfa(aktifSayfa === "onaylar" ? "teklif" : "onaylar")} 
                  style={{ backgroundColor: '#0f2942', color: 'white', padding: '9px 16px', border: '1px solid rgba(255,255,255,0.35)', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', transition: 'all 0.2s ease' }}
                >
                  {aktifSayfa === "onaylar" ? "Teklif Ekranına Dön" : "Onay Bekleyenler"}
                </button>
                <button 
                  onClick={() => setAktifSayfa(aktifSayfa === "ayarlar" ? "teklif" : "ayarlar")} 
                  style={{ backgroundColor: '#ffffff', color: '#0f2942', padding: '9px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', transition: 'all 0.2s ease' }}
                >
                  {aktifSayfa === "ayarlar" ? "Teklif Ekranına Dön" : "Ayarlar"}
                </button>
              </div>
            )}

            <button 
              onClick={cikisYap} 
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)', color: 'white', padding: '7px 16px', border: '1px solid rgba(255, 255, 255, 0.25)', borderRadius: '6px', cursor: 'pointer', fontSize: '12.5px', fontWeight: '600', transition: 'all 0.2s ease' }}
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </header>

      <div className="govde">
        {aktifSayfa === "ayarlar" ? (
          <Ayarlar />
        ) : aktifSayfa === "onaylar" ? (
          <OnayYonetimi />
        ) : aktifSayfa === "m2hesapla" ? (
          <M2FiyatHesaplayici />
        ) : (
          <>
            <TeklifBilgileriForm teklif={teklif} onDegistir={setTeklif} />

            <main className="ana-icerik">
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', backgroundColor: '#e2e8f0', padding: '6px', borderRadius: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setAktifSepetNumarasi(1)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '6px', border: 'none',
                    backgroundColor: aktifSepetNumarasi === 1 ? '#0f2942' : 'transparent',
                    color: aktifSepetNumarasi === 1 ? 'white' : '#475569',
                    fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  1. Seçenek [{sepet1.length} Ürün]
                </button>

                <button
                  type="button"
                  onClick={secenekleriYerDegistir}
                  title="1. ve 2. Seçeneğin Yerini Değiştir"
                  style={{
                    backgroundColor: '#0f2942', color: 'white', border: 'none',
                    padding: '10px 16px', borderRadius: '6px', fontSize: '13px',
                    fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  ⇄ Seçenekleri Takas Et (1 ↔ 2)
                </button>

                <button
                  type="button"
                  onClick={() => setAktifSepetNumarasi(2)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '6px', border: 'none',
                    backgroundColor: aktifSepetNumarasi === 2 ? '#0f2942' : 'transparent',
                    color: aktifSepetNumarasi === 2 ? 'white' : '#475569',
                    fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  2. Seçenek [{sepet2.length} Ürün]
                </button>
              </div>

              <UrunEkleFormu
                urunler={urunler}
                yukleniyor={yukleniyor}
                hata={hata}
                sepet1={sepet1}
                sepet2={sepet2}
                onTopluGuncelle={(hedefSepetNo, guncelSepet) => {
                  if (hedefSepetNo === 1) {
                    sepetGuncelle1(guncelSepet);
                  } else {
                    sepetGuncelle2(guncelSepet);
                  }
                }}
                onEkle={(satir) => {
                  if (aktifSepetNumarasi === 1) {
                    sepetGuncelle1([...sepet1, satir]);
                  } else {
                    sepetGuncelle2([...sepet2, satir]);
                  }
                }}
                islemVerisi={islemVerisi}
                onGuncelle={(index, guncelSatir) => {
                  const hedefSepetNo = islemVerisi?.sepetNo || 1;
                  handleGuncelle(index, guncelSatir, hedefSepetNo);
                }}
                onIptal={() => setIslemVerisi(null)}
              />

              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#0f2942', borderBottom: '2px solid #0f2942', paddingBottom: '8px', marginBottom: '15px', fontSize: '16px', fontWeight: '700' }}>
                  1. Seçenek
                </h3>
                <SepetTablosu 
                  sepet={sepet1} 
                  gecmisUzunluk={sepet1Gecmis.length}
                  onGeriAl={geriAl1}
                  onTemizle={() => sepetGuncelle1([])} 
                  onSil={(index) => sepettenUrunSil(index, 1)} 
                  onDuzenle={(index, satir) => {
                    setIslemVerisi({ tip: "duzenle", index, satir, sepetNo: 1 });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onTekrarEt={(satir) => {
                    setIslemVerisi({ tip: "tekrar", satir, sepetNo: 1 });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onTopluFiyatGuncelle={(yeniSepet) => sepetGuncelle1(yeniSepet)}
                />
              </div>

              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#0f2942', borderBottom: '2px solid #0f2942', paddingBottom: '8px', marginBottom: '15px', fontSize: '16px', fontWeight: '700' }}>
                  2. Seçenek
                </h3>
                <SepetTablosu 
                  sepet={sepet2} 
                  gecmisUzunluk={sepet2Gecmis.length}
                  onGeriAl={geriAl2}
                  onTemizle={() => sepetGuncelle2([])} 
                  onSil={(index) => sepettenUrunSil(index, 2)} 
                  onDuzenle={(index, satir) => {
                    setIslemVerisi({ tip: "duzenle", index, satir, sepetNo: 2 });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onTekrarEt={(satir) => {
                    setIslemVerisi({ tip: "tekrar", satir, sepetNo: 2 });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onTopluFiyatGuncelle={(yeniSepet) => sepetGuncelle2(yeniSepet)}
                />
              </div>

              <CiktiButonu teklif={teklif} sepet={sepet1} sepet2={sepet2} kullaniciRolu={kullaniciRolu} />

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
                    odemeSekli: yuklenenTeklif.odeme_sekli || "",
                    teklifNo: revizeTeklifNo,
                    siparisNo: yuklenenTeklif.siparis_no || "",
                    tarih: new Date(),
                    onayDurumu: "onaylandi"
                  });
                  sepetGuncelle1(yuklenenSepet1 || []);
                  sepetGuncelle2(yuklenenSepet2 || []);
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