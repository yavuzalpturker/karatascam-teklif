import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { teklifPdfIndir, proformaPdfIndir } from "../utils/pdfOlustur";

export default function GecmisTeklifler() {
  const [teklifler, setTeklifler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [arama, setArama] = useState("");

  useEffect(() => {
    fetchGecmisTeklifler();
  }, []);

  async function fetchGecmisTeklifler() {
    setYukleniyor(true);
    const { data, error } = await supabase
      .from("teklifler")
      .select("*")
      .order("created_at", { ascending: false }); // En yeniler en üstte
      
    if (error) console.error("Hata:", error);
    setTeklifler(data || []);
    setYukleniyor(false);
  }

  // SİLME FONKSİYONU
  async function sil(id) {
    if (!window.confirm("Bu teklifi arşivden silmek istediğine emin misin?")) return;
    
    const { error } = await supabase.from("teklifler").delete().eq("id", id);
    if (!error) {
      setTeklifler(teklifler.filter((t) => t.id !== id));
    } else {
      alert("Silme işlemi başarısız oldu.");
    }
  }

  // YANLIŞLIKLA SİLDİĞİMİZ İNDİRME FONKSİYONU (Geri Geldi!)
  function tekrarIndir(t) {
    const teklifBilgisi = {
      musteriAdi: t.musteri_adi,
      projeAdi: t.proje_adi,
      ilgiliKisi: t.ilgili_kisi,
      notlar: t.notlar,
      tarih: new Date(t.tarih)
    };

    if (t.tur === "PROFORMA") {
      proformaPdfIndir(teklifBilgisi, t.sepet, t.teklif_no);
    } else {
      teklifPdfIndir(teklifBilgisi, t.sepet, t.teklif_no);
    }
  }

  const filtrelenmisTeklifler = teklifler.filter((t) => {
    const aramaMetni = arama.toLocaleLowerCase("tr-TR");
    return (
      (t.teklif_no || "").toLocaleLowerCase("tr-TR").includes(aramaMetni) ||
      (t.musteri_adi || "").toLocaleLowerCase("tr-TR").includes(aramaMetni)
    );
  });

  return (
    <section className="panel" style={{ marginTop: "30px" }}>
      <h2 className="panel__baslik">Geçmiş Teklif & Proforma Arşivi</h2>

      <input
        type="text"
        placeholder="Ara (No veya Müşteri Adı)..."
        value={arama}
        onChange={(e) => setArama(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "15px", borderRadius: "6px", border: "1px solid #ccc" }}
      />

      <div style={{ maxHeight: "400px", overflowY: "auto", overflowX: "auto", border: "1px solid #eee", borderRadius: "6px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f4f4f4", textAlign: "left" }}>
              <th style={{ padding: "12px", borderBottom: "2px solid #ccc", position: "sticky", top: 0, backgroundColor: "#eeeeee", zIndex: 1 }}>NO</th>
              <th style={{ padding: "12px", borderBottom: "2px solid #ccc", position: "sticky", top: 0, backgroundColor: "#eeeeee", zIndex: 1 }}>TÜR</th>
              <th style={{ padding: "12px", borderBottom: "2px solid #ccc", position: "sticky", top: 0, backgroundColor: "#eeeeee", zIndex: 1 }}>MÜŞTERİ</th>
              <th style={{ padding: "12px", borderBottom: "2px solid #ccc", textAlign: "center", position: "sticky", top: 0, backgroundColor: "#eeeeee", zIndex: 1 }}>İŞLEM</th>
            </tr>
          </thead>
          <tbody>
            {yukleniyor ? (
              <tr><td colSpan="4" style={{ padding: "10px", textAlign: "center" }}>Yükleniyor...</td></tr>
            ) : filtrelenmisTeklifler.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: "10px", textAlign: "center" }}>Kayıt bulunamadı.</td></tr>
            ) : (
              filtrelenmisTeklifler.map((t) => (
                <tr key={t.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px", fontWeight: "bold" }}>{t.teklif_no}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{
                      padding: "3px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold",
                      backgroundColor: t.tur === "PROFORMA" ? "#e0f7fa" : "#fff3e0",
                      color: t.tur === "PROFORMA" ? "#006064" : "#e65100"
                    }}>
                      {t.tur}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>{t.musteri_adi}</td>
                  <td style={{ padding: "12px", textAlign: "center", whiteSpace: "nowrap" }}>
                    <button onClick={() => tekrarIndir(t)} className="buton buton--birincil" style={{ cursor: "pointer", padding: "6px 12px", fontSize: "12px", margin: "0 5px 0 0" }}>İndir</button>
                    <button 
                      onClick={() => sil(t.id)} 
                      style={{ backgroundColor: "#ff4d4d", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}