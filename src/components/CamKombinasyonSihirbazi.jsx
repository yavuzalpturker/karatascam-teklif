import { useState, useEffect } from "react";

// --- ŞİŞECAM GENİŞ CAM RENK VE TİP LİSTESİ ---
const CAM_RENKLERI = [
  "Clear (Şeffaf)", "Extra Clear", "Ultra Clear", "Satine Cam", "Füme", "Bronz", "Mavi", "Yeşil", 
  "Koyu Füme", "Derin Füme", "Açık Füme", "Turkuaz", "Ara Yeşil"
];

const AYNA_RENKLERI = [
  "Düz Ayna", "Füme Ayna", "Bronz Ayna", "Eskitme Ayna"
];

// --- ŞİŞECAM GLASSTOOL TÜM KAPLAMA SERİLERİ ---
const KAPLAMA_TURLERI = [
  "Kaplamasız (Düzcam)",
  "Emaye Boyalı",
  "Climax T 80", "Climax T 71", "Climax T 70", "Climax T 60", "Climax T 50", "Climax T 40", "Ecotherm T",
  "Duosol T 70", "Duosol T 70 One", "Duosol T 60", "Duosol T 58", "Duosol T 58 One", "Duosol T 51", "Duosol T 51 One", "Duosol T 50", "Duosol T 43/28",
  "Ecosol T 62", "Ecosol T 62/44", "Ecosol T 50",
  "Prosol T 60 One", "Prosol T 50", "Prosol T 40", "Prosol T Silver", "Prosol T Blue", "Prosol T Green", "Prosol T Bronze", "Prosol T Grey",
  "Coolplus T 70/37", "Coolplus T 70/40", "Coolplus T 60/40", "Coolplus T 50/33",
  "Low-E (Standart)", "Solar Low-E (Standart)", "Climax 80", "Climax 71", "Duosol 70", "Duosol 58", "Ecosol 62",
  "Tentesol Gümüş", "Tentesol Füme", "Tentesol Bronz", "Tentesol Mavi", "Tentesol Yeşil",
  "Tentesol T Gümüş (Temperlenebilir)", "Tentesol T Füme (Temperlenebilir)", "Tentesol T Bronz (Temperlenebilir)", "Tentesol T Mavi (Temperlenebilir)", "Tentesol T Yeşil (Temperlenebilir)",
  "Anti-Reflektif", "Kendi Kendini Temizleyen (Self-Cleaning)"
];

const KALINLIKLAR = ["2 mm", "3 mm", "4 mm", "5 mm", "6 mm", "8 mm", "10 mm", "12 mm", "15 mm", "19 mm"];
const CITA_KALINLIKLARI = ["6 mm", "8 mm", "9 mm", "10 mm", "12 mm", "14 mm", "15 mm", "16 mm", "18 mm", "20 mm", "22 mm", "24 mm"];

const CITA_TIPLERI = [
  "Alüminyum Çıta", 
  "Alüminyum Siyah Çıta", 
  "Warm Edge (Sıcak Kenar Çıta)"
];

const DOLGU_TIPLERI = [
  "Dolgu Yok",
  "Silikon Dolgu",
  "Thiokol Dolgu",
  "Poliüretan Dolgu"
];

const GAZ_TIPLERI = ["Hava", "Argon Gazı", "Kripton Gazı"];
const PVB_TURLERI = [
  "Şeffaf PVB (0.38)", "Şeffaf PVB (0.76)", "Şeffaf PVB (1.14)", "Şeffaf PVB (1.52)", 
  "Akustik PVB (0.38)", "Akustik PVB (0.76)", "Opak PVB", "Füme PVB", "Bronz PVB", 
  "Vanceva Renkli PVB", "Mesh PVB (Metal Fileli)", "SentryGlas (SG Ionoplast)"
];

// --- KÜÇÜLTÜLMÜŞ ÖZEL İŞLEM SEÇİCİ BİLEŞENİ ---
const CamIslemleriPaneli = ({ kenar, setKenar, temper, setTemper, delik, setDelik, oygu, setOygu }) => (
  <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px dashed #cbd5e1", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
    <div>
      <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#334155", marginBottom: "2px" }}>Kenar İşlemi</label>
      <select value={kenar} onChange={e => setKenar(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "11px", fontWeight: "600", color: "#1e293b", backgroundColor: "white" }}>
        <option>Düz Kesim (İşlemsiz)</option>
        <option>Rodajlı</option>
        <option>CNC Rodaj</option>
        <option>Bizoteli</option>
        <option>Pahlı</option>
      </select>
    </div>
    <div>
      <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#334155", marginBottom: "2px" }}>Temper İşlemi</label>
      <select value={temper} onChange={e => setTemper(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "11px", fontWeight: "600", color: "#1e293b", backgroundColor: "white" }}>
        <option>Tempersiz</option>
        <option>Temperli</option>
        <option>Yarı Temperli</option>
        <option>Bombeli Temperli</option>
      </select>
    </div>
    <div>
      <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#334155", marginBottom: "2px" }}>Delik İşlemi</label>
      <select value={delik} onChange={e => setDelik(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "11px", fontWeight: "600", color: "#1e293b", backgroundColor: "white" }}>
        <option>Delik Yok</option>
        <option>Delik Var</option>
      </select>
    </div>
    <div>
      <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#334155", marginBottom: "2px" }}>Oygu İşlemi</label>
      <select value={oygu} onChange={e => setOygu(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "11px", fontWeight: "600", color: "#1e293b", backgroundColor: "white" }}>
        <option>Oygu Yok</option>
        <option>Oygu Var</option>
        <option>CNC Oygu</option>
      </select>
    </div>
  </div>
);

const CamKatmaniSecici = ({ 
  title, bgColor, borderColor, 
  tip, setTip, kalinlik, setKalinlik, 
  lamK1, setLamK1, lamK2, setLamK2, lamPVB, setLamPVB, 
  renk, setRenk, renkListesi = CAM_RENKLERI, kaplama, setKaplama,
  kenar, setKenar, temper, setTemper, delik, setDelik, oygu, setOygu,
  isAyna = false
}) => (
  <div style={{ flex: 3, minWidth: "240px", padding: "10px", backgroundColor: bgColor, borderRadius: "8px", border: `1px solid ${borderColor}`, boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
      <label style={{ fontSize: "13px", fontWeight: "800", color: "#0f2942" }}>{title}</label>
      {setTip && (
        <select value={tip} onChange={e => setTip(e.target.value)} style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "4px", border: "1px solid #cbd5e1", backgroundColor: tip === "lamine" ? "#e0f2fe" : "white", fontWeight: "700", color: "#1e293b", cursor: "pointer" }}>
          <option value="tek">Tek Cam</option>
          <option value="lamine">Lamine Cam</option>
        </select>
      )}
    </div>

    {tip === "tek" || !tip ? (
      <div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
        <select value={kalinlik} onChange={(e) => setKalinlik(e.target.value)} style={{ flex: 1, padding: "7px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "12px", fontWeight: "700", color: "#1e293b", backgroundColor: "white" }}>{KALINLIKLAR.map(k => <option key={k} value={k}>{k}</option>)}</select>
        <select value={renk} onChange={(e) => setRenk(e.target.value)} style={{ flex: 2, padding: "7px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "12px", fontWeight: "600", color: "#1e293b", backgroundColor: "white" }}>{renkListesi.map(r => <option key={r} value={r}>{r}</option>)}</select>
      </div>
    ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "6px" }}>
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          <select value={lamK1} onChange={(e) => setLamK1(e.target.value)} style={{ flex: 1, padding: "7px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "12px", fontWeight: "700", color: "#1e293b", backgroundColor: "white" }}>{KALINLIKLAR.map(k => <option key={k} value={k}>{k}</option>)}</select>
          <span style={{ fontWeight: "800", color: "#64748b", fontSize: "14px" }}>+</span>
          <select value={lamK2} onChange={(e) => setLamK2(e.target.value)} style={{ flex: 1, padding: "7px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "12px", fontWeight: "700", color: "#1e293b", backgroundColor: "white" }}>{KALINLIKLAR.map(k => <option key={k} value={k}>{k}</option>)}</select>
        </div>
        <select value={lamPVB} onChange={(e) => setLamPVB(e.target.value)} style={{ width: "100%", padding: "7px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "11px", fontWeight: "600", color: "#1e293b", backgroundColor: "white" }}>{PVB_TURLERI.map(p => <option key={p} value={p}>{p}</option>)}</select>
        <select value={renk} onChange={(e) => setRenk(e.target.value)} style={{ width: "100%", padding: "7px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "11px", fontWeight: "600", color: "#1e293b", backgroundColor: "white" }}>{renkListesi.map(r => <option key={r} value={r}>{r}</option>)}</select>
      </div>
    )}

    {!isAyna && (
      <select value={kaplama} onChange={(e) => setKaplama(e.target.value)} style={{ width: "100%", padding: "7px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "12px", fontWeight: "700", color: "#0f2942", backgroundColor: "#f8fafc" }}>{KAPLAMA_TURLERI.map(kp => <option key={kp} value={kp}>{kp}</option>)}</select>
    )}

    <CamIslemleriPaneli 
      kenar={kenar} setKenar={setKenar} 
      temper={temper} setTemper={setTemper} 
      delik={delik} setDelik={setDelik} 
      oygu={oygu} setOygu={setOygu} 
    />
  </div>
);

export default function CamKombinasyonSihirbazi({ onKombinasyonSec, baslangicMetni, baslangicVerisi }) {
  const [camTuru, setCamTuru] = useState("isicam");

  const [tekCamKalinlik, setTekCamKalinlik] = useState("4 mm");
  const [tekCamRenk, setTekCamRenk] = useState("Clear (Şeffaf)");
  const [tekCamKaplama, setTekCamKaplama] = useState("Kaplamasız (Düzcam)");
  const [tekKenar, setTekKenar] = useState("Düz Kesim (İşlemsiz)");
  const [tekTemper, setTekTemper] = useState("Tempersiz");
  const [tekDelik, setTekDelik] = useState("Delik Yok");
  const [tekOygu, setTekOygu] = useState("Oygu Yok");

  // --- AYNA İÇİN STATE'LER ---
  const [aynaKalinlik, setAynaKalinlik] = useState("4 mm");
  const [aynaRenk, setAynaRenk] = useState("Düz Ayna");
  const [aynaKenar, setAynaKenar] = useState("Düz Kesim (İşlemsiz)");
  const [aynaTemper, setAynaTemper] = useState("Tempersiz");
  const [aynaDelik, setAynaDelik] = useState("Delik Yok");
  const [aynaOygu, setAynaOygu] = useState("Oygu Yok");

  // --- LAMİNE İÇİN ÇOKLU KATMAN STATE'LERİ ---
  const [lamineKatmanSayisi, setLamineKatmanSayisi] = useState(2);
  const [lamCamlar, setLamCamlar] = useState([
    { kalinlik: "4 mm", renk: "Clear (Şeffaf)", kaplama: "Kaplamasız (Düzcam)", kenar: "Düz Kesim (İşlemsiz)", temper: "Tempersiz", delik: "Delik Yok", oygu: "Oygu Yok" },
    { kalinlik: "4 mm", renk: "Clear (Şeffaf)", kaplama: "Kaplamasız (Düzcam)", kenar: "Düz Kesim (İşlemsiz)", temper: "Tempersiz", delik: "Delik Yok", oygu: "Oygu Yok" },
    { kalinlik: "4 mm", renk: "Clear (Şeffaf)", kaplama: "Kaplamasız (Düzcam)", kenar: "Düz Kesim (İşlemsiz)", temper: "Tempersiz", delik: "Delik Yok", oygu: "Oygu Yok" },
    { kalinlik: "4 mm", renk: "Clear (Şeffaf)", kaplama: "Kaplamasız (Düzcam)", kenar: "Düz Kesim (İşlemsiz)", temper: "Tempersiz", delik: "Delik Yok", oygu: "Oygu Yok" },
    { kalinlik: "4 mm", renk: "Clear (Şeffaf)", kaplama: "Kaplamasız (Düzcam)", kenar: "Düz Kesim (İşlemsiz)", temper: "Tempersiz", delik: "Delik Yok", oygu: "Oygu Yok" }
  ]);
  const [lamPvbLer, setLamPvbLer] = useState([
    "Şeffaf PVB (0.38)", "Şeffaf PVB (0.38)", "Şeffaf PVB (0.38)", "Şeffaf PVB (0.38)"
  ]);

  const [disCamTipi, setDisCamTipi] = useState("tek");
  const [disCamKalinlik, setDisCamKalinlik] = useState("4 mm");
  const [disCamLamK1, setDisCamLamK1] = useState("4 mm");
  const [disCamLamK2, setDisCamLamK2] = useState("4 mm");
  const [disCamLamPVB, setDisCamLamPVB] = useState("Şeffaf PVB (0.38)");
  const [disCamRenk, setDisCamRenk] = useState("Clear (Şeffaf)");
  const [disCamKaplama, setDisCamKaplama] = useState("Duosol T 70");
  const [disKenar, setDisKenar] = useState("Düz Kesim (İşlemsiz)");
  const [disTemper, setDisTemper] = useState("Tempersiz");
  const [disDelik, setDisDelik] = useState("Delik Yok");
  const [disOygu, setDisOygu] = useState("Oygu Yok");

  const [citaKalinlik, setCitaKalinlik] = useState("20 mm");
  const [citaTipi, setCitaTipi] = useState("Warm Edge (Sıcak Kenar Çıta)");
  const [gazTipi, setGazTipi] = useState("Argon Gazı");
  const [dolguTipi, setDolguTipi] = useState("Dolgu Yok");

  const [icCamTipi, setIcCamTipi] = useState("tek");
  const [icCamKalinlik, setIcCamKalinlik] = useState("4 mm");
  const [icCamLamK1, setIcCamLamK1] = useState("4 mm");
  const [icCamLamK2, setIcCamLamK2] = useState("4 mm");
  const [icCamLamPVB, setIcCamLamPVB] = useState("Şeffaf PVB (0.38)");
  const [icCamRenk, setIcCamRenk] = useState("Clear (Şeffaf)");
  const [icCamKaplama, setIcCamKaplama] = useState("Kaplamasız (Düzcam)");
  const [icKenar, setIcKenar] = useState("Düz Kesim (İşlemsiz)");
  const [icTemper, setIcTemper] = useState("Tempersiz");
  const [icDelik, setIcDelik] = useState("Delik Yok");
  const [icOygu, setIcOygu] = useState("Oygu Yok");

  const [uDisCamTipi, setUDisCamTipi] = useState("tek");
  const [uDisCamKalinlik, setUDisCamKalinlik] = useState("4 mm");
  const [uDisLamK1, setUDisLamK1] = useState("4 mm");
  const [uDisLamK2, setUDisLamK2] = useState("4 mm");
  const [uDisLamPVB, setUDisLamPVB] = useState("Şeffaf PVB (0.38)");
  const [uDisCamRenk, setUDisCamRenk] = useState("Clear (Şeffaf)");
  const [uDisCamKaplama, setUDisCamKaplama] = useState("Duosol T 70");
  const [uDisKenar, setUDisKenar] = useState("Düz Kesim (İşlemsiz)");
  const [uDisTemper, setUDisTemper] = useState("Tempersiz");
  const [uDisDelik, setUDisDelik] = useState("Delik Yok");
  const [uDisOygu, setUDisOygu] = useState("Oygu Yok");

  const [uCita1Kalinlik, setUCita1Kalinlik] = useState("16 mm");
  const [uCita1Tipi, setUCita1Tipi] = useState("Warm Edge (Sıcak Kenar Çıta)");
  const [uGaz1Tipi, setUGaz1Tipi] = useState("Argon Gazı");
  const [uDolgu1Tipi, setUDolgu1Tipi] = useState("Dolgu Yok");

  const [uOrtaCamTipi, setUOrtaCamTipi] = useState("tek");
  const [uOrtaCamKalinlik, setUOrtaCamKalinlik] = useState("4 mm");
  const [uOrtaLamK1, setUOrtaLamK1] = useState("4 mm");
  const [uOrtaLamK2, setUOrtaLamK2] = useState("4 mm");
  const [uOrtaLamPVB, setUOrtaLamPVB] = useState("Şeffaf PVB (0.38)");
  const [uOrtaCamRenk, setUOrtaCamRenk] = useState("Clear (Şeffaf)");
  const [uOrtaCamKaplama, setUOrtaCamKaplama] = useState("Kaplamasız (Düzcam)");
  const [uOrtaKenar, setUOrtaKenar] = useState("Düz Kesim (İşlemsiz)");
  const [uOrtaTemper, setUOrtaTemper] = useState("Tempersiz");
  const [uOrtaDelik, setUOrtaDelik] = useState("Delik Yok");
  const [uOrtaOygu, setUOrtaOygu] = useState("Oygu Yok");

  const [uCita2Kalinlik, setUCita2Kalinlik] = useState("16 mm");
  const [uCita2Tipi, setUCita2Tipi] = useState("Warm Edge (Sıcak Kenar Çıta)");
  const [uGaz2Tipi, setUGaz2Tipi] = useState("Argon Gazı");
  const [uDolgu2Tipi, setUDolgu2Tipi] = useState("Dolgu Yok");

  const [uIcCamTipi, setUIcCamTipi] = useState("tek");
  const [uIcCamKalinlik, setUIcCamKalinlik] = useState("4 mm");
  const [uIcLamK1, setUIcLamK1] = useState("4 mm");
  const [uIcLamK2, setUIcLamK2] = useState("4 mm");
  const [uIcLamPVB, setUIcLamPVB] = useState("Şeffaf PVB (0.38)");
  const [uIcCamRenk, setUIcCamRenk] = useState("Clear (Şeffaf)");
  const [uIcCamKaplama, setUIcCamKaplama] = useState("Climax T 71");
  const [uIcKenar, setUIcKenar] = useState("Düz Kesim (İşlemsiz)");
  const [uIcTemper, setUIcTemper] = useState("Tempersiz");
  const [uIcDelik, setUIcDelik] = useState("Delik Yok");
  const [uIcOygu, setUIcOygu] = useState("Oygu Yok");

  const [olusturulanIsim, setOlusturulanIsim] = useState("");

  const handleLamCamGuncelle = (index, alan, deger) => {
    const yeniCamlar = [...lamCamlar];
    yeniCamlar[index] = { ...yeniCamlar[index], [alan]: deger };

    if (index === 0) {
      for (let i = 1; i < yeniCamlar.length; i++) {
        yeniCamlar[i] = { ...yeniCamlar[i], [alan]: deger };
      }
    }

    setLamCamlar(yeniCamlar);
  };

  const handlePvbGuncelle = (index, deger) => {
    const yeniPvb = [...lamPvbLer];
    yeniPvb[index] = deger;

    if (index === 0) {
      for (let i = 1; i < yeniPvb.length; i++) {
        yeniPvb[i] = deger;
      }
    }

    setLamPvbLer(yeniPvb);
  };

  useEffect(() => {
    if (baslangicVerisi) {
      if(baslangicVerisi.camTuru) setCamTuru(baslangicVerisi.camTuru);

      if(baslangicVerisi.tekCamKalinlik) setTekCamKalinlik(baslangicVerisi.tekCamKalinlik);
      if(baslangicVerisi.tekCamRenk) setTekCamRenk(baslangicVerisi.tekCamRenk);
      if(baslangicVerisi.tekCamKaplama) setTekCamKaplama(baslangicVerisi.tekCamKaplama);
      if(baslangicVerisi.tekKenar) setTekKenar(baslangicVerisi.tekKenar);
      if(baslangicVerisi.tekTemper) setTekTemper(baslangicVerisi.tekTemper);
      if(baslangicVerisi.tekDelik) setTekDelik(baslangicVerisi.tekDelik);
      if(baslangicVerisi.tekOygu) setTekOygu(baslangicVerisi.tekOygu);

      if(baslangicVerisi.aynaKalinlik) setAynaKalinlik(baslangicVerisi.aynaKalinlik);
      if(baslangicVerisi.aynaRenk) setAynaRenk(baslangicVerisi.aynaRenk);
      if(baslangicVerisi.aynaKenar) setAynaKenar(baslangicVerisi.aynaKenar);
      if(baslangicVerisi.aynaTemper) setAynaTemper(baslangicVerisi.aynaTemper);
      if(baslangicVerisi.aynaDelik) setAynaDelik(baslangicVerisi.aynaDelik);
      if(baslangicVerisi.aynaOygu) setAynaOygu(baslangicVerisi.aynaOygu);

      if(baslangicVerisi.lamineKatmanSayisi) setLamineKatmanSayisi(baslangicVerisi.lamineKatmanSayisi);
      if(baslangicVerisi.lamCamlar) setLamCamlar(baslangicVerisi.lamCamlar);
      if(baslangicVerisi.lamPvbLer) setLamPvbLer(baslangicVerisi.lamPvbLer);

      if(baslangicVerisi.disCamTipi) setDisCamTipi(baslangicVerisi.disCamTipi);
      if(baslangicVerisi.disCamKalinlik) setDisCamKalinlik(baslangicVerisi.disCamKalinlik);
      if(baslangicVerisi.disCamLamK1) setDisCamLamK1(baslangicVerisi.disCamLamK1);
      if(baslangicVerisi.disCamLamK2) setDisCamLamK2(baslangicVerisi.disCamLamK2);
      if(baslangicVerisi.disCamLamPVB) setDisCamLamPVB(baslangicVerisi.disCamLamPVB);
      if(baslangicVerisi.disCamRenk) setDisCamRenk(baslangicVerisi.disCamRenk);
      if(baslangicVerisi.disCamKaplama) setDisCamKaplama(baslangicVerisi.disCamKaplama);
      if(baslangicVerisi.disKenar) setDisKenar(baslangicVerisi.disKenar);
      if(baslangicVerisi.disTemper) setDisTemper(baslangicVerisi.disTemper);
      if(baslangicVerisi.disDelik) setDisDelik(baslangicVerisi.disDelik);
      if(baslangicVerisi.disOygu) setDisOygu(baslangicVerisi.disOygu);

      if(baslangicVerisi.citaKalinlik) setCitaKalinlik(baslangicVerisi.citaKalinlik);
      if(baslangicVerisi.citaTipi) setCitaTipi(baslangicVerisi.citaTipi);
      if(baslangicVerisi.gazTipi) setGazTipi(baslangicVerisi.gazTipi);
      if(baslangicVerisi.dolguTipi) setDolguTipi(baslangicVerisi.dolguTipi);

      if(baslangicVerisi.icCamTipi) setIcCamTipi(baslangicVerisi.icCamTipi);
      if(baslangicVerisi.icCamKalinlik) setIcCamKalinlik(baslangicVerisi.icCamKalinlik);
      if(baslangicVerisi.icCamLamK1) setIcCamLamK1(baslangicVerisi.icCamLamK1);
      if(baslangicVerisi.icCamLamK2) setIcCamLamK2(baslangicVerisi.icCamLamK2);
      if(baslangicVerisi.icCamLamPVB) setIcCamLamPVB(baslangicVerisi.icCamLamPVB);
      if(baslangicVerisi.icCamRenk) setIcCamRenk(baslangicVerisi.icCamRenk);
      if(baslangicVerisi.icCamKaplama) setIcCamKaplama(baslangicVerisi.icCamKaplama);
      if(baslangicVerisi.icKenar) setIcKenar(baslangicVerisi.icKenar);
      if(baslangicVerisi.icTemper) setIcTemper(baslangicVerisi.icTemper);
      if(baslangicVerisi.icDelik) setIcDelik(baslangicVerisi.icDelik);
      if(baslangicVerisi.icOygu) setIcOygu(baslangicVerisi.icOygu);

      if(baslangicVerisi.uDisCamTipi) setUDisCamTipi(baslangicVerisi.uDisCamTipi);
      if(baslangicVerisi.uDisCamKalinlik) setUDisCamKalinlik(baslangicVerisi.uDisCamKalinlik);
      if(baslangicVerisi.uDisLamK1) setUDisLamK1(baslangicVerisi.uDisLamK1);
      if(baslangicVerisi.uDisLamK2) setUDisLamK2(baslangicVerisi.uDisLamK2);
      if(baslangicVerisi.uDisLamPVB) setUDisLamPVB(baslangicVerisi.uDisLamPVB);
      if(baslangicVerisi.uDisCamRenk) setUDisCamRenk(baslangicVerisi.uDisCamRenk);
      if(baslangicVerisi.uDisCamKaplama) setUDisCamKaplama(baslangicVerisi.uDisCamKaplama);
      if(baslangicVerisi.uDisKenar) setUDisKenar(baslangicVerisi.uDisKenar);
      if(baslangicVerisi.uDisTemper) setUDisTemper(baslangicVerisi.uDisTemper);
      if(baslangicVerisi.uDisDelik) setUDisDelik(baslangicVerisi.uDisDelik);
      if(baslangicVerisi.uDisOygu) setUDisOygu(baslangicVerisi.uDisOygu);

      if(baslangicVerisi.uCita1Kalinlik) setUCita1Kalinlik(baslangicVerisi.uCita1Kalinlik);
      if(baslangicVerisi.uCita1Tipi) setUCita1Tipi(baslangicVerisi.uCita1Tipi);
      if(baslangicVerisi.uGaz1Tipi) setUGaz1Tipi(baslangicVerisi.uGaz1Tipi);
      if(baslangicVerisi.uDolgu1Tipi) setUDolgu1Tipi(baslangicVerisi.uDolgu1Tipi);

      if(baslangicVerisi.uOrtaCamTipi) setUOrtaCamTipi(baslangicVerisi.uOrtaCamTipi);
      if(baslangicVerisi.uOrtaCamKalinlik) setUOrtaCamKalinlik(baslangicVerisi.uOrtaCamKalinlik);
      if(baslangicVerisi.uOrtaLamK1) setUOrtaLamK1(baslangicVerisi.uOrtaLamK1);
      if(baslangicVerisi.uOrtaLamK2) setUOrtaLamK2(baslangicVerisi.uOrtaLamK2);
      if(baslangicVerisi.uOrtaLamPVB) setUOrtaLamPVB(baslangicVerisi.uOrtaLamPVB);
      if(baslangicVerisi.uOrtaCamRenk) setUOrtaCamRenk(baslangicVerisi.uOrtaCamRenk);
      if(baslangicVerisi.uOrtaCamKaplama) setUOrtaCamKaplama(baslangicVerisi.uOrtaCamKaplama);
      if(baslangicVerisi.uOrtaKenar) setUOrtaKenar(baslangicVerisi.uOrtaKenar);
      if(baslangicVerisi.uOrtaTemper) setUOrtaTemper(baslangicVerisi.uOrtaTemper);
      if(baslangicVerisi.uOrtaDelik) setUOrtaDelik(baslangicVerisi.uOrtaDelik);
      if(baslangicVerisi.uOrtaOygu) setUOrtaOygu(baslangicVerisi.uOrtaOygu);

      if(baslangicVerisi.uCita2Kalinlik) setUCita2Kalinlik(baslangicVerisi.uCita2Kalinlik);
      if(baslangicVerisi.uCita2Tipi) setUCita2Tipi(baslangicVerisi.uCita2Tipi);
      if(baslangicVerisi.uGaz2Tipi) setUGaz2Tipi(baslangicVerisi.uGaz2Tipi);
      if(baslangicVerisi.uDolgu2Tipi) setUDolgu2Tipi(baslangicVerisi.uDolgu2Tipi);

      if(baslangicVerisi.uIcCamTipi) setUIcCamTipi(baslangicVerisi.uIcCamTipi);
      if(baslangicVerisi.uIcCamKalinlik) setUIcCamKalinlik(baslangicVerisi.uIcCamKalinlik);
      if(baslangicVerisi.uIcLamK1) setUIcLamK1(baslangicVerisi.uIcLamK1);
      if(baslangicVerisi.uIcLamK2) setUIcLamK2(baslangicVerisi.uIcLamK2);
      if(baslangicVerisi.uIcLamPVB) setUIcLamPVB(baslangicVerisi.uIcLamPVB);
      if(baslangicVerisi.uIcCamRenk) setUIcCamRenk(baslangicVerisi.uIcCamRenk);
      if(baslangicVerisi.uIcCamKaplama) setUIcCamKaplama(baslangicVerisi.uIcCamKaplama);
      if(baslangicVerisi.uIcKenar) setUIcKenar(baslangicVerisi.uIcKenar);
      if(baslangicVerisi.uIcTemper) setUIcTemper(baslangicVerisi.uIcTemper);
      if(baslangicVerisi.uIcDelik) setUIcDelik(baslangicVerisi.uIcDelik);
      if(baslangicVerisi.uIcOygu) setUIcOygu(baslangicVerisi.uIcOygu);
      
      return; 
    }

    if (!baslangicMetni) return;
    const m = baslangicMetni;
    const upperM = m.toLocaleUpperCase("tr-TR");

    if (upperM.includes("ÜÇLÜ ISICAM")) setCamTuru("ucIliIsicam");
    else if (upperM.includes("ISICAM")) setCamTuru("isicam");
    else if (upperM.includes("LAMİNE CAM")) setCamTuru("lamine");
    else if (upperM.includes("AYNA")) setCamTuru("ayna");
    else if (upperM.includes("CAM")) setCamTuru("tek");

    const parseCamStr = (str, setTip, setKal, setK1, setK2, setPvb, setRenk, setKap, setKenar, setTemper, setDelik, setOygu, isAyna = false) => {
      if (!str) return;
      const lamineMatch = str.match(/(\d+)\s*\+\s*(\d+)\s*mm/);
      if (lamineMatch || str.toLocaleUpperCase("tr-TR").includes("LAMİNE")) {
        setTip("lamine");
        if (lamineMatch) {
          setK1(`${lamineMatch[1]} mm`);
          setK2(`${lamineMatch[2]} mm`);
        }
        let pvbBulundu = "Şeffaf PVB (0.38)";
        for(let p of PVB_TURLERI) { if (str.includes(p)) { pvbBulundu = p; break; } }
        setPvb(pvbBulundu);
      } else {
        setTip("tek");
        const kalMatch = str.match(/(\d+\s*mm)/);
        if (kalMatch) setKal(kalMatch[1]);
      }

      let renkBulundu = isAyna ? "Düz Ayna" : "Clear (Şeffaf)";
      const kaynakListe = isAyna ? AYNA_RENKLERI : CAM_RENKLERI;
      for (let r of kaynakListe) { if (str.includes(r)) { renkBulundu = r; break; } }
      setRenk(renkBulundu);

      let kapBulundu = "Kaplamasız (Düzcam)";
      const siraliKaplamalar = [...KAPLAMA_TURLERI].sort((a,b) => b.length - a.length);
      for (let kp of siraliKaplamalar) { if (kp !== "Kaplamasız (Düzcam)" && str.includes(kp)) { kapBulundu = kp; break; } }
      setKap(kapBulundu);

      if (str.includes("Rodajlı")) setKenar("Rodajlı");
      else if (str.includes("CNC Rodaj")) setKenar("CNC Rodaj");
      else if (str.includes("Bizoteli")) setKenar("Bizoteli");
      else if (str.includes("Pahlı")) setKenar("Pahlı");
      else setKenar("Düz Kesim (İşlemsiz)");

      if (str.includes("Bombeli Temperli")) setTemper("Bombeli Temperli");
      else if (str.includes("Yarı Temperli")) setTemper("Yarı Temperli");
      else if (str.includes("Temperli")) setTemper("Temperli");
      else setTemper("Tempersiz");

      setDelik(str.includes("Delikli") ? "Delik Var" : "Delik Yok");
      if (str.includes("CNC Oygu")) setOygu("CNC Oygu");
      else if (str.includes("Oygulu") || str.includes("Oygu Var")) setOygu("Oygu Var");
      else setOygu("Oygu Yok");
    };

    const parseBoslukStr = (str, setKal, setTip, setGaz, setDolgu) => {
      if (!str) return;
      const kalMatch = str.match(/(\d+\s*mm)/);
      if (kalMatch) setKal(kalMatch[1]);
      for (let ct of CITA_TIPLERI) { if (str.includes(ct)) { setTip(ct); break; } }
      for (let g of GAZ_TIPLERI) { if (str.includes(g)) { setGaz(g); break; } }
      let dolguBulundu = "Dolgu Yok";
      for (let dt of DOLGU_TIPLERI) { if (dt !== "Dolgu Yok" && str.includes(dt)) { dolguBulundu = dt; break; } }
      setDolgu(dolguBulundu);
    };

    let parts = m.replace(/\s*(ISICAM|ÜÇLÜ ISICAM|LAMİNE CAM|AYNA|CAM)$/i, "").split(/\s+\+\s+/);

    if (upperM.includes("ISICAM") && !upperM.includes("ÜÇLÜ")) {
      if (parts[0]) parseCamStr(parts[0], setDisCamTipi, setDisCamKalinlik, setDisCamLamK1, setDisCamLamK2, setDisCamLamPVB, setDisCamRenk, setDisCamKaplama, setDisKenar, setDisTemper, setDisDelik, setDisOygu);
      if (parts[1]) parseBoslukStr(parts[1], setCitaKalinlik, setCitaTipi, setGazTipi, setDolguTipi);
      if (parts.length === 4) {
        parseBoslukStr(parts[2], () => {}, () => {}, () => {}, setDolguTipi);
        parseCamStr(parts[3], setIcCamTipi, setIcCamKalinlik, setIcCamLamK1, setIcCamLamK2, setIcCamLamPVB, setIcCamRenk, setIcCamKaplama, setIcKenar, setIcTemper, setIcDelik, setIcOygu);
      } else if (parts[2]) {
        parseCamStr(parts[2], setIcCamTipi, setIcCamKalinlik, setIcCamLamK1, setIcCamLamK2, setIcCamLamPVB, setIcCamRenk, setIcCamKaplama, setIcKenar, setIcTemper, setIcDelik, setIcOygu);
      }
    }
    else if (upperM.includes("AYNA")) parseCamStr(m, () => {}, setAynaKalinlik, setAynaKalinlik, setAynaKalinlik, () => {}, setAynaRenk, () => {}, setAynaKenar, setAynaTemper, setAynaDelik, setAynaOygu, true);
    else if (upperM.includes("CAM")) parseCamStr(m, () => {}, setTekCamKalinlik, setTekCamKalinlik, setTekCamKalinlik, () => {}, setTekCamRenk, setTekCamKaplama, setTekKenar, setTekTemper, setTekDelik, setTekOygu);

  }, [baslangicMetni, baslangicVerisi]);

  // --- İSİM OLUŞTURUCU ---
  const formatPane = (tip, kal, lamK1, lamK2, pvb, renk, kap, kenar, temper, delik, oygu, isAyna = false) => {
    const kapStr = (!isAyna && kap !== "Kaplamasız (Düzcam)") ? ` ${kap}` : "";
    let base = "";
    if (tip === "lamine") {
      const l1 = lamK1.replace(" mm", "");
      const l2 = lamK2.replace(" mm", "");
      base = `${l1}+${l2} mm ${renk} Lamine (${pvb})${kapStr}`;
    } else {
      base = `${kal} ${renk}${kapStr}`;
    }

    let islemList = [];
    if (kenar && kenar !== "Düz Kesim (İşlemsiz)") islemList.push(kenar);
    if (temper && temper !== "Tempersiz") islemList.push(temper);
    if (delik === "Delik Var") islemList.push("Delikli");
    if (oygu === "Oygu Var" || oygu === "CNC Oygu") islemList.push(oygu);

    if (islemList.length > 0) {
      base += ` [ ${islemList.join(" - ")} ]`;
    }
    return base;
  };

  useEffect(() => {
    let isim = "";
    if (camTuru === "tek") {
      isim = formatPane("tek", tekCamKalinlik, "", "", "", tekCamRenk, tekCamKaplama, tekKenar, tekTemper, tekDelik, tekOygu) + " CAM";
    } 
    else if (camTuru === "ayna") {
      isim = formatPane("tek", aynaKalinlik, "", "", "", aynaRenk, "", aynaKenar, aynaTemper, aynaDelik, aynaOygu, true);
    }
    else if (camTuru === "lamine") {
      let parcalar = [];
      for (let i = 0; i < lamineKatmanSayisi; i++) {
        const c = lamCamlar[i];
        const camStr = formatPane("tek", c.kalinlik, "", "", "", c.renk, c.kaplama, c.kenar, c.temper, c.delik, c.oygu);
        parcalar.push(camStr);
        if (i < lamineKatmanSayisi - 1) {
          const pvb = lamPvbLer[i] || "Şeffaf PVB (0.38)";
          parcalar.push(`${pvb}`);
        }
      }
      isim = `${parcalar.join(" + ")} LAMİNE CAM`;
    } 
    else if (camTuru === "isicam") {
      const disCamStr = formatPane(disCamTipi, disCamKalinlik, disCamLamK1, disCamLamK2, disCamLamPVB, disCamRenk, disCamKaplama, disKenar, disTemper, disDelik, disOygu);
      const icCamStr = formatPane(icCamTipi, icCamKalinlik, icCamLamK1, icCamLamK2, icCamLamPVB, icCamRenk, icCamKaplama, icKenar, icTemper, icDelik, icOygu);
      let boslukStr = `${citaKalinlik} ${citaTipi} (${gazTipi})`;
      if (dolguTipi && dolguTipi !== "Dolgu Yok") boslukStr += ` + ${dolguTipi}`;
      isim = `${disCamStr} + ${boslukStr} + ${icCamStr} ISICAM`;
    }
    else if (camTuru === "ucIliIsicam") {
      const disCamStr = formatPane(uDisCamTipi, uDisCamKalinlik, uDisLamK1, uDisLamK2, uDisLamPVB, uDisCamRenk, uDisCamKaplama, uDisKenar, uDisTemper, uDisDelik, uDisOygu);
      const ortaCamStr = formatPane(uOrtaCamTipi, uOrtaCamKalinlik, uOrtaLamK1, uOrtaLamK2, uOrtaLamPVB, uOrtaCamRenk, uOrtaCamKaplama, uOrtaKenar, uOrtaTemper, uOrtaDelik, uOrtaOygu);
      const icCamStr = formatPane(uIcCamTipi, uIcCamKalinlik, uIcLamK1, uIcLamK2, uIcLamPVB, uIcCamRenk, uIcCamKaplama, uIcKenar, uIcTemper, uIcDelik, uIcOygu);
      
      let bosluk1Str = `${uCita1Kalinlik} ${uCita1Tipi} (${uGaz1Tipi})`;
      if (uDolgu1Tipi && uDolgu1Tipi !== "Dolgu Yok") bosluk1Str += ` + ${uDolgu1Tipi}`;
      let bosluk2Str = `${uCita2Kalinlik} ${uCita2Tipi} (${uGaz2Tipi})`;
      if (uDolgu2Tipi && uDolgu2Tipi !== "Dolgu Yok") bosluk2Str += ` + ${uDolgu2Tipi}`;

      isim = `${disCamStr} + ${bosluk1Str} + ${ortaCamStr} + ${bosluk2Str} + ${icCamStr} ÜÇLÜ ISICAM`;
    }
    setOlusturulanIsim(isim);
  }, [
    camTuru, tekCamKalinlik, tekCamRenk, tekCamKaplama, tekKenar, tekTemper, tekDelik, tekOygu,
    aynaKalinlik, aynaRenk, aynaKenar, aynaTemper, aynaDelik, aynaOygu,
    lamineKatmanSayisi, lamCamlar, lamPvbLer,
    disCamTipi, disCamKalinlik, disCamLamK1, disCamLamK2, disCamLamPVB, disCamRenk, disCamKaplama, disKenar, disTemper, disDelik, disOygu,
    citaKalinlik, citaTipi, gazTipi, dolguTipi,
    icCamTipi, icCamKalinlik, icCamLamK1, icCamLamK2, icCamLamPVB, icCamRenk, icCamKaplama, icKenar, icTemper, icDelik, icOygu,
    uDisCamTipi, uDisCamKalinlik, uDisLamK1, uDisLamK2, uDisLamPVB, uDisCamRenk, uDisCamKaplama, uDisKenar, uDisTemper, uDisDelik, uDisOygu,
    uCita1Kalinlik, uCita1Tipi, uGaz1Tipi, uDolgu1Tipi,
    uOrtaCamTipi, uOrtaCamKalinlik, uOrtaLamK1, uOrtaLamK2, uOrtaLamPVB, uOrtaCamRenk, uOrtaCamKaplama, uOrtaKenar, uOrtaTemper, uOrtaDelik, uOrtaOygu,
    uCita2Kalinlik, uCita2Tipi, uGaz2Tipi, uDolgu2Tipi,
    uIcCamTipi, uIcCamKalinlik, uIcLamK1, uIcLamK2, uIcLamPVB, uIcCamRenk, uIcCamKaplama, uIcKenar, uIcTemper, uIcDelik, uIcOygu
  ]);

  const aktar = () => {
    const durum = {
      camTuru,
      tekCamKalinlik, tekCamRenk, tekCamKaplama, tekKenar, tekTemper, tekDelik, tekOygu,
      aynaKalinlik, aynaRenk, aynaKenar, aynaTemper, aynaDelik, aynaOygu,
      lamineKatmanSayisi, lamCamlar, lamPvbLer,
      disCamTipi, disCamKalinlik, disCamLamK1, disCamLamK2, disCamLamPVB, disCamRenk, disCamKaplama, disKenar, disTemper, disDelik, disOygu,
      citaKalinlik, citaTipi, gazTipi, dolguTipi,
      icCamTipi, icCamKalinlik, icCamLamK1, icCamLamK2, icCamLamPVB, icCamRenk, icCamKaplama, icKenar, icTemper, icDelik, icOygu,
      uDisCamTipi, uDisCamKalinlik, uDisLamK1, uDisLamK2, uDisLamPVB, uDisCamRenk, uDisCamKaplama, uDisKenar, uDisTemper, uDisDelik, uDisOygu,
      uCita1Kalinlik, uCita1Tipi, uGaz1Tipi, uDolgu1Tipi,
      uOrtaCamTipi, uOrtaCamKalinlik, uOrtaLamK1, uOrtaLamK2, uOrtaLamPVB, uOrtaCamRenk, uOrtaCamKaplama, uOrtaKenar, uOrtaTemper, uOrtaDelik, uOrtaOygu,
      uCita2Kalinlik, uCita2Tipi, uGaz2Tipi, uDolgu2Tipi,
      uIcCamTipi, uIcCamKalinlik, uIcLamK1, uIcLamK2, uIcLamPVB, uIcCamRenk, uIcCamKaplama, uIcKenar, uIcTemper, uIcDelik, uIcOygu
    };
    if (onKombinasyonSec) onKombinasyonSec(olusturulanIsim, durum);
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #cbd5e1", marginBottom: "16px", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
      <h3 style={{ margin: "0 0 10px 0", color: "#0f2942", fontSize: "15px", fontWeight: "900" }}>
        Şişecam Katmanlı Cam & Kaplama Sihirbazı
      </h3>

      <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
        {[
          { id: "isicam", label: "Isıcam (Çift Cam)" },
          { id: "ucIliIsicam", label: "Üçlü Isıcam" },
          { id: "lamine", label: "Lamine Cam" },
          { id: "tek", label: "Tek Cam" },
          { id: "ayna", label: "Ayna" }
        ].map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCamTuru(item.id)}
            style={{
              flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1",
              backgroundColor: camTuru === item.id ? "#0f2942" : "white",
              color: camTuru === item.id ? "white" : "#334155",
              fontWeight: "700", fontSize: "12px", cursor: "pointer",
              boxShadow: camTuru === item.id ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
              transition: "all 0.2s ease"
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "stretch", backgroundColor: "white", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
        
        {camTuru === "tek" && (
          <CamKatmaniSecici 
            title="Tek Cam Katmanı" bgColor="#f8fafc" borderColor="#cbd5e1"
            kalinlik={tekCamKalinlik} setKalinlik={setTekCamKalinlik}
            renk={tekCamRenk} setRenk={setTekCamRenk} renkListesi={CAM_RENKLERI}
            kaplama={tekCamKaplama} setKaplama={setTekCamKaplama}
            kenar={tekKenar} setKenar={setTekKenar}
            temper={tekTemper} setTemper={setTekTemper}
            delik={tekDelik} setDelik={setTekDelik}
            oygu={tekOygu} setOygu={setTekOygu}
          />
        )}

        {camTuru === "ayna" && (
          <CamKatmaniSecici 
            title="Ayna Seçimi" bgColor="#f8fafc" borderColor="#cbd5e1"
            kalinlik={aynaKalinlik} setKalinlik={setAynaKalinlik}
            renk={aynaRenk} setRenk={setAynaRenk} renkListesi={AYNA_RENKLERI}
            kenar={aynaKenar} setKenar={setAynaKenar}
            temper={aynaTemper} setTemper={setAynaTemper}
            delik={aynaDelik} setDelik={setAynaDelik}
            oygu={aynaOygu} setOygu={setAynaOygu}
            isAyna={true}
          />
        )}

        {camTuru === "lamine" && (
          <div style={{ width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", backgroundColor: "#e2e8f0", padding: "6px 10px", borderRadius: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: "800", color: "#0f2942" }}>Lamine Katman Sayısı:</label>
              <select 
                value={lamineKatmanSayisi} 
                onChange={(e) => setLamineKatmanSayisi(parseInt(e.target.value))}
                style={{ padding: "4px 10px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "12px", fontWeight: "700", color: "#0f2942", backgroundColor: "white", cursor: "pointer" }}
              >
                <option value={2}>2'li Lamine</option>
                <option value={3}>3'lü Lamine</option>
                <option value={4}>4'lü Lamine</option>
                <option value={5}>5'li Lamine</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center", overflowX: "auto", paddingBottom: "4px" }}>
              {Array.from({ length: lamineKatmanSayisi }).map((_, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                  <CamKatmaniSecici 
                    title={`${i + 1}. Katman (Cam veya Ayna)`} bgColor="#f8fafc" borderColor="#cbd5e1"
                    tip="tek"
                    kalinlik={lamCamlar[i].kalinlik} setKalinlik={(val) => handleLamCamGuncelle(i, 'kalinlik', val)}
                    renk={lamCamlar[i].renk} setRenk={(val) => handleLamCamGuncelle(i, 'renk', val)} 
                    renkListesi={[...CAM_RENKLERI, ...AYNA_RENKLERI]}
                    kaplama={lamCamlar[i].kaplama} setKaplama={(val) => handleLamCamGuncelle(i, 'kaplama', val)}
                    kenar={lamCamlar[i].kenar} setKenar={(val) => handleLamCamGuncelle(i, 'kenar', val)}
                    temper={lamCamlar[i].temper} setTemper={(val) => handleLamCamGuncelle(i, 'temper', val)}
                    delik={lamCamlar[i].delik} setDelik={(val) => handleLamCamGuncelle(i, 'delik', val)}
                    oygu={lamCamlar[i].oygu} setOygu={(val) => handleLamCamGuncelle(i, 'oygu', val)}
                  />

                  {i < lamineKatmanSayisi - 1 && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                      <span style={{ fontWeight: "800", color: "#64748b", fontSize: "14px" }}>+</span>
                      <div style={{ padding: "8px", backgroundColor: "#f1f5f9", borderRadius: "6px", border: "1px solid #cbd5e1", width: "170px" }}>
                        <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#334155", marginBottom: "4px" }}>PVB Film</label>
                        <select 
                          value={lamPvbLer[i] || "Şeffaf PVB (0.38)"} 
                          onChange={(e) => handlePvbGuncelle(i, e.target.value)} 
                          style={{ width: "100%", padding: "7px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "12px", fontWeight: "700", color: "#1e293b", backgroundColor: "white" }}
                        >
                          {PVB_TURLERI.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <span style={{ fontWeight: "800", color: "#64748b", fontSize: "14px" }}>+</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {camTuru === "isicam" && (
          <div style={{ display: "flex", gap: "10px", width: "100%", alignItems: "center" }}>
            <CamKatmaniSecici 
              title="1. Dış Cam" bgColor="#f8fafc" borderColor="#cbd5e1"
              tip={disCamTipi} setTip={setDisCamTipi} kalinlik={disCamKalinlik} setKalinlik={setDisCamKalinlik}
              lamK1={disCamLamK1} setLamK1={setDisCamLamK1} lamK2={disCamLamK2} setLamK2={setDisCamLamK2} lamPVB={disCamLamPVB} setLamPVB={setDisCamLamPVB}
              renk={disCamRenk} setRenk={setDisCamRenk} renkListesi={[...CAM_RENKLERI, ...AYNA_RENKLERI]} kaplama={disCamKaplama} setKaplama={setDisCamKaplama}
              kenar={disKenar} setKenar={setDisKenar} temper={disTemper} setTemper={setDisTemper}
              delik={disDelik} setDelik={setDisDelik} oygu={disOygu} setOygu={setDisOygu}
            />
            
            <div style={{ fontWeight: "800", color: "#64748b", fontSize: "18px", padding: "0 4px" }}>+</div>
            
            <div style={{ flex: 1.5, padding: "10px", backgroundColor: "#f1f5f9", borderRadius: "8px", border: "1px solid #cbd5e1", alignSelf: "stretch", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#334155", marginBottom: "6px" }}>Ara Boşluk & Çıta</label>
              <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                <select value={citaKalinlik} onChange={(e) => setCitaKalinlik(e.target.value)} style={{ flex: 1, padding: "7px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "11px", fontWeight: "700", color: "#1e293b", backgroundColor: "white" }}>
                  {CITA_KALINLIKLARI.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <select value={gazTipi} onChange={(e) => setGazTipi(e.target.value)} style={{ flex: 1, padding: "7px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "11px", fontWeight: "700", color: "#1e293b", backgroundColor: "white" }}>
                  {GAZ_TIPLERI.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: "4px" }}>
                <select value={citaTipi} onChange={(e) => setCitaTipi(e.target.value)} style={{ flex: 1, padding: "7px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "11px", fontWeight: "600", color: "#1e293b", backgroundColor: "white" }}>
                  {CITA_TIPLERI.map(ct => <option key={ct} value={ct}>{ct}</option>)}
                </select>
                <select value={dolguTipi} onChange={(e) => setDolguTipi(e.target.value)} style={{ flex: 1, padding: "7px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "11px", fontWeight: "600", color: "#1e293b", backgroundColor: "white" }}>
                  {DOLGU_TIPLERI.map(dt => <option key={dt} value={dt}>{dt}</option>)}
                </select>
              </div>
            </div>

            <div style={{ fontWeight: "800", color: "#64748b", fontSize: "18px", padding: "0 4px" }}>+</div>

            <CamKatmaniSecici 
              title="2. İç Cam" bgColor="#f8fafc" borderColor="#cbd5e1"
              tip={icCamTipi} setTip={setIcCamTipi} kalinlik={icCamKalinlik} setKalinlik={setIcCamKalinlik}
              lamK1={icCamLamK1} setLamK1={setIcCamLamK1} lamK2={icCamLamK2} setLamK2={setIcCamLamK2} lamPVB={icCamLamPVB} setLamPVB={setIcCamLamPVB}
              renk={icCamRenk} setRenk={setIcCamRenk} renkListesi={[...CAM_RENKLERI, ...AYNA_RENKLERI]} kaplama={icCamKaplama} setKaplama={setIcCamKaplama}
              kenar={icKenar} setKenar={setIcKenar} temper={icTemper} setTemper={setIcTemper}
              delik={icDelik} setDelik={setIcDelik} oygu={icOygu} setOygu={setIcOygu}
            />
          </div>
        )}

        {camTuru === "ucIliIsicam" && (
          <div style={{ display: "flex", gap: "6px", width: "100%", alignItems: "center" }}>
            <CamKatmaniSecici 
              title="1. Dış" bgColor="#f8fafc" borderColor="#cbd5e1" 
              tip={uDisCamTipi} setTip={setUDisCamTipi} kalinlik={uDisCamKalinlik} setKalinlik={setUDisCamKalinlik} 
              lamK1={uDisLamK1} setLamK1={setUDisLamK1} lamK2={uDisLamK2} setLamK2={setUDisLamK2} lamPVB={uDisLamPVB} setLamPVB={setUDisLamPVB} 
              renk={uDisCamRenk} setRenk={setUDisCamRenk} renkListesi={[...CAM_RENKLERI, ...AYNA_RENKLERI]} kaplama={uDisCamKaplama} setKaplama={setUDisCamKaplama} 
              kenar={uDisKenar} setKenar={setUDisKenar} temper={uDisTemper} setTemper={setUDisTemper}
              delik={uDisDelik} setDelik={setUDisDelik} oygu={uDisOygu} setOygu={setUDisOygu}
            />
            
            <div style={{ fontWeight: "800", color: "#64748b", fontSize: "14px" }}>+</div>

            <div style={{ flex: 1.2, padding: "8px", backgroundColor: "#f1f5f9", borderRadius: "6px", border: "1px solid #cbd5e1", alignSelf: "stretch", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <label style={{ display: "block", fontSize: "10px", fontWeight: "800", color: "#334155", marginBottom: "3px" }}>1. Boşluk</label>
              <div style={{ display: "flex", gap: "4px", marginBottom: "3px" }}>
                <select value={uCita1Kalinlik} onChange={(e) => setUCita1Kalinlik(e.target.value)} style={{ flex: 1, padding: "5px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "11px", fontWeight: "700", color: "#1e293b", backgroundColor: "white" }}>{CITA_KALINLIKLARI.map(b => <option key={b} value={b}>{b}</option>)}</select>
                <select value={uGaz1Tipi} onChange={(e) => setUGaz1Tipi(e.target.value)} style={{ flex: 1, padding: "5px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "11px", fontWeight: "700", color: "#1e293b", backgroundColor: "white" }}>{GAZ_TIPLERI.map(g => <option key={g} value={g}>{g}</option>)}</select>
              </div>
              <div style={{ display: "flex", gap: "4px" }}>
                <select value={uCita1Tipi} onChange={(e) => setUCita1Tipi(e.target.value)} style={{ flex: 1, padding: "5px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "10px", fontWeight: "600", color: "#1e293b", backgroundColor: "white" }}>{CITA_TIPLERI.map(ct => <option key={ct} value={ct}>{ct}</option>)}</select>
                <select value={uDolgu1Tipi} onChange={(e) => setUDolgu1Tipi(e.target.value)} style={{ flex: 1, padding: "5px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "10px", fontWeight: "600", color: "#1e293b", backgroundColor: "white" }}>{DOLGU_TIPLERI.map(dt => <option key={dt} value={dt}>{dt}</option>)}</select>
              </div>
            </div>

            <div style={{ fontWeight: "800", color: "#64748b", fontSize: "14px" }}>+</div>

            <CamKatmaniSecici 
              title="2. Orta" bgColor="#f8fafc" borderColor="#cbd5e1" 
              tip={uOrtaCamTipi} setTip={setUOrtaCamTipi} kalinlik={uOrtaCamKalinlik} setKalinlik={setUOrtaCamKalinlik} 
              lamK1={uOrtaLamK1} setLamK1={setUOrtaLamK1} lamK2={uOrtaLamK2} setLamK2={setUOrtaLamK2} lamPVB={uOrtaLamPVB} setLamPVB={setUOrtaLamPVB} 
              renk={uOrtaCamRenk} setRenk={setUOrtaCamRenk} renkListesi={[...CAM_RENKLERI, ...AYNA_RENKLERI]} kaplama={uOrtaCamKaplama} setKaplama={setUOrtaCamKaplama} 
              kenar={uOrtaKenar} setKenar={setUOrtaKenar} temper={uOrtaTemper} setTemper={setUOrtaTemper}
              delik={uOrtaDelik} setDelik={setUOrtaDelik} oygu={uOrtaOygu} setOygu={setUOrtaOygu}
            />
            
            <div style={{ fontWeight: "800", color: "#64748b", fontSize: "14px" }}>+</div>

            <div style={{ flex: 1.2, padding: "8px", backgroundColor: "#f1f5f9", borderRadius: "6px", border: "1px solid #cbd5e1", alignSelf: "stretch", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <label style={{ display: "block", fontSize: "10px", fontWeight: "800", color: "#334155", marginBottom: "3px" }}>2. Boşluk</label>
              <div style={{ display: "flex", gap: "4px", marginBottom: "3px" }}>
                <select value={uCita2Kalinlik} onChange={(e) => setUCita2Kalinlik(e.target.value)} style={{ flex: 1, padding: "5px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "11px", fontWeight: "700", color: "#1e293b", backgroundColor: "white" }}>{CITA_KALINLIKLARI.map(b => <option key={b} value={b}>{b}</option>)}</select>
                <select value={uGaz2Tipi} onChange={(e) => setUGaz2Tipi(e.target.value)} style={{ flex: 1, padding: "5px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "11px", fontWeight: "700", color: "#1e293b", backgroundColor: "white" }}>{GAZ_TIPLERI.map(g => <option key={g} value={g}>{g}</option>)}</select>
              </div>
              <div style={{ display: "flex", gap: "4px" }}>
                <select value={uCita2Tipi} onChange={(e) => setUCita2Tipi(e.target.value)} style={{ flex: 1, padding: "5px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "10px", fontWeight: "600", color: "#1e293b", backgroundColor: "white" }}>{CITA_TIPLERI.map(ct => <option key={ct} value={ct}>{ct}</option>)}</select>
                <select value={uDolgu2Tipi} onChange={(e) => setUDolgu2Tipi(e.target.value)} style={{ flex: 1, padding: "5px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "10px", fontWeight: "600", color: "#1e293b", backgroundColor: "white" }}>{DOLGU_TIPLERI.map(dt => <option key={dt} value={dt}>{dt}</option>)}</select>
              </div>
            </div>

            <div style={{ fontWeight: "800", color: "#64748b", fontSize: "14px" }}>+</div>

            <CamKatmaniSecici 
              title="3. İç" bgColor="#f8fafc" borderColor="#cbd5e1" 
              tip={uIcCamTipi} setTip={setUIcCamTipi} kalinlik={uIcCamKalinlik} setKalinlik={setUIcCamKalinlik} 
              lamK1={uIcLamK1} setLamK1={setUIcLamK1} lamK2={uIcLamK2} setLamK2={setUIcLamK2} lamPVB={uIcLamPVB} setLamPVB={setUIcLamPVB} 
              renk={uIcCamRenk} setRenk={setUIcCamRenk} renkListesi={[...CAM_RENKLERI, ...AYNA_RENKLERI]} kaplama={uIcCamKaplama} setKaplama={setUIcCamKaplama} 
              kenar={uIcKenar} setKenar={setUIcKenar} temper={uIcTemper} setTemper={setUIcTemper}
              delik={uIcDelik} setDelik={setUIcDelik} oygu={uIcOygu} setOygu={setUIcOygu}
            />
          </div>
        )}
      </div>

      <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", backgroundColor: "#e2e8f0", padding: "10px 14px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
        <div style={{ fontSize: "13px", color: "#1e293b", flex: 1 }}>
          <span style={{ fontWeight: "700", color: "#475569" }}>Oluşturulan Teknik Cam Adı: </span>
          <br />
          <span style={{ fontWeight: "900", color: "#0f2942", fontSize: "14px" }}>{olusturulanIsim}</span>
        </div>

        <button
          type="button"
          onClick={aktar}
          style={{
            backgroundColor: "#0f2942",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: "800",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            transition: "all 0.2s ease"
          }}
        >
          ↙️ Forma Aktar
        </button>
      </div>
    </div>
  );
}