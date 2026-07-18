import { useState } from "react";
import { teklifPdfIndir, proformaPdfIndir } from "../utils/pdfOlustur";

export default function CiktiButonu({ teklif, sepet }) {
  const [islemDurumu, setIslemDurumu] = useState(null);

  if (sepet.length === 0) return null;

  // ARŞİVE KAYDETME VE NUMARA ÜRETME MOTORU
  const arsiveKaydet = (tur) => {
    // 1. Sıradaki Numarayı Al ve Formatla (Örn: 2026/002)
    let sayac = parseInt(localStorage.getItem("proforma_sayac") || "1", 10);
    const yil = new Date().getFullYear();
    const belgeNo = `${yil}/${sayac.toString().padStart(3, "0")}`;

    // 2. Arşive eklenecek veri paketini hazırla
    const yeniKayit = {
      id: Date.now().toString(), // Benzersiz ID
      no: belgeNo,
      tur: tur,                  // "TEKLİF" veya "PROFORMA"
      musteriAdi: teklif.musteriAdi || "Bilinmeyen Müşteri",
      tarih: new Date().toISOString(),
      teklif: teklif,
      sepet: sepet
    };

    // 3. Mevcut arşivi getir, yenisini en başa ekle ve kaydet
    const mevcutArsiv = JSON.parse(localStorage.getItem("gecmis_teklifler") || "[]");
    const guncelArsiv = [yeniKayit, ...mevcutArsiv];
    localStorage.setItem("gecmis_teklifler", JSON.stringify(guncelArsiv));
    
    // 4. Sonraki işlem için sayacı 1 artır
    localStorage.setItem("proforma_sayac", sayac + 1);

    // 5. Aşağıdaki tablonun (GecmisTeklifler) haberi olsun diye sinyal gönder
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("arsivGuncellendi"));

    // Üretilen bu numarayı PDF'e basılması için geri döndür
    return belgeNo;
  };

  async function indirTeklif() {
    setIslemDurumu("teklif");
    try {
      // Önce arşive kaydet ve numarayı al
      const belgeNo = arsiveKaydet("TEKLİF");
      // Sonra o numarayla PDF'i sekmede aç (true parametresi sekmede açtırır)
      await teklifPdfIndir(teklif, sepet, belgeNo, true);
    } finally {
      setIslemDurumu(null);
    }
  }

  async function indirProforma() {
    setIslemDurumu("proforma");
    try {
      // Önce arşive kaydet ve numarayı al
      const belgeNo = arsiveKaydet("PROFORMA");
      // Sonra o numarayla PDF'i sekmede aç
      await proformaPdfIndir(teklif, sepet, belgeNo, true);
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
          {islemDurumu === "teklif" ? "Hazırlanıyor…" : "Teklifi Kaydet & Görüntüle"}
        </button>

        <button 
          className="buton buton--birincil" 
          onClick={indirProforma} 
          disabled={islemDurumu !== null}
        >
          {islemDurumu === "proforma" ? "Hazırlanıyor…" : "Proformayı Kaydet & Görüntüle"}
        </button>
        
      </div>
    </section>
  );
}