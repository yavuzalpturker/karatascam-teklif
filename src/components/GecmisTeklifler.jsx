import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { teklifPdfIndir, proformaPdfIndir } from "../utils/pdfOlustur";

export default function GecmisTeklifler({ kullaniciRolu, onSepetiYukle }) {
  const [teklifler, setTeklifler] = useState([]);
  const [secilenler, setSecilenler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [arama, setArama] = useState("");

  useEffect(() => {
    fetchGecmisTeklifler();

    const arsivGuncellemeDinleyici = () => fetchGecmisTeklifler();
    window.addEventListener("arsivGuncellendi", arsivGuncellemeDinleyici);

    return () => {
      window.removeEventListener("arsivGuncellendi", arsivGuncellemeDinleyici);
    };
  }, []);

  async function fetchGecmisTeklifler() {
    setYukleniyor(true);
    const { data, error } = await supabase
      .from("teklifler")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (error) console.error("Hata:", error);
    setTeklifler(data || []);
    setYukleniyor(false);
  }

  const handleTekliSecim = (id) => {
    if (secilenler.includes(id)) {
      setSecilenler(secilenler.filter(item => item !== id));
    } else {
      setSecilenler([...secilenler, id]);
    }
  };

  const topluSil = async () => {
    if (secilenler.length === 0) {
      alert("Lütfen silinecek en az bir teklif seçin!");
      return;
    }

    const onay = window.confirm(`Seçilen ${secilenler.length} teklifi silmek istediğinize emin misiniz?`);
    if (!onay) return;

    try {
      const { error } = await supabase.from('teklifler').delete().in('id', secilenler);
      if (error) throw error;

      setTeklifler(teklifler.filter(item => !secilenler.includes(item.id)));
      setSecilenler([]);
      alert("Seçilen teklifler başarıyla silindi!");
    } catch (err) {
      console.error("Silme hatası:", err);
      alert("Silinirken bir hata oluştu: " + err.message);
    }
  };

  async function sil(id) {
    if (!window.confirm("Bu teklifi arşivden silmek istediğine emin misin?")) return;
    
    const { error } = await supabase.from("teklifler").delete().eq("id", id);
    if (!error) {
      setTeklifler(teklifler.filter((t) => t.id !== id));
      setSecilenler(secilenler.filter(item => item !== id));
    } else {
      alert("Silme işlemi başarısız oldu.");
    }
  }

  function tekrarIndir(t) {
    const teklifBilgisi = {
      musteriAdi: t.musteri_adi,
      projeAdi: t.proje_adi,
      ilgiliKisi: t.ilgili_kisi,
      notlar: t.notlar,
      tarih: new Date(t.tarih)
    };

    const sepet1 = t.sepet || [];
    const sepet2 = t.sepet2 || [];

    if (t.tur === "PROFORMA") {
      proformaPdfIndir(teklifBilgisi, sepet1, sepet2, t.teklif_no, false);
    } else {
      teklifPdfIndir(teklifBilgisi, sepet1, sepet2, t.teklif_no, false);
    }
  }

  function onizle(t) {
    const teklifBilgisi = {
      musteriAdi: t.musteri_adi,
      projeAdi: t.proje_adi,
      ilgiliKisi: t.ilgili_kisi,
      notlar: t.notlar,
      tarih: new Date(t.tarih)
    };

    const sepet1 = t.sepet || [];
    const sepet2 = t.sepet2 || [];

    if (t.tur === "PROFORMA") {
      proformaPdfIndir(teklifBilgisi, sepet1, sepet2, t.teklif_no, true);
    } else {
      teklifPdfIndir(teklifBilgisi, sepet1, sepet2, t.teklif_no, true);
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <h2 className="panel__baslik" style={{ margin: 0, color: "#0f2942" }}>Geçmiş Teklifler</h2>
        {kullaniciRolu === 'admin' && secilenler.length > 0 && (
          <button 
            onClick={topluSil} 
            style={{ backgroundColor: "#991b1b", color: "white", border: "none", padding: "8px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}
          >
            🗑️ Seçilenleri Sil ({secilenler.length})
          </button>
        )}
      </div>

      <input
        type="text"
        placeholder="Ara (No veya Müşteri Adı)..."
        value={arama}
        onChange={(e) => setArama(e.target.value)}
        style={{ width: "100%", padding: "10px 14px", marginBottom: "15px", borderRadius: "6px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px" }}
      />

      <div style={{ maxHeight: "400px", overflowY: "auto", overflowX: "auto", border: "1px solid #cbd5e1", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", backgroundColor: "white" }}>
          <thead>
            <tr style={{ backgroundColor: "#0f2942", textAlign: "left", color: "white" }}>
              {kullaniciRolu === 'admin' && (
                <th style={{ padding: "12px", borderBottom: "2px solid #0b1d2e", position: "sticky", top: 0, backgroundColor: "#0f2942", zIndex: 1, width: "40px", textAlign: "center" }}>
                  <input 
                    type="checkbox" 
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSecilenler(filtrelenmisTeklifler.map(t => t.id));
                      } else {
                        setSecilenler([]);
                      }
                    }}
                    checked={filtrelenmisTeklifler.length > 0 && secilenler.length === filtrelenmisTeklifler.length}
                    style={{ cursor: "pointer", width: "16px", height: "16px" }}
                  />
                </th>
              )}
              <th style={{ padding: "12px 16px", borderBottom: "2px solid #0b1d2e", position: "sticky", top: 0, backgroundColor: "#0f2942", zIndex: 1, fontWeight: "600" }}>NO</th>
              <th style={{ padding: "12px 16px", borderBottom: "2px solid #0b1d2e", position: "sticky", top: 0, backgroundColor: "#0f2942", zIndex: 1, fontWeight: "600" }}>TÜR</th>
              <th style={{ padding: "12px 16px", borderBottom: "2px solid #0b1d2e", position: "sticky", top: 0, backgroundColor: "#0f2942", zIndex: 1, fontWeight: "600" }}>MÜŞTERİ</th>
              <th style={{ padding: "12px 16px", borderBottom: "2px solid #0b1d2e", textAlign: "center", position: "sticky", top: 0, backgroundColor: "#0f2942", zIndex: 1, fontWeight: "600" }}>İŞLEM</th>
            </tr>
          </thead>
          <tbody>
            {yukleniyor ? (
              <tr><td colSpan={kullaniciRolu === 'admin' ? "5" : "4"} style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>Yükleniyor...</td></tr>
            ) : filtrelenmisTeklifler.length === 0 ? (
              <tr><td colSpan={kullaniciRolu === 'admin' ? "5" : "4"} style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>Kayıt bulunamadı.</td></tr>
            ) : (
              filtrelenmisTeklifler.map((t, index) => (
                <tr key={t.id} style={{ borderBottom: "1px solid #e2e8f0", backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                  {kullaniciRolu === 'admin' && (
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <input 
                        type="checkbox" 
                        checked={secilenler.includes(t.id)}
                        onChange={() => handleTekliSecim(t.id)}
                        style={{ cursor: "pointer", width: "16px", height: "16px" }}
                      />
                    </td>
                  )}
                  <td style={{ padding: "12px 16px", fontWeight: "600", color: "#1e293b" }}>{t.teklif_no}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      padding: "4px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: "700", letterSpacing: "0.5px",
                      backgroundColor: "#e2e8f0",
                      color: "#334155"
                    }}>
                      {t.tur}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#334155", fontWeight: "500" }}>{t.musteri_adi}</td>
                  <td style={{ padding: "12px 16px", textAlign: "center", whiteSpace: "nowrap" }}>
                    <div style={{ display: "inline-flex", gap: "6px", justifyContent: "center" }}>
                      
                      {/* KURUMSAL SEPETİ GETİR BUTONU */}
                      <button 
                        onClick={() => onSepetiYukle(t, t.sepet, t.sepet2)} 
                        title="Bu teklifin sepetini ve bilgilerini ana ekrana yükle"
                        style={{ 
                          backgroundColor: "#334155", 
                          color: "white", 
                          border: "none", 
                          padding: "5px 12px", 
                          borderRadius: "4px", 
                          cursor: "pointer", 
                          fontSize: "12px", 
                          fontWeight: "500"
                        }}
                      >
                        📥 Sepeti Getir
                      </button>

                      <button 
                        onClick={() => onizle(t)} 
                        title="Yeni Sekmede Görüntüle"
                        style={{ 
                          backgroundColor: "#f1f5f9", 
                          color: "#334155", 
                          border: "1px solid #cbd5e1", 
                          padding: "5px 10px", 
                          borderRadius: "4px", 
                          cursor: "pointer", 
                          fontSize: "12px", 
                          fontWeight: "500"
                        }}
                      >
                        👁️ Görüntüle
                      </button>

                      <button 
                        onClick={() => tekrarIndir(t)} 
                        style={{ 
                          backgroundColor: "#1e3a8a", 
                          color: "white", 
                          border: "none", 
                          padding: "5px 12px", 
                          borderRadius: "4px", 
                          cursor: "pointer", 
                          fontSize: "12px", 
                          fontWeight: "500"
                        }}
                      >
                        📥 İndir
                      </button>
                      
                      {kullaniciRolu === 'admin' && (
                        <button 
                          onClick={() => sil(t.id)} 
                          style={{ 
                            backgroundColor: "#991b1b", 
                            color: "white", 
                            border: "none", 
                            padding: "5px 10px", 
                            borderRadius: "4px", 
                            cursor: "pointer", 
                            fontSize: "12px",
                            fontWeight: "500"
                          }}
                        >
                          Sil
                        </button>
                      )}
                    </div>
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