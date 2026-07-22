import { useState, useEffect } from "react";
import { satirHesapla } from "../utils/hesaplama";
import { supabase } from "../lib/supabaseClient";
import CamKombinasyonSihirbazi from "./CamKombinasyonSihirbazi";

export default function UrunEkleFormu({ urunler = [], yukleniyor, hata, onEkle, islemVerisi, onGuncelle, onIptal }) {
  const [arama, setArama] = useState("");
  const [secilenId, setSecilenId] = useState("");
  const [listeAcik, setListeAcik] = useState(false);
  
  const [ozelAciklama, setOzelAciklama] = useState("");
  const [urunGorselBase64, setUrunGorselBase64] = useState(null); // GÖRSEL BASE64 STATE'İ

  const [en, setEn] = useState("");
  const [boy, setBoy] = useState("");
  const [miktar, setMiktar] = useState("1"); 
  const [secilenBirim, setSecilenBirim] = useState("m²");

  const [fiyatAna, setFiyatAna] = useState(""); 
  const [fiyatAdet, setFiyatAdet] = useState(""); 

  // --- DİNAMİK EKSTRA İŞLEM BEDELLERİ ---
  const [ekstraIslemler, setEkstraIslemler] = useState({
    kenarBedeli: "",  // Rodaj, Bizote, Pah Bedeli
    temperBedeli: "", // Temper Bedeli
    delikBedeli: "",  // Delik Bedeli
    oyguBedeli: "",   // Oygu Bedeli
    bondingBedeli: "" // Bonding / Strüktürel Bedeli
  });

  const [paraBirimi, setParaBirimi] = useState("TRY");
  const [kdvOrani, setKdvOrani] = useState("20");

  const [eklenenOzelUrunler, setEklenenOzelUrunler] = useState([]);

  useEffect(() => {
    if (islemVerisi && islemVerisi.satir && islemVerisi.satir.hamVeri) {
      const ham = islemVerisi.satir.hamVeri;
      setArama(ham.arama || "");
      setSecilenId(ham.secilenId || "");
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
      if (ham.ekstraIslemler) {
        setEkstraIslemler(ham.ekstraIslemler);
      }
    }
  }, [islemVerisi]);

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
    setSecilenId("");
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

  // GÖRSEL SEÇİLDİĞİNDE BASE64'E ÇEVİREN FONKSİYON
  const handleGorselYukle = (e) => {
    const dosya = e.target.files[0];
    if (dosya) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUrunGorselBase64(reader.result);
      };
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
      const { error } = await supabase
        .from('urunler')
        .delete()
        .eq('id', silinecekUrun.id);

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

  // --- HANGİ EKSTRA FİYAT İNPUTLARININ GÖRÜNECEĞİNİ TESPİT ETME ---
  const aramaUpper = arama.toLocaleUpperCase("tr-TR");
  const varKenar = aramaUpper.includes("RODAJ") || aramaUpper.includes("BİZOTE") || aramaUpper.includes("PAH");
  const varTemper = aramaUpper.includes("TEMPER");
  const varDelik = aramaUpper.includes("DELİK");
  const varOygu = aramaUpper.includes("OYGU");
  const varBonding = aramaUpper.includes("ISICAM") || aramaUpper.includes("WARM EDGE") || aramaUpper.includes("BONDİNG") || aramaUpper.includes("SILIKON");

  async function ekle() {
    if (!secilenUrun) return;

    let hesaplananMiktar = Number(miktar) || 1;
    let ekstraAciklama = "";
    let nihaiFiyat = Number(fiyatAna) || Number(fiyatAdet) || 0;
    let nihaiBirim = secilenBirim;

    if (secilenBirim === "m²" || secilenBirim === "ad") {
      const enDegeri = Number(en) || 0;
      const boyDegeri = Number(boy) || 0;
      let toplamM2 = 0;
      
      if (enDegeri > 0 && boyDegeri > 0) {
        const tekCamM2 = (enDegeri * boyDegeri) / 1000000;
        toplamM2 = tekCamM2 * (Number(miktar) || 1);
        ekstraAciklama = ` (${enDegeri}×${boyDegeri} mm - ${Number(miktar) || 1} Adet - Toplam: ${toplamM2.toFixed(2)} m²)`;
      } else {
        ekstraAciklama = ` (${Number(miktar) || 1} Adet)`;
      }

      if (fiyatAdet && Number(fiyatAdet) > 0) {
        hesaplananMiktar = Number(miktar) || 1; 
        nihaiFiyat = Number(fiyatAdet);
        nihaiBirim = "ad"; 
      } else {
        hesaplananMiktar = toplamM2 > 0 ? toplamM2 : (Number(miktar) || 1);
        nihaiFiyat = Number(fiyatAna) || 0;
        nihaiBirim = toplamM2 > 0 ? "m²" : "ad";
      }

    } 
    else if (secilenBirim === "mt") {
      const boyDegeri = Number(boy) || 0;
      hesaplananMiktar = (boyDegeri / 1000) * (Number(miktar) || 1);
      ekstraAciklama = ` (${boyDegeri} mm - ${Number(miktar) || 1} Adet)`;
      nihaiFiyat = Number(fiyatAna) || 0;
      nihaiBirim = "mt";
    } 
    else {
      hesaplananMiktar = Number(miktar) || 1;
      nihaiFiyat = Number(fiyatAna) || 0;
      nihaiBirim = "ad";
    }

    let sonKullanilacakUrun = { ...secilenUrun };

    if (secilenId === "ozel_urun") {
      const arananAciklama = arama.toLocaleUpperCase("tr-TR").trim();

      try {
        const { data: mevcutUrun } = await supabase
          .from("urunler")
          .select("*")
          .ilike("aciklama", arananAciklama)
          .maybeSingle();

        if (mevcutUrun) {
          sonKullanilacakUrun = mevcutUrun;
        } else {
          const yeniVeritabaniUrunu = {
            kodu: "ÖZEL",
            aciklama: arananAciklama
          };

          const { data, error } = await supabase
            .from("urunler")
            .insert([yeniVeritabaniUrunu])
            .select()
            .single();

          if (!error && data) {
            sonKullanilacakUrun = data;
            setEklenenOzelUrunler((prev) => [...prev, data]); 
          }
        }
      } catch (err) {
        console.error("Supabase bağlantı hatası:", err);
      }
    }

    const duzeltilmisUrun = {
      ...sonKullanilacakUrun,
      "Ana Birim": nihaiBirim.toUpperCase(), 
      aciklama: aciklamaBul(sonKullanilacakUrun),
      Açıklama: aciklamaBul(sonKullanilacakUrun)
    };

    // 1. ANA CAM SATIRINI HESAPLA VE EKLE
    const anaSatir = satirHesapla(duzeltilmisUrun, 100, 100, hesaplananMiktar, nihaiFiyat, paraBirimi, Number(kdvOrani), nihaiBirim);
    anaSatir.ozelAciklama = ozelAciklama + ekstraAciklama;
    anaSatir.gorsel = urunGorselBase64; // GÖRSEL BİLGİSİ SATIRA EKLENDİ
    anaSatir.miktar = Number(hesaplananMiktar.toFixed(3)); 
    anaSatir.secilenBirim = nihaiBirim;
    anaSatir.birimFiyat = nihaiFiyat;
    anaSatir.birim = nihaiBirim; 
    anaSatir.Birim = nihaiBirim;
    anaSatir.hamVeri = {
      arama, secilenId, ozelAciklama, en, boy, miktar, secilenBirim, fiyatAna, fiyatAdet, paraBirimi, kdvOrani, ekstraIslemler
    };

    if (islemVerisi && islemVerisi.tip === "duzenle") {
      if (onGuncelle) onGuncelle(islemVerisi.index, anaSatir);
      if (onIptal) onIptal();
    } else {
      if (onEkle) onEkle(anaSatir);

      // 2. EKSTRA İŞLEM BEDELLERİNİ AYRI BİRER KALEM OLARAK SEPETE EKLEME
      const ekstraKalemler = [
        { isim: "RODAJ / BİZOTE / PAH İŞLEM BEDELİ", bedel: Number(ekstraIslemler.kenarBedeli) },
        { isim: "TEMPER İŞLEM BEDELİ", bedel: Number(ekstraIslemler.temperBedeli) },
        { isim: "DELİK İŞLEM BEDELİ", bedel: Number(ekstraIslemler.delikBedeli) },
        { isim: "OYGU İŞLEM BEDELİ", bedel: Number(ekstraIslemler.oyguBedeli) },
        { isim: "BONDİNG / STRÜKTÜREL SİLİKON UYGULAMA BEDELİ", bedel: Number(ekstraIslemler.bondingBedeli) }
      ];

      ekstraKalemler.forEach((item) => {
        if (item.bedel && item.bedel > 0) {
          const ekstraUrunObj = {
            id: "ekstra_islem",
            kodu: "HİZMET",
            aciklama: item.isim,
            Açıklama: item.isim,
            "Ana Birim": "AD"
          };

          const ekstraSatir = satirHesapla(ekstraUrunObj, 100, 100, Number(miktar) || 1, item.bedel, paraBirimi, Number(kdvOrani), "ad");
          ekstraSatir.ozelAciklama = `(${aciklamaBul(sonKullanilacakUrun)} İçin Hizmet Bedeli)`;
          ekstraSatir.miktar = Number(miktar) || 1;
          ekstraSatir.secilenBirim = "ad";
          ekstraSatir.birimFiyat = item.bedel;
          ekstraSatir.birim = "ad";
          ekstraSatir.Birim = "ad";

          if (onEkle) onEkle(ekstraSatir);
        }
      });

      if (islemVerisi && islemVerisi.tip === "tekrar" && onIptal) onIptal(); 
    }
    
    // Formu Sıfırlama
    setFiyatAna("");
    setFiyatAdet("");
    setArama("");
    setSecilenId("");
    setOzelAciklama(""); 
    setUrunGorselBase64(null);
    setEn("");
    setBoy("");
    setMiktar("1"); 
    setEkstraIslemler({ kenarBedeli: "", temperBedeli: "", delikBedeli: "", oyguBedeli: "", bondingBedeli: "" });
  }

  if (yukleniyor) {
    return (
      <section className="panel">
        <h2 className="panel__baslik">Ürün Ekleme Ekranı</h2>
        <p className="bilgi-metni">Ürün listesi yükleniyor, lütfen bekleyin…</p>
      </section>
    );
  }

  if (hata) {
    return (
      <section className="panel">
        <h2 className="panel__baslik">Ürün Ekleme Ekranı</h2>
        <p className="hata-metni">Ürünler yüklenemedi: {hata}</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <CamKombinasyonSihirbazi onKombinasyonSec={handleSihirbazdanGelenUrun} />

      <h2 className="panel__baslik">
        {islemVerisi?.tip === "duzenle" ? "✏️ Ürünü Düzenle" : "Ürün Ekleme Ekranı"}
      </h2>

      <label className="alan">
        <span>Ürün Ara ve Seç (En az 3 harf giriniz)</span>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Ürün adı veya kodu yazın..."
            value={arama}
            onChange={handleAramaDegisimi}
            autoComplete="off"
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
          
          {listeAcik && arama.length >= 3 && (
            <ul style={{ 
              position: "absolute", top: "100%", left: 0, right: 0, maxHeight: "250px", 
              overflowY: "auto", backgroundColor: "white", border: "1px solid #ccc", 
              borderRadius: "0 0 6px 6px", zIndex: 1000, padding: 0, margin: 0, listStyle: "none",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
            }}>
              {filtrelenmisUrunler.length === 0 ? (
                <li style={{ padding: "10px", color: "#666" }}>Veritabanında eşleşen ürün bulunamadı...</li>
              ) : (
                filtrelenmisUrunler.map((urun) => (
                  <li 
                    key={urun.id}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", borderBottom: "1px solid #eee", cursor: "pointer", fontSize: "14px" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f0f8ff"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
                  >
                    <div onClick={() => handleUrunSec(urun)} style={{ flex: 1 }} onMouseDown={(e) => e.preventDefault()}>
                      <strong>{koduBul(urun)}</strong> - {aciklamaBul(urun)}
                    </div>
                    <button onClick={(e) => urunSil(urun, e)} onMouseDown={(e) => e.preventDefault()} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                      ❌ Sil
                    </button>
                  </li>
                ))
              )}

              {secilenId !== "ozel_urun" && (
                <li 
                  onClick={handleOzelUrunSec}
                  style={{ padding: "12px 10px", backgroundColor: "#e6fcff", borderTop: "2px solid #b3e6ff", cursor: "pointer", color: "#007099", fontWeight: "bold", textAlign: "center", position: "sticky", bottom: 0 }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#cceeff"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "#e6fcff"}
                >
                  ➕ "{arama}" Özel Ürün Olarak Seç
                </li>
              )}
            </ul>
          )}
        </div>
      </label>

      {/* ÖZEL AÇIKLAMA VE GÖRSEL YÜKLEME ALANI */}
      <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
        <label className="alan" style={{ flex: 3 }}>
          <span>Ürün Açıklaması / Detay (PDF'teki Açıklama Sütununa Yazılır)</span>
          <input
            type="text"
            placeholder="Örn: Rodajlı, Bizoteli veya Özel İmalat..."
            value={ozelAciklama}
            onChange={(e) => setOzelAciklama(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
        </label>

        {/* GÖRSEL YÜKLEME INPUTI */}
        <label className="alan" style={{ flex: 1 }}>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#0f2942" }}>🖼️ Ürün Görseli Ekle</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleGorselYukle}
            style={{ fontSize: "11px", padding: "6px" }}
          />
        </label>
      </div>

      {/* YÜKLENEN GÖRSEL ÖNİZLEME */}
      {urunGorselBase64 && (
        <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#f1f5f9", borderRadius: "6px", display: "flex", alignItems: "center", gap: "10px" }}>
          <img src={urunGorselBase64} alt="Önizleme" style={{ height: "60px", width: "auto", borderRadius: "4px", border: "1px solid #cbd5e1" }} />
          <span style={{ fontSize: "12px", color: "#166534", fontWeight: "bold" }}>✓ PDF'e Eklenecek Görsel Seçildi</span>
          <button 
            type="button" 
            onClick={() => setUrunGorselBase64(null)} 
            style={{ marginLeft: "auto", backgroundColor: "#ef4444", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", cursor: "pointer" }}
          >
            Görseli Kaldır
          </button>
        </div>
      )}

      <div className="olcu-grid" style={{ marginTop: "10px" }}>
        <label className="alan">
          <span>Birim Seçimi</span>
          <select value={secilenBirim} onChange={(e) => setSecilenBirim(e.target.value)}>
            <option value="m²">Metrekare (m²)</option>
            <option value="ad">Adet (ad)</option>
            <option value="mt">Metretül (mt)</option>
          </select>
        </label>

        {(secilenBirim === "m²" || secilenBirim === "ad") ? (
          <>
            <label className="alan">
              <span>En (mm)</span>
              <input type="number" min="0" placeholder="Örn: 1500" value={en} onChange={(e) => setEn(e.target.value)} />
            </label>
            <label className="alan">
              <span>Boy (mm)</span>
              <input type="number" min="0" placeholder="Örn: 2000" value={boy} onChange={(e) => setBoy(e.target.value)} />
            </label>
            <label className="alan">
              <span>Adet</span>
              <input type="number" min="1" step="1" value={miktar} onChange={(e) => setMiktar(e.target.value)} />
            </label>
          </>
        ) : secilenBirim === "mt" ? (
          <>
            <label className="alan">
              <span>Uzunluk / Boy (mm)</span>
              <input type="number" min="0" placeholder="Örn: 2000" value={boy} onChange={(e) => setBoy(e.target.value)} />
            </label>
            <label className="alan">
              <span>Adet</span>
              <input type="number" min="1" step="1" value={miktar} onChange={(e) => setMiktar(e.target.value)} />
            </label>
          </>
        ) : (
          <label className="alan">
            <span>Miktar</span>
            <input type="number" min="0.01" step="0.01" value={miktar} onChange={(e) => setMiktar(e.target.value)} />
          </label>
        )}
        
        <label className="alan">
          <span>KDV Oranı (%)</span>
          <select value={kdvOrani} onChange={(e) => setKdvOrani(e.target.value)}>
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="10">10</option>
            <option value="20">20</option>
          </select>
        </label>
      </div>

      {/* FIYATLANDIRMA ALANI */}
      <label className="alan">
        <span>Fiyatlandırma</span>
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
              style={{ flex: 1 }}
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
              style={{ flex: 1 }}
            />
          )}

          <select value={paraBirimi} onChange={(e) => setParaBirimi(e.target.value)} style={{ flex: "0 0 90px" }}>
            <option value="TRY">TL (₺)</option>
            <option value="USD">Dolar ($)</option>
            <option value="EUR">Euro (€)</option>
          </select>
        </div>
      </label>

      {/* DİNAMİK EKSTRA İŞLEM BEDELLERİ */}
      {(varKenar || varTemper || varDelik || varOygu || varBonding) && (
        <div style={{ backgroundColor: "#f8fafc", padding: "12px", borderRadius: "6px", border: "1px solid #cbd5e1", marginBottom: "15px" }}>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#0f2942", display: "block", marginBottom: "8px" }}>
            Ekstra İşlem Bedelleri
          </span>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "8px" }}>
            {varKenar && (
              <div>
                <label style={{ fontSize: "11px", fontWeight: "600", color: "#475569" }}>Rodaj / Pah / Bizote Bedeli</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={ekstraIslemler.kenarBedeli}
                  onChange={(e) => setEkstraIslemler({ ...ekstraIslemler, kenarBedeli: e.target.value })}
                  style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                />
              </div>
            )}

            {varTemper && (
              <div>
                <label style={{ fontSize: "11px", fontWeight: "600", color: "#475569" }}>Temper Bedeli</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={ekstraIslemler.temperBedeli}
                  onChange={(e) => setEkstraIslemler({ ...ekstraIslemler, temperBedeli: e.target.value })}
                  style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                />
              </div>
            )}

            {varDelik && (
              <div>
                <label style={{ fontSize: "11px", fontWeight: "600", color: "#475569" }}>Delik Bedeli</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={ekstraIslemler.delikBedeli}
                  onChange={(e) => setEkstraIslemler({ ...ekstraIslemler, delikBedeli: e.target.value })}
                  style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                />
              </div>
            )}

            {varOygu && (
              <div>
                <label style={{ fontSize: "11px", fontWeight: "600", color: "#475569" }}>Oygu Bedeli</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={ekstraIslemler.oyguBedeli}
                  onChange={(e) => setEkstraIslemler({ ...ekstraIslemler, oyguBedeli: e.target.value })}
                  style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                />
              </div>
            )}

            {varBonding && (
              <div>
                <label style={{ fontSize: "11px", fontWeight: "600", color: "#475569" }}>Bonding / Silikon Bedeli</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={ekstraIslemler.bondingBedeli}
                  onChange={(e) => setEkstraIslemler({ ...ekstraIslemler, bondingBedeli: e.target.value })}
                  style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
        <button 
          className="buton buton--birincil" 
          onClick={ekle} 
          disabled={!secilenUrun}
          style={{ flex: 1, backgroundColor: islemVerisi?.tip === "duzenle" ? "#10b981" : "#0f2942" }}
        >
          {islemVerisi?.tip === "duzenle" ? "Değişikliği Kaydet" : "Listeye Ekle"}
        </button>

        {islemVerisi && (
          <button 
            className="buton buton--ikincil" 
            onClick={onIptal} 
            style={{ backgroundColor: "#6b7280", color: "white" }}
          >
            İptal
          </button>
        )}
      </div>
    </section>
  );
}