import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { teklifPdfIndir, proformaPdfIndir } from "../utils/pdfOlustur";
import { imalatPdfIndir } from "../utils/pdfImalatOlustur";

export default function CiktiButonu({ teklif, sepet, sepet2 = [] }) {
  const [islemDurumu, setIslemDurumu] = useState(null);

  if (sepet.length === 0 && sepet2.length === 0) return null;

  const supabaseKaydet = async (tur, imalatSepet1 = sepet, imalatSepet2 = sepet2) => {
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
      sepet: imalatSepet1,
      sepet2: imalatSepet2
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
      if (tur === "İMALAT") {
        const seciliSepet1 = sepet.filter(item => item.secili !== false);
        const seciliSepet2 = sepet2.filter(item => item.secili !== false);

        if (seciliSepet1.length === 0 && seciliSepet2.length === 0) {
          alert("Lütfen imalat listesine eklemek için en az 1 ürün seçin (checkbox)!");
          return;
        }

        const belgeNo = await supabaseKaydet(tur, seciliSepet1, seciliSepet2);
        await imalatPdfIndir(teklif, seciliSepet1, seciliSepet2, belgeNo, onizlemeMi);
      } else {
        const belgeNo = await supabaseKaydet(tur, sepet, sepet2);
        if (tur === "TEKLİF") {
          await teklifPdfIndir(teklif, sepet, sepet2, belgeNo, onizlemeMi);
        } else {
          await proformaPdfIndir(teklif, sepet, sepet2, belgeNo, onizlemeMi);
        }
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

        {/* İMALAT / KESİM LİSTESİ BUTONLARI (KURUMSAL TEMAYA UYARLANDI) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <button 
            className="buton" 
            onClick={() => islemYap("İMALAT", false)} 
            disabled={islemDurumu !== null}
            style={{ backgroundColor: "#0f2942", color: "white", fontWeight: "bold", border: "1px solid #0f2942" }}
          >
            {islemDurumu === "İMALAT" ? "Hazırlanıyor…" : "🛠️ Seçilenlerin İmalatını İndir"}
          </button>
          <button 
            className="buton buton--ikincil" 
            onClick={() => islemYap("İMALAT", true)} 
            disabled={islemDurumu !== null}
          >
            Seçilenlerin İmalatını Önizle
          </button>
        </div>

      </div>
    </section>
  );
}