import { useState, useEffect } from "react";

const CAM_RENKLERI = [
  "Clear (Şeffaf)", "Extra Clear", "Ultra Clear", "Füme", "Bronz", "Mavi", "Yeşil", 
  "Temperlenebilir Low-E", "Temperlenebilir Solar Low-E", "Low-E", "Solar Low-E"
];

const KALINLIKLAR = ["3 mm", "4 mm", "5 mm", "6 mm", "8 mm", "10 mm", "12 mm"];

const ARA_BOSLUKLAR = [
  "6 mm Hava", "9 mm Hava", "12 mm Hava", "16 mm Hava",
  "6 mm Argon", "9 mm Argon", "12 mm Argon", "16 mm Argon"
];

const PVB_TURLERI = [
  "Şeffaf PVB (0.38)", "Şeffaf PVB (0.76)", "Akustik PVB", "Opak PVB", "Füme PVB", "Bronz PVB"
];

export default function CamKombinasyonSihirbazi({ onKombinasyonSec }) {
  const [camTuru, setCamTuru] = useState("tek"); // 'tek', 'isicam', 'lamine'

  // Tek Cam State
  const [tekCamKalinlik, setTekCamKalinlik] = useState("6 mm");
  const [tekCamRenk, setTekCamRenk] = useState("Clear (Şeffaf)");

  // Isıcam State
  const [disCamKalinlik, setDisCamKalinlik] = useState("4 mm");
  const [disCamRenk, setDisCamRenk] = useState("Temperlenebilir Low-E");
  const [araBosluk, setAraBosluk] = useState("16 mm Argon");
  const [icCamKalinlik, setIcCamKalinlik] = useState("4 mm");
  const [icCamRenk, setIcCamRenk] = useState("Clear (Şeffaf)");

  // Lamine Cam State
  const [lamineCam1Kalinlik, setLamineCam1Kalinlik] = useState("4 mm");
  const [lamineCam1Renk, setLamineCam1Renk] = useState("Clear (Şeffaf)");
  const [pvbTuru, setPvbTuru] = useState("Şeffaf PVB (0.38)");
  const [lamineCam2Kalinlik, setLamineCam2Kalinlik] = useState("4 mm");
  const [lamineCam2Renk, setLamineCam2Renk] = useState("Clear (Şeffaf)");

  const [olusturulanIsim, setOlusturulanIsim] = useState("");

  // Kombinasyon Ismini Dinamik Olusturma
  useEffect(() => {
    let isim = "";
    if (camTuru === "tek") {
      isim = `${tekCamKalinlik} ${tekCamRenk} CAM`;
    } else if (camTuru === "isicam") {
      isim = `(${disCamKalinlik} ${disCamRenk}) + (${araBosluk}) + (${icCamKalinlik} ${icCamRenk}) ISICAM`;
    } else if (camTuru === "lamine") {
      const k1 = lamineCam1Kalinlik.replace(" mm", "");
      const k2 = lamineCam2Kalinlik.replace(" mm", "");
      
      if (lamineCam1Renk === lamineCam2Renk) {
        isim = `${k1}+${k2} ${lamineCam1Renk} LAMİNE CAM (${pvbTuru})`;
      } else {
        isim = `${k1}mm ${lamineCam1Renk} + ${pvbTuru} + ${k2}mm ${lamineCam2Renk} LAMİNE CAM`;
      }
    }
    setOlusturulanIsim(isim);
  }, [
    camTuru, tekCamKalinlik, tekCamRenk, 
    disCamKalinlik, disCamRenk, araBosluk, icCamKalinlik, icCamRenk,
    lamineCam1Kalinlik, lamineCam1Renk, pvbTuru, lamineCam2Kalinlik, lamineCam2Renk
  ]);

  const aktar = () => {
    if (onKombinasyonSec) {
      onKombinasyonSec(olusturulanIsim);
    }
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #cbd5e1", marginBottom: "20px" }}>
      <h3 style={{ margin: "0 0 12px 0", color: "#0f2942", fontSize: "15px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
        🧩 Cam Kombinasyon Sihirbazı (Şişecam Katman Sistemi)
      </h3>

      {/* TÜR SEÇİMİ */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "15px" }}>
        {[
          { id: "tek", label: "Tek Cam" },
          { id: "isicam", label: "Isıcam (Çift Cam)" },
          { id: "lamine", label: "Lamine Cam" }
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
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", backgroundColor: "white", padding: "12px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
        
        {/* TEK CAM ALANI */}
        {camTuru === "tek" && (
          <>
            <div style={{ flex: 1, minWidth: "140px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Kalınlık</label>
              <select value={tekCamKalinlik} onChange={(e) => setTekCamKalinlik(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1" }}>
                {KALINLIKLAR.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div style={{ flex: 2, minWidth: "180px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Cam Tipi / Rengi</label>
              <select value={tekCamRenk} onChange={(e) => setTekCamRenk(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1" }}>
                {CAM_RENKLERI.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </>
        )}

        {/* ISICAM ALANI */}
        {camTuru === "isicam" && (
          <>
            {/* Dış Cam */}
            <div style={{ flex: 1, minWidth: "150px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#1e293b", marginBottom: "4px" }}>1. Dış Cam</label>
              <select value={disCamKalinlik} onChange={(e) => setDisCamKalinlik(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1", marginBottom: "4px" }}>
                {KALINLIKLAR.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
              <select value={disCamRenk} onChange={(e) => setDisCamRenk(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1" }}>
                {CAM_RENKLERI.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div style={{ fontWeight: "bold", color: "#94a3b8" }}>+</div>

            {/* Ara Boşluk */}
            <div style={{ flex: 1, minWidth: "120px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#1e293b", marginBottom: "4px" }}>Ara Boşluk</label>
              <select value={araBosluk} onChange={(e) => setAraBosluk(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1" }}>
                {ARA_BOSLUKLAR.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div style={{ fontWeight: "bold", color: "#94a3b8" }}>+</div>

            {/* İç Cam */}
            <div style={{ flex: 1, minWidth: "150px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#1e293b", marginBottom: "4px" }}>2. İç Cam</label>
              <select value={icCamKalinlik} onChange={(e) => setIcCamKalinlik(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1", marginBottom: "4px" }}>
                {KALINLIKLAR.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
              <select value={icCamRenk} onChange={(e) => setIcCamRenk(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1" }}>
                {CAM_RENKLERI.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </>
        )}

        {/* LAMİNE CAM ALANI */}
        {camTuru === "lamine" && (
          <>
            {/* 1. Cam */}
            <div style={{ flex: 1, minWidth: "140px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#1e293b", marginBottom: "4px" }}>1. Cam Katmanı</label>
              <select value={lamineCam1Kalinlik} onChange={(e) => setLamineCam1Kalinlik(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1", marginBottom: "4px" }}>
                {KALINLIKLAR.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
              <select value={lamineCam1Renk} onChange={(e) => setLamineCam1Renk(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1" }}>
                {CAM_RENKLERI.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div style={{ fontWeight: "bold", color: "#94a3b8" }}>+</div>

            {/* Ara Katman (PVB) */}
            <div style={{ flex: 1, minWidth: "130px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#1e293b", marginBottom: "4px" }}>Ara Katman (PVB)</label>
              <select value={pvbTuru} onChange={(e) => setPvbTuru(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1" }}>
                {PVB_TURLERI.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div style={{ fontWeight: "bold", color: "#94a3b8" }}>+</div>

            {/* 2. Cam */}
            <div style={{ flex: 1, minWidth: "140px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#1e293b", marginBottom: "4px" }}>2. Cam Katmanı</label>
              <select value={lamineCam2Kalinlik} onChange={(e) => setLamineCam2Kalinlik(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1", marginBottom: "4px" }}>
                {KALINLIKLAR.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
              <select value={lamineCam2Renk} onChange={(e) => setLamineCam2Renk(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1" }}>
                {CAM_RENKLERI.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </>
        )}

      </div>

      {/* ÖNİZLEME VE FORMA AKTARMA ALANI */}
      <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ fontSize: "13px", color: "#1e293b" }}>
          <span style={{ fontWeight: "600", color: "#64748b" }}>Oluşturulan Ürün Adı: </span>
          <span style={{ fontWeight: "700", color: "#0f2942" }}>{olusturulanIsim}</span>
        </div>

        <button
          type="button"
          onClick={aktar}
          style={{
            backgroundColor: "#0f2942",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}
        >
          ↙️ Forma Aktar
        </button>
      </div>
    </div>
  );
}