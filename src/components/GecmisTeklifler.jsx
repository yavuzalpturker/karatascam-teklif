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
    const { data } = await supabase
      .from("teklifler")
      .select("*")
      .order("created_at", { ascending: false }); // En yeniler en üstte
    setTeklifler(data || []);
    setYukleniyor(false);
  }

  // YENİ: Silme fonksiyonu
  async function sil(id) {
    if (!window.confirm("Bu teklifi arşivden silmek istediğine emin misin?")) return;
    
    const { error } = await supabase.from("teklifler").delete().eq("id", id);
    if (!error) {
      setTeklifler(teklifler.filter((t) => t.id !== id));
    } else {
      alert("Silme işlemi başarısız oldu.");
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

      <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #eee", borderRadius: "6px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f4f4f4", position: "sticky", top: 0 }}>
              <th style={{ padding: "10px", textAlign: "left" }}>NO</th>
              <th style={{ padding: "10px", textAlign: "left" }}>MÜŞTERİ</th>
              <th style={{ padding: "10px", textAlign: "center" }}>İŞLEM</th>
            </tr>
          </thead>
          <tbody>
            {filtrelenmisTeklifler.map((t) => (
              <tr key={t.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "10px" }}>{t.teklif_no}</td>
                <td style={{ padding: "10px" }}>{t.musteri_adi}</td>
                <td style={{ padding: "10px", textAlign: "center" }}>
                  <button onClick={() => tekrarIndir(t)} style={{ marginRight: "10px", cursor: "pointer" }}>İndir</button>
                  {/* SİLME BUTONU BURADA */}
                  <button 
                    onClick={() => sil(t.id)} 
                    style={{ backgroundColor: "#ff4d4d", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}