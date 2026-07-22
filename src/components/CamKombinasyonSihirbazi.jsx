import { useState, useEffect } from "react";

// --- ŞİŞECAM GENİŞ CAM RENK VE TİP LİSTESİ ---
const CAM_RENKLERI = [
  "Clear (Şeffaf)", "Extra Clear", "Ultra Clear", "Füme", "Bronz", "Mavi", "Yeşil", 
  "Koyu Füme", "Derin Füme", "Açık Füme", "Turkuaz", "Ara Yeşil"
];

// --- ŞİŞECAM GLASSTOOL TÜM KAPLAMA SERİLERİ ---
const KAPLAMA_TURLERI = [
  "Kaplamasız (Düzcam)",
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
const CITA_TIPLERI = ["Alüminyum Çıta", "Warm Edge (Sıcak Kenar Çıta)"];
const GAZ_TIPLERI = ["Hava", "Argon Gazı", "Kripton Gazı"];
const PVB_TURLERI = [
  "Şeffaf PVB (0.38)", "Şeffaf PVB (0.76)", "Şeffaf PVB (1.52)", 
  "Akustik PVB (0.38)", "Akustik PVB (0.76)", "Opak PVB", "Füme PVB", "Bronz PVB", 
  "Vanceva Renkli PVB", "Mesh PVB (Metal Fileli)", "SentryGlas (SG Ionoplast)"
];

// --- HER CAM KATMANI İÇİN ÖZEL İŞLEM SEÇİCİ BİLEŞEN ---
const CamIslemleriPaneli = ({ kenar, setKenar, temper, setTemper, delik, setDelik, oygu, setOygu }) => (
  <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px dashed #cbd5e1", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
    <div>
      <label style={{ display: "block", fontSize: "10px", fontWeight: "700", color: "#475569", marginBottom: "2px" }}>Kenar İşlemi</label>
      <select value={kenar} onChange={e => setKenar(e.target.value)} style={{ width: "100%", padding: "4px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "11px", color: "#1e293b" }}>
        <option>Düz Kesim (İşlemsiz)</option>
        <option>Rodajlı</option>
        <option>Bizoteli</option>
        <option>Pahlı</option>
      </select>
    </div>
    <div>
      <label style={{ display: "block", fontSize: "10px", fontWeight: "700", color: "#475569", marginBottom: "2px" }}>Temper İşlemi</label>
      <select value={temper} onChange={e => setTemper(e.target.value)} style={{ width: "100%", padding: "4px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "11px", color: "#1e293b" }}>
        <option>Tempersiz</option>
        <option>Temperli</option>
        <option>Yarı Temperli</option>
        <option>Bombeli Temperli</option>
      </select>
    </div>
    <div>
      <label style={{ display: "block", fontSize: "10px", fontWeight: "700", color: "#475569", marginBottom: "2px" }}>Delik İşlemi</label>
      <select value={delik} onChange={e => setDelik(e.target.value)} style={{ width: "100%", padding: "4px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "11px", color: "#1e293b" }}>
        <option>Delik Yok</option>
        <option>Delik Var</option>
      </select>
    </div>
    <div>
      <label style={{ display: "block", fontSize: "10px", fontWeight: "700", color: "#475569", marginBottom: "2px" }}>Oygu İşlemi</label>
      <select value={oygu} onChange={e => setOygu(e.target.value)} style={{ width: "100%", padding: "4px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "11px", color: "#1e293b" }}>
        <option>Oygu Yok</option>
        <option>Oygu Var</option>
      </select>
    </div>
  </div>
);

// --- CAM KATMANI BİLEŞENİ (ÖZEL İŞLEMLER DÂHİL) ---
const CamKatmaniSecici = ({ 
  title, bgColor, borderColor, 
  tip, setTip, kalinlik, setKalinlik, 
  lamK1, setLamK1, lamK2, setLamK2, lamPVB, setLamPVB, 
  renk, setRenk, kaplama, setKaplama,
  kenar, setKenar, temper, setTemper, delik, setDelik, oygu, setOygu
}) => (
  <div style={{ flex: 3, minWidth: "270px", padding: "12px", backgroundColor: bgColor, borderRadius: "8px", border: `1px solid ${borderColor}` }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
      <label style={{ fontSize: "13px", fontWeight: "700", color: "#0f2942" }}>{title}</label>
      {setTip && (
        <select value={tip} onChange={e => setTip(e.target.value)} style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "4px", border: "1px solid #cbd5e1", backgroundColor: tip === "lamine" ? "#e0f2fe" : "white", fontWeight: "bold", color: "#1e293b", cursor: "pointer" }}>
          <option value="tek">Tek Cam</option>
          <option value="lamine">Lamine Cam</option>
        </select>
      )}
    </div>

    {tip === "tek" || !tip ? (
      <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
        <select value={kalinlik} onChange={(e) => setKalinlik(e.target.value)} style={{ flex: 1, padding: "7px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "12px", color: "#1e293b" }}>{KALINLIKLAR.map(k => <option key={k} value={k}>{k}</option>)}</select>
        <select value={renk} onChange={(e) => setRenk(e.target.value)} style={{ flex: 2, padding: "7px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "12px", color: "#1e293b" }}>{CAM_RENKLERI.map(r => <option key={r} value={r}>{r}</option>)}</select>
      </div>
    ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "8px" }}>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <select value={lamK1} onChange={(e) => setLamK1(e.target.value)} style={{ flex: 1, padding: "7px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "12px", color: "#1e293b" }}>{KALINLIKLAR.map(k => <option key={k} value={k}>{k}</option>)}</select>
          <span style={{ fontWeight: "bold", color: "#64748b", fontSize: "14px" }}>+</span>
          <select value={lamK2} onChange={(e) => setLamK2(e.target.value)} style={{ flex: 1, padding: "7px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "12px", color: "#1e293b" }}>{KALINLIKLAR.map(k => <option key={k} value={k}>{k}</option>)}</select>
        </div>
        <select value={lamPVB} onChange={(e) => setLamPVB(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "11px", color: "#1e293b" }}>{PVB_TURLERI.map(p => <option key={p} value={p}>{p}</option>)}</select>
        <select value={renk} onChange={(e) => setRenk(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "11px", color: "#1e293b" }}>{CAM_RENKLERI.map(r => <option key={r} value={r}>{r}</option>)}</select>
      </div>
    )}
    <select value={kaplama} onChange={(e) => setKaplama(e.target.value)} style={{ width: "100%", padding: "7px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "12px", color: "#1e293b" }}>{KAPLAMA_TURLERI.map(kp => <option key={kp} value={kp}>{kp}</option>)}</select>

    {/* HER CAM İÇİN AYRI İŞLEM ALANI */}
    <CamIslemleriPaneli 
      kenar={kenar} setKenar={setKenar} 
      temper={temper} setTemper={setTemper} 
      delik={delik} setDelik={setDelik} 
      oygu={oygu} setOygu={setOygu} 
    />
  </div>
);

export default function CamKombinasyonSihirbazi({ onKombinasyonSec }) {
  const [camTuru, setCamTuru] = useState("isicam");

  // --- 1. TEK CAM STATE'LERİ ---
  const [tekCamKalinlik, setTekCamKalinlik] = useState("6 mm");
  const [tekCamRenk, setTekCamRenk] = useState("Clear (Şeffaf)");
  const [tekCamKaplama, setTekCamKaplama] = useState("Kaplamasız (Düzcam)");
  const [tekKenar, setTekKenar] = useState("Düz Kesim (İşlemsiz)");
  const [tekTemper, setTekTemper] = useState("Tempersiz");
  const [tekDelik, setTekDelik] = useState("Delik Yok");
  const [tekOygu, setTekOygu] = useState("Oygu Yok");

  // --- 2. LAMİNE CAM STATE'LERİ ---
  const [lam1Kalinlik, setLam1Kalinlik] = useState("4 mm");
  const [lam1Renk, setLam1Renk] = useState("Clear (Şeffaf)");
  const [lam1Kaplama, setLam1Kaplama] = useState("Kaplamasız (Düzcam)");
  const [lam1Kenar, setLam1Kenar] = useState("Düz Kesim (İşlemsiz)");
  const [lam1Temper, setLam1Temper] = useState("Tempersiz");
  const [lam1Delik, setLam1Delik] = useState("Delik Yok");
  const [lam1Oygu, setLam1Oygu] = useState("Oygu Yok");

  const [pvbTuru, setPvbTuru] = useState("Şeffaf PVB (0.38)");

  const [lam2Kalinlik, setLam2Kalinlik] = useState("4 mm");
  const [lam2Renk, setLam2Renk] = useState("Clear (Şeffaf)");
  const [lam2Kaplama, setLam2Kaplama] = useState("Kaplamasız (Düzcam)");
  const [lam2Kenar, setLam2Kenar] = useState("Düz Kesim (İşlemsiz)");
  const [lam2Temper, setLam2Temper] = useState("Tempersiz");
  const [lam2Delik, setLam2Delik] = useState("Delik Yok");
  const [lam2Oygu, setLam2Oygu] = useState("Oygu Yok");

  // --- 3. ISICAM (ÇİFT CAM) STATE'LERİ ---
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

  // --- 4. ÜÇLÜ ISICAM STATE'LERİ ---
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

  // Cam Katmanı ve İşlemlerini Metne Çevirici
  const formatPane = (tip, kal, lamK1, lamK2, pvb, renk, kap, kenar, temper, delik, oygu) => {
    const kapStr = kap !== "Kaplamasız (Düzcam)" ? ` ${kap}` : "";
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
    if (oygu === "Oygu Var") islemList.push("Oygulu");

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
    else if (camTuru === "lamine") {
      const cam1Str = formatPane("tek", lam1Kalinlik, "", "", "", lam1Renk, lam1Kaplama, lam1Kenar, lam1Temper, lam1Delik, lam1Oygu);
      const cam2Str = formatPane("tek", lam2Kalinlik, "", "", "", lam2Renk, lam2Kaplama, lam2Kenar, lam2Temper, lam2Delik, lam2Oygu);
      isim = `(${cam1Str}) + (${pvbTuru}) + (${cam2Str}) LAMİNE CAM`;
    } 
    else if (camTuru === "isicam") {
      const disCamStr = formatPane(disCamTipi, disCamKalinlik, disCamLamK1, disCamLamK2, disCamLamPVB, disCamRenk, disCamKaplama, disKenar, disTemper, disDelik, disOygu);
      const icCamStr = formatPane(icCamTipi, icCamKalinlik, icCamLamK1, icCamLamK2, icCamLamPVB, icCamRenk, icCamKaplama, icKenar, icTemper, icDelik, icOygu);
      const boslukStr = `${citaKalinlik} ${citaTipi} (${gazTipi})`;

      isim = `(${disCamStr}) + (${boslukStr}) + (${icCamStr}) ISICAM`;
    }
    else if (camTuru === "ucIliIsicam") {
      const disCamStr = formatPane(uDisCamTipi, uDisCamKalinlik, uDisLamK1, uDisLamK2, uDisLamPVB, uDisCamRenk, uDisCamKaplama, uDisKenar, uDisTemper, uDisDelik, uDisOygu);
      const ortaCamStr = formatPane(uOrtaCamTipi, uOrtaCamKalinlik, uOrtaLamK1, uOrtaLamK2, uOrtaLamPVB, uOrtaCamRenk, uOrtaCamKaplama, uOrtaKenar, uOrtaTemper, uOrtaDelik, uOrtaOygu);
      const icCamStr = formatPane(uIcCamTipi, uIcCamKalinlik, uIcLamK1, uIcLamK2, uIcLamPVB, uIcCamRenk, uIcCamKaplama, uIcKenar, uIcTemper, uIcDelik, uIcOygu);
      const bosluk1Str = `${uCita1Kalinlik} ${uCita1Tipi} (${uGaz1Tipi})`;
      const bosluk2Str = `${uCita2Kalinlik} ${uCita2Tipi} (${uGaz2Tipi})`;

      isim = `(${disCamStr}) + (${bosluk1Str}) + (${ortaCamStr}) + (${bosluk2Str}) + (${icCamStr}) ÜÇLÜ ISICAM`;
    }

    setOlusturulanIsim(isim);
  }, [
    camTuru, 
    tekCamKalinlik, tekCamRenk, tekCamKaplama, tekKenar, tekTemper, tekDelik, tekOygu,
    lam1Kalinlik, lam1Renk, lam1Kaplama, lam1Kenar, lam1Temper, lam1Delik, lam1Oygu, pvbTuru,
    lam2Kalinlik, lam2Renk, lam2Kaplama, lam2Kenar, lam2Temper, lam2Delik, lam2Oygu,
    disCamTipi, disCamKalinlik, disCamLamK1, disCamLamK2, disCamLamPVB, disCamRenk, disCamKaplama, disKenar, disTemper, disDelik, disOygu,
    citaKalinlik, citaTipi, gazTipi,
    icCamTipi, icCamKalinlik, icCamLamK1, icCamLamK2, icCamLamPVB, icCamRenk, icCamKaplama, icKenar, icTemper, icDelik, icOygu,
    uDisCamTipi, uDisCamKalinlik, uDisLamK1, uDisLamK2, uDisLamPVB, uDisCamRenk, uDisCamKaplama, uDisKenar, uDisTemper, uDisDelik, uDisOygu,
    uCita1Kalinlik, uCita1Tipi, uGaz1Tipi,
    uOrtaCamTipi, uOrtaCamKalinlik, uOrtaLamK1, uOrtaLamK2, uOrtaLamPVB, uOrtaCamRenk, uOrtaCamKaplama, uOrtaKenar, uOrtaTemper, uOrtaDelik, uOrtaOygu,
    uCita2Kalinlik, uCita2Tipi, uGaz2Tipi,
    uIcCamTipi, uIcCamKalinlik, uIcLamK1, uIcLamK2, uIcLamPVB, uIcCamRenk, uIcCamKaplama, uIcKenar, uIcTemper, uIcDelik, uIcOygu
  ]);

  const aktar = () => {
    if (onKombinasyonSec) {
      onKombinasyonSec(olusturulanIsim);
    }
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #cbd5e1", marginBottom: "20px" }}>
      <h3 style={{ margin: "0 0 12px 0", color: "#0f2942", fontSize: "15px", fontWeight: "700" }}>
        Şişecam Katmanlı Cam & Kaplama Sihirbazı
      </h3>

      {/* TÜR SEÇİMİ */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "15px" }}>
        {[
          { id: "isicam", label: "Isıcam (Çift Cam)" },
          { id: "ucIliIsicam", label: "Üçlü Isıcam" },
          { id: "lamine", label: "Lamine Cam" },
          { id: "tek", label: "Tek Cam" }
        ].map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCamTuru(item.id)}
            style={{
              flex: 1, padding: "9px", borderRadius: "5px", border: "1px solid #cbd5e1",
              backgroundColor: camTuru === item.id ? "#0f2942" : "white",
              color: camTuru === item.id ? "white" : "#334155",
              fontWeight: "600", fontSize: "13px", cursor: "pointer"
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* KATMAN SEÇİMLERİ */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "stretch", backgroundColor: "white", padding: "14px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
        
        {/* 1. TEK CAM ALANI */}
        {camTuru === "tek" && (
          <CamKatmaniSecici 
            title="Tek Cam Katmanı" bgColor="#f8fafc" borderColor="#e2e8f0"
            kalinlik={tekCamKalinlik} setKalinlik={setTekCamKalinlik}
            renk={tekCamRenk} setRenk={setTekCamRenk}
            kaplama={tekCamKaplama} setKaplama={setTekCamKaplama}
            kenar={tekKenar} setKenar={setTekKenar}
            temper={tekTemper} setTemper={setTekTemper}
            delik={tekDelik} setDelik={setTekDelik}
            oygu={tekOygu} setOygu={setTekOygu}
          />
        )}

        {/* 2. LAMİNE CAM ALANI */}
        {camTuru === "lamine" && (
          <div style={{ display: "flex", gap: "10px", width: "100%", alignItems: "center", flexWrap: "nowrap" }}>
            <CamKatmaniSecici 
              title="1. Dış Cam Katmanı" bgColor="#f8fafc" borderColor="#cbd5e1"
              kalinlik={lam1Kalinlik} setKalinlik={setLam1Kalinlik}
              renk={lam1Renk} setRenk={setLam1Renk}
              kaplama={lam1Kaplama} setKaplama={setLam1Kaplama}
              kenar={lam1Kenar} setKenar={setLam1Kenar}
              temper={lam1Temper} setTemper={setLam1Temper}
              delik={lam1Delik} setDelik={setLam1Delik}
              oygu={lam1Oygu} setOygu={setLam1Oygu}
            />

            <div style={{ fontWeight: "bold", color: "#64748b", fontSize: "18px" }}>+</div>

            <div style={{ flex: 2, padding: "12px", backgroundColor: "#f1f5f9", borderRadius: "8px", border: "1px solid #cbd5e1", alignSelf: "stretch", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "8px" }}>Ara Katman (PVB Film)</label>
              <select value={pvbTuru} onChange={(e) => setPvbTuru(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "12px", color: "#1e293b" }}>
                {PVB_TURLERI.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div style={{ fontWeight: "bold", color: "#64748b", fontSize: "18px" }}>+</div>

            <CamKatmaniSecici 
              title="2. İç Cam Katmanı" bgColor="#f8fafc" borderColor="#cbd5e1"
              kalinlik={lam2Kalinlik} setKalinlik={setLam2Kalinlik}
              renk={lam2Renk} setRenk={setLam2Renk}
              kaplama={lam2Kaplama} setKaplama={setLam2Kaplama}
              kenar={lam2Kenar} setKenar={setLam2Kenar}
              temper={lam2Temper} setTemper={setLam2Temper}
              delik={lam2Delik} setDelik={setLam2Delik}
              oygu={lam2Oygu} setOygu={setLam2Oygu}
            />
          </div>
        )}

        {/* 3. ISICAM (ÇİFT CAM) ALANI */}
        {camTuru === "isicam" && (
          <div style={{ display: "flex", gap: "10px", width: "100%", alignItems: "center" }}>
            <CamKatmaniSecici 
              title="1. Dış Cam" bgColor="#f8fafc" borderColor="#e2e8f0"
              tip={disCamTipi} setTip={setDisCamTipi} kalinlik={disCamKalinlik} setKalinlik={setDisCamKalinlik}
              lamK1={disCamLamK1} setLamK1={setDisCamLamK1} lamK2={disCamLamK2} setLamK2={setDisCamLamK2} lamPVB={disCamLamPVB} setLamPVB={setDisCamLamPVB}
              renk={disCamRenk} setRenk={setDisCamRenk} kaplama={disCamKaplama} setKaplama={setDisCamKaplama}
              kenar={disKenar} setKenar={setDisKenar} temper={disTemper} setTemper={setDisTemper}
              delik={disDelik} setDelik={setDisDelik} oygu={disOygu} setOygu={setDisOygu}
            />
            
            <div style={{ fontWeight: "bold", color: "#94a3b8", fontSize: "18px" }}>+</div>
            
            <div style={{ flex: 2, padding: "10px", backgroundColor: "#f1f5f9", borderRadius: "8px", border: "1px solid #cbd5e1", alignSelf: "stretch", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>Ara Boşluk & Çıta</label>
              <div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
                <select value={citaKalinlik} onChange={(e) => setCitaKalinlik(e.target.value)} style={{ flex: 1, padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "12px", color: "#1e293b" }}>
                  {CITA_KALINLIKLARI.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <select value={gazTipi} onChange={(e) => setGazTipi(e.target.value)} style={{ flex: 1, padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "12px", color: "#1e293b" }}>
                  {GAZ_TIPLERI.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <select value={citaTipi} onChange={(e) => setCitaTipi(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "12px", color: "#1e293b" }}>
                {CITA_TIPLERI.map(ct => <option key={ct} value={ct}>{ct}</option>)}
              </select>
            </div>

            <div style={{ fontWeight: "bold", color: "#94a3b8", fontSize: "18px" }}>+</div>

            <CamKatmaniSecici 
              title="2. İç Cam" bgColor="#f8fafc" borderColor="#e2e8f0"
              tip={icCamTipi} setTip={setIcCamTipi} kalinlik={icCamKalinlik} setKalinlik={setIcCamKalinlik}
              lamK1={icCamLamK1} setLamK1={setIcCamLamK1} lamK2={icCamLamK2} setLamK2={setIcCamLamK2} lamPVB={icCamLamPVB} setLamPVB={setIcCamLamPVB}
              renk={icCamRenk} setRenk={setIcCamRenk} kaplama={icCamKaplama} setKaplama={setIcCamKaplama}
              kenar={icKenar} setKenar={setIcKenar} temper={icTemper} setTemper={setIcTemper}
              delik={icDelik} setDelik={setIcDelik} oygu={icOygu} setOygu={setIcOygu}
            />
          </div>
        )}

        {/* 4. ÜÇLÜ ISICAM ALANI */}
        {camTuru === "ucIliIsicam" && (
          <div style={{ display: "flex", gap: "8px", width: "100%", alignItems: "center" }}>
            <CamKatmaniSecici 
              title="1. Dış Cam" bgColor="#f8fafc" borderColor="#e2e8f0" 
              tip={uDisCamTipi} setTip={setUDisCamTipi} kalinlik={uDisCamKalinlik} setKalinlik={setUDisCamKalinlik} 
              lamK1={uDisLamK1} setLamK1={setUDisLamK1} lamK2={uDisLamK2} setLamK2={setUDisLamK2} lamPVB={uDisLamPVB} setLamPVB={setUDisLamPVB} 
              renk={uDisCamRenk} setRenk={setUDisCamRenk} kaplama={uDisCamKaplama} setKaplama={setUDisCamKaplama} 
              kenar={uDisKenar} setKenar={setUDisKenar} temper={uDisTemper} setTemper={setUDisTemper}
              delik={uDisDelik} setDelik={setUDisDelik} oygu={uDisOygu} setOygu={setUDisOygu}
            />
            
            <div style={{ fontWeight: "bold", color: "#94a3b8", fontSize: "14px" }}>+</div>

            <div style={{ flex: 1.5, padding: "8px", backgroundColor: "#f1f5f9", borderRadius: "8px", border: "1px solid #cbd5e1", alignSelf: "stretch", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>1. Boşluk</label>
              <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                <select value={uCita1Kalinlik} onChange={(e) => setUCita1Kalinlik(e.target.value)} style={{ flex: 1, padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "11px", color: "#1e293b" }}>{CITA_KALINLIKLARI.map(b => <option key={b} value={b}>{b}</option>)}</select>
                <select value={uGaz1Tipi} onChange={(e) => setUGaz1Tipi(e.target.value)} style={{ flex: 1, padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "11px", color: "#1e293b" }}>{GAZ_TIPLERI.map(g => <option key={g} value={g}>{g}</option>)}</select>
              </div>
              <select value={uCita1Tipi} onChange={(e) => setUCita1Tipi(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "11px", color: "#1e293b" }}>{CITA_TIPLERI.map(ct => <option key={ct} value={ct}>{ct}</option>)}</select>
            </div>

            <div style={{ fontWeight: "bold", color: "#94a3b8", fontSize: "14px" }}>+</div>

            <CamKatmaniSecici 
              title="2. Orta Cam" bgColor="#f8fafc" borderColor="#e2e8f0" 
              tip={uOrtaCamTipi} setTip={setUOrtaCamTipi} kalinlik={uOrtaCamKalinlik} setKalinlik={setUOrtaCamKalinlik} 
              lamK1={uOrtaLamK1} setLamK1={setUOrtaLamK1} lamK2={uOrtaLamK2} setLamK2={setUOrtaLamK2} lamPVB={uOrtaLamPVB} setLamPVB={setUOrtaLamPVB} 
              renk={uOrtaCamRenk} setRenk={setUOrtaCamRenk} kaplama={uOrtaCamKaplama} setKaplama={setUOrtaCamKaplama} 
              kenar={uOrtaKenar} setKenar={setUOrtaKenar} temper={uOrtaTemper} setTemper={setUOrtaTemper}
              delik={uOrtaDelik} setDelik={setUOrtaDelik} oygu={uOrtaOygu} setOygu={setUOrtaOygu}
            />
            
            <div style={{ fontWeight: "bold", color: "#94a3b8", fontSize: "14px" }}>+</div>

            <div style={{ flex: 1.5, padding: "8px", backgroundColor: "#f1f5f9", borderRadius: "8px", border: "1px solid #cbd5e1", alignSelf: "stretch", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>2. Boşluk</label>
              <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                <select value={uCita2Kalinlik} onChange={(e) => setUCita2Kalinlik(e.target.value)} style={{ flex: 1, padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "11px", color: "#1e293b" }}>{CITA_KALINLIKLARI.map(b => <option key={b} value={b}>{b}</option>)}</select>
                <select value={uGaz2Tipi} onChange={(e) => setUGaz2Tipi(e.target.value)} style={{ flex: 1, padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "11px", color: "#1e293b" }}>{GAZ_TIPLERI.map(g => <option key={g} value={g}>{g}</option>)}</select>
              </div>
              <select value={uCita2Tipi} onChange={(e) => setUCita2Tipi(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "11px", color: "#1e293b" }}>{CITA_TIPLERI.map(ct => <option key={ct} value={ct}>{ct}</option>)}</select>
            </div>

            <div style={{ fontWeight: "bold", color: "#94a3b8", fontSize: "14px" }}>+</div>

            <CamKatmaniSecici 
              title="3. İç Cam" bgColor="#f8fafc" borderColor="#e2e8f0" 
              tip={uIcCamTipi} setTip={setUIcCamTipi} kalinlik={uIcCamKalinlik} setKalinlik={setUIcCamKalinlik} 
              lamK1={uIcLamK1} setLamK1={setUIcLamK1} lamK2={uIcLamK2} setLamK2={setUIcLamK2} lamPVB={uIcLamPVB} setLamPVB={setUIcLamPVB} 
              renk={uIcCamRenk} setRenk={setUIcCamRenk} kaplama={uIcCamKaplama} setKaplama={setUIcCamKaplama} 
              kenar={uIcKenar} setKenar={setUIcKenar} temper={uIcTemper} setTemper={setUIcTemper}
              delik={uIcDelik} setDelik={setUIcDelik} oygu={uIcOygu} setOygu={setUIcOygu}
            />
          </div>
        )}
      </div>

      {/* ÖNİZLEME VE FORMA AKTARMA ALANI */}
      <div style={{ marginTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", backgroundColor: "#f1f5f9", padding: "10px 14px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
        <div style={{ fontSize: "13px", color: "#1e293b", flex: 1 }}>
          <span style={{ fontWeight: "600", color: "#64748b" }}>Oluşturulan Teknik Cam Adı: </span>
          <br />
          <span style={{ fontWeight: "700", color: "#0f2942", fontSize: "14px" }}>{olusturulanIsim}</span>
        </div>

        <button
          type="button"
          onClick={aktar}
          style={{
            backgroundColor: "#0f2942",
            color: "white",
            border: "none",
            padding: "9px 18px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0,0,0,0.15)"
          }}
        >
          ↙️ Forma Aktar
        </button>
      </div>
    </div>
  );
}