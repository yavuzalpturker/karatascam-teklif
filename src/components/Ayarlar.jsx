import React, { useState, useEffect } from 'react';

export default function Ayarlar() {
  // Yönetici State'leri
  const [adminKadi, setAdminKadi] = useState('');
  const [adminSifre, setAdminSifre] = useState('');
  
  // Personel State'leri
  const [personelKadi, setPersonelKadi] = useState('');
  const [personelSifre, setPersonelSifre] = useState('');

  const [mesaj, setMesaj] = useState({ tip: '', metin: '' });

  // Sayfa yüklendiğinde bilgileri LocalStorage'dan getir
  useEffect(() => {
    const kayitliSifreler = JSON.parse(localStorage.getItem('karatas_sifreler')) || {};
    
    // Eğer daha önceden kayıtlı kullanıcı adı yoksa eski varsayılanları koy
    setAdminKadi(kayitliSifreler.adminKadi || 'karatas');
    setAdminSifre(kayitliSifreler.admin || '1234');
    
    setPersonelKadi(kayitliSifreler.personelKadi || 'personel');
    setPersonelSifre(kayitliSifreler.personel || '1234');
  }, []);

  const gosterMesaj = (tip, metin) => {
    setMesaj({ tip, metin });
    setTimeout(() => setMesaj({ tip: '', metin: '' }), 3000);
  };

  const bilgileriKaydet = () => {
    if (adminSifre.length < 4 || personelSifre.length < 4) {
      gosterMesaj('error', 'Şifreler güvenlik için en az 4 haneli olmalıdır!');
      return;
    }
    if (!adminKadi.trim() || !personelKadi.trim()) {
      gosterMesaj('error', 'Kullanıcı adları boş bırakılamaz!');
      return;
    }

    const bilgiler = { 
      adminKadi: adminKadi.trim(), 
      admin: adminSifre, // Eski kodlar bozulmasın diye şifreyi eski key ile de tutuyoruz
      personelKadi: personelKadi.trim(), 
      personel: personelSifre
    };
    
    localStorage.setItem('karatas_sifreler', JSON.stringify(bilgiler));
    gosterMesaj('success', 'Kullanıcı adları ve şifreler başarıyla güncellendi!');
  };

  return (
    <section className="panel" style={{ marginTop: "30px", padding: "30px", width: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 className="panel__baslik" style={{ margin: 0, color: "#0f2942" }}>Sistem Yönetimi</h2>
        {mesaj.metin && (
          <div style={{ 
            padding: "8px 16px", 
            backgroundColor: mesaj.tip === 'success' ? "#dcfce7" : "#fee2e2", 
            color: mesaj.tip === 'success' ? "#166534" : "#991b1b",
            borderRadius: "6px",
            fontWeight: "bold",
            fontSize: "14px"
          }}>
            {mesaj.metin}
          </div>
        )}
      </div>

      <div style={{ backgroundColor: "#f8fafc", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
        <h3 style={{ borderBottom: "2px solid #0f2942", paddingBottom: "10px", color: "#0f2942", marginTop: 0 }}>🔐 Kullanıcı & Şifre Yönetimi</h3>
        <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>Sisteme giriş için kullanıcı adlarını ve şifreleri buradan değiştirebilirsiniz.</p>
        
        {/* YÖNETİCİ BİLGİLERİ */}
        <div style={{ marginBottom: "20px", paddingBottom: "15px", borderBottom: "1px dashed #cbd5e1" }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#334155" }}>Yönetici (Admin) Bilgileri</h4>
          <div style={{ display: "flex", gap: "15px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "5px", color: "#475569" }}>Kullanıcı Adı</label>
              <input 
                type="text" 
                value={adminKadi}
                onChange={(e) => setAdminKadi(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "5px", color: "#475569" }}>Şifre</label>
              <input 
                type="text" 
                value={adminSifre}
                onChange={(e) => setAdminSifre(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} 
              />
            </div>
          </div>
        </div>

        {/* PERSONEL BİLGİLERİ */}
        <div style={{ marginBottom: "25px" }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#334155" }}>Çalışan (Personel) Bilgileri</h4>
          <div style={{ display: "flex", gap: "15px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "5px", color: "#475569" }}>Kullanıcı Adı</label>
              <input 
                type="text" 
                value={personelKadi}
                onChange={(e) => setPersonelKadi(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "5px", color: "#475569" }}>Şifre</label>
              <input 
                type="text" 
                value={personelSifre}
                onChange={(e) => setPersonelSifre(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} 
              />
            </div>
          </div>
        </div>

        <button 
          onClick={bilgileriKaydet}
          style={{ width: "100%", backgroundColor: "#0f2942", color: "white", padding: "12px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "14px" }}
        >
          💾 Bilgileri Güncelle
        </button>
      </div>
    </section>
  );
}