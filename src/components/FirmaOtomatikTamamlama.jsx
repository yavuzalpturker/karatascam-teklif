import { useState, useRef, useEffect } from 'react';
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

  return (
    <div ref={kutuRef} style={{ position: 'relative' }}>
      <input
        type="text"
        value={aramaMetni}
        onChange={(e) => {
          setAramaMetni(e.target.value);
          onSecim(e.target.value); // serbest yazmaya da izin ver
          setAcikMi(true);
        }}
        onFocus={() => setAcikMi(true)}
        placeholder="Firma adı yazmaya başlayın..."
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
            maxHeight: '220px',
            overflowY: 'auto',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          }}
        >
          {yukleniyor && (
            <div style={{ padding: '8px 12px', color: '#888' }}>Aranıyor...</div>
          )}
          {!yukleniyor && sonuclar.length === 0 && (
            <div style={{ padding: '8px 12px', color: '#888' }}>Sonuç bulunamadı</div>
          )}
          {!yukleniyor &&
            sonuclar.map((firma, i) => (
              <div
                key={i}
                onClick={() => firmaSecildi(firma.firma_adi)}
                style={{ padding: '8px 12px', cursor: 'pointer' }}
                onMouseDown={(e) => e.preventDefault()} // blur'dan önce tıklamayı yakala
              >
                {firma.firma_adi}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}