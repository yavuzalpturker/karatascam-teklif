import React, { useState, useEffect } from 'react';

export default function Ayarlar() {
  // Şifre Ayarları State'leri
  const [adminSifre, setAdminSifre] = useState('');
  const [personelSifre, setPersonelSifre] = useState('');
  const [mesaj, setMesaj] = useState({ tip: '', metin: '' });

  // Sayfa yüklendiğinde şifreleri LocalStorage'dan getir
  useEffect(() => {
    const kayitliSifreler = JSON.parse(localStorage.getItem('karatas_sifreler')) || {
      admin: '1234',
      personel: '1234'
    };
    setAdminSifre(kayitliSifreler.admin);
    setPersonelSifre(kayitliSifreler.personel);
  }, []);

  const gosterMesaj = (tip, metin) => {
    setMesaj({ tip, metin });
    setTimeout(() => setMesaj({ tip: '', metin: '' }), 3000);
  };

  const sifreleriKaydet = () => {
    if(adminSifre.length < 4 || personelSifre.length < 4) {
      gosterMesaj('error', 'Şifreler güvenlik için en az 4 haneli olmalıdır!');
      return;
    }
    const sifreler = { admin: adminSifre, personel: personelSifre };
    localStorage.setItem('karatas_sifreler', JSON.stringify(sifreler));
    gosterMesaj('success', 'Şifreler başarıyla güncellendi!');
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

      {/* SADECE ŞİFRE AYARLARI KALDI */}
      <div style={{ backgroundColor: "#f8fafc", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
        <h3 style={{ borderBottom: "2px solid #0f2942", paddingBottom: "10px", color: "#0f2942", marginTop: 0 }}>🔐 Kullanıcı & Şifre Yönetimi</h3>
        <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>Sisteme giriş şifrelerini buradan değiştirebilirsiniz.</p>
        
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "5px", color: "#334155" }}>Yönetici (Admin) Şifresi - Kullanıcı Adı: <span style={{ color: "black" }}>karatas</span></label>
          <input 
            type="text" 
            value={adminSifre}
            onChange={(e) => setAdminSifre(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} 
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "5px", color: "#334155" }}>Çalışan (Personel) Şifresi - Kullanıcı Adı: <span style={{ color: "black" }}>personel</span></label>
          <input 
            type="text" 
            value={personelSifre}
            onChange={(e) => setPersonelSifre(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} 
          />
        </div>

        <button 
          onClick={sifreleriKaydet}
          style={{ width: "100%", backgroundColor: "#0f2942", color: "white", padding: "12px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "14px" }}
        >
          🔑 Şifreleri Güncelle
        </button>
      </div>
    </section>
  );
}