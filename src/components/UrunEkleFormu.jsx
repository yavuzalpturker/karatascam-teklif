import { useState, useEffect } from "react";
import { satirHesapla } from "../utils/hesaplama";
import { supabase } from "../lib/supabaseClient";
import CamKombinasyonSihirbazi from "./CamKombinasyonSihirbazi";

export default function UrunEkleFormu({ 
  urunler = [], 
  yukleniyor, 
  hata, 
  onEkle, 
  islemVerisi, 
  onGuncelle, 
  onIptal,
  sepet1 = [], 
  sepet2 = [], 
  onTopluGuncelle 
}) {
  const [arama, setArama] = useState("");
  const [secilenId, setSecilenId] = useState("");
  const [listeAcik, setListeAcik] = useState(false);
  
  const [pozNo, setPozNo] = useState(""); 
  const [ozelAciklama, setOzelAciklama] = useState("");
  const [urunGorselBase64, setUrunGorselBase64] = useState(null); 

  const [en, setEn] = useState("");
  const [boy, setBoy] = useState("");
  const [miktar, setMiktar] = useState("1"); 
  const [secilenBirim, setSecilenBirim] = useState("m²");

  const [fiyatAna, setFiyatAna] = useState(""); 
  const [fiyatAdet, setFiyatAdet] = useState(""); 

  const [paraBirimi, setParaBirimi] = useState("TRY");
  const [kdvOrani, setKdvOrani] = useState("20");

  const [eklenenOzelUrunler, setEklenenOzelUrunler] = useState([]);

  useEffect(() => {
    if (islemVerisi && islemVerisi.satir && islemVerisi.satir.hamVeri) {
      const ham = islemVerisi.satir.hamVeri;
      setArama(ham.arama || "");
      setSecilenId(ham.secilenId || "");
      setPozNo(ham.pozNo || ""); 
      setOzelAciklama(ham.ozelAciklama || "");
      setUrunGorselBase64(islemVerisi.satir.gorsel || null);
      setEn(ham.en || "");
      setBoy(ham.boy || "");
      setMiktar(ham.miktar || "1");
      setSecilenBirim(ham.secilenBirim || "m²");
      setFiyatAna(ham.fiyatAna || "");
      setFiyatAdet(ham.fiyatAdet || "");
      setParaBirimi(ham.paraBirimi || "TRY");
      setKdvOrani(ham.kdvOrani || "20");
    }
  }, [islemVerisi]);

  const formuSifirla = () => {
    setArama("");
    setSecilenId("");
    setPozNo("");
    setOzelAciklama("");
    setUrunGorselBase64(null);
    setEn("");
    setBoy("");
    setMiktar("1");
    setFiyatAna("");
    setFiyatAdet("");
  };

  const tumUrunler = [...(urunler || []), ...eklenenOzelUrunler];

  const aciklamaBul = (u) => u?.Açıklama || u?.açıklama || u?.aciklama || u?.Aciklama || "İsimsiz Ürün";
  const koduBul = (u) => u?.Kodu || u?.kodu || u?.code || "";

  const filtrelenmisUrunler = tumUrunler.filter((urun) => {
    if (arama.length < 3) return false;
    const aramaMetni = arama.toLocaleLowerCase("tr-TR");
    const tumBilgiler = Object.values(urun).join(" ").toLocaleLowerCase("tr-TR");
    return tumBilgiler.includes(aramaMetni);
  });

  const secilenUrun = secilenId === "ozel_urun" 
    ? { id: "ozel_urun", kodu: "ÖZEL", aciklama: arama.toLocaleUpperCase("tr-TR") }
    : tumUrunler.find((u) => u.id === secilenId);

  const handleAramaDegisimi = (e) => {
    setArama(e.target.value);
    setSecilenId("ozel_urun");
    setListeAcik(true);
  };

  const handleUrunSec = (urun) => {
    setSecilenId(urun.id);
    setArama(`${koduBul(urun)} - ${aciklamaBul(urun)}`);
    setListeAcik(false);
  };

  const handleOzelUrunSec = () => {
    setSecilenId("ozel_urun");
    setListeAcik(false);
  };

  const handleSihirbazdanGelenUrun = (olusturulanIsim) => {
    setArama(olusturulanIsim);
    setSecilenId("ozel_urun");
    setListeAcik(false);
  };

  const handleGorselYukle = (e) => {
    const dosya = e.target.files[0];
    if (dosya) {
      const reader = new FileReader();
      reader.onloadend = () => setUrunGorselBase64(reader.result);
      reader.readAsDataURL(dosya);
    }
  };

  async function urunSil(silinecekUrun, e) {
    e.stopPropagation();
    e.preventDefault();

    const urunAdi = aciklamaBul(silinecekUrun);
    const onay = window.confirm(`"${urunAdi}" ürününü veritabanından kalıcı olarak silmek istediğinize emin misiniz?`);
    if (!onay) return;

    try {
      const { error } = await supabase.from('urunler').delete().eq('id', silinecekUrun.id);
      if (error) {
        console.error("Ürün silinemedi:", error);
        alert("Silme işlemi sırasında hata oluştu: " + error.message);
      } else {
        setArama("");
        setSecilenId("");
        setListeAcik(false);
        alert("Ürün başarıyla silindi!");
      }
    } catch (err) {
      console.error("Supabase bağlantı hatası:", err);
    }
  }

  const getSonUrun = async () => {
    let sonKullanilacakUrun = { ...secilenUrun };
    if (secilenId === "ozel_urun") {
      const arananAciklama = arama.toLocaleUpperCase("tr-TR").trim();
      try {
        const { data: mevcutUrun } = await supabase.from("urunler").select("*").ilike("aciklama", arananAciklama).maybeSingle();
        if (mevcutUrun) {
          sonKullanilacakUrun = mevcutUrun;
        } else {
          const { data, error } = await supabase.from("urunler").insert([{ kodu: "ÖZEL", aciklama: arananAciklama }]).select().single();
          if (!error && data) {
            sonKullanilacakUrun = data;
            setEklenenOzelUrunler((prev) => [...prev, data]); 
          }
        }
      } catch (err) { console.error("Supabase hatası:", err); }
    }
    return sonKullanilacakUrun;
  };

  const satirOlusturHelper = (hedefEn, hedefBoy, hedefMiktar, hedefBirim, hedefPozNo, hedefSecili, secilenSonUrun) => {
    const enDegeri = Number(hedefEn) || 0;
    const boyDegeri = Number(hedefBoy) || 0;
    const miktarDegeri = Number(hedefMiktar) || 1;
    let ekstraAciklama = "";
    let nihaiFiyat = Number(fiyatAna) || Number(fiyatAdet) || 0;
    let nihaiBirim = hedefBirim;
    let hesaplananMiktar = miktarDegeri;

    if (hedefBirim === "m²" || hedefBirim === "ad") {
      let toplamM2 = 0;
      if (enDegeri > 0 && boyDegeri > 0) {
        const tekCamM2 = (enDegeri * boyDegeri) / 1000000;
        toplamM2 = tekCamM2 * miktarDegeri;
        ekstraAciklama = ` (${enDegeri}×${boyDegeri} mm - ${miktarDegeri} Adet - Toplam: ${toplamM2.toFixed(2)} m²)`;
      } else {
        ekstraAciklama = ` (${miktarDegeri} Adet)`;
      }

      if (fiyatAdet && Number(fiyatAdet) > 0) {
        nihaiFiyat = Number(fiyatAdet);
        nihaiBirim = "ad"; 
      } else {
        hesaplananMiktar = toplamM2 > 0 ? toplamM2 : miktarDegeri;
        nihaiFiyat = Number(fiyatAna) || 0;
        nihaiBirim = toplamM2 > 0 ? "m²" : "ad";
      }
    } else if (hedefBirim === "mt") {
      hesaplananMiktar = (boyDegeri / 1000) * miktarDegeri;
      ekstraAciklama = ` (${boyDegeri} mm - ${miktarDegeri} Adet)`;
      nihaiFiyat = Number(fiyatAna) || 0;
      nihaiBirim = "mt";
    } else {
      nihaiFiyat = Number(fiyatAna) || 0;
      nihaiBirim = "ad";
    }

    const duzeltilmisUrun = {
      ...secilenSonUrun,
      "Ana Birim": nihaiBirim.toUpperCase(), 
      aciklama: arama.trim() || aciklamaBul(secilenSonUrun),
      Açıklama: arama.trim() || aciklamaBul(secilenSonUrun)
    };

    const satir = satirHesapla(duzeltilmisUrun, 100, 100, hesaplananMiktar, nihaiFiyat, paraBirimi, Number(kdvOrani), nihaiBirim);
    satir.pozNo = hedefPozNo || "-"; 
    satir.ozelAciklama = ozelAciklama + ekstraAciklama;
    satir.gorsel = urunGorselBase64; 
    satir.miktar = Number(hesaplananMiktar.toFixed(3)); 
    satir.secilenBirim = nihaiBirim;
    satir.birimFiyat = nihaiFiyat;
    satir.birim = nihaiBirim; 
    satir.Birim = nihaiBirim;
    satir.secili = hedefSecili;
    satir.en = enDegeri;
    satir.boy = boyDegeri;
    satir.hamVeri = {
      arama, secilenId, pozNo: hedefPozNo, ozelAciklama, en: hedefEn, boy: hedefBoy, miktar: hedefMiktar, secilenBirim: hedefBirim, fiyatAna, fiyatAdet, paraBirimi, kdvOrani
    };

    return satir;
  };

  async function ekle(e) {
    if (e) e.preventDefault();
    if (!secilenUrun) return;

    const sonUrun = await getSonUrun();
    const anaSatir = satirOlusturHelper(en, boy, miktar, secilenBirim, pozNo, true, sonUrun);

    if (islemVerisi && islemVerisi.tip === "duzenle") {
      if (onGuncelle) onGuncelle(islemVerisi.index, anaSatir);
      if (onIptal) onIptal();
    } else {
      if (onEkle) onEkle(anaSatir);
      if (islemVerisi && islemVerisi.tip === "tekrar" && onIptal) onIptal(); 
    }
    
    formuSifirla();
  }

  async function topluUygula(e) {
    if (e) e.preventDefault();
    if (!secilenUrun) return;
    
    if (!onTopluGuncelle) {
      alert("Lütfen App.jsx dosyasını güncelleyin (onTopluGuncelle eksik).");
      return;
    }

    const sonUrun = await getSonUrun();
    const hedefSepetNo = islemVerisi?.sepetNo || 1;
    const aktifSepet = hedefSepetNo === 1 ? sepet1 : sepet2;

    if (!aktifSepet) return;

    const guncelSepet = aktifSepet.map((item, idx) => {
      if (item.secili !== false || idx === islemVerisi.index) {
        const hEn = item.hamVeri?.en || item.en || "";
        const hBoy = item.hamVeri?.boy || item.boy || "";
        const hMiktar = item.hamVeri?.miktar || "1";
        const hBirim = item.hamVeri?.secilenBirim || item.secilenBirim || "m²";
        const hPozNo = item.pozNo || "";
        
        return satirOlusturHelper(hEn, hBoy, hMiktar, hBirim, hPozNo, item.secili !== false, sonUrun);
      }
      return item;
    });

    onTopluGuncelle(hedefSepetNo, guncelSepet);
    if (onIptal) onIptal();
    formuSifirla();
  }

  if (yukleniyor) {
    return (
      <section className="panel" style={{ backgroundColor: "white", padding: "20px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
        <h2 className="panel__baslik" style={{ fontSize: "17px", fontWeight: "800", color: "#0f2942" }}>Ürün Ekleme Ekranı</h2>
        <p className="bilgi-metni" style={{ fontSize: "14px", color: "#64748b" }}>Ürün listesi yükleniyor, lütfen bekleyin…</p>
      </section>
    );
  }

  if (hata) {
    return (
      <section className="panel" style={{ backgroundColor: "white", padding: "20px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
        <h2 className="panel__baslik" style={{ fontSize: "17px", fontWeight: "800", color: "#0f2942" }}>Ürün Ekleme Ekranı</h2>
        <p className="hata-metni" style={{ fontSize: "14px", color: "#ef4444" }}>Ürünler yüklenemedi: {hata}</p>
      </section>
    );
  }

  return (
    <section className="panel" style={{ backgroundColor: "white", padding: "24px", borderRadius: "10px", border: "1px solid #cbd5e1", marginBottom: "30px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
      
      <CamKombinasyonSihirbazi 
        onKombinasyonSec={handleSihirbazdanGelenUrun} 
        baslangicMetni={islemVerisi ? arama : ""} 
      />

      <h2 className="panel__baslik" style={{ fontSize: "18px", fontWeight: "800", color: "#0f2942", margin: "20px 0 16px 0", borderBottom: "2px solid #e2e8f0", paddingBottom: "10px" }}>
        {islemVerisi?.tip === "duzenle" ? "✏️ Ürünü Düzenle" : "➕ Ürün Ekleme Ekranı"}
      </h2>

      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
          Ürün Ara ve Seç (En az 3 harf giriniz)
        </label>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Ürün adı veya kodu yazın..."
            value={arama}
            onChange={handleAramaDegisimi}
            autoComplete="off"
            style={{ width: "100%", padding: "12px 14px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", fontWeight: "600", outline: "none", backgroundColor: "#f8fafc" }}
          />
          
          {listeAcik && arama.length >= 3 && (
            <ul style={{ 
              position: "absolute", top: "100%", left: 0, right: 0, maxHeight: "250px", 
              overflowY: "auto", backgroundColor: "white", border: "1px solid #cbd5e1", 
              borderRadius: "0 0 6px 6px", zIndex: 1000, padding: 0, margin: 0, listStyle: "none",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)"
            }}>
              {filtrelenmisUrunler.length === 0 ? (
                <li style={{ padding: "12px 14px", color: "#64748b", fontSize: "14px" }}>Veritabanında eşleşen ürün bulunamadı...</li>
              ) : (
                filtrelenmisUrunler.map((urun) => (
                  <li 
                    key={urun.id}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderBottom: "1px solid #f1f5f9", cursor: "pointer", fontSize: "14px" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f0f8ff"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
                  >
                    <div onClick={() => handleUrunSec(urun)} style={{ flex: 1 }} onMouseDown={(e) => e.preventDefault()}>
                      <strong style={{ color: "#0f2942" }}>{koduBul(urun)}</strong> - {aciklamaBul(urun)}
                    </div>
                    <button onClick={(e) => urunSil(urun, e)} onMouseDown={(e) => e.preventDefault()} style={{ background: '#fee2e2', border: 'none', color: '#991b1b', cursor: 'pointer', fontSize: '12px', padding: '6px 10px', borderRadius: '4px', fontWeight: 'bold' }}>
                      ❌ Sil
                    </button>
                  </li>
                ))
              )}

              {secilenId !== "ozel_urun" && (
                <li 
                  onClick={handleOzelUrunSec}
                  style={{ padding: "14px", backgroundColor: "#e0f2fe", borderTop: "2px solid #bae6fd", cursor: "pointer", color: "#0369a1", fontWeight: "800", textAlign: "center", position: "sticky", bottom: 0, fontSize: "14px" }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#bae6fd"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "#e0f2fe"}
                >
                  ➕ "{arama}" Özel Ürün Olarak Seç
                </li>
              )}
            </ul>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap", marginBottom: "16px" }}>
        <div style={{ flex: "0 0 130px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>Poz No</label>
          <input
            type="text"
            placeholder="Örn: P1"
            value={pozNo}
            onChange={(e) => setPozNo(e.target.value)}
            style={{ width: "100%", padding: "11px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", fontWeight: "700", backgroundColor: "white" }}
          />
        </div>

        <div style={{ flex: 3, minWidth: "220px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>Ürün Açıklaması / Detay (PDF Sütununa Yazılır)</label>
          <input
            type="text"
            placeholder="Örn: Rodajlı, Bizoteli veya Özel İmalat..."
            value={ozelAciklama}
            onChange={(e) => setOzelAciklama(e.target.value)}
            style={{ width: "100%", padding: "11px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", backgroundColor: "white" }}
          />
        </div>

        <div style={{ flex: 1.5, minWidth: "160px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#0f2942", marginBottom: "6px" }}>🖼️ Ürün Görseli Ekle</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleGorselYukle}
            style={{ fontSize: "12px", padding: "8px", width: "100%", border: "1px solid #cbd5e1", borderRadius: "6px", backgroundColor: "#f8fafc" }}
          />
        </div>
      </div>

      {urunGorselBase64 && (
        <div style={{ marginTop: "10px", marginBottom: "16px", padding: "12px", backgroundColor: "#f1f5f9", borderRadius: "6px", display: "flex", alignItems: "center", gap: "12px", border: "1px solid #cbd5e1" }}>
          <img src={urunGorselBase64} alt="Önizleme" style={{ height: "65px", width: "auto", borderRadius: "4px", border: "1px solid #cbd5e1" }} />
          <span style={{ fontSize: "13px", color: "#166534", fontWeight: "bold" }}>✓ PDF'e Eklenecek Görsel Seçildi</span>
          <button 
            type="button" 
            onClick={() => setUrunGorselBase64(null)} 
            style={{ marginLeft: "auto", backgroundColor: "#ef4444", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
          >
            Görseli Kaldır
          </button>
        </div>
      )}

      {/* ÜST SATIR: BİRİM, EN, BOY (ADET VE KDV AŞAĞI ALINDI VE BÜYÜTÜLDÜ) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px", marginBottom: "16px" }}>
        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>Birim Seçimi</label>
          <select value={secilenBirim} onChange={(e) => setSecilenBirim(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", fontWeight: "700", backgroundColor: "white" }}>
            <option value="m²">Metrekare (m²)</option>
            <option value="ad">Adet (ad)</option>
            <option value="mt">Metretül (mt)</option>
          </select>
        </div>

        {(secilenBirim === "m²" || secilenBirim === "ad") ? (
          <>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>En (mm)</label>
              <input type="number" min="0" placeholder="Örn: 1500" value={en} onChange={(e) => setEn(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", fontWeight: "600", backgroundColor: "white" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>Boy (mm)</label>
              <input type="number" min="0" placeholder="Örn: 2000" value={boy} onChange={(e) => setBoy(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", fontWeight: "600", backgroundColor: "white" }} />
            </div>
          </>
        ) : secilenBirim === "mt" ? (
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>Uzunluk / Boy (mm)</label>
            <input type="number" min="0" placeholder="Örn: 2000" value={boy} onChange={(e) => setBoy(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", fontWeight: "600", backgroundColor: "white" }} />
          </div>
        ) : null}
      </div>

      {/* ALT SATIR: ADET, KDV ORANI VE FİYATLANDIRMA (BÜYÜK VE BELİRGİN) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr 110px", gap: "14px", marginBottom: "20px", alignItems: "flex-end" }}>
        
        {/* BÜYÜTÜLMÜŞ ADET */}
        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "800", color: "#0f2942", marginBottom: "6px" }}>Adet</label>
          <input type="number" min="1" step="1" value={miktar} onChange={(e) => setMiktar(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "15px", fontWeight: "700", backgroundColor: "white" }} />
        </div>

        {/* BÜYÜTÜLMÜŞ KDV */}
        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "800", color: "#0f2942", marginBottom: "6px" }}>KDV Oranı (%)</label>
          <select value={kdvOrani} onChange={(e) => setKdvOrani(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "15px", fontWeight: "700", backgroundColor: "white" }}>
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="10">10</option>
            <option value="20">20</option>
          </select>
        </div>

        {/* FİYAT */}
        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "800", color: "#0f2942", marginBottom: "6px" }}>Fiyatlandırma</label>
          <div style={{ display: "flex", gap: "8px" }}>
            {((secilenBirim !== "m²" && secilenBirim !== "ad") || fiyatAdet === "") && (
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder={(secilenBirim === "m²" || secilenBirim === "ad") ? "Ana Cam m² Fiyatı" : "Fiyat"}
                value={fiyatAna}
                onChange={(e) => {
                  setFiyatAna(e.target.value);
                  if (secilenBirim === "m²" || secilenBirim === "ad") setFiyatAdet(""); 
                }}
                style={{ flex: 1, padding: "12px 14px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "15px", fontWeight: "600", backgroundColor: "white" }}
              />
            )}

            {(secilenBirim === "m²" || secilenBirim === "ad") && fiyatAna === "" && (
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Adet Fiyatı"
                value={fiyatAdet}
                onChange={(e) => {
                  setFiyatAdet(e.target.value);
                  setFiyatAna(""); 
                }}
                style={{ flex: 1, padding: "12px 14px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "15px", fontWeight: "600", backgroundColor: "white" }}
              />
            )}
          </div>
        </div>

        {/* PARA BİRİMİ */}
        <div>
          <select value={paraBirimi} onChange={(e) => setParaBirimi(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "15px", fontWeight: "800", backgroundColor: "white" }}>
            <option value="TRY">TL (₺)</option>
            <option value="USD">Dolar ($)</option>
            <option value="EUR">Euro (€)</option>
          </select>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        {islemVerisi && (
          <button 
            type="button" 
            onClick={() => { formuSifirla(); onIptal(); }}
            style={{ backgroundColor: "#64748b", color: "white", border: "none", padding: "12px 20px", borderRadius: "6px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}
          >
            İptal
          </button>
        )}

        {islemVerisi?.tip === "duzenle" && (
          <button 
            type="button"
            onClick={topluUygula}
            style={{ backgroundColor: "#8b5cf6", color: "white", border: "none", padding: "12px 20px", borderRadius: "6px", fontSize: "14px", fontWeight: "800", cursor: "pointer", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
          >
            ✨ Seçili Ürünlere de Uygula
          </button>
        )}

        <button 
          type="button"
          onClick={ekle} 
          disabled={!arama.trim()}
          style={{ backgroundColor: islemVerisi?.tip === "duzenle" ? "#10b981" : "#0f2942", color: "white", border: "none", padding: "12px 26px", borderRadius: "6px", fontSize: "14px", fontWeight: "800", cursor: arama.trim() ? "pointer" : "not-allowed", opacity: arama.trim() ? 1 : 0.6, boxShadow: "0 4px 6px rgba(0,0,0,0.15)" }}
        >
          {islemVerisi?.tip === "duzenle" ? "💾 Sadece Bu Ürünü Kaydet" : "📥 Sepete Ekle"}
        </button>
      </div>
    </section>
  );
}