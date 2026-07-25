import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { teklifPdfIndir, proformaPdfIndir } from "../utils/pdfOlustur";
import { imalatPdfIndir } from "../utils/pdfImalatOlustur";

export default function CiktiButonu({ teklif, sepet, sepet2 = [] }) {
  const [islemDurumu, setIslemDurumu] = useState(null);
  
  // AKILLI SAYAÇ VE HAFIZA STATE'LERİ
  const [imalatSayaci, setImalatSayaci] = useState(1);
  const [sonSiparisNo, setSonSiparisNo] = useState("");
  const [sonSeciliUrunler, setSonSeciliUrunler] = useState("");

  if (sepet.length === 0 && sepet2.length === 0) return null;

  // Seçilen ürünleri ve sipariş numarasını izleyen Akıllı Fonksiyon
  const getAkilliImalatTeklifi = (seciliSepet1, seciliSepet2, tumuSeciliMi) => {
    const islemTeklifi = { ...teklif };
    if (!islemTeklifi.siparisNo) return islemTeklifi; // Sipariş no boşsa hiçbir şey yapma

    // EĞER BÜTÜN ÜRÜNLER SEÇİLİYSE TAKI EKLEME, DİREKT ORİJİNAL NUMARAYI VER
    if (tumuSeciliMi) {
      return islemTeklifi;
    }

    // Parçalı seçim yapıldıysa hafıza ve sayaç mantığını çalıştır
    const seciliVeri = JSON.stringify([...seciliSepet1, ...seciliSepet2]);
    
    let guncelSayac = imalatSayaci;

    // Eğer ana sipariş numarası baştan değiştiyse (örn: I-1078'den I-1079'a geçtiyse)
    if (islemTeklifi.siparisNo !== sonSiparisNo) {
      guncelSayac = 1;
      setSonSiparisNo(islemTeklifi.siparisNo);
      setSonSeciliUrunler(seciliVeri);
      setImalatSayaci(1);
    } 
    // Eğer sipariş numarası aynı ama SEÇİLEN ÜRÜNLER FARKLIYSA (Yeni ürünler tiklendiyse)
    else if (seciliVeri !== sonSeciliUrunler) {
      guncelSayac = imalatSayaci + 1;
      setSonSeciliUrunler(seciliVeri);
      setImalatSayaci(guncelSayac);
    }

    islemTeklifi.siparisNo = `${islemTeklifi.siparisNo}-${guncelSayac}`;
    return islemTeklifi;
  };

  const supabaseKaydet = async (tur, aktifTeklif, imalatSepet1 = sepet, imalatSepet2 = sepet2) => {
    let sayac = parseInt(localStorage.getItem("proforma_sayac") || "1", 10);
    const yil = new Date().getFullYear();
    const belgeNo = `${yil}/${sayac.toString().padStart(3, "0")}`;

    const yeniKayit = {
      teklif_no: belgeNo,
      siparis_no: aktifTeklif.siparisNo || null, 
      tur: tur,
      musteri_adi: aktifTeklif.musteriAdi || "Bilinmeyen Müşteri",
      proje_adi: aktifTeklif.projeAdi,
      ilgili_kisi: aktifTeklif.ilgiliKisi,
      notlar: aktifTeklif.notlar || "",
      odeme_sekli: aktifTeklif.odemeSekli || "", 
      tarih: new Date().toISOString(),
      sepet: imalatSepet1,
      sepet2: imalatSepet2
    };

    const { error } = await supabase.from("teklifler").insert([yeniKayit]);
    
    if (error) {
      console.error("Supabase Kayıt Hatası:", error);
      alert("Arşive kaydedilirken bir hata oluştu.");
      return null;
    }

    localStorage.setItem("proforma_sayac", sayac + 1);
    window.dispatchEvent(new Event("arsivGuncellendi"));
    alert("Başarıyla arşive kaydedildi!");
    return belgeNo;
  };

  async function sadeceKaydet(tur) {
    setIslemDurumu(tur + "_KAYDET");
    try {
      if (tur === "İMALAT") {
        const seciliSepet1 = sepet.filter(item => item.secili !== false);
        const seciliSepet2 = sepet2.filter(item => item.secili !== false);
        
        // Sepetteki TÜM ürünlerin seçili olup olmadığını kontrol ediyoruz
        const tumuSeciliMi = (seciliSepet1.length === sepet.length) && (seciliSepet2.length === sepet2.length);

        if (seciliSepet1.length === 0 && seciliSepet2.length === 0) {
          alert("Lütfen imalat listesine kaydetmek için en az 1 ürün seçin (checkbox)!");
          return;
        }
        
        const islemTeklifi = getAkilliImalatTeklifi(seciliSepet1, seciliSepet2, tumuSeciliMi);
        await supabaseKaydet(tur, islemTeklifi, seciliSepet1, seciliSepet2);
      } else {
        await supabaseKaydet(tur, teklif, sepet, sepet2);
      }
    } finally {
      setIslemDurumu(null);
    }
  }

  async function islemYap(tur, onizlemeMi) {
    setIslemDurumu(tur);
    try {
      let belgeNo = teklif.teklifNo || "";

      if (tur === "İMALAT") {
        const seciliSepet1 = sepet.filter(item => item.secili !== false);
        const seciliSepet2 = sepet2.filter(item => item.secili !== false);
        
        // Sepetteki TÜM ürünlerin seçili olup olmadığını kontrol ediyoruz
        const tumuSeciliMi = (seciliSepet1.length === sepet.length) && (seciliSepet2.length === sepet2.length);

        if (seciliSepet1.length === 0 && seciliSepet2.length === 0) {
          alert("Lütfen imalat listesine eklemek için en az 1 ürün seçin (checkbox)!");
          return;
        }

        const islemTeklifi = getAkilliImalatTeklifi(seciliSepet1, seciliSepet2, tumuSeciliMi);
        await imalatPdfIndir(islemTeklifi, seciliSepet1, seciliSepet2, belgeNo, onizlemeMi);
      } else {
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
          <button 
            className="buton" 
            onClick={() => sadeceKaydet("TEKLİF")} 
            disabled={islemDurumu !== null}
            style={{ backgroundColor: "#10b981", color: "white", fontWeight: "bold", border: "1px solid #10b981" }}
          >
            {islemDurumu === "TEKLİF_KAYDET" ? "Kaydediliyor…" : "Teklifi Kaydet"}
          </button>
          <button className="buton buton--birincil" onClick={() => islemYap("TEKLİF", false)} disabled={islemDurumu !== null}>
            {islemDurumu === "TEKLİF" ? "İndiriliyor…" : "Teklifi İndir"}
          </button>
          <button className="buton buton--ikincil" onClick={() => islemYap("TEKLİF", true)} disabled={islemDurumu !== null}>
            Teklifi Önizle
          </button>
        </div>

        {/* PROFORMA BUTONLARI */}
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <button 
            className="buton" 
            onClick={() => sadeceKaydet("PROFORMA")} 
            disabled={islemDurumu !== null}
            style={{ backgroundColor: "#10b981", color: "white", fontWeight: "bold", border: "1px solid #10b981" }}
          >
            {islemDurumu === "PROFORMA_KAYDET" ? "Kaydediliyor…" : "Proformayı Kaydet"}
          </button>
          <button className="buton buton--birincil" onClick={() => islemYap("PROFORMA", false)} disabled={islemDurumu !== null}>
            {islemDurumu === "PROFORMA" ? "İndiriliyor…" : "Proformayı İndir"}
          </button>
          <button className="buton buton--ikincil" onClick={() => islemYap("PROFORMA", true)} disabled={islemDurumu !== null}>
            Proformayı Önizle
          </button>
        </div>

        {/* İMALAT / KESİM LİSTESİ BUTONLARI */}
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <button 
            className="buton" 
            onClick={() => sadeceKaydet("İMALAT")} 
            disabled={islemDurumu !== null}
            style={{ backgroundColor: "#10b981", color: "white", fontWeight: "bold", border: "1px solid #10b981" }}
          >
            {islemDurumu === "İMALAT_KAYDET" ? "Kaydediliyor…" : "🛠️ İmalat Listesini Kaydet"}
          </button>
          <button 
            className="buton" 
            onClick={() => islemYap("İMALAT", false)} 
            disabled={islemDurumu !== null}
            style={{ backgroundColor: "#0f2942", color: "white", fontWeight: "bold", border: "1px solid #0f2942" }}
          >
            {islemDurumu === "İMALAT" ? "İndiriliyor…" : "🛠️ Seçilenlerin İmalatını İndir"}
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