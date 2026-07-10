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
    try {
      setYukleniyor(true);
      // Numaraya göre azalan sırada çekiyoruz (En yeni en üstte)
      const { data, error } = await supabase
        .from("teklifler")
        .select("*")
        .order("teklif_no", { ascending: false });

      if (error) throw error;
      setTeklifler(data || []);
    } catch (e) {
      console.error("Veriler yüklenemedi:", e.message);
    } finally {
      setYukleniyor(false);
    }
  }

  // Arama filtresi (Numara, Müşteri Adı veya Proje Adına göre arar)
  const filtrelenmisTeklifler = teklifler.filter((t) => {
    const aramaMetni = arama.toLocaleLowerCase("tr-TR");
    return (
      (t.teklif_no || "").toLocaleLowerCase("tr-TR").includes(aramaMetni) ||
      (t.musteri_adi || "").toLocaleLowerCase("tr-TR").includes(aramaMetni) ||
      (t.proje_adi || "").toLocaleLowerCase("tr-TR").includes(aramaMetni)
    );
  });

  // Geçmiş teklifi hafızadan okuyup tekrar PDF üreten sihirli fonksiyon
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

  return (
    <section className="panel" style={{ marginTop: "30px" }}>
      <h2 className="panel__baslik">Geçmiş Teklif & Proforma Arşivi</h2>

      <label className="alan" style={{ marginBottom: "20px" }}>
        <span>Teklif No veya Müşteri Adı ile Ara</span>
        <input
          type="text"
          placeholder="Ara..."
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
        />
      </label>

      {yukleniyor ? (
        <p className="bilgi-metni">Arşiv listesi yükleniyor...</p>
      ) : filtrelenmisTeklifler.length === 0 ? (
        <p className="bilgi-metni">Arşivde kayıtlı belge bulunamadı.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ backgroundColor: "#eeeeee", textAlign: "left" }}>
                <th style={{ padding: "12px", borderBottom: "2px solid #ccc" }}>BELGE NO</th>
                <th style={{ padding: "12px", borderBottom: "2px solid #ccc" }}>TÜR</th>
                <th style={{ padding: "12px", borderBottom: "2px solid #ccc" }}>MÜŞTERİ ADI</th>
                <th style={{ padding: "12px", borderBottom: "2px solid #ccc" }}>PROJE ADI</th>
                <th style={{ padding: "12px", borderBottom: "2px solid #ccc" }}>TARİH</th>
                <th style={{ padding: "12px", borderBottom: "2px solid #ccc", textAlign: "center" }}>AKSİYON</th>
              </tr>
            </thead>
            <tbody>
              {filtrelenmisTeklifler.map((t) => (
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
                  <td style={{ padding: "12px" }}>{t.proje_adi}</td>
                  <td style={{ padding: "12px" }}>{t.tarih}</td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <button
                      className="buton buton--birincil"
                      onClick={() => tekrarIndir(t)}
                      style={{ padding: "6px 12px", fontSize: "12px", margin: 0 }}
                    >
                      Tekrar İndir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}