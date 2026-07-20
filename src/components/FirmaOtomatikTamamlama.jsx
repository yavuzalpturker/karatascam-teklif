import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; 
import { useFirmaArama } from '../hooks/useFirmaArama';

export default function FirmaOtomatikTamamlama({ deger, onSecim }) {
  const [aramaMetni, setAramaMetni] = useState(deger || '');
  const [acikMi, setAcikMi] = useState(false);
  const kutuRef = useRef(null);
  
  const { sonuclar, yukleniyor } = useFirmaArama(aramaMetni);

  useEffect(() => {
    setAramaMetni(deger || '');
  }, [deger]);

  useEffect(() => {
    function disaTiklama(e) {
      if (kutuRef.current && !kutuRef.current.contains(e.target)) {
        setAcikMi(false);
      }
    }
    document.addEventListener('mousedown', disaTiklama);
    return () => document.removeEventListener('mousedown', disaTiklama);
  }, []);

  function firmaSecildi(firmaAdi) {
    setAramaMetni(firmaAdi);
    onSecim(firmaAdi);
    setAcikMi(false);
  }

  // YENİ FİRMA KAYDETME FONKSİYONU
  async function yeniFirmaKaydet() {
    const buyukHarfliFirma = aramaMetni.toLocaleUpperCase('tr-TR');
    
    try {
      const { error } = await supabase
        .from('firmalar')
        .insert([{ firma_adi: buyukHarfliFirma }]);

      if (error) {
        console.error("Firma kaydedilemedi:", error);
        alert("DİKKAT: Firma teklife eklendi ama veritabanına kaydedilemedi!\nHata: " + error.message);
        firmaSecildi(buyukHarfliFirma); 
      } else {
        firmaSecildi(buyukHarfliFirma); 
      }
    } catch (err) {
      console.error("Supabase bağlantı hatası:", err);
    }
  }

  // YENİ EKLENEN: FİRMAYI VERİTABANINDAN SİLME FONKSİYONU
  async function firmaSil(silinecekFirma, e) {
    e.stopPropagation(); // Tıklamanın "Seçim" işlemi yapmasını engeller
    e.preventDefault();

    const onay = window.confirm(`"${silinecekFirma}" firmasını veritabanından kalıcı olarak silmek istediğinize emin misiniz?`);
    if (!onay) return;

    try {
      const { error } = await supabase
        .from('firmalar')
        .delete()
        .eq('firma_adi', silinecekFirma);

      if (error) {
        console.error("Firma silinemedi:", error);
        alert("Silme işlemi sırasında hata oluştu: " + error.message);
      } else {
        // Başarıyla silindiğinde menüyü kapatıp arama ekranını temizler
        setAcikMi(false);
      }
    } catch (err) {
      console.error("Supabase bağlantı hatası:", err);
    }
  }

  const tamEslesmeVarMi = sonuclar.some(
    (f) => f.firma_adi.toLocaleLowerCase('tr-TR') === aramaMetni.toLocaleLowerCase('tr-TR')
  );

  return (
    <div ref={kutuRef} style={{ position: 'relative' }}>
      <input
        type="text"
        value={aramaMetni}
        onChange={(e) => {
          setAramaMetni(e.target.value);
          onSecim(e.target.value); 
          setAcikMi(true);
        }}
        onFocus={() => setAcikMi(true)}
        placeholder="Firma adı yazmaya başlayın..."
        style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
      />

      {acikMi && aramaMetni.trim().length >= 2 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 20,
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: '6px',
            maxHeight: '250px',
            overflowY: 'auto',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          }}
        >
          {yukleniyor && (
            <div style={{ padding: '8px 12px', color: '#888' }}>Aranıyor...</div>
          )}
          
          {!yukleniyor && sonuclar.length === 0 && (
            <div style={{ padding: '8px 12px', color: '#888' }}>Sonuç bulunamadı. Aşağıdan yeni firma olarak kaydedebilirsiniz.</div>
          )}
          
          {!yukleniyor &&
            sonuclar.map((firma, i) => (
              <div
                key={i}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '10px 12px', 
                  borderBottom: '1px solid #eee', 
                  fontSize: "14px",
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f0f8ff"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
              >
                {/* SOL TARAF: Tıklanınca firmayı seçer */}
                <span 
                  onClick={() => firmaSecildi(firma.firma_adi)}
                  onMouseDown={(e) => e.preventDefault()} 
                  style={{ flex: 1 }}
                >
                  {firma.firma_adi}
                </span>

                {/* SAĞ TARAF: SİLME BUTONU */}
                <button
                  onClick={(e) => firmaSil(firma.firma_adi, e)}
                  onMouseDown={(e) => e.preventDefault()}
                  style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    color: '#ef4444', 
                    cursor: 'pointer', 
                    fontSize: '12px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontWeight: 'bold'
                  }}
                  title="Bu firmayı veritabanından kalıcı olarak sil"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#fee2e2"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  ❌ Sil
                </button>
              </div>
            ))}

          {!yukleniyor && !tamEslesmeVarMi && (
            <div 
              onClick={yeniFirmaKaydet}
              onMouseDown={(e) => e.preventDefault()}
              style={{ 
                padding: "12px 10px", 
                backgroundColor: "#e6fcff", 
                borderTop: "2px solid #b3e6ff", 
                cursor: "pointer", 
                color: "#007099", 
                fontWeight: "bold", 
                textAlign: "center",
                position: "sticky",
                bottom: 0,
                fontSize: "14px"
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#cceeff"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "#e6fcff"}
            >
              ➕ "{aramaMetni.toLocaleUpperCase('tr-TR')}" Yeni Firma Kaydet
            </div>
          )}
        </div>
      )}
    </div>
  );
}