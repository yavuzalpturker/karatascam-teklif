import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [sifre, setSifre] = useState('');
  const [hata, setHata] = useState('');

  const girisYap = (e) => {
    e.preventDefault();
    
    // Ayarlardan kaydedilen şifreleri çek, yoksa varsayılan olarak 1234 kullan
    const kayitliSifreler = JSON.parse(localStorage.getItem('karatas_sifreler')) || {
      admin: '1234',
      personel: '1234'
    };
    
    if (kullaniciAdi === 'karatas' && sifre === kayitliSifreler.admin) {
      // Yönetici girişi
      onLogin(true, 'admin');
    } else if (kullaniciAdi === 'personel' && sifre === kayitliSifreler.personel) {
      // Normal çalışan girişi
      onLogin(true, 'calisan');
    } else {
      setHata('Kullanıcı adı veya şifre hatalı!');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0b2031 0%, #1a4f76 100%)', 
      fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      margin: '-8px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* SİHİRLİ ANİMASYON KODLARI BURADA GİZLİ */}
      <style>
        {`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes float1 {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-25px) rotate(15deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }
          @keyframes float2 {
            0% { transform: translateY(0px) rotate(0deg) scale(1); }
            50% { transform: translateY(20px) rotate(-10deg) scale(1.05); }
            100% { transform: translateY(0px) rotate(0deg) scale(1); }
          }
          .input-focus:focus {
            border-color: #1a4f76 !important;
            box-shadow: 0 0 0 3px rgba(26, 79, 118, 0.25) !important;
            transform: translateY(-1px);
          }
          .login-btn {
            transition: all 0.3s ease;
          }
          .login-btn:hover {
            background-color: #10375c !important;
            transform: translateY(-3px);
            box-shadow: 0 8px 15px rgba(16, 55, 92, 0.4) !important;
          }
        `}
      </style>

      {/* ARKA PLANDA UÇUŞAN YARI SAYDAM CAM PANELLER */}
      <div style={{
        position: 'absolute', top: '10%', left: '15%', width: '150px', height: '150px',
        background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)',
        borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)',
        animation: 'float1 8s infinite ease-in-out'
      }}></div>
      <div style={{
        position: 'absolute', bottom: '15%', right: '15%', width: '250px', height: '250px',
        background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(8px)',
        borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)',
        animation: 'float2 10s infinite ease-in-out'
      }}></div>
      <div style={{
        position: 'absolute', top: '40%', right: '5%', width: '80px', height: '80px',
        background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(12px)',
        borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)',
        animation: 'float1 6s infinite ease-in-out', animationDelay: '1s'
      }}></div>

      {/* ANA GİRİŞ KARTI */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '0 50px 40px 50px',
        borderRadius: '16px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
        width: '100%',
        maxWidth: '420px',
        textAlign: 'center',
        boxSizing: 'border-box',
        animation: 'fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        zIndex: 10,
        marginTop: '60px' 
      }}>
        
        {/* ROZET GİBİ YUKARI TAŞAN ŞIK LOGO ALANI */}
        <div style={{ 
          marginTop: '-60px', 
          marginBottom: '15px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '10px',
            borderRadius: '50%',
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
          }}>
            <img 
              src="/logo3.jpg" 
              alt="Karataş Cam Logo" 
              style={{ 
                width: '100px', 
                height: '100px',
                objectFit: 'contain',
                borderRadius: '50%',
                display: 'block'
              }} 
            />
          </div>
        </div>
        
        <h1 style={{ color: '#10375c', fontSize: '28px', margin: '0 0 10px 0', fontWeight: '900', letterSpacing: '-0.5px' }}>KARATAŞ CAM</h1>
        
        {/* SİSTEM BİLGİSİ ROZETİ */}
        <div style={{ 
          display: 'inline-block', backgroundColor: '#e9ecef', color: '#495057', 
          padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', 
          marginBottom: '20px' 
        }}>
          Teklif & Proforma Sistemi
        </div>

        {/* YENİ EKLENEN KARŞILAMA METNİ */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#2b3035', fontSize: '18px', margin: '0 0 5px 0', fontWeight: '700' }}>Sisteme Hoş Geldiniz 👋</h2>
          <p style={{ color: '#6c757d', fontSize: '14px', margin: '0' }}>Devam etmek için lütfen giriş yapınız.</p>
        </div>
        
        <form onSubmit={girisYap}>
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#495057', fontWeight: '700' }}>Kullanıcı Adı</label>
            <input 
              type="text" 
              className="input-focus"
              value={kullaniciAdi} 
              onChange={(e) => setKullaniciAdi(e.target.value)} 
              placeholder=""
              style={{ 
                width: '100%', padding: '14px 16px', borderRadius: '10px', 
                border: '1px solid #dee2e6', fontSize: '15px', boxSizing: 'border-box',
                outline: 'none', backgroundColor: '#f8f9fa', transition: 'all 0.2s'
              }} 
              required 
            />
          </div>

          <div style={{ marginBottom: '30px', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#495057', fontWeight: '700' }}>Şifre</label>
            <input 
              type="password" 
              className="input-focus"
              value={sifre} 
              onChange={(e) => setSifre(e.target.value)} 
              placeholder="••••••••"
              style={{ 
                width: '100%', padding: '14px 16px', borderRadius: '10px', 
                border: '1px solid #dee2e6', fontSize: '15px', boxSizing: 'border-box',
                outline: 'none', backgroundColor: '#f8f9fa', transition: 'all 0.2s'
              }} 
              required 
            />
          </div>
          
          {hata && (
            <div style={{ 
              color: '#842029', backgroundColor: '#f8d7da', padding: '12px', 
              borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: 'bold',
              border: '1px solid #f5c2c7', animation: 'fadeUp 0.3s ease-out'
            }}>
              {hata}
            </div>
          )}
          
          <button 
            type="submit" 
            className="login-btn"
            style={{ 
              width: '100%', padding: '16px', backgroundColor: '#1a4f76', 
              color: 'white', border: 'none', borderRadius: '10px', 
              fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(26, 79, 118, 0.2)',
              marginTop: '5px'
            }}
          >
            GÜVENLİ GİRİŞ YAP
          </button>
        </form>

        <div style={{ marginTop: '30px', fontSize: '13px', color: '#adb5bd', fontWeight: '500' }}>
          &copy; {new Date().getFullYear()} Karataşcam Şişecam. Tüm hakları saklıdır.
        </div>
      </div>
    </div>
  );
}