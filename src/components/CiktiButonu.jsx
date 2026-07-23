import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { teklifPdfIndir, proformaPdfIndir } from "../utils/pdfOlustur";
import { imalatPdfIndir } from "../utils/pdfImalatOlustur";

export default function CiktiButonu({ teklif, sepet, sepet2 = [] }) {
  const [islemDurumu, setIslemDurumu] = useState(null);

  if (sepet.length === 0 && sepet2.length === 0) return null;

  const supabaseKaydet = async (tur) => {
    let sayac = parseInt(localStorage.getItem("proforma_sayac") || "1", 10);
    const yil = new Date().getFullYear();
    const belgeNo = `${yil}/${sayac.toString().padStart(3, "0")}`;

    const yeniKayit = {
      teklif_no: belgeNo,
      tur: tur,
      musteri_adi: teklif.musteriAdi || "Bilinmeyen Müşteri",
      proje_adi: teklif.projeAdi,
      ilgili_kisi: teklif.ilgiliKisi,
      notlar: teklif.notlar || "",
      odeme_sekli: teklif.odemeSekli || "", 
      tarih: new Date().toISOString(),
      sepet: sepet,
      sepet2: sepet2
    };

    const { error } = await supabase.from("teklifler").insert([yeniKayit]);
    
    if (error) {
      console.error("Supabase Kayıt Hatası:", error);
      alert("Teklif oluşturuldu ama arşive kaydedilirken bir hata oluştu.");
      return belgeNo;
    }

    localStorage.setItem("proforma_sayac", sayac + 1);
    window.dispatchEvent(new Event("arsivGuncellendi"));
    return belgeNo;
  };

  async function islemYap(tur, onizlemeMi) {
    setIslemDurumu(tur);
    try {
      // Artık tüm türler (TEKLİF, PROFORMA, İMALAT) aynı mantıkla arşive kaydediliyor
      const belgeNo = await supabaseKaydet(tur);
      
      if (tur === "TEKLİF") {
        await teklifPdfIndir(teklif, sepet, sepet2, belgeNo, onizlemeMi);
      } else if (tur === "PROFORMA") {
        await proformaPdfIndir(teklif, sepet, sepet2, belgeNo, onizlemeMi);
      } else if (tur === "İMALAT") {
        await imalatPdfIndir(teklif, sepet, sepet2, belgeNo, onizlemeMi);
      }
    } finally {
      setIslemDurumu(null);
    }
  }

  return (
    <section className="panel">
      <h2 className="panel__baslik">Çıktı Yönetimi</h2>
      
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "flex-start" }}>
        
        {/* TEKLİF BUTONLARI */}
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <button className="buton buton--birincil" onClick={() => islemYap("TEKLİF", false)} disabled={islemDurumu !== null}>
            {islemDurumu === "TEKLİF" ? "Hazırlanıyor…" : "Teklifi Kaydet & İndir"}
          </button>
          <button className="buton buton--ikincil" onClick={() => islemYap("TEKLİF", true)} disabled={islemDurumu !== null}>
            Teklifi Önizle
          </button>
        </div>

        {/* PROFORMA BUTONLARI */}
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <button className="buton buton--birincil" onClick={() => islemYap("PROFORMA", false)} disabled={islemDurumu !== null}>
            {islemDurumu === "PROFORMA" ? "Hazırlanıyor…" : "Proformayı Kaydet & İndir"}
          </button>
          <button className="buton buton--ikincil" onClick={() => islemYap("PROFORMA", true)} disabled={islemDurumu !== null}>
            Proformayı Önizle
          </button>
        </div>

        {/* İMALAT / KESİM LİSTESİ BUTONLARI */}
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <button 
            className="buton" 
            onClick={() => islemYap("İMALAT", false)} 
            disabled={islemDurumu !== null}
            style={{ backgroundColor: "#d97706", color: "white", fontWeight: "bold" }}
          >
            {islemDurumu === "İMALAT" ? "Hazırlanıyor…" : "İmalat Listesini Kaydet & İndir"}
          </button>
          <button 
            className="buton buton--ikincil" 
            onClick={() => islemYap("İMALAT", true)} 
            disabled={islemDurumu !== null}
          >
            İmalat Listesini Önizle
          </button>
        </div>

      </div>
    </section>
  );
}