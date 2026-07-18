import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { teklifPdfIndir, proformaPdfIndir } from "../utils/pdfOlustur";

export default function CiktiButonu({ teklif, sepet }) {
  const [islemDurumu, setIslemDurumu] = useState(null);

  if (sepet.length === 0) return null;

  // SUPABASE'E KAYDETME VE NUMARA ÜRETME MOTORU (Aynı mantık)
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
      tarih: new Date().toISOString(),
      sepet: sepet 
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

  // İndirme ve Önizleme Fonksiyonları
  async function islemYap(tur, onizlemeMi) {
    setIslemDurumu(tur);
    try {
      const belgeNo = await supabaseKaydet(tur);
      if (tur === "TEKLİF") {
        await teklifPdfIndir(teklif, sepet, belgeNo, onizlemeMi);
      } else {
        await proformaPdfIndir(teklif, sepet, belgeNo, onizlemeMi);
      }
    } finally {
      setIslemDurumu(null);
    }
  }

  return (
    <section className="panel">
      <h2 className="panel__baslik">Çıktı Yönetimi</h2>
      
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        
        {/* Teklif Bölümü */}
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <button className="buton buton--birincil" onClick={() => islemYap("TEKLİF", false)} disabled={islemDurumu !== null}>
            {islemDurumu === "TEKLİF" ? "Hazırlanıyor…" : "Teklifi Kaydet & İndir"}
          </button>
          <button className="buton buton--ikincil" onClick={() => islemYap("TEKLİF", true)} disabled={islemDurumu !== null}>
            Teklifi Önizle
          </button>
        </div>

        {/* Proforma Bölümü */}
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <button className="buton buton--birincil" onClick={() => islemYap("PROFORMA", false)} disabled={islemDurumu !== null}>
            {islemDurumu === "PROFORMA" ? "Hazırlanıyor…" : "Proformayı Kaydet & İndir"}
          </button>
          <button className="buton buton--ikincil" onClick={() => islemYap("PROFORMA", true)} disabled={islemDurumu !== null}>
            Proformayı Önizle
          </button>
        </div>

      </div>
    </section>
  );
}