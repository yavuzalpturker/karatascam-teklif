import { useState, useEffect, useRef } from "react";

const SEKIL_TANIMLARI = [
  { id: "RS01", ad: "RS01 - Üstten Eğimli Kesim", parametreler: ["L", "H", "H1"] },
  { id: "RS02", ad: "RS02 - Sağ Üst Köşe Pahlı", parametreler: ["L", "H", "L1", "H1"] },
  { id: "RS03", ad: "RS03 - Çift Taraf Eğimli Yamuk", parametreler: ["L", "H", "L1", "L2"] },
  { id: "RS04", ad: "RS04 - Dik Açılı ve Pahlı Yamuk", parametreler: ["L", "H", "L1", "L2", "H1"] },
  { id: "RS05", ad: "RS05 - Derece Açılı Tek Taraf Yamuk", parametreler: ["L", "H", "L1", "A"] },
  { id: "RS06", ad: "RS06 - Çift Derece Açılı Yamuk", parametreler: ["L", "H", "A", "A1"] },
  { id: "RS07", ad: "RS07 - Çift Taraf Farklı Kırıklı", parametreler: ["L", "H", "L1", "L2", "H1", "H2"] },
  { id: "RS08", ad: "RS08 - Dört Köşe Eşit Pahlı", parametreler: ["L", "H", "L1", "H1"] },
  { id: "RS09", ad: "RS09 - Paralelkenar Cam", parametreler: ["L", "H", "L1"] },
  { id: "RS10", ad: "RS10 - Çatı Tipi Çift Eğimli", parametreler: ["L", "H", "L1", "H1", "H2"] },
  { id: "RS11", ad: "RS11 - Çapraz Çift Zıt Pahlı", parametreler: ["L", "H", "L1", "L2", "H1", "H2"] },
  { id: "RS12", ad: "RS12 - Dört Köşe İkili Farklı Pahlı", parametreler: ["L", "H", "L1", "L2", "H1", "H2"] },
  { id: "RS13", ad: "RS13 - Pahlı ve Daire Delikli Cam", parametreler: ["L", "H", "L1", "H1", "XC", "YC", "L2"] },
  { id: "RS14", ad: "RS14 - İç Slot (Oval Delikli) Cam", parametreler: ["L", "H", "L1", "L2", "L3", "H1"] }
];

export default function SekilCiziciModal({ acik, onKapat, onCizimKaydet, varsayilanEn = "", varsayilanBoy = "" }) {
  const [seciliSekilId, setSeciliSekilId] = useState("RS08");
  const [parametreler, setParametreler] = useState({
    L: varsayilanEn || 1200,
    H: varsayilanBoy || 800,
    L1: 150,
    L2: 150,
    L3: 300,
    H1: 150,
    H2: 100,
    A: 45,
    A1: 60,
    XC: 600,
    YC: 400
  });

  const canvasRef = useRef(null);

  useEffect(() => {
    if (varsayilanEn) setParametreler(p => ({ ...p, L: Number(varsayilanEn) || p.L }));
    if (varsayilanBoy) setParametreler(p => ({ ...p, H: Number(varsayilanBoy) || p.H }));
  }, [varsayilanEn, varsayilanBoy]);

  useEffect(() => {
    if (!acik) return;
    cizimYap();
  }, [acik, seciliSekilId, parametreler]);

  const handleParametreDegis = (pAd, val) => {
    setParametreler(prev => ({ ...prev, [pAd]: Number(val) || 0 }));
  };

  const cizimYap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    const padX = 90; 
    const padY = 70; 

    const drawW = width - padX * 2;
    const drawH = height - padY * 2;

    const L = parametreler.L || 1200;
    const H = parametreler.H || 800;
    const scale = Math.min(drawW / (L || 1), drawH / (H || 1));

    const x0 = padX + (drawW - L * scale) / 2;
    const y0 = height - padY - (drawH - H * scale) / 2;

    const toX = (val) => x0 + val * scale;
    const toY = (val) => y0 - val * scale;

    const okCiz = (x1, y1, x2, y2, etiket, konum = "alt") => {
      ctx.strokeStyle = "#cc0000";
      ctx.fillStyle = "#cc0000";
      ctx.lineWidth = 2.2;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      const angle = Math.atan2(y2 - y1, x2 - x1);
      const headLen = 9;

      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1 + headLen * Math.cos(angle - Math.PI / 6), y1 + headLen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(x1 + headLen * Math.cos(angle + Math.PI / 6), y1 + headLen * Math.sin(angle + Math.PI / 6));
      ctx.fill();

      ctx.font = "bold 20px Arial"; 
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;

      if (konum === "alt") {
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(etiket, midX, midY + 8);
      } else if (konum === "üst") {
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(etiket, midX, midY - 8);
      } else {
        ctx.save();
        ctx.translate(midX, midY);
        ctx.rotate(-Math.PI / 2); 
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const offset = konum === "sol" ? -18 : 18; 
        ctx.fillText(etiket, 0, offset);
        ctx.restore();
      }
    };

    let noktalar = [];
    const { L1, L2, L3, H1, H2, A, A1, XC, YC } = parametreler;

    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 3.5;
    ctx.beginPath();

    switch (seciliSekilId) {
      case "RS01":
        noktalar = [{ x: 0, y: 0 }, { x: L, y: 0 }, { x: L, y: H1 }, { x: 0, y: H }];
        break;
      case "RS02":
        noktalar = [{ x: 0, y: 0 }, { x: L, y: 0 }, { x: L, y: H1 }, { x: L1, y: H }, { x: 0, y: H }];
        break;
      case "RS03":
        noktalar = [{ x: 0, y: 0 }, { x: L, y: 0 }, { x: L - L1, y: H }, { x: L2, y: H }];
        break;
      case "RS04":
        noktalar = [{ x: 0, y: 0 }, { x: L, y: 0 }, { x: L, y: H1 }, { x: L - L1, y: H }, { x: L2, y: H }];
        break;
      case "RS05":
        noktalar = [{ x: 0, y: 0 }, { x: L, y: 0 }, { x: L, y: H }, { x: L1, y: H }];
        break;
      case "RS06":
        noktalar = [
          { x: 0, y: 0 }, { x: L, y: 0 },
          { x: L - (H / Math.tan((A1 * Math.PI) / 180)), y: H },
          { x: H / Math.tan((A * Math.PI) / 180), y: H }
        ];
        break;
      case "RS07":
        noktalar = [{ x: 0, y: 0 }, { x: L, y: 0 }, { x: L, y: H2 }, { x: L - L1, y: H }, { x: L2, y: H }, { x: 0, y: H1 }];
        break;
      case "RS08":
        noktalar = [
          { x: L1, y: 0 }, { x: L - L1, y: 0 }, { x: L, y: H1 },
          { x: L, y: H - H1 }, { x: L - L1, y: H }, { x: L1, y: H },
          { x: 0, y: H - H1 }, { x: 0, y: H1 }
        ];
        break;
      case "RS09":
        noktalar = [{ x: 0, y: 0 }, { x: L - L1, y: 0 }, { x: L, y: H }, { x: L1, y: H }];
        break;
      case "RS10":
        noktalar = [{ x: 0, y: H1 }, { x: L1, y: H }, { x: L, y: H2 }, { x: L, y: 0 }, { x: 0, y: 0 }];
        break;
      case "RS11":
        noktalar = [{ x: 0, y: 0 }, { x: L - L2, y: 0 }, { x: L, y: H2 }, { x: L, y: H }, { x: L1, y: H }, { x: 0, y: H - H1 }];
        break;
      case "RS12":
        noktalar = [
          { x: L1, y: 0 }, { x: L - L1, y: 0 }, { x: L, y: H1 },
          { x: L, y: H - H2 }, { x: L - L2, y: H }, { x: L2, y: H },
          { x: 0, y: H - H2 }, { x: 0, y: H1 }
        ];
        break;
      case "RS13":
      case "RS14":
        noktalar = [
          { x: L1, y: 0 }, { x: L - L1, y: 0 }, { x: L, y: H1 },
          { x: L, y: H - H1 }, { x: L - L1, y: H }, { x: L1, y: H },
          { x: 0, y: H - H1 }, { x: 0, y: H1 }
        ];
        if (seciliSekilId === "RS14") {
          noktalar = [{ x: 0, y: 0 }, { x: L, y: 0 }, { x: L, y: H }, { x: 0, y: H }];
        }
        break;
      default:
        noktalar = [{ x: 0, y: 0 }, { x: L, y: 0 }, { x: L, y: H }, { x: 0, y: H }];
    }

    noktalar.forEach((pt, idx) => {
      const px = toX(pt.x);
      const py = toY(pt.y);
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.stroke();

    if (seciliSekilId === "RS13") {
      const cx = toX(XC);
      const cy = toY(YC);
      const r = (L2 / 2) * scale;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.stroke();
      okCiz(toX(0), cy, cx, cy, `XC = ${XC}`, "üst");
      okCiz(cx, toY(0), cx, cy, `YC = ${YC}`, "sağ");
      okCiz(cx - r, cy, cx + r, cy, `L2 = ${L2}`, "alt");
    }

    if (seciliSekilId === "RS14") {
      const sx = toX(L1);
      const sy = toY(L2);
      const r = (H1 / 2) * scale;
      const len = L3 * scale;
      ctx.beginPath();
      ctx.arc(sx + r, sy - r, r, Math.PI / 2, (3 * Math.PI) / 2);
      ctx.lineTo(sx + len - r, sy - 2 * r);
      ctx.arc(sx + len - r, sy - r, r, (3 * Math.PI) / 2, Math.PI / 2);
      ctx.lineTo(sx + r, sy);
      ctx.closePath();
      ctx.stroke();
      okCiz(toX(0), sy - r, sx, sy - r, `L1 = ${L1}`, "üst");
      okCiz(sx, toY(0), sx, sy, `L2 = ${L2}`, "sol");
      okCiz(sx, sy - 2 * r - 10, sx + len, sy - 2 * r - 10, `L3 = ${L3}`, "üst");
      okCiz(sx + len / 2, sy - 2 * r, sx + len / 2, sy, `H1 = ${H1}`, "sağ");
    }

    okCiz(toX(0), toY(-25), toX(L), toY(-25), `L = ${L}`, "alt");
    okCiz(toX(-28), toY(0), toX(-28), toY(H), `H = ${H}`, "sol");

    if (["RS01", "RS02", "RS04", "RS07", "RS08", "RS10", "RS11", "RS12", "RS13"].includes(seciliSekilId)) {
      okCiz(toX(L + 28), toY(0), toX(L + 28), toY(H1), `H1 = ${H1}`, "sağ");
    }
    if (["RS02", "RS03", "RS04", "RS07", "RS08", "RS09", "RS10", "RS11", "RS12", "RS13"].includes(seciliSekilId)) {
      okCiz(toX(0), toY(H + 25), toX(L1), toY(H + 25), `L1 = ${L1}`, "üst");
    }
  };

  const handleKayıtEt = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const base64Gorsel = canvas.toDataURL("image/png");
    
    const sekilObj = SEKIL_TANIMLARI.find(s => s.id === seciliSekilId);
    const ozetMetin = `${sekilObj?.id} L:${parametreler.L} H:${parametreler.H}`;

    onCizimKaydet({
      base64Gorsel,
      ozetMetin,
      en: parametreler.L,
      boy: parametreler.H
    });
    onKapat();
  };

  if (!acik) return null;

  const aktifSekilObj = SEKIL_TANIMLARI.find(s => s.id === seciliSekilId);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 41, 66, 0.8)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
      <div style={{ backgroundColor: "white", width: "900px", maxWidth: "95vw", borderRadius: "10px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        
        <div style={{ backgroundColor: "#0f2942", color: "white", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800" }}>📐 CNC Parametrik Özel Şekil Çizici</h3>
          <button onClick={onKapat} style={{ background: "none", border: "none", color: "white", fontSize: "20px", cursor: "pointer", fontWeight: "bold" }}>✕</button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", padding: "16px", gap: "20px" }}>
          
          <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#0f2942", marginBottom: "4px" }}>Şekil Formu Seçin</label>
              <select 
                value={seciliSekilId} 
                onChange={(e) => setSeciliSekilId(e.target.value)}
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: "700", backgroundColor: "#f8fafc" }}
              >
                {SEKIL_TANIMLARI.map(s => (
                  <option key={s.id} value={s.id}>{s.ad}</option>
                ))}
              </select>
            </div>

            <div style={{ backgroundColor: "#f1f5f9", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
              <h5 style={{ margin: "0 0 10px 0", color: "#0f2942", fontSize: "13px", fontWeight: "800" }}>📏 Ölçü Parametreleri (mm / Derece)</h5>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {aktifSekilObj?.parametreler.map(p => (
                  <div key={p}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#334155", marginBottom: "2px" }}>{p} Değeri</label>
                    <input 
                      type="number" 
                      min="0"
                      value={parametreler[p] !== undefined ? parametreler[p] : ""} 
                      onChange={(e) => handleParametreDegis(p, e.target.value)}
                      style={{ width: "100%", padding: "7px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: "700" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ flex: "1 1 480px", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#ffffff", borderRadius: "8px", border: "2px solid #cbd5e1", padding: "10px" }}>
            <canvas ref={canvasRef} width={500} height={350} style={{ width: "100%", height: "auto", borderRadius: "4px" }} />
          </div>

        </div>

        <div style={{ padding: "12px 20px", backgroundColor: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button onClick={onKapat} style={{ backgroundColor: "#64748b", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: "700", cursor: "pointer" }}>İptal</button>
          <button onClick={handleKayıtEt} style={{ backgroundColor: "#16a34a", color: "white", border: "none", padding: "8px 20px", borderRadius: "6px", fontWeight: "800", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>📐 Çizimi Oluştur ve Ürüne Ekle</button>
        </div>

      </div>
    </div>
  );
}