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
  "Vanceva Renkli PVB", "SentryGlas (SG Ionoplast)"
];

// --- BÜYÜTÜLMÜŞ VE GENİŞLETİLMİŞ CAM KATMANI BİLEŞENİ ---
const CamKatmaniSecici = ({ 
  title, bgColor, borderColor, 
  tip, setTip, kalinlik, setKalinlik, 
  lamK1, setLamK1, lamK2, setLamK2, lamPVB, setLamPVB, 
  renk, setRenk, kaplama, setKaplama 
}) => (
  <div style={{ flex: 3, minWidth: "280px", padding: "12px", backgroundColor: bgColor, borderRadius: "8px", border: `1px solid ${borderColor}` }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
      <label style={{ fontSize: "13px", fontWeight: "700", color: "#0f2942" }}>{title}</label>
      <select value={tip} onChange={e => setTip(e.target.value)} style={{ fontSize: "12px", padding: "5px 10px", borderRadius: "5px", border: "1px solid #cbd5e1", backgroundColor: tip === "lamine" ? "#e0f2fe" : "white", fontWeight: "bold", color: "#1e293b", cursor: "pointer" }}>
        <option value="tek">Tek Cam</option>
        <option value="lamine">Lamine Cam</option>
      </select>
    </div>

    {tip === "tek" ? (
      <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
        <select value={kalinlik} onChange={(e) => setKalinlik(e.target.value)} style={{ flex: 1, padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "13px", color: "#1e293b" }}>{KALINLIKLAR.map(k => <option key={k} value={k}>{k}</option>)}</select>
        <select value={renk} onChange={(e) => setRenk(e.target.value)} style={{ flex: 2, padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "13px", color: "#1e293b" }}>{CAM_RENKLERI.map(r => <option key={r} value={r}>{r}</option>)}</select>
      </div>
    ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "8px" }}>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <select value={lamK1} onChange={(e) => setLamK1(e.target.value)} style={{ flex: 1, padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "13px", color: "#1e293b" }}>{KALINLIKLAR.map(k => <option key={k} value={k}>{k}</option>)}</select>
          <span style={{ fontWeight: "bold", color: "#64748b", fontSize: "16px" }}>+</span>
          <select value={lamK2} onChange={(e) => setLamK2(e.target.value)} style={{ flex: 1, padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "13px", color: "#1e293b" }}>{KALINLIKLAR.map(k => <option key={k} value={k}>{k}</option>)}</select>
        </div>
        <select value={lamPVB} onChange={(e) => setLamPVB(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "12px", color: "#1e293b" }}>{PVB_TURLERI.map(p => <option key={p} value={p}>{p}</option>)}</select>
        <select value={renk} onChange={(e) => setRenk(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "12px", color: "#1e293b" }}>{CAM_RENKLERI.map(r => <option key={r} value={r}>{r}</option>)}</select>
      </div>
    )}
    <select value={kaplama} onChange={(e) => setKaplama(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "13px", color: "#1e293b" }}>{KAPLAMA_TURLERI.map(kp => <option key={kp} value={kp}>{kp}</option>)}</select>
  </div>
);


export default function CamKombinasyonSihirbazi({ onKombinasyonSec }) {
  const [camTuru, setCamTuru] = useState("isicam");

  const [kenarIslemi, setKenarIslemi] = useState("Düz Kesim (İşlemsiz)");
  const [temperIslemi, setTemperIslemi] = useState("Tempersiz");
  const [delikIslemi, setDelikIslemi] = useState("Delik Yok");
  const [oyguIslemi, setOyguIslemi] = useState("Oygu Yok");

  const [tekCamKalinlik, setTekCamKalinlik] = useState("6 mm");
  const [tekCamRenk, setTekCamRenk] = useState("Clear (Şeffaf)");
  const [tekCamKaplama, setTekCamKaplama] = useState("Kaplamasız (Düzcam)");

  const [lamineCam1Kalinlik, setLamineCam1Kalinlik] = useState("4 mm");
  const [lamineCam1Renk, setLamineCam1Renk] = useState("Clear (Şeffaf)");
  const [lamineCam1Kaplama, setLamineCam1Kaplama] = useState("Kaplamasız (Düzcam)");
  const [pvbTuru, setPvbTuru] = useState("Şeffaf PVB (0.38)");
  const [lamineCam2Kalinlik, setLamineCam2Kalinlik] = useState("4 mm");
  const [lamineCam2Renk, setLamineCam2Renk] = useState("Clear (Şeffaf)");
  const [lamineCam2Kaplama, setLamineCam2Kaplama] = useState("Kaplamasız (Düzcam)");

  const [disCamTipi, setDisCamTipi] = useState("tek");
  const [disCamKalinlik, setDisCamKalinlik] = useState("4 mm");
  const [disCamLamK1, setDisCamLamK1] = useState("4 mm");
  const [disCamLamK2, setDisCamLamK2] = useState("4 mm");
  const [disCamLamPVB, setDisCamLamPVB] = useState("Şeffaf PVB (0.38)");
  const [disCamRenk, setDisCamRenk] = useState("Clear (Şeffaf)");
  const [disCamKaplama, setDisCamKaplama] = useState("Duosol T 70");

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

  const [uDisCamTipi, setUDisCamTipi] = useState("tek");
  const [uDisCamKalinlik, setUDisCamKalinlik] = useState("4 mm");
  const [uDisLamK1, setUDisLamK1] = useState("4 mm");
  const [uDisLamK2, setUDisLamK2] = useState("4 mm");
  const [uDisLamPVB, setUDisLamPVB] = useState("Şeffaf PVB (0.38)");
  const [uDisCamRenk, setUDisCamRenk] = useState("Clear (Şeffaf)");
  const [uDisCamKaplama, setUDisCamKaplama] = useState("Duosol T 70");

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

  const [olusturulanIsim, setOlusturulanIsim] = useState("");

  const formatPane = (tip, kal, lamK1, lamK2, pvb, renk, kap) => {
    const kapStr = kap !== "Kaplamasız (Düzcam)" ? ` ${kap}` : "";
    if (tip === "lamine") {
      const l1 = lamK1.replace(" mm", "");
      const l2 = lamK2.replace(" mm", "");
      return `${l1}+${l2} mm ${renk} Lamine (${pvb})${kapStr}`;
    }
    return `${kal} ${renk}${kapStr}`;
  };

  useEffect(() => {
    let isim = "";

    if (camTuru === "tek") {
      const kaplamaYazisi = tekCamKaplama !== "Kaplamasız (Düzcam)" ? ` ${tekCamKaplama}` : "";
      isim = `${tekCamKalinlik} ${tekCamRenk}${kaplamaYazisi} CAM`;
    } 
    else if (camTuru === "lamine") {
      const kaplama1 = lamineCam1Kaplama !== "Kaplamasız (Düzcam)" ? ` ${lamineCam1Kaplama}` : "";
      const kaplama2 = lamineCam2Kaplama !== "Kaplamasız (Düzcam)" ? ` ${lamineCam2Kaplama}` : "";
      const k1 = lamineCam1Kalinlik.replace(" mm", "");
      const k2 = lamineCam2Kalinlik.replace(" mm", "");

      if (lamineCam1Renk === lamineCam2Renk && kaplama1 === "" && kaplama2 === "") {
        isim = `${k1}+${k2} mm ${lamineCam1Renk} LAMİNE CAM (${pvbTuru})`;
      } else {
        isim = `(${k1}mm ${lamineCam1Renk}${kaplama1}) + (${pvbTuru}) + (${k2}mm ${lamineCam2Renk}${kaplama2}) LAMİNE CAM`;
      }
    } 
    else if (camTuru === "isicam") {
      const disCamStr = formatPane(disCamTipi, disCamKalinlik, disCamLamK1, disCamLamK2, disCamLamPVB, disCamRenk, disCamKaplama);
      const icCamStr = formatPane(icCamTipi, icCamKalinlik, icCamLamK1, icCamLamK2, icCamLamPVB, icCamRenk, icCamKaplama);
      const boslukStr = `${citaKalinlik} ${citaTipi} (${gazTipi})`;

      isim = `(${disCamStr}) + (${boslukStr}) + (${icCamStr}) ISICAM`;
    }
    else if (camTuru === "ucIliIsicam") {
      const disCamStr = formatPane(uDisCamTipi, uDisCamKalinlik, uDisLamK1, uDisLamK2, uDisLamPVB, uDisCamRenk, uDisCamKaplama);
      const ortaCamStr = formatPane(uOrtaCamTipi, uOrtaCamKalinlik, uOrtaLamK1, uOrtaLamK2, uOrtaLamPVB, uOrtaCamRenk, uOrtaCamKaplama);
      const icCamStr = formatPane(uIcCamTipi, uIcCamKalinlik, uIcLamK1, uIcLamK2, uIcLamPVB, uIcCamRenk, uIcCamKaplama);
      const bosluk1Str = `${uCita1Kalinlik} ${uCita1Tipi} (${uGaz1Tipi})`;
      const bosluk2Str = `${uCita2Kalinlik} ${uCita2Tipi} (${uGaz2Tipi})`;

      isim = `(${disCamStr}) + (${bosluk1Str}) + (${ortaCamStr}) + (${bosluk2Str}) + (${icCamStr}) ÜÇLÜ ISICAM`;
    }

    let islemEkleri = [];
    if (kenarIslemi !== "Düz Kesim (İşlemsiz)") islemEkleri.push(kenarIslemi);
    if (temperIslemi !== "Tempersiz") islemEkleri.push(temperIslemi);
    if (delikIslemi === "Delik Var") islemEkleri.push("Delikli");
    if (oyguIslemi === "Oygu Var") islemEkleri.push("Oygulu");

    if (islemEkleri.length > 0) {
      isim = `${isim} [ ${islemEkleri.join(" - ")} ]`;
    }

    setOlusturulanIsim(isim);
  }, [
    camTuru, tekCamKalinlik, tekCamRenk, tekCamKaplama,
    lamineCam1Kalinlik, lamineCam1Renk, lamineCam1Kaplama, pvbTuru, lamineCam2Kalinlik, lamineCam2Renk, lamineCam2Kaplama,
    disCamTipi, disCamKalinlik, disCamLamK1, disCamLamK2, disCamLamPVB, disCamRenk, disCamKaplama,
    citaKalinlik, citaTipi, gazTipi,
    icCamTipi, icCamKalinlik, icCamLamK1, icCamLamK2, icCamLamPVB, icCamRenk, icCamKaplama,
    uDisCamTipi, uDisCamKalinlik, uDisLamK1, uDisLamK2, uDisLamPVB, uDisCamRenk, uDisCamKaplama,
    uCita1Kalinlik, uCita1Tipi, uGaz1Tipi,
    uOrtaCamTipi, uOrtaCamKalinlik, uOrtaLamK1, uOrtaLamK2, uOrtaLamPVB, uOrtaCamRenk, uOrtaCamKaplama,
    uCita2Kalinlik, uCita2Tipi, uGaz2Tipi,
    uIcCamTipi, uIcCamKalinlik, uIcLamK1, uIcLamK2, uIcLamPVB, uIcCamRenk, uIcCamKaplama,
    kenarIslemi, temperIslemi, delikIslemi, oyguIslemi
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

      {/* KATMAN SEÇİMLERİ (GENİŞLETİLMİŞ) */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", alignItems: "flex-start", backgroundColor: "white", padding: "16px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
        
        {/* 1. TEK CAM ALANI */}
        {camTuru === "tek" && (
          <div style={{ display: "flex", gap: "10px", width: "100%", alignItems: "center" }}>
            <div style={{ flex: 2 }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>Cam Kalınlığı</label>
              <select value={tekCamKalinlik} onChange={(e) => setTekCamKalinlik(e.target.value)} style={{ width: "100%", padding: "9px", borderRadius: "5px", border: "1px solid #cbd5e1", color: "#1e293b", fontSize: "13px" }}>
                {KALINLIKLAR.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div style={{ flex: 3 }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>Cam Rengi</label>
              <select value={tekCamRenk} onChange={(e) => setTekCamRenk(e.target.value)} style={{ width: "100%", padding: "9px", borderRadius: "5px", border: "1px solid #cbd5e1", color: "#1e293b", fontSize: "13px" }}>
                {CAM_RENKLERI.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div style={{ flex: 4 }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>Kaplama Tipi (Tüm Şişecam Serisi)</label>
              <select value={tekCamKaplama} onChange={(e) => setTekCamKaplama(e.target.value)} style={{ width: "100%", padding: "9px", borderRadius: "5px", border: "1px solid #cbd5e1", color: "#1e293b", fontSize: "13px" }}>
                {KAPLAMA_TURLERI.map(kp => <option key={kp} value={kp}>{kp}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* 2. LAMİNE CAM ALANI (YATAY GENİŞ, BÜYÜK VE FERAH) */}
        {camTuru === "lamine" && (
          <div style={{ display: "flex", gap: "12px", width: "100%", alignItems: "center", flexWrap: "nowrap" }}>
            
            {/* 1. Dış Cam */}
            <div style={{ flex: 4, padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#0f2942", marginBottom: "8px" }}>1. Dış Cam Katmanı</label>
              <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                <select value={lamineCam1Kalinlik} onChange={(e) => setLamineCam1Kalinlik(e.target.value)} style={{ flex: 1, padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "13px", color: "#1e293b" }}>
                  {KALINLIKLAR.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                <select value={lamineCam1Renk} onChange={(e) => setLamineCam1Renk(e.target.value)} style={{ flex: 2, padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "13px", color: "#1e293b" }}>
                  {CAM_RENKLERI.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <select value={lamineCam1Kaplama} onChange={(e) => setLamineCam1Kaplama(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "13px", color: "#1e293b" }}>
                {KAPLAMA_TURLERI.map(kp => <option key={kp} value={kp}>{kp}</option>)}
              </select>
            </div>

            <div style={{ fontWeight: "bold", color: "#64748b", fontSize: "20px" }}>+</div>

            {/* Ara Katman (PVB) */}
            <div style={{ flex: 3, padding: "12px", backgroundColor: "#f1f5f9", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "8px" }}>Ara Katman (PVB Film)</label>
              <select value={pvbTuru} onChange={(e) => setPvbTuru(e.target.value)} style={{ width: "100%", padding: "14px 8px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "13px", color: "#1e293b" }}>
                {PVB_TURLERI.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div style={{ fontWeight: "bold", color: "#64748b", fontSize: "20px" }}>+</div>

            {/* 2. İç Cam */}
            <div style={{ flex: 4, padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#0f2942", marginBottom: "8px" }}>2. İç Cam Katmanı</label>
              <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                <select value={lamineCam2Kalinlik} onChange={(e) => setLamineCam2Kalinlik(e.target.value)} style={{ flex: 1, padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "13px", color: "#1e293b" }}>
                  {KALINLIKLAR.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                <select value={lamineCam2Renk} onChange={(e) => setLamineCam2Renk(e.target.value)} style={{ flex: 2, padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "13px", color: "#1e293b" }}>
                  {CAM_RENKLERI.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <select value={lamineCam2Kaplama} onChange={(e) => setLamineCam2Kaplama(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "13px", color: "#1e293b" }}>
                {KAPLAMA_TURLERI.map(kp => <option key={kp} value={kp}>{kp}</option>)}
              </select>
            </div>

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
            />
            
            <div style={{ fontWeight: "bold", color: "#94a3b8", fontSize: "18px" }}>+</div>
            
            <div style={{ flex: 2, padding: "10px", backgroundColor: "#f1f5f9", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>Ara Boşluk & Çıta</label>
              <div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
                <select value={citaKalinlik} onChange={(e) => setCitaKalinlik(e.target.value)} style={{ flex: 1, padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "13px", color: "#1e293b" }}>
                  {CITA_KALINLIKLARI.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <select value={gazTipi} onChange={(e) => setGazTipi(e.target.value)} style={{ flex: 1, padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "13px", color: "#1e293b" }}>
                  {GAZ_TIPLERI.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <select value={citaTipi} onChange={(e) => setCitaTipi(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "13px", color: "#1e293b" }}>
                {CITA_TIPLERI.map(ct => <option key={ct} value={ct}>{ct}</option>)}
              </select>
            </div>

            <div style={{ fontWeight: "bold", color: "#94a3b8", fontSize: "18px" }}>+</div>

            <CamKatmaniSecici 
              title="2. İç Cam" bgColor="#f8fafc" borderColor="#e2e8f0"
              tip={icCamTipi} setTip={setIcCamTipi} kalinlik={icCamKalinlik} setKalinlik={setIcCamKalinlik}
              lamK1={icCamLamK1} setLamK1={setIcCamLamK1} lamK2={icCamLamK2} setLamK2={setIcCamLamK2} lamPVB={icCamLamPVB} setLamPVB={setIcCamLamPVB}
              renk={icCamRenk} setRenk={setIcCamRenk} kaplama={icCamKaplama} setKaplama={setIcCamKaplama}
            />
          </div>
        )}

        {/* 4. ÜÇLÜ ISICAM ALANI */}
        {camTuru === "ucIliIsicam" && (
          <div style={{ display: "flex", gap: "8px", width: "100%", alignItems: "center" }}>
            <CamKatmaniSecici title="1. Dış Cam" bgColor="#f8fafc" borderColor="#e2e8f0" tip={uDisCamTipi} setTip={setUDisCamTipi} kalinlik={uDisCamKalinlik} setKalinlik={setUDisCamKalinlik} lamK1={uDisLamK1} setLamK1={setUDisLamK1} lamK2={uDisLamK2} setLamK2={setUDisLamK2} lamPVB={uDisLamPVB} setLamPVB={setUDisLamPVB} renk={uDisCamRenk} setRenk={setUDisCamRenk} kaplama={uDisCamKaplama} setKaplama={setUDisCamKaplama} />
            
            <div style={{ fontWeight: "bold", color: "#94a3b8", fontSize: "14px" }}>+</div>

            <div style={{ flex: 1.5, padding: "8px", backgroundColor: "#f1f5f9", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>1. Boşluk</label>
              <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                <select value={uCita1Kalinlik} onChange={(e) => setUCita1Kalinlik(e.target.value)} style={{ flex: 1, padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "11px", color: "#1e293b" }}>{CITA_KALINLIKLARI.map(b => <option key={b} value={b}>{b}</option>)}</select>
                <select value={uGaz1Tipi} onChange={(e) => setUGaz1Tipi(e.target.value)} style={{ flex: 1, padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "11px", color: "#1e293b" }}>{GAZ_TIPLERI.map(g => <option key={g} value={g}>{g}</option>)}</select>
              </div>
              <select value={uCita1Tipi} onChange={(e) => setUCita1Tipi(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "11px", color: "#1e293b" }}>{CITA_TIPLERI.map(ct => <option key={ct} value={ct}>{ct}</option>)}</select>
            </div>

            <div style={{ fontWeight: "bold", color: "#94a3b8", fontSize: "14px" }}>+</div>

            <CamKatmaniSecici title="2. Orta Cam" bgColor="#f8fafc" borderColor="#e2e8f0" tip={uOrtaCamTipi} setTip={setUOrtaCamTipi} kalinlik={uOrtaCamKalinlik} setKalinlik={setUOrtaCamKalinlik} lamK1={uOrtaLamK1} setLamK1={setUOrtaLamK1} lamK2={uOrtaLamK2} setLamK2={setUOrtaLamK2} lamPVB={uOrtaLamPVB} setLamPVB={setUOrtaLamPVB} renk={uOrtaCamRenk} setRenk={setUOrtaCamRenk} kaplama={uOrtaCamKaplama} setKaplama={setUOrtaCamKaplama} />
            
            <div style={{ fontWeight: "bold", color: "#94a3b8", fontSize: "14px" }}>+</div>

            <div style={{ flex: 1.5, padding: "8px", backgroundColor: "#f1f5f9", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>2. Boşluk</label>
              <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                <select value={uCita2Kalinlik} onChange={(e) => setUCita2Kalinlik(e.target.value)} style={{ flex: 1, padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "11px", color: "#1e293b" }}>{CITA_KALINLIKLARI.map(b => <option key={b} value={b}>{b}</option>)}</select>
                <select value={uGaz2Tipi} onChange={(e) => setUGaz2Tipi(e.target.value)} style={{ flex: 1, padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "11px", color: "#1e293b" }}>{GAZ_TIPLERI.map(g => <option key={g} value={g}>{g}</option>)}</select>
              </div>
              <select value={uCita2Tipi} onChange={(e) => setUCita2Tipi(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "11px", color: "#1e293b" }}>{CITA_TIPLERI.map(ct => <option key={ct} value={ct}>{ct}</option>)}</select>
            </div>

            <div style={{ fontWeight: "bold", color: "#94a3b8", fontSize: "14px" }}>+</div>

            <CamKatmaniSecici title="3. İç Cam" bgColor="#f8fafc" borderColor="#e2e8f0" tip={uIcCamTipi} setTip={setUIcCamTipi} kalinlik={uIcCamKalinlik} setKalinlik={setUIcCamKalinlik} lamK1={uIcLamK1} setLamK1={setUIcLamK1} lamK2={uIcLamK2} setLamK2={setUIcLamK2} lamPVB={uIcLamPVB} setLamPVB={setUIcLamPVB} renk={uIcCamRenk} setRenk={setUIcCamRenk} kaplama={uIcCamKaplama} setKaplama={setUIcCamKaplama} />
          </div>
        )}
      </div>

      {/* İŞLEM SEÇENEKLERİ (Kenar, Temper, Delik, Oygu) */}
      <div style={{ display: "flex", gap: "10px", marginTop: "16px", padding: "12px", backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "6px", flexWrap: "wrap" }}>
        
        <div style={{ flex: 1, minWidth: "150px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>Kenar İşlemi</label>
          <select value={kenarIslemi} onChange={(e) => setKenarIslemi(e.target.value)} style={{ width: "100%", padding: "7px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "12px", cursor: "pointer", color: "#1e293b", backgroundColor: "white" }}>
            <option>Düz Kesim (İşlemsiz)</option>
            <option>Rodajlı</option>
            <option>Bizoteli</option>
            <option>Pahlı</option>
          </select>
        </div>

        <div style={{ flex: 1, minWidth: "150px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>Temper İşlemi</label>
          <select value={temperIslemi} onChange={(e) => setTemperIslemi(e.target.value)} style={{ width: "100%", padding: "7px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "12px", cursor: "pointer", color: "#1e293b", backgroundColor: "white" }}>
            <option>Tempersiz</option>
            <option>Temperli</option>
            <option>Yarı Temperli</option>
            <option>Bombeli Temperli</option>
          </select>
        </div>

        <div style={{ flex: 1, minWidth: "100px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>Delik İşlemi</label>
          <select value={delikIslemi} onChange={(e) => setDelikIslemi(e.target.value)} style={{ width: "100%", padding: "7px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "12px", cursor: "pointer", color: "#1e293b", backgroundColor: "white" }}>
            <option>Delik Yok</option>
            <option>Delik Var</option>
          </select>
        </div>

        <div style={{ flex: 1, minWidth: "100px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>Oygu İşlemi</label>
          <select value={oyguIslemi} onChange={(e) => setOyguIslemi(e.target.value)} style={{ width: "100%", padding: "7px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "12px", cursor: "pointer", color: "#1e293b", backgroundColor: "white" }}>
            <option>Oygu Yok</option>
            <option>Oygu Var</option>
          </select>
        </div>
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