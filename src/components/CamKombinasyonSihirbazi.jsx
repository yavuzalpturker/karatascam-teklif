import { useState, useEffect } from "react";

// ŞİŞECAM GENİŞ CAM RENK VE TİP LİSTESİ
const CAM_RENKLERI = [
  "Clear (Şeffaf)", 
  "Extra Clear", 
  "Ultra Clear", 
  "Füme", 
  "Bronz", 
  "Mavi", 
  "Yeşil", 
  "Koyu Füme",
  "Derin Füme",
  "Açık Füme",
  "Turkuaz",
  "Ara Yeşil"
];

// ŞİŞECAM GLASSTOOL TÜM KAPLAMA SERİLERİ (EKSİKSİZ)
const KAPLAMA_TURLERI = [
  "Kaplamasız (Düzcam)",

  // --- TEMPERLENEBİLİR LOW-E SERİSİ (Isı Kontrol) ---
  "Climax T 80",
  "Climax T 71",
  "Climax T 70",
  "Climax T 60",
  "Climax T 50",
  "Climax T 40",
  "Ecotherm T",

  // --- TEMPERLENEBİLİR SOLAR LOW-E SERİSİ (Güneş + Isı Kontrol) ---
  "Duosol T 70",
  "Duosol T 70 One",
  "Duosol T 60",
  "Duosol T 58",
  "Duosol T 58 One",
  "Duosol T 51",
  "Duosol T 51 One",
  "Duosol T 50",
  "Duosol T 43/28",
  "Ecosol T 62",
  "Ecosol T 62/44",
  "Ecosol T 50",
  "Prosol T 60 One",
  "Prosol T 50",
  "Prosol T 40",
  "Prosol T Silver",
  "Prosol T Blue",
  "Prosol T Green",
  "Prosol T Bronze",
  "Prosol T Grey",
  "Coolplus T 70/37",
  "Coolplus T 70/40",
  "Coolplus T 60/40",
  "Coolplus T 50/33",

  // --- TEMPERLENMEYEN DÜZ LOW-E & SOLAR LOW-E SERİSİ ---
  "Low-E (Standart)",
  "Solar Low-E (Standart)",
  "Climax 80",
  "Climax 71",
  "Duosol 70",
  "Duosol 58",
  "Ecosol 62",

  // --- REFLEKTİF / GÜNEŞ KONTROL (TENTESOL SERİSİ) ---
  "Tentesol Gümüş",
  "Tentesol Füme",
  "Tentesol Bronz",
  "Tentesol Mavi",
  "Tentesol Yeşil",
  "Tentesol T Gümüş (Temperlenebilir)",
  "Tentesol T Füme (Temperlenebilir)",
  "Tentesol T Bronz (Temperlenebilir)",
  "Tentesol T Mavi (Temperlenebilir)",
  "Tentesol T Yeşil (Temperlenebilir)",

  // --- ÖZEL KAPLAMALAR ---
  "Anti-Reflektif",
  "Kendi Kendini Temizleyen (Self-Cleaning)"
];

const KALINLIKLAR = [
  "2 mm", "3 mm", "4 mm", "5 mm", "6 mm", "8 mm", "10 mm", "12 mm", "15 mm", "19 mm"
];

const CITA_KALINLIKLARI = [
  "6 mm", "8 mm", "9 mm", "10 mm", "12 mm", "14 mm", "15 mm", "16 mm", "18 mm", "20 mm", "22 mm", "24 mm"
];

const CITA_TIPLERI = [
  "Alüminyum Çıta",
  "Warm Edge (Sıcak Kenar Çıta)"
];

const GAZ_TIPLERI = ["Hava", "Argon Gazı", "Kripton Gazı"];

const PVB_TURLERI = [
  "Şeffaf PVB (0.38)", 
  "Şeffaf PVB (0.76)", 
  "Şeffaf PVB (1.52)", 
  "Akustik PVB (0.38)", 
  "Akustik PVB (0.76)", 
  "Opak PVB", 
  "Füme PVB", 
  "Bronz PVB", 
  "Vanceva Renkli PVB",
  "SentryGlas (SG Ionoplast)"
];

export default function CamKombinasyonSihirbazi({ onKombinasyonSec }) {
  const [camTuru, setCamTuru] = useState("isicam");

  // --- 1. TEK CAM STATE'LERİ ---
  const [tekCamKalinlik, setTekCamKalinlik] = useState("6 mm");
  const [tekCamRenk, setTekCamRenk] = useState("Clear (Şeffaf)");
  const [tekCamKaplama, setTekCamKaplama] = useState("Kaplamasız (Düzcam)");

  // --- 2. LAMİNE CAM STATE'LERİ ---
  const [lamineCam1Kalinlik, setLamineCam1Kalinlik] = useState("4 mm");
  const [lamineCam1Renk, setLamineCam1Renk] = useState("Clear (Şeffaf)");
  const [lamineCam1Kaplama, setLamineCam1Kaplama] = useState("Kaplamasız (Düzcam)");

  const [pvbTuru, setPvbTuru] = useState("Şeffaf PVB (0.38)");

  const [lamineCam2Kalinlik, setLamineCam2Kalinlik] = useState("4 mm");
  const [lamineCam2Renk, setLamineCam2Renk] = useState("Clear (Şeffaf)");
  const [lamineCam2Kaplama, setLamineCam2Kaplama] = useState("Kaplamasız (Düzcam)");

  // --- 3. ISICAM STATE'LERİ ---
  const [disCamKalinlik, setDisCamKalinlik] = useState("4 mm");
  const [disCamRenk, setDisCamRenk] = useState("Clear (Şeffaf)");
  const [disCamKaplama, setDisCamKaplama] = useState("Duosol T 70");

  const [citaKalinlik, setCitaKalinlik] = useState("20 mm");
  const [citaTipi, setCitaTipi] = useState("Warm Edge (Sıcak Kenar Çıta)");
  const [gazTipi, setGazTipi] = useState("Argon Gazı");

  const [icCamKalinlik, setIcCamKalinlik] = useState("4 mm");
  const [icCamRenk, setIcCamRenk] = useState("Clear (Şeffaf)");
  const [icCamKaplama, setIcCamKaplama] = useState("Kaplamasız (Düzcam)");

  const [olusturulanIsim, setOlusturulanIsim] = useState("");

  // Kombinasyon İsmini Dinamik Oluşturma
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
        isim = `${k1}+${k2} ${lamineCam1Renk} LAMİNE CAM (${pvbTuru})`;
      } else {
        isim = `(${k1}mm ${lamineCam1Renk}${kaplama1}) + (${pvbTuru}) + (${k2}mm ${lamineCam2Renk}${kaplama2}) LAMİNE CAM`;
      }
    } 
    else if (camTuru === "isicam") {
      const disKaplamaYazisi = disCamKaplama !== "Kaplamasız (Düzcam)" ? ` ${disCamKaplama}` : "";
      const icKaplamaYazisi = icCamKaplama !== "Kaplamasız (Düzcam)" ? ` ${icCamKaplama}` : "";

      const disCamStr = `${disCamKalinlik} ${disCamRenk}${disKaplamaYazisi}`;
      const boslukStr = `${citaKalinlik} ${citaTipi} (${gazTipi})`;
      const icCamStr = `${icCamKalinlik} ${icCamRenk}${icKaplamaYazisi}`;

      isim = `(${disCamStr}) + (${boslukStr}) + (${icCamStr}) ISICAM`;
    }

    setOlusturulanIsim(isim);
  }, [
    camTuru, tekCamKalinlik, tekCamRenk, tekCamKaplama,
    lamineCam1Kalinlik, lamineCam1Renk, lamineCam1Kaplama, pvbTuru, lamineCam2Kalinlik, lamineCam2Renk, lamineCam2Kaplama,
    disCamKalinlik, disCamRenk, disCamKaplama, citaKalinlik, citaTipi, gazTipi, icCamKalinlik, icCamRenk, icCamKaplama
  ]);

  const aktar = () => {
    if (onKombinasyonSec) {
      onKombinasyonSec(olusturulanIsim);
    }
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #cbd5e1", marginBottom: "20px" }}>
      <h3 style={{ margin: "0 0 12px 0", color: "#0f2942", fontSize: "15px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
        🧩 Şişecam Katmanlı Cam & Kaplama Sihirbazı
      </h3>

      {/* TÜR SEÇİMİ */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "15px" }}>
        {[
          { id: "isicam", label: "Isıcam (Çift Cam)" },
          { id: "lamine", label: "Lamine Cam" },
          { id: "tek", label: "Tek Cam" }
        ].map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCamTuru(item.id)}
            style={{
              flex: 1,
              padding: "8px",
              borderRadius: "5px",
              border: "1px solid #cbd5e1",
              backgroundColor: camTuru === item.id ? "#0f2942" : "white",
              color: camTuru === item.id ? "white" : "#334155",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer"
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* KATMAN SEÇİMLERİ */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "flex-start", backgroundColor: "white", padding: "14px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
        
        {/* 1. TEK CAM ALANI */}
        {camTuru === "tek" && (
          <>
            <div style={{ flex: 1, minWidth: "120px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>Cam Kalınlığı</label>
              <select value={tekCamKalinlik} onChange={(e) => setTekCamKalinlik(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1" }}>
                {KALINLIKLAR.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: "150px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>Cam Rengi</label>
              <select value={tekCamRenk} onChange={(e) => setTekCamRenk(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1" }}>
                {CAM_RENKLERI.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div style={{ flex: 2, minWidth: "220px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>Kaplama Tipi (Tüm Şişecam Serisi)</label>
              <select value={tekCamKaplama} onChange={(e) => setTekCamKaplama(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1" }}>
                {KAPLAMA_TURLERI.map(kp => <option key={kp} value={kp}>{kp}</option>)}
              </select>
            </div>
          </>
        )}

        {/* 2. LAMİNE CAM ALANI */}
        {camTuru === "lamine" && (
          <>
            {/* 1. Cam Katmanı */}
            <div style={{ flex: 2, minWidth: "200px", padding: "8px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#0f2942", marginBottom: "6px" }}>1. Dış Cam Katmanı</label>
              <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                <select value={lamineCam1Kalinlik} onChange={(e) => setLamineCam1Kalinlik(e.target.value)} style={{ flex: 1, padding: "5px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "12px" }}>
                  {KALINLIKLAR.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                <select value={lamineCam1Renk} onChange={(e) => setLamineCam1Renk(e.target.value)} style={{ flex: 2, padding: "5px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "12px" }}>
                  {CAM_RENKLERI.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <select value={lamineCam1Kaplama} onChange={(e) => setLamineCam1Kaplama(e.target.value)} style={{ width: "100%", padding: "5px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "12px" }}>
                {KAPLAMA_TURLERI.map(kp => <option key={kp} value={kp}>{kp}</option>)}
              </select>
            </div>

            <div style={{ fontWeight: "bold", color: "#94a3b8", alignSelf: "center" }}>+</div>

            {/* Ara Katman (PVB) */}
            <div style={{ flex: 1.5, minWidth: "160px", padding: "8px", backgroundColor: "#fefce8", borderRadius: "6px", border: "1px solid #fef08a" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#854d0e", marginBottom: "6px" }}>Ara Katman (PVB Film)</label>
              <select value={pvbTuru} onChange={(e) => setPvbTuru(e.target.value)} style={{ width: "100%", padding: "5px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "12px" }}>
                {PVB_TURLERI.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div style={{ fontWeight: "bold", color: "#94a3b8", alignSelf: "center" }}>+</div>

            {/* 2. Cam Katmanı */}
            <div style={{ flex: 2, minWidth: "200px", padding: "8px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#0f2942", marginBottom: "6px" }}>2. İç Cam Katmanı</label>
              <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                <select value={lamineCam2Kalinlik} onChange={(e) => setLamineCam2Kalinlik(e.target.value)} style={{ flex: 1, padding: "5px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "12px" }}>
                  {KALINLIKLAR.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                <select value={lamineCam2Renk} onChange={(e) => setLamineCam2Renk(e.target.value)} style={{ flex: 2, padding: "5px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "12px" }}>
                  {CAM_RENKLERI.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <select value={lamineCam2Kaplama} onChange={(e) => setLamineCam2Kaplama(e.target.value)} style={{ width: "100%", padding: "5px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "12px" }}>
                {KAPLAMA_TURLERI.map(kp => <option key={kp} value={kp}>{kp}</option>)}
              </select>
            </div>
          </>
        )}

        {/* 3. ISICAM ALANI */}
        {camTuru === "isicam" && (
          <>
            {/* Dış Cam */}
            <div style={{ flex: 2, minWidth: "210px", padding: "8px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#0f2942", marginBottom: "6px" }}>1. Dış Cam</label>
              <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                <select value={disCamKalinlik} onChange={(e) => setDisCamKalinlik(e.target.value)} style={{ flex: 1, padding: "5px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "12px" }}>
                  {KALINLIKLAR.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                <select value={disCamRenk} onChange={(e) => setDisCamRenk(e.target.value)} style={{ flex: 2, padding: "5px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "12px" }}>
                  {CAM_RENKLERI.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <select value={disCamKaplama} onChange={(e) => setDisCamKaplama(e.target.value)} style={{ width: "100%", padding: "5px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "12px" }}>
                {KAPLAMA_TURLERI.map(kp => <option key={kp} value={kp}>{kp}</option>)}
              </select>
            </div>

            <div style={{ fontWeight: "bold", color: "#94a3b8", alignSelf: "center" }}>+</div>

            {/* Ara Boşluk & Çıta */}
            <div style={{ flex: 2, minWidth: "200px", padding: "8px", backgroundColor: "#f0fdf4", borderRadius: "6px", border: "1px solid #bbf7d0" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#166534", marginBottom: "6px" }}>Ara Boşluk & Çıta</label>
              <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                <select value={citaKalinlik} onChange={(e) => setCitaKalinlik(e.target.value)} style={{ flex: 1, padding: "5px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "12px" }}>
                  {CITA_KALINLIKLARI.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <select value={gazTipi} onChange={(e) => setGazTipi(e.target.value)} style={{ flex: 1, padding: "5px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "12px" }}>
                  {GAZ_TIPLERI.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <select value={citaTipi} onChange={(e) => setCitaTipi(e.target.value)} style={{ width: "100%", padding: "5px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "12px" }}>
                {CITA_TIPLERI.map(ct => <option key={ct} value={ct}>{ct}</option>)}
              </select>
            </div>

            <div style={{ fontWeight: "bold", color: "#94a3b8", alignSelf: "center" }}>+</div>

            {/* İç Cam */}
            <div style={{ flex: 2, minWidth: "210px", padding: "8px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#0f2942", marginBottom: "6px" }}>2. İç Cam</label>
              <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                <select value={icCamKalinlik} onChange={(e) => setIcCamKalinlik(e.target.value)} style={{ flex: 1, padding: "5px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "12px" }}>
                  {KALINLIKLAR.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                <select value={icCamRenk} onChange={(e) => setIcCamRenk(e.target.value)} style={{ flex: 2, padding: "5px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "12px" }}>
                  {CAM_RENKLERI.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <select value={icCamKaplama} onChange={(e) => setIcCamKaplama(e.target.value)} style={{ width: "100%", padding: "5px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "12px" }}>
                {KAPLAMA_TURLERI.map(kp => <option key={kp} value={kp}>{kp}</option>)}
              </select>
            </div>
          </>
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