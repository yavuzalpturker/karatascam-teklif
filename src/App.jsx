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

  // --- DİNAMİK ÇOKLU SEÇENEK (SEPETLER) YAPISI ---
  const [sepetler, setSepetler] = useState([[], []]); // Başlangıçta 1. ve 2. Seçenek
  const [sepetGecmisleri, setSepetGecmisleri] = useState([[], []]);
  const [aktifSepetNumarasi, setAktifSepetNumarasi] = useState(1);
  const [islemVerisi, setIslemVerisi] = useState(null);

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

  const cikisYap = () => {
    sessionStorage.removeItem('karatas_oturum');
    sessionStorage.removeItem('karatas_rol');
    sessionStorage.removeItem('karatas_personel_adi');
    
    setGirisBasarili(false);
    setKullaniciRolu(null);
    setAktifSayfa("teklif");
    setTeklif({
      musteriAdi: "",
      ilgiliKisi: "",
      projeAdi: "",
      teklifNo: "",
      siparisNo: "",
      odemeSekli: "",
      tarih: new Date(),
      onayDurumu: "onaylandi"
    });
    setSepetler([[], []]);
    setSepetGecmisleri([[], []]);
  };

  const yeniTeklifBaslat = () => {
    const onay = window.confirm("Mevcut sepetler ve teklif bilgileri sıfırlanacak. Yeni teklif başlatmak istiyor musunuz?");
    if (!onay) return;

    setTeklif({
      musteriAdi: "",
      ilgiliKisi: "",
      projeAdi: "",
      teklifNo: "",
      siparisNo: "",
      odemeSekli: "",
      tarih: new Date(),
      onayDurumu: "onaylandi"
    });
    setSepetler([[], []]);
    setSepetGecmisleri([[], []]);
    setAktifSepetNumarasi(1);
    setIslemVerisi(null);
  };

  // Dinamik Seçenek Ekleme
  const yeniSecenekEkle = () => {
    setSepetler(prev => [...prev, []]);
    setSepetGecmisleri(prev => [...prev, []]);
    setAktifSepetNumarasi(sepetler.length + 1);
  };

  // Seçenek Silme
  const secenekSil = (secenekIndex) => {
    if (sepetler.length <= 1) {
      alert("En az 1 seçenek bulunmalıdır!");
      return;
    }
    const onay = window.confirm(`${secenekIndex + 1}. Seçeneği silmek istediğinize emin misiniz?`);
    if (!onay) return;

    setSepetler(prev => prev.filter((_, idx) => idx !== secenekIndex));
    setSepetGecmisleri(prev => prev.filter((_, idx) => idx !== secenekIndex));
    setAktifSepetNumarasi(1);
  };

  // Genel Sepet Güncelleme
  const sepetiGuncelle = (sepetNo, yeniSepet) => {
    const idx = sepetNo - 1;
    setSepetGecmisleri(prev => {
      const kopya = [...prev];
      kopya[idx] = [...(kopya[idx] || []), sepetler[idx] || []];
      return kopya;
    });
    setSepetler(prev => {
      const kopya = [...prev];
      kopya[idx] = yeniSepet;
      return kopya;
    });
  };

  const geriAl = (sepetNo) => {
    const idx = sepetNo - 1;
    const gecmis = sepetGecmisleri[idx] || [];
    if (gecmis.length === 0) return;

    const oncekiHal = gecmis[gecmis.length - 1];
    setSepetler(prev => {
      const kopya = [...prev];
      kopya[idx] = oncekiHal;
      return kopya;
    });
    setSepetGecmisleri(prev => {
      const kopya = [...prev];
      kopya[idx] = kopya[idx].slice(0, kopya[idx].length - 1);
      return kopya;
    });
  };

  const sepettenUrunSil = (silinecekIndex, sepetNo) => {
    const idx = sepetNo - 1;
    const guncel = (sepetler[idx] || []).filter((_, index) => index !== silinecekIndex);
    sepetiGuncelle(sepetNo, guncel);
  };

  const handleGuncelle = (index, guncelSatir, sepetNo) => {
    const idx = sepetNo - 1;
    const kopya = [...(sepetler[idx] || [])];
    kopya[index] = guncelSatir;
    sepetiGuncelle(sepetNo, kopya);
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
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={yeniTeklifBaslat}
                style={{ backgroundColor: '#10b981', color: 'white', padding: '9px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
              >
                ➕ Yeni Teklif (Temizle)
              </button>

              {kullaniciRolu === 'admin' && (
                <button 
                  onClick={() => setAktifSayfa(aktifSayfa === "ayarlar" ? "teklif" : "ayarlar")} 
                  style={{ backgroundColor: '#ffffff', color: '#0f2942', padding: '9px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', transition: 'all 0.2s ease' }}
                >
                  {aktifSayfa === "ayarlar" ? "Teklif Ekranına Dön" : "Ayarlar"}
                </button>
              )}
            </div>

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
        ) : aktifSayfa === "m2hesapla" ? (
          <M2FiyatHesaplayici />
        ) : (
          <>
            <TeklifBilgileriForm teklif={teklif} onDegistir={setTeklif} />

            <main className="ana-icerik">
              {/* DİNAMİK SEÇENEK SEKMELERİ */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', backgroundColor: '#e2e8f0', padding: '6px', borderRadius: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                {sepetler.map((sIcerik, idx) => {
                  const sNo = idx + 1;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAktifSepetNumarasi(sNo)}
                      style={{
                        flex: 1, minWidth: '120px', padding: '10px', borderRadius: '6px', border: 'none',
                        backgroundColor: aktifSepetNumarasi === sNo ? '#0f2942' : 'transparent',
                        color: aktifSepetNumarasi === sNo ? 'white' : '#475569',
                        fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      {sNo}. Seçenek [{sIcerik.length} Ürün]
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={yeniSecenekEkle}
                  title="Yeni Seçenek Ekle"
                  style={{
                    backgroundColor: '#16a34a', color: 'white', border: 'none',
                    padding: '10px 16px', borderRadius: '6px', fontSize: '13px',
                    fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  ➕ Yeni Seçenek
                </button>
              </div>

              {/* ÜRÜN EKLEME FORMU */}
              <UrunEkleFormu
                urunler={urunler}
                yukleniyor={yukleniyor}
                hata={hata}
                sepet1={sepetler[0] || []}
                sepet2={sepetler[1] || []}
                aktifSecenekNo={aktifSepetNumarasi}
                onTopluGuncelle={(hedefSepetNo, guncelSepet) => sepetiGuncelle(hedefSepetNo, guncelSepet)}
                onEkle={(satir) => {
                  const guncel = [...(sepetler[aktifSepetNumarasi - 1] || []), satir];
                  sepetiGuncelle(aktifSepetNumarasi, guncel);
                }}
                islemVerisi={islemVerisi}
                onGuncelle={(index, guncelSatir) => {
                  const hedefSepetNo = islemVerisi?.sepetNo || 1;
                  handleGuncelle(index, guncelSatir, hedefSepetNo);
                }}
                onIptal={() => setIslemVerisi(null)}
              />

              {/* SEÇENEK TABLOLARI LİSTESİ */}
              {sepetler.map((sIcerik, idx) => {
                const sNo = idx + 1;
                return (
                  <div key={idx} style={{ marginBottom: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f2942', paddingBottom: '8px', marginBottom: '15px' }}>
                      <h3 style={{ color: '#0f2942', margin: 0, fontSize: '16px', fontWeight: '700' }}>
                        {sNo}. Seçenek
                      </h3>
                      {sepetler.length > 1 && (
                        <button
                          type="button"
                          onClick={() => secenekSil(idx)}
                          style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          🗑️ {sNo}. Seçeneği Sil
                        </button>
                      )}
                    </div>

                    <SepetTablosu 
                      sepet={sIcerik} 
                      gecmisUzunluk={(sepetGecmisleri[idx] || []).length}
                      onGeriAl={() => geriAl(sNo)}
                      onTemizle={() => sepetiGuncelle(sNo, [])} 
                      onSil={(index) => sepettenUrunSil(index, sNo)} 
                      onDuzenle={(index, satir) => {
                        setIslemVerisi({ tip: "duzenle", index, satir, sepetNo: sNo });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      onTekrarEt={(satir) => {
                        setIslemVerisi({ tip: "tekrar", satir, sepetNo: sNo });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      onTopluFiyatGuncelle={(yeniSepet) => sepetiGuncelle(sNo, yeniSepet)}
                    />
                  </div>
                );
              })}

              <CiktiButonu teklif={teklif} sepet={sepetler[0] || []} sepet2={sepetler[1] || []} kullaniciRolu={kullaniciRolu} />

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
                  sepetiGuncelle(1, yuklenenSepet1 || []);
                  sepetiGuncelle(2, yuklenenSepet2 || []);
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