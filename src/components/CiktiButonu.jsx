import React, { useState } from 'react';
import { supabase } from "../lib/supabaseClient";
import { teklifPdfIndir, proformaPdfIndir } from "../utils/pdfOlustur";
import { imalatPdfIndir } from "../utils/pdfImalatOlustur";

export default function CiktiButonu({ teklif, sepet, sepet2 = [], kullaniciRolu }) {
  const [islemDurumu, setIslemDurumu] = useState(null);
  
  const [imalatSayaci, setImalatSayaci] = useState(1);
  const [sonSiparisNo, setSonSiparisNo] = useState("");
  const [sonSeciliUrunler, setSonSeciliUrunler] = useState("");

  if (sepet.length === 0 && sepet2.length === 0) return null;

  const getAkilliImalatTeklifi = (seciliSepet1, seciliSepet2, tumuSeciliMi) => {
    const islemTeklifi = { ...teklif };
    if (!islemTeklifi.siparisNo) return islemTeklifi; 

    if (tumuSeciliMi) {
      return islemTeklifi;
    }

    const seciliVeri = JSON.stringify([...seciliSepet1, ...seciliSepet2]);
    let guncelSayac = imalatSayaci;

    if (islemTeklifi.siparisNo !== sonSiparisNo) {
      guncelSayac = 1;
      setSonSiparisNo(islemTeklifi.siparisNo);
      setSonSeciliUrunler(seciliVeri);
      setImalatSayaci(1);
    } 
    else if (seciliVeri !== sonSeciliUrunler) {
      guncelSayac = imalatSayaci + 1;
      setSonSeciliUrunler(seciliVeri);
      setImalatSayaci(guncelSayac);
    }

    islemTeklifi.siparisNo = `${islemTeklifi.siparisNo}-${guncelSayac}`;
    return islemTeklifi;
  };

  const supabaseKaydet = async (tur, aktifTeklif, imalatSepet1 = sepet, imalatSepet2 = sepet2, onayDurumu = "onaylandi") => {
    let sayac = parseInt(localStorage.getItem("proforma_sayac") || "1", 10);
    const yil = new Date().getFullYear();
    const belgeNo = `${yil}/${sayac.toString().padStart(3, "0")}`;

    // Oturumdan ad soyad bilgisini güvenli bir şekilde çekiyoruz
    let hazirlayanKisi = sessionStorage.getItem("karatas_personel_adi");
    if (!hazirlayanKisi) {
      try {
        const oturumVerisi = JSON.parse(sessionStorage.getItem("karatas_oturum"));
        if (oturumVerisi && oturumVerisi.kullanici) {
          hazirlayanKisi = oturumVerisi.kullanici;
        }
      } catch (e) {
        hazirlayanKisi = null;
      }
    }
    if (!hazirlayanKisi) {
      hazirlayanKisi = kullaniciRolu === 'admin' ? 'Yönetici' : 'Personel';
    }

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
      sepet2: imalatSepet2,
      onay_durumu: onayDurumu,
      hazirlayan: hazirlayanKisi // <-- Girdiğin Ad Soyad arşive yazılıyor
    };

    const { error } = await supabase.from("teklifler").insert([yeniKayit]);
    
    if (error) {
      console.error("Supabase Kayıt Hatası:", error);
      alert("Arşive kaydedilirken bir hata oluştu.");
      return null;
    }

    localStorage.setItem("proforma_sayac", sayac + 1);
    window.dispatchEvent(new Event("arsivGuncellendi"));
    
    if (onayDurumu === "bekliyor") {
      alert("✅ Sepet başarıyla yönetici onayına sunuldu!");
    } else {
      alert("Başarıyla arşive kaydedildi!");
    }
    return belgeNo;
  };

  async function sadeceKaydet(tur) {
    setIslemDurumu(tur + "_KAYDET");
    try {
      if (tur === "İMALAT") {
        const seciliSepet1 = sepet.filter(item => item.secili !== false);
        const seciliSepet2 = sepet2.filter(item => item.secili !== false);
        const tumuSeciliMi = (seciliSepet1.length === sepet.length) && (seciliSepet2.length === sepet2.length);

        if (seciliSepet1.length === 0 && seciliSepet2.length === 0) {
          alert("Lütfen imalat listesine kaydetmek için en az 1 ürün seçin (checkbox)!");
          return;
        }
        
        const islemTeklifi = getAkilliImalatTeklifi(seciliSepet1, seciliSepet2, tumuSeciliMi);
        await supabaseKaydet(tur, islemTeklifi, seciliSepet1, seciliSepet2, "onaylandi");
      } else {
        await supabaseKaydet(tur, teklif, sepet, sepet2, "onaylandi");
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

  async function personelOnayGonder() {
    setIslemDurumu("ONAY_GONDER");
    try {
      const seciliSepet1 = sepet.filter(item => item.secili !== false);
      const seciliSepet2 = sepet2.filter(item => item.secili !== false);
      const tumuSeciliMi = (seciliSepet1.length === sepet.length) && (seciliSepet2.length === sepet2.length);

      const islemTeklifi = getAkilliImalatTeklifi(seciliSepet1, seciliSepet2, tumuSeciliMi);
      await supabaseKaydet("TEKLİF", islemTeklifi, seciliSepet1, seciliSepet2, "bekliyor");
    } finally {
      setIslemDurumu(null);
    }
  }

  const belgeOnaylanmisMi = teklif.onayDurumu === 'onaylandi';
  const tamYetki = kullaniciRolu === 'admin' || belgeOnaylanmisMi;

  return (
    <section className="panel">
      <h2 className="panel__baslik">Çıktı Yönetimi</h2>
      
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "flex-start", justifyContent: tamYetki ? 'flex-start' : 'center' }}>
        
        {tamYetki ? (
          <>
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
          </>
        ) : (
          <div style={{ width: '100%', maxWidth: '550px', textAlign: 'center' }}>
            <button 
              className="buton" 
              onClick={personelOnayGonder} 
              disabled={islemDurumu !== null}
              style={{ width: '100%', padding: '16px', backgroundColor: '#0f2942', color: 'white', fontWeight: 'bold', fontSize: '15px', border: '1px solid #0f2942', borderRadius: '6px', cursor: 'pointer' }}
            >
              {islemDurumu === "ONAY_GONDER" ? "Yöneticiye İletiliyor..." : "📋 Sepeti Yöneticinin Onayına Gönder"}
            </button>
            <p style={{ marginTop: '12px', color: '#64748b', fontSize: '13.5px', fontWeight: '500' }}>
              Yönetici onayladıktan sonra, bu sepeti <b>Geçmiş Teklifler</b> bölümünden açarak tüm indirme butonlarına erişebilirsiniz.
            </p>
          </div>
        )}

      </div>
    </section>
  );
}