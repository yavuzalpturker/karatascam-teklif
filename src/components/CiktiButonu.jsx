import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { teklifPdfIndir, proformaPdfIndir } from "../utils/pdfOlustur";

export default function CiktiButonu({ teklif, sepet }) {
  const [islemDurumu, setIslemDurumu] = useState(null);

  if (sepet.length === 0) return null;

  // SUPABASE'E KAYDETME VE NUMARA ÜRETME MOTORU
  const supabaseKaydet = async (tur) => {
    // 1. Sıradaki Numarayı Al
    let sayac = parseInt(localStorage.getItem("proforma_sayac") || "1", 10);
    const yil = new Date().getFullYear();
    const belgeNo = `${yil}/${sayac.toString().padStart(3, "0")}`;

    // 2. Supabase'e Gönderilecek Veri Paketi (GecmisTeklifler'in beklediği format)
    const yeniKayit = {
      teklif_no: belgeNo,
      tur: tur,                  
      musteri_adi: teklif.musteriAdi || "Bilinmeyen Müşteri",
      proje_adi: teklif.projeAdi,
      ilgili_kisi: teklif.ilgiliKisi,
      notlar: teklif.notlar || "",
      tarih: new Date().toISOString(),
      sepet: sepet // Sepet JSON formatında saklanıyor
    };

    // 3. Supabase'e Yaz
    const { error } = await supabase.from("teklifler").insert([yeniKayit]);
    
    if (error) {
      console.error("Supabase Kayıt Hatası:", error);
      alert("Teklif oluşturuldu ama arşive kaydedilirken bir hata oluştu.");
      return belgeNo; // Hata olsa bile belge numarasını dön ki PDF oluşturulsun
    }

    // 4. Başarılıysa sayacı 1 artır
    localStorage.setItem("proforma_sayac", sayac + 1);

    // 5. Aşağıdaki tablonun haberi olsun diye sinyal gönder
    window.dispatchEvent(new Event("arsivGuncellendi"));

    return belgeNo;
  };

  async function indirTeklif() {
    setIslemDurumu("teklif");
    try {
      const belgeNo = await supabaseKaydet("TEKLİF");
      await teklifPdfIndir(teklif, sepet, belgeNo, false);
    } finally {
      setIslemDurumu(null);
    }
  }

  async function indirProforma() {
    setIslemDurumu("proforma");
    try {
      const belgeNo = await supabaseKaydet("PROFORMA");
      await proformaPdfIndir(teklif, sepet, belgeNo, false);
    } finally {
      setIslemDurumu(null);
    }
  }

  return (
    <section className="panel">
      <h2 className="panel__baslik">Çıktı Yönetimi</h2>
      <div style={{ display: "flex", gap: "1rem" }}>
        <button 
          className="buton buton--birincil" 
          onClick={indirTeklif} 
          disabled={islemDurumu !== null}
        >
          {islemDurumu === "teklif" ? "Hazırlanıyor…" : "Teklifi Kaydet & İndir"}
        </button>

        <button 
          className="buton buton--birincil" 
          onClick={indirProforma} 
          disabled={islemDurumu !== null}
        >
          {islemDurumu === "proforma" ? "Hazırlanıyor…" : "Proformayı Kaydet & İndir"}
        </button>
      </div>
    </section>
  );
}