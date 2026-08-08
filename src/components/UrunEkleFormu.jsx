import { useState, useEffect } from "react";
import { satirHesapla, paraFormatla } from "../utils/hesaplama";
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
  onTopluGuncelle,
  aktifSecenekNo, 
  seciliSepet     
}) {
  const [arama, setArama] = useState("");
  const [secilenId, setSecilenId] = useState("");
  const [listeAcik, setListeAcik] = useState(false);
  
  const [pozNo, setPozNo] = useState(""); 
  const [ozelAciklama, setOzelAciklama] = useState("");
  const [urunGorselBase64, setUrunGorselBase64] = useState(null); 

  const [en, setEn] = useState("");
  const [boy, setBoy] = useState("");
  const [manuelM2, setManuelM2] = useState("");
  const [miktar, setMiktar] = useState("1"); 
  const [secilenBirim, setSecilenBirim] = useState("m²");

  const [fiyatAna, setFiyatAna] = useState(""); 
  const [fiyatAdet, setFiyatAdet] = useState(""); 

  const [iscilikTuru, setIscilikTuru] = useState(""); 
  const [iscilikMetretul, setIscilikMetretul] = useState(""); 
  const [iscilikBirimFiyat, setIscilikBirimFiyat] = useState(""); 
  const [karolajEnAdet, setKarolajEnAdet] = useState("");
  const [karolajBoyAdet, setKarolajBoyAdet] = useState("");

  const [sivamaIcEn, setSivamaIcEn] = useState("");
  const [sivamaIcBoy, setSivamaIcBoy] = useState("");
  const [sivamaDisEn, setSivamaDisEn] = useState("");
  const [sivamaDisBoy, setSivamaDisBoy] = useState("");

  const [paraBirimi, setParaBirimi] = useState("TRY");
  const [kdvOrani, setKdvOrani] = useState("20");
  const [ihracatMi, setIhracatMi] = useState(false);

  const [eklenenOzelUrunler, setEklenenOzelUrunler] = useState([]);
  const [sihirbazVerisi, setSihirbazVerisi] = useState(null);

  const gercekAktifSepet = aktifSecenekNo || seciliSepet || 1;
  const hedefSepetNo = (islemVerisi?.tip === "duzenle" && islemVerisi?.sepetNo) ? islemVerisi.sepetNo : Number(gercekAktifSepet) || 1;
  const aktifSepetDizisi = hedefSepetNo === 1 ? sepet1 : sepet2;

  const isIscilikFunc = (oge) => {
    if (!oge) return false;
    if (oge.id && String(oge.id).startsWith("iscilik_")) return true;
    const ad = String(oge.urunAciklamasi || oge.Açıklama || oge.aciklama || "").toUpperCase();
    if (ad.includes("BEDELİ") || ad.includes("İŞÇİLİK") || ad.includes("BONDİNG") || ad.includes("KAROLAJ") || ad.includes("SIVAMA")) return true;
    return false;
  };

  const handleIhracatToggle = (checked) => {
    setIhracatMi(checked);
    const yeniKdv = checked ? "0" : "20";
    setKdvOrani(yeniKdv);

    if (onTopluGuncelle) {
      if (sepet1 && sepet1.length > 0) {
        const yeniSepet1 = sepet1.map(item => ({
          ...item,
          kdvOrani: Number(yeniKdv),
          hamVeri: { ...(item.hamVeri || {}), kdvOrani: Number(yeniKdv) }
        }));
        onTopluGuncelle(1, yeniSepet1);
      }
      if (sepet2 && sepet2.length > 0) {
        const yeniSepet2 = sepet2.map(item => ({
          ...item,
          kdvOrani: Number(yeniKdv),
          hamVeri: { ...(item.hamVeri || {}), kdvOrani: Number(yeniKdv) }
        }));
        onTopluGuncelle(2, yeniSepet2);
      }
    }
  };

  // --- HAFIZALI AKILLI YAPIŞTIRMA VE BAŞLIKTAN CAM ADI ALGILAYICI ---
  const handleTopluMetinIsle = (hamMetin) => {
    if (!hamMetin.trim()) return;

    const satirlar = hamMetin.trim().split("\n");
    let yeniSepetEklentileri = [];
    let sonBulunanCamBasligi = ""; // Üst satırdaki başlığı hafızada tutma

    for (let satirMetni of satirlar) {
      satirMetni = satirMetni.trim();
      if (!satirMetni) continue;

      const ustSatir = satirMetni.toUpperCase();
      if (ustSatir.includes("GENİŞLİK") || ustSatir.includes("YÜKSEKLİK") || ustSatir.includes("CAM ÖZELLİKLERİ")) continue;
      if (ustSatir === "POZ" || ustSatir === "POZ NO" || ustSatir === "POZ NUMARASI" || ustSatir === "NUMARA") continue;

      // Eğer satırda başlık veya tek başına cam açıklaması varsa onu hafızaya al
      if ((ustSatir.includes("MM") || ustSatir.includes("KOMBİNASYON") || ustSatir.includes("SOLAR") || ustSatir.includes("LOWE") || ustSatir.includes("TEMPER") || ustSatir.includes("LAMİNE")) && !/\d{3,}\s*[\t\s]\s*\d{3,}/.test(satirMetni)) {
        let temizBaslik = satirMetni.replace(/^KOMBİNASYON\s*:\s*/i, "").trim();
        if (temizBaslik.length > 10) {
          sonBulunanCamBasligi = temizBaslik;
        }
      }

      let adet = 1;
      let genislik = 0;
      let yukseklik = 0;
      let pozNoVal = "-";
      let algilananCamAdi = "";

      const sutunlar = satirMetni.split("\t").map(s => s.trim()).filter(s => s !== "");

      if (sutunlar.length >= 2) {
        let olcuAdaylari = [];
        let adetBulundu = false;

        for (let i = 0; i < sutunlar.length; i++) {
          const sutun = sutunlar[i];
          const sutunUst = sutun.toUpperCase();

          if (i === 0 && sutun.length <= 12 && !sutunUst.includes("MM") && !sutunUst.includes("CAM")) {
            pozNoVal = sutun;
            continue;
          }

          if (sutun.length > 12 || sutunUst.includes("MM") || sutunUst.includes("CAM") || sutunUst.includes("TEMPER") || sutunUst.includes("RODAJ") || sutunUst.includes("ISICAM")) {
            if (!algilananCamAdi) {
              algilananCamAdi = sutun;
              sonBulunanCamBasligi = sutun; // Hafızayı güncelle
              continue;
            }
          }

          const temizSayi = sutun.replace(/\./g, "").replace(/,/g, ".");
          const val = Number(temizSayi);

          if (!isNaN(val) && val > 0) {
            if (val >= 50) {
              olcuAdaylari.push(val);
            } else if (!adetBulundu && val < 50) {
              adet = val;
              adetBulundu = true;
            }
          }
        }

        if (olcuAdaylari.length >= 2) {
          genislik = olcuAdaylari[0];
          yukseklik = olcuAdaylari[1];
        }
      }

      if (genislik === 0 || yukseklik === 0) {
        const dimMatch = satirMetni.match(/(\d{2,})\s*[xX*×]\s*(\d{2,})/);
        if (dimMatch) {
          genislik = Number(dimMatch[1]);
          yukseklik = Number(dimMatch[2]);
        } else {
          const sayilar = satirMetni.match(/\b\d+\b/g);
          if (sayilar) {
            const buyukSayilar = sayilar.map(Number).filter(n => n >= 50);
            if (buyukSayilar.length >= 2) {
              genislik = buyukSayilar[0];
              yukseklik = buyukSayilar[1];
            }
          }
        }

        if (genislik === 0 || yukseklik === 0) continue; 

        const adetMatch = satirMetni.match(/(\d+)\s*(?:adet|ad\.|ad\b|tane|pcs|pc)/i);
        if (adetMatch) adet = Number(adetMatch[1]);

        const pozMatch = satirMetni.match(/(?:P|Poz|P-)\s*[:.-]?\s*([A-Za-z0-9/,-]{1,10})/i);
        if (pozMatch) pozNoVal = pozMatch[1];
      }

      if (adet <= 0) adet = 1;

      // Ürün adını sırayla bul: Satır içi cam adı -> Hafızadaki Başlık Cam Adı -> Arama kutusundaki ad
      let nihaiUrunAdi = algilananCamAdi || sonBulunanCamBasligi || arama.trim() || "ÖZEL CAM ÜRÜNÜ";
      nihaiUrunAdi = nihaiUrunAdi.toLocaleUpperCase("tr-TR");

      const benzersizId = "text_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      const dummyUrun = { id: benzersizId, kodu: "ÖZEL", aciklama: nihaiUrunAdi, "Ana Birim": "m²" };
      
      const tekCamM2 = (genislik * yukseklik) / 1000000;
      const toplamM2 = tekCamM2 * adet;
      
      let parcaAciklama = `(${genislik}×${yukseklik} mm - ${adet} Adet - Toplam: ${toplamM2.toFixed(2)} m²)`;

      const satir = satirHesapla(dummyUrun, 100, 100, toplamM2, Number(fiyatAna) || 0, paraBirimi, Number(kdvOrani), "m²");
      
      satir.id = benzersizId;
      satir.pozNo = pozNoVal.length <= 12 ? pozNoVal : "-";
      satir.urunAciklamasi = nihaiUrunAdi;
      satir.ozelAciklama = parcaAciklama;
      satir.orijinalMiktar = adet;
      satir.adet = adet;
      satir.Adet = adet;
      satir.kdvOrani = Number(kdvOrani);
      satir.miktar = Number(toplamM2.toFixed(3));
      satir.secilenBirim = "m²";
      satir.en = genislik;
      satir.boy = yukseklik;
      satir.secili = true;
      satir.hamVeri = {
        arama: nihaiUrunAdi, ozelAciklama: parcaAciklama, en: genislik, boy: yukseklik, miktar: adet, 
        secilenBirim: "m²", paraBirimi, kdvOrani: Number(kdvOrani)
      };

      yeniSepetEklentileri.push(satir);
    }

    if (yeniSepetEklentileri.length > 0) {
      if (onTopluGuncelle) {
        onTopluGuncelle(hedefSepetNo, [...aktifSepetDizisi, ...yeniSepetEklentileri]);
      } else if (onEkle) {
        yeniSepetEklentileri.forEach(s => onEkle(s));
      }
      alert(`✅ Başarıyla ${yeniSepetEklentileri.length} satır ${hedefSepetNo}. Seçeneğe eklendi!`);
    } else {
      alert("Metin içinde geçerli ölçü bulunamadı. Lütfen kontrol edin.");
    }
  };

  useEffect(() => {
    if (iscilikTuru === "Karolaj Bedeli") {
      const eMm = Number(en) || 0;       
      const bMm = Number(boy) || 0;       
      const eAdet = Number(karolajEnAdet) || 0; 
      const bAdet = Number(karolajBoyAdet) || 0; 
      const urunAdeti = (miktar !== "" && !isNaN(miktar)) ? Number(miktar) : 1;    

      if (eMm > 0 && bMm > 0 && (eAdet > 0 || bAdet > 0)) {
        const birCamIscilikMt = ((eMm * eAdet) + (bMm * bAdet)) / 1000;
        const toplamIscilikMt = birCamIscilikMt * urunAdeti;
        setIscilikMetretul(toplamIscilikMt.toFixed(2));
      } else {
        setIscilikMetretul("");
      }
    }
  }, [en, boy, karolajEnAdet, karolajBoyAdet, miktar, iscilikTuru]);

  useEffect(() => {
    if (islemVerisi && (islemVerisi.tip === "duzenle" || islemVerisi.tip === "tekrar") && (islemVerisi.satir || islemVerisi.hamVeri)) {
      const satir = islemVerisi.satir || islemVerisi;
      const ham = satir.hamVeri || islemVerisi.hamVeri || {};

      setPozNo(satir.pozNo || ham.pozNo || "");
      setUrunGorselBase64(satir.gorsel || ham.gorsel || null);
      setParaBirimi(satir.paraBirimi || ham.paraBirimi || "TRY");
      
      const gelenKdv = satir.kdvOrani !== undefined ? String(satir.kdvOrani) : (ham.kdvOrani !== undefined ? String(ham.kdvOrani) : "20");
      setKdvOrani(gelenKdv);
      setIhracatMi(gelenKdv === "0");

      setIscilikTuru(ham.iscilikTuru || "");
      setIscilikMetretul(ham.iscilikMetretul || "");
      setIscilikBirimFiyat(ham.iscilikBirimFiyat || "");
      setKarolajEnAdet(ham.karolajEnAdet || "");
      setKarolajBoyAdet(ham.karolajBoyAdet || "");
      
      setSivamaIcEn(ham.sivamaIcEn || "");
      setSivamaIcBoy(ham.sivamaIcBoy || "");
      setSivamaDisEn(ham.sivamaDisEn || "");
      setSivamaDisBoy(ham.sivamaDisBoy || "");

      const gelenAd = satir.urunAciklamasi || ham.arama || satir.aciklama || satir.Açıklama || "";
      setArama(gelenAd);
      
      let temizAciklama = ham.ozelAciklama || satir.ozelAciklama || "";
      temizAciklama = temizAciklama.replace(/\(.*?Toplam:.*?m²\)/gi, "")
                                   .replace(/\(.*?Adet.*?m²\)/gi, "")
                                   .replace(/\(.*?×.*?mm.*?\)/gi, "")
                                   .replace(/\(\d+\s*Adet\)/gi, "")
                                   .replace(/^\|\s*/g, "").replace(/\s*\|\s*$/g, "").trim();
      setOzelAciklama(temizAciklama); 
      
      setSecilenId(ham.secilenId || "ozel_urun");
      
      const gelenEn = satir.en || ham.en || "";
      const gelenBoy = satir.boy || ham.boy || "";
      setEn(gelenEn);
      setBoy(gelenBoy);
      setManuelM2(satir.manuelM2 || ham.manuelM2 || "");
      
      const gelenMiktar = satir.orijinalMiktar !== undefined && satir.orijinalMiktar !== null 
        ? String(satir.orijinalMiktar) 
        : (ham.miktar !== undefined ? String(ham.miktar) : String(satir.adet || "1"));
      setMiktar(gelenMiktar);
      
      const kaydedilenBirim = satir.secilenBirim || ham.secilenBirim || "m²";
      setSecilenBirim(kaydedilenBirim);

      const hamFiyatAna = satir.birimFiyat !== undefined ? satir.birimFiyat : (ham.fiyatAna !== undefined ? ham.fiyatAna : "");
      const hamFiyatAdet = ham.fiyatAdet !== undefined ? ham.fiyatAdet : "";

      if (kaydedilenBirim === "ad" || satir.birim === "ad") {
        setFiyatAdet(hamFiyatAdet !== "" ? hamFiyatAdet : hamFiyatAna);
        setFiyatAna("");
      } else {
        setFiyatAna(hamFiyatAna);
        setFiyatAdet(hamFiyatAdet);
      }
      
      setSihirbazVerisi(ham.sihirbazVerisi || null);
    }
  }, [islemVerisi?.index, islemVerisi?.tip]);

  const formuSifirla = () => {
    setArama("");
    setSecilenId("");
    setPozNo("");
    setOzelAciklama("");
    setUrunGorselBase64(null);
    setEn("");
    setBoy("");
    setManuelM2("");
    setMiktar("1");
    setFiyatAna("");
    setFiyatAdet("");
    setIscilikTuru("");
    setIscilikMetretul("");
    setIscilikBirimFiyat("");
    setKarolajEnAdet("");
    setKarolajBoyAdet("");
    setSivamaIcEn("");
    setSivamaIcBoy("");
    setSivamaDisEn("");
    setSivamaDisBoy("");
    setSihirbazVerisi(null);
    setIhracatMi(false);
    setKdvOrani("20");
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

  const handleSihirbazdanGelenUrun = (olusturulanIsim, durum) => {
    setArama(olusturulanIsim);
    setSecilenId("ozel_urun");
    setSihirbazVerisi(durum);
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
    if (secilenId === "ozel_urun" || !secilenUrun) {
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

  const anaSatirOlusturHelper = (hedefEn, hedefBoy, hedefManuelM2, hedefMiktar, hedefBirim, hedefPozNo, hedefSecili, secilenSonUrun, hedefOzelAciklama = null) => {
    const miktarDegeri = (hedefMiktar !== "" && hedefMiktar !== null && !isNaN(hedefMiktar)) ? Number(hedefMiktar) : null;
    const enDegeri = Number(hedefEn) || 0;
    const boyDegeri = Number(hedefBoy) || 0;
    const manuelM2Degeri = Number(hedefManuelM2) || 0;
    
    let ekstraAciklama = "";
    let nihaiFiyat = Number(fiyatAna) || Number(fiyatAdet) || 0;
    let nihaiBirim = hedefBirim;
    let hesaplananMiktar = miktarDegeri !== null ? miktarDegeri : 1;
    let toplamM2 = 0;

    if (iscilikTuru === "Sıvama Bedeli") {
      nihaiFiyat = Number(fiyatAna) || 0;
    }

    if (manuelM2Degeri > 0) {
      toplamM2 = miktarDegeri !== null ? manuelM2Degeri * miktarDegeri : manuelM2Degeri;
      ekstraAciklama = miktarDegeri !== null 
        ? ` (${manuelM2Degeri} m² - ${miktarDegeri} Adet - Toplam: ${toplamM2.toFixed(2)} m²)` 
        : ` (${manuelM2Degeri} m²)`;
    } else if (enDegeri > 0 && boyDegeri > 0) {
      const tekCamM2 = (enDegeri * boyDegeri) / 1000000;
      toplamM2 = miktarDegeri !== null ? tekCamM2 * miktarDegeri : tekCamM2;
      
      if (iscilikTuru === "Sıvama Bedeli" && (sivamaIcEn || sivamaDisEn)) {
        ekstraAciklama = ` (Dış Cam: ${sivamaDisEn || enDegeri}×${sivamaDisBoy || boyDegeri} mm | İç Cam: ${sivamaIcEn || "-"}×${sivamaIcBoy || "-"} mm - ${miktarDegeri || 1} Adet - Toplam: ${toplamM2.toFixed(2)} m²)`;
      } else {
        ekstraAciklama = miktarDegeri !== null 
          ? ` (${enDegeri}×${boyDegeri} mm - ${miktarDegeri} Adet - Toplam: ${toplamM2.toFixed(2)} m²)` 
          : ` (${enDegeri}×${boyDegeri} mm - Toplam: ${toplamM2.toFixed(2)} m²)`;
      }
    } else if (boyDegeri > 0) {
      ekstraAciklama = miktarDegeri !== null ? ` (${boyDegeri} mm - ${miktarDegeri} Adet)` : ` (${boyDegeri} mm)`;
    } else {
      ekstraAciklama = miktarDegeri !== null ? ` (${miktarDegeri} Adet)` : "";
    }

    if (hedefBirim === "m²" || hedefBirim === "ad") {
      if (fiyatAdet && Number(fiyatAdet) > 0 && iscilikTuru !== "Sıvama Bedeli") {
        nihaiFiyat = Number(fiyatAdet);
        nihaiBirim = "ad"; 
      } else {
        hesaplananMiktar = toplamM2 > 0 ? toplamM2 : (miktarDegeri !== null ? miktarDegeri : 1);
        if (iscilikTuru !== "Sıvama Bedeli") {
          nihaiFiyat = Number(fiyatAna) || 0;
          nihaiBirim = toplamM2 > 0 ? "m²" : "ad";
        }
      }
    } else if (hedefBirim === "mt") {
      hesaplananMiktar = miktarDegeri !== null ? (boyDegeri / 1000) * miktarDegeri : (boyDegeri / 1000);
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
    satir.urunAciklamasi = arama.trim() || aciklamaBul(secilenSonUrun);
    
    let kullanilacakOzelAciklama = hedefOzelAciklama !== null ? hedefOzelAciklama : ozelAciklama;
    kullanilacakOzelAciklama = kullanilacakOzelAciklama
      .replace(/\(\s*\d+\s*[xX×]\s*\d+\s*mm[^)]*\)/gi, "")
      .replace(/\d+\s*[xX×]\s*\d+\s*mm/gi, "")
      .replace(/\(\d+\s*Adet\)/gi, "")
      .replace(/\|\s*$/g, "")
      .trim();

    satir.ozelAciklama = kullanilacakOzelAciklama ? `${kullanilacakOzelAciklama} | ${ekstraAciklama}` : ekstraAciklama;
    satir.gorsel = urunGorselBase64; 
    
    satir.orijinalMiktar = miktarDegeri;
    satir.adet = miktarDegeri;
    satir.Adet = miktarDegeri;
    satir.kdvOrani = Number(kdvOrani);
    
    satir.miktar = Number(hesaplananMiktar.toFixed(3)); 
    satir.secilenBirim = nihaiBirim;
    satir.birimFiyat = nihaiFiyat;
    satir.birim = nihaiBirim; 
    satir.Birim = nihaiBirim;
    satir.secili = hedefSecili;
    satir.en = Number(enDegeri);
    satir.boy = Number(boyDegeri);
    satir.manuelM2 = manuelM2Degeri;
    
    satir.hamVeri = {
      arama, secilenId, pozNo: hedefPozNo, ozelAciklama: kullanilacakOzelAciklama, en: hedefEn, boy: hedefBoy, 
      manuelM2: manuelM2Degeri, miktar: miktarDegeri, secilenBirim: hedefBirim, 
      fiyatAna, fiyatAdet, paraBirimi, kdvOrani: Number(kdvOrani), karolajEnAdet, karolajBoyAdet, 
      sivamaIcEn, sivamaIcBoy, sivamaDisEn, sivamaDisBoy,
      iscilikTuru, iscilikMetretul, iscilikBirimFiyat, sihirbazVerisi 
    };

    return satir;
  };

  const karolajSatiriOlusturHelper = (hedefEn, hedefBoy, hedefMiktar, hedefPozNo, hedefSecili, secilenSonUrun) => {
    let mtMiktari = 0;
    const miktarDegeri = (hedefMiktar !== "" && hedefMiktar !== null && !isNaN(hedefMiktar)) ? Number(hedefMiktar) : 1;

    if (iscilikTuru === "Karolaj Bedeli") {
      const eMm = Number(hedefEn) || 0;       
      const bMm = Number(hedefBoy) || 0;       
      const eAdet = Number(karolajEnAdet) || 0; 
      const bAdet = Number(karolajBoyAdet) || 0; 
      
      if (eMm > 0 && bMm > 0 && (eAdet > 0 || bAdet > 0)) {
        const birCamIscilikMt = ((eMm * eAdet) + (bMm * bAdet)) / 1000;
        mtMiktari = Number((birCamIscilikMt * miktarDegeri).toFixed(2));
      }
    } else {
      mtMiktari = Number(iscilikMetretul) || 0;
    }

    const mtBirimFiyat = Number(iscilikBirimFiyat) || 0;
    const toplamIscilikTutari = mtMiktari * mtBirimFiyat;

    const iscilikUrunu = {
      id: "iscilik_" + Date.now() + "_" + Math.random().toString(36).substring(7),
      kodu: secilenSonUrun ? koduBul(secilenSonUrun) : "ÖZEL",
      aciklama: iscilikTuru ? iscilikTuru.toLocaleUpperCase("tr-TR") : "İŞÇİLİK",
      "Ana Birim": "mt"
    };

    const satir = satirHesapla(iscilikUrunu, 100, 100, mtMiktari, mtBirimFiyat, paraBirimi, Number(kdvOrani), "mt");
    satir.toplamTutar = toplamIscilikTutari;
    satir.pozNo = hedefPozNo || "-";
    satir.urunAciklamasi = iscilikTuru ? iscilikTuru.toLocaleUpperCase("tr-TR") : "İŞÇİLİK";
    satir.kdvOrani = Number(kdvOrani);
    
    let parcalar = [];
    let urunVeAdetBilgisi = hedefEn && hedefBoy ? `${hedefEn}×${hedefBoy} mm` : "Ürün Ölçüsü Yok";

    if (iscilikTuru === "Karolaj Bedeli" && (karolajEnAdet || karolajBoyAdet)) {
      urunVeAdetBilgisi += hedefMiktar !== null ? ` (${hedefMiktar} Adet Cam İçin → Cam Başına ${karolajEnAdet || 0} En / ${karolajBoyAdet || 0} Boy)` : ` (Cam Başına ${karolajEnAdet || 0} En / ${karolajBoyAdet || 0} Boy)`;
    } else {
      urunVeAdetBilgisi += hedefMiktar !== null ? ` (${hedefMiktar} Adet İçin)` : "";
    }
    parcalar.push(urunVeAdetBilgisi);
    parcalar.push(`Toplam İşlem: ${mtMiktari} mt × ${paraFormatla(mtBirimFiyat, paraBirimi)}`);

    satir.ozelAciklama = parcalar.join(" | ");
    satir.gorsel = null;
    
    satir.orijinalMiktar = hedefMiktar; 
    satir.adet = hedefMiktar;
    satir.Adet = hedefMiktar;
    satir.miktar = mtMiktari; 
    satir.secilenBirim = "mt";
    satir.birimFiyat = mtBirimFiyat;
    satir.birim = "mt";
    satir.Birim = "mt";
    satir.en = Number(hedefEn) || 0;
    satir.boy = Number(hedefBoy) || 0;
    satir.secili = hedefSecili;
    satir.hamVeri = {
      iscilikTuru, iscilikMetretul: mtMiktari, iscilikBirimFiyat, karolajEnAdet, karolajBoyAdet, pozNo: hedefPozNo, paraBirimi, kdvOrani: Number(kdvOrani), en: hedefEn, boy: hedefBoy, miktar: hedefMiktar
    };
    return satir;
  };

  async function ekle(e) {
    if (e) e.preventDefault();
    if (!arama.trim()) return;

    const sonUrun = await getSonUrun();
    const anaSatir = anaSatirOlusturHelper(en, boy, manuelM2, miktar, secilenBirim, pozNo, true, sonUrun);

    let karolajSatiri = null;
    if (iscilikTuru && (Number(iscilikMetretul) > 0 || iscilikTuru === "Karolaj Bedeli") && Number(iscilikBirimFiyat) > 0) {
      karolajSatiri = karolajSatiriOlusturHelper(en, boy, miktar, pozNo, true, sonUrun);
    }

    if (islemVerisi && islemVerisi.tip === "duzenle") {
      const yeniSepet = [];

      for (let i = 0; i < aktifSepetDizisi.length; i++) {
        if (i === islemVerisi.index) {
          yeniSepet.push(anaSatir);
          if (karolajSatiri) {
            yeniSepet.push(karolajSatiri);
          }
          while (i + 1 < aktifSepetDizisi.length && isIscilikFunc(aktifSepetDizisi[i + 1])) {
            i++; 
          }
        } else {
          yeniSepet.push(aktifSepetDizisi[i]);
        }
      }

      if (onTopluGuncelle) {
        onTopluGuncelle(hedefSepetNo, yeniSepet);
      } else if (onGuncelle) {
        onGuncelle(islemVerisi.index, anaSatir, hedefSepetNo);
      }
      if (onIptal) onIptal();
    } else {
      const yeniEklenecekler = [anaSatir];
      if (karolajSatiri) {
        yeniEklenecekler.push(karolajSatiri);
      }

      if (onTopluGuncelle) {
        onTopluGuncelle(hedefSepetNo, [...aktifSepetDizisi, ...yeniEklenecekler]);
      } else if (onEkle) {
        yeniEklenecekler.forEach(item => onEkle(item));
      }

      if (islemVerisi && islemVerisi.tip === "tekrar" && onIptal) onIptal(); 
    }
    
    formuSifirla();
  }

  async function topluUygula(e) {
    if (e) e.preventDefault();
    if (!arama.trim()) return;
    
    if (!onTopluGuncelle) {
      alert("Lütfen App.jsx dosyasını güncelleyin (onTopluGuncelle eksik).");
      return;
    }

    const sonUrun = await getSonUrun();

    if (!aktifSepetDizisi) return;

    const guncelSepet = [];
    
    for (let idx = 0; idx < aktifSepetDizisi.length; idx++) {
      const item = aktifSepetDizisi[idx];

      if (isIscilikFunc(item)) {
        continue; 
      }

      if (item.secili !== false || idx === islemVerisi.index) {
        const hEn = (idx === islemVerisi.index) ? en : (item.hamVeri?.en || item.en || "");
        const hBoy = (idx === islemVerisi.index) ? boy : (item.hamVeri?.boy || item.boy || "");
        const hManuelM2 = (idx === islemVerisi.index) ? manuelM2 : (item.hamVeri?.manuelM2 || item.manuelM2 || "");
        const hMiktar = (idx === islemVerisi.index) ? miktar : (item.hamVeri?.miktar !== undefined ? item.hamVeri.miktar : (item.orijinalMiktar !== undefined ? item.orijinalMiktar : "1"));
        const hBirim = (idx === islemVerisi.index) ? secilenBirim : (item.hamVeri?.secilenBirim || item.secilenBirim || "m²");
        const hPozNo = (idx === islemVerisi.index) ? pozNo : (item.pozNo || "");
        const hOzelAciklama = (idx === islemVerisi.index) ? ozelAciklama : (item.hamVeri?.ozelAciklama || "");
        
        const yeniAnaSatir = anaSatirOlusturHelper(hEn, hBoy, hManuelM2, hMiktar, hBirim, hPozNo, item.secili !== false, sonUrun, hOzelAciklama);
        guncelSepet.push(yeniAnaSatir);

        if (iscilikTuru && (Number(iscilikMetretul) > 0 || iscilikTuru === "Karolaj Bedeli") && Number(iscilikBirimFiyat) > 0) {
          const yeniKarolajSatiri = karolajSatiriOlusturHelper(hEn, hBoy, hMiktar, hPozNo, item.secili !== false, sonUrun);
          guncelSepet.push(yeniKarolajSatiri);
        }
      } else {
        guncelSepet.push(item);
        let nextIdx = idx + 1;
        while(nextIdx < aktifSepetDizisi.length && isIscilikFunc(aktifSepetDizisi[nextIdx])) {
          guncelSepet.push(aktifSepetDizisi[nextIdx]);
          idx++; 
          nextIdx++;
        }
      }
    }

    onTopluGuncelle(hedefSepetNo, guncelSepet);
    if (onIptal) onIptal();
    formuSifirla();
  }

  if (yukleniyor) {
    return (
      <section className="panel" style={{ backgroundColor: "white", padding: "16px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
        <h2 className="panel__baslik" style={{ fontSize: "15px", fontWeight: "800", color: "#0f2942" }}>Ürün Ekleme Ekranı</h2>
        <p className="bilgi-metni" style={{ fontSize: "13px", color: "#64748b" }}>Ürün listesi yükleniyor, lütfen bekleyin…</p>
      </section>
    );
  }

  if (hata) {
    return (
      <section className="panel" style={{ backgroundColor: "white", padding: "16px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
        <h2 className="panel__baslik" style={{ fontSize: "15px", fontWeight: "800", color: "#0f2942" }}>Ürün Ekleme Ekranı</h2>
        <p className="hata-metni" style={{ fontSize: "13px", color: "#ef4444" }}>Ürünler yüklenemedi: {hata}</p>
      </section>
    );
  }

  const formDoluMu = arama.trim();

  return (
    <section className="panel" style={{ backgroundColor: "white", padding: "18px", borderRadius: "8px", border: "1px solid #cbd5e1", marginBottom: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.04)" }}>
      
      {/* --- AKILLI YAPIŞTIRMA ALANI (EXCEL veya DÜZ YAZI) --- */}
      <div style={{ backgroundColor: "#f8fafc", border: "2px solid #cbd5e1", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
        <h4 style={{ margin: "0 0 4px 0", color: "#0f2942", fontSize: "14px", fontWeight: "800" }}>📋 Excel veya Düz Metin (Yazı) Yapıştır</h4>
        <p style={{ margin: "0 0 8px 0", color: "#64748b", fontSize: "11px" }}>Buraya Excel tablosu veya WhatsApp/Mail gibi yerlerden gelen serbest yazıları (Örn: P1 1889 2734 2) yapıştırın, sistem ölçüleri okuyup sepete eklesin.</p>
        
        <textarea 
          rows="2" 
          placeholder="Ctrl + V ile Excel tablosu veya sipariş metnini yapıştırabilirsiniz..."
          onPaste={(e) => {
            e.preventDefault();
            const pastedText = e.clipboardData.getData('text');
            handleTopluMetinIsle(pastedText);
          }}
          style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", outline: "none", backgroundColor: "white" }}
        />
      </div>

      <CamKombinasyonSihirbazi 
        onKombinasyonSec={handleSihirbazdanGelenUrun} 
        baslangicMetni={islemVerisi ? arama : ""} 
        baslangicVerisi={sihirbazVerisi} 
      />

      <h2 className="panel__baslik" style={{ fontSize: "16px", fontWeight: "800", color: "#0f2942", margin: "14px 0 12px 0", borderBottom: "2px solid #e2e8f0", paddingBottom: "8px" }}>
        {islemVerisi?.tip === "duzenle" ? "✏️ Ürünü Düzenle" : (islemVerisi?.tip === "tekrar" ? "🔄 Ürünü Tekrar Et" : "➕ Ürün Ekleme Ekranı")}
      </h2>

      <div style={{ marginBottom: "12px" }}>
        <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
          Ürün Ara ve Seç
        </label>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Ürün adı veya kodu yazın..."
            value={arama}
            onChange={handleAramaDegisimi}
            autoComplete="off"
            style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: "600", outline: "none", backgroundColor: "#f8fafc" }}
          />
          
          {listeAcik && arama.length >= 3 && (
            <ul style={{ 
              position: "absolute", top: "100%", left: 0, right: 0, maxHeight: "200px", 
              overflowY: "auto", backgroundColor: "white", border: "1px solid #cbd5e1", 
              borderRadius: "0 0 6px 6px", zIndex: 1000, padding: 0, margin: 0, listStyle: "none",
              boxShadow: "0 8px 12px -2px rgba(0,0,0,0.1)"
            }}>
              {filtrelenmisUrunler.length === 0 ? (
                <li style={{ padding: "10px 12px", color: "#64748b", fontSize: "13px" }}>Veritabanında eşleşen ürün bulunamadı...</li>
              ) : (
                filtrelenmisUrunler.map((urun) => (
                  <li 
                    key={urun.id}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderBottom: "1px solid #f1f5f9", cursor: "pointer", fontSize: "13px" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f0f8ff"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
                  >
                    <div onClick={() => handleUrunSec(urun)} style={{ flex: 1 }} onMouseDown={(e) => e.preventDefault()}>
                      <strong style={{ color: "#0f2942" }}>{koduBul(urun)}</strong> - {aciklamaBul(urun)}
                    </div>
                    <button onClick={(e) => urunSil(urun, e)} onMouseDown={(e) => e.preventDefault()} style={{ background: '#fee2e2', border: 'none', color: '#991b1b', cursor: 'pointer', fontSize: '11px', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                      ❌ Sil
                    </button>
                  </li>
                ))
              )}

              {secilenId !== "ozel_urun" && (
                <li 
                  onClick={handleOzelUrunSec}
                  style={{ padding: "11px", backgroundColor: "#e0f2fe", borderTop: "2px solid #bae6fd", cursor: "pointer", color: "#0369a1", fontWeight: "800", textAlign: "center", position: "sticky", bottom: 0, fontSize: "13px" }}
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

      <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", flexWrap: "wrap", marginBottom: "12px" }}>
        <div style={{ flex: "0 0 110px" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Poz No</label>
          <input
            type="text"
            placeholder="Örn: P1"
            value={pozNo}
            onChange={(e) => setPozNo(e.target.value)}
            style={{ width: "100%", padding: "9px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: "700", backgroundColor: "white" }}
          />
        </div>

        <div style={{ flex: 3, minWidth: "200px" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Ürün Açıklaması / Detay</label>
          <input
            type="text"
            placeholder="Örn: Rodajlı, Bizoteli..."
            value={ozelAciklama}
            onChange={(e) => setOzelAciklama(e.target.value)}
            style={{ width: "100%", padding: "9px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", backgroundColor: "white" }}
          />
        </div>

        <div style={{ flex: 1.5, minWidth: "140px" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#0f2942", marginBottom: "4px" }}>🖼️ Görsel Ekle</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleGorselYukle}
            style={{ fontSize: "11px", padding: "6px", width: "100%", border: "1px solid #cbd5e1", borderRadius: "6px", backgroundColor: "#f8fafc" }}
          />
        </div>
      </div>

      {urunGorselBase64 && (
        <div style={{ marginTop: "8px", marginBottom: "12px", padding: "10px", backgroundColor: "#f1f5f9", borderRadius: "6px", display: "flex", alignItems: "center", gap: "10px", border: "1px solid #cbd5e1" }}>
          <img src={urunGorselBase64} alt="Önizleme" style={{ height: "50px", width: "auto", borderRadius: "4px", border: "1px solid #cbd5e1" }} />
          <span style={{ fontSize: "12px", color: "#166534", fontWeight: "bold" }}>✓ Görsel Seçildi</span>
          <button 
            type="button" 
            onClick={() => setUrunGorselBase64(null)} 
            style={{ marginLeft: "auto", backgroundColor: "#ef4444", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
          >
            Kaldır
          </button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "140px 120px 1fr 1fr", gap: "10px", marginBottom: "12px", alignItems: "center" }}>
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Birim</label>
          <select value={secilenBirim} onChange={(e) => setSecilenBirim(e.target.value)} style={{ width: "100%", padding: "9px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: "700", backgroundColor: "white" }}>
            <option value="m²">Metrekare (m²)</option>
            <option value="ad">Adet (ad)</option>
            <option value="mt">Metretül (mt)</option>
          </select>
        </div>

        {secilenBirim === "m²" ? (
          <>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Toplam m²</label>
              <input type="number" min="0" step="0.01" placeholder="Örn: 70" value={manuelM2} onChange={(e) => setManuelM2(e.target.value)} style={{ width: "100%", padding: "9px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: "600", backgroundColor: "white" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#64748b", marginBottom: "4px" }}>En (mm)</label>
              <input type="number" min="0" value={en} onChange={(e) => setEn(e.target.value)} style={{ width: "100%", padding: "9px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: "600", backgroundColor: "white" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#64748b", marginBottom: "4px" }}>Boy (mm)</label>
              <input type="number" min="0" value={boy} onChange={(e) => setBoy(e.target.value)} style={{ width: "100%", padding: "9px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: "600", backgroundColor: "white" }} />
            </div>
          </>
        ) : (
          <>
            <div style={{ display: "none" }} />
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>En (mm)</label>
              <input type="number" min="0" value={en} onChange={(e) => setEn(e.target.value)} style={{ width: "100%", padding: "9px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: "600", backgroundColor: "white" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Boy (mm)</label>
              <input type="number" min="0" value={boy} onChange={(e) => setBoy(e.target.value)} style={{ width: "100%", padding: "9px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: "600", backgroundColor: "white" }} />
            </div>
          </>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 1fr 100px", gap: "10px", marginBottom: "12px", alignItems: "flex-end" }}>
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#0f2942", marginBottom: "4px" }}>Adet</label>
          <input type="number" min="1" step="1" placeholder="Boş" value={miktar} onChange={(e) => setMiktar(e.target.value)} style={{ width: "100%", padding: "9px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", fontWeight: "700", backgroundColor: "white" }} />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#0f2942", marginBottom: "4px" }}>Fiyatlandırma</label>
          {((secilenBirim !== "m²" && secilenBirim !== "ad") || fiyatAdet === "") && (
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder={(secilenBirim === "m²" || secilenBirim === "ad") ? "Birim m² Fiyatı" : "Fiyat"}
              value={fiyatAna}
              onChange={(e) => {
                setFiyatAna(e.target.value);
                if (secilenBirim === "m²" || secilenBirim === "ad") setFiyatAdet(""); 
              }}
              style={{ width: "100%", padding: "9px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", fontWeight: "600", backgroundColor: "white" }}
            />
          )}
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#0f2942", marginBottom: "4px" }}>&nbsp;</label>
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
              style={{ width: "100%", padding: "9px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", fontWeight: "600", backgroundColor: "white" }}
            />
          )}
        </div>

        <div>
          <select value={paraBirimi} onChange={(e) => setParaBirimi(e.target.value)} style={{ width: "100%", padding: "9px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", fontWeight: "800", backgroundColor: "white" }}>
            <option value="TRY">TL (₺)</option>
            <option value="USD">Dolar ($)</option>
            <option value="EUR">Euro (€)</option>
          </select>
        </div>
      </div>

      <div style={{ backgroundColor: "#f1f5f9", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", marginBottom: "16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: iscilikTuru === "Karolaj Bedeli" ? "1.2fr 1fr 1fr 1fr 100px" : iscilikTuru === "Sıvama Bedeli" ? "1.2fr 2fr 1fr 100px" : "1fr 1fr 1fr 100px", gap: "10px", alignItems: "flex-end" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#0f2942", marginBottom: "4px" }}>İşçilik Bedeli Türü</label>
            <select value={iscilikTuru} onChange={(e) => setIscilikTuru(e.target.value)} style={{ width: "100%", padding: "9px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: "700", backgroundColor: "white", color: "#1e293b" }}>
              <option value="">İşçilik Seçiniz (Yok)</option>
              <option value="Karolaj Bedeli">Karolaj Bedeli</option>
              <option value="Sıvama Bedeli">Sıvama Bedeli</option>
              <option value="Bonding Bedeli">Bonding Bedeli</option>
            </select>
          </div>

          {iscilikTuru === "Karolaj Bedeli" && (
            <>
              <div style={{ display: "flex", gap: "4px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#0f2942", marginBottom: "4px" }}>En Adet</label>
                  <input type="number" min="0" step="1" placeholder="Örn: 2" value={karolajEnAdet} onChange={(e) => setKarolajEnAdet(e.target.value)} style={{ width: "100%", padding: "9px 6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: "600", backgroundColor: "white" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#0f2942", marginBottom: "4px" }}>Boy Adet</label>
                  <input type="number" min="0" step="1" placeholder="Örn: 4" value={karolajBoyAdet} onChange={(e) => setKarolajBoyAdet(e.target.value)} style={{ width: "100%", padding: "9px 6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: "600", backgroundColor: "white" }} />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#0f2942", marginBottom: "4px" }}>Metretül (mt)</label>
                <input type="number" min="0" step="0.01" placeholder="Örn: 50" value={iscilikMetretul} onChange={(e) => setIscilikMetretul(e.target.value)} style={{ width: "100%", padding: "9px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: "600", backgroundColor: "white" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#0f2942", marginBottom: "4px" }}>mt Başına Fiyat</label>
                <input type="number" min="0" step="0.01" placeholder="Örn: 360" value={iscilikBirimFiyat} onChange={(e) => setIscilikBirimFiyat(e.target.value)} style={{ width: "100%", padding: "9px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: "600", backgroundColor: "white" }} />
              </div>
            </>
          )}

          {iscilikTuru === "Sıvama Bedeli" && (
            <>
              <div style={{ display: "flex", gap: "6px", backgroundColor: "#e2e8f0", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "10px", fontWeight: "800", color: "#0f2942", marginBottom: "2px" }}>Dış Cam (En x Boy)</label>
                  <div style={{ display: "flex", gap: "2px" }}>
                    <input type="number" placeholder="En" value={sivamaDisEn} onChange={(e) => setSivamaDisEn(e.target.value)} style={{ width: "50%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "12px", backgroundColor: "white" }} />
                    <input type="number" placeholder="Boy" value={sivamaDisBoy} onChange={(e) => setSivamaDisBoy(e.target.value)} style={{ width: "50%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "12px", backgroundColor: "white" }} />
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "10px", fontWeight: "800", color: "#0f2942", marginBottom: "2px" }}>İç Cam (En x Boy)</label>
                  <div style={{ display: "flex", gap: "2px" }}>
                    <input type="number" placeholder="En" value={sivamaIcEn} onChange={(e) => setSivamaIcEn(e.target.value)} style={{ width: "50%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "12px", backgroundColor: "white" }} />
                    <input type="number" placeholder="Boy" value={sivamaIcBoy} onChange={(e) => setSivamaIcBoy(e.target.value)} style={{ width: "50%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "12px", backgroundColor: "white" }} />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#0f2942", marginBottom: "4px" }}>Sıvama Fiyatı</label>
                <input type="number" min="0" step="0.01" placeholder="Örn: 500" value={fiyatAna} onChange={(e) => setFiyatAna(e.target.value)} style={{ width: "100%", padding: "9px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: "600", backgroundColor: "white" }} />
              </div>
            </>
          )}

          {iscilikTuru !== "Sıvama Bedeli" && iscilikTuru !== "Karolaj Bedeli" && (
            <>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#0f2942", marginBottom: "4px" }}>Metretül (mt)</label>
                <input type="number" min="0" step="0.01" placeholder="Örn: 50" value={iscilikMetretul} onChange={(e) => setIscilikMetretul(e.target.value)} disabled={!iscilikTuru} style={{ width: "100%", padding: "9px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: "600", backgroundColor: iscilikTuru ? "white" : "#e2e8f0" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#0f2942", marginBottom: "4px" }}>mt Başına Fiyat</label>
                <input type="number" min="0" step="0.01" placeholder="Örn: 360" value={iscilikBirimFiyat} onChange={(e) => setIscilikBirimFiyat(e.target.value)} disabled={!iscilikTuru} style={{ width: "100%", padding: "9px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: "600", backgroundColor: iscilikTuru ? "white" : "#e2e8f0" }} />
              </div>
            </>
          )}
          
          <div>
            <select value={paraBirimi} onChange={(e) => setParaBirimi(e.target.value)} disabled={!iscilikTuru} style={{ width: "100%", padding: "9px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", fontWeight: "800", backgroundColor: iscilikTuru ? "white" : "#e2e8f0" }}>
              <option value="TRY">TL (₺)</option>
              <option value="USD">Dolar ($)</option>
              <option value="EUR">Euro (€)</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}>
        
        <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
          <div style={{ width: "110px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "3px" }}>KDV Oranı (%)</label>
            <select value={kdvOrani} onChange={(e) => setKdvOrani(e.target.value)} disabled={ihracatMi} style={{ width: "100%", padding: "7px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", fontWeight: "600", backgroundColor: ihracatMi ? "#e2e8f0" : "#f8fafc", color: "#475569" }}>
              <option value="0">% 0</option>
              <option value="1">% 1</option>
              <option value="10">% 10</option>
              <option value="20">% 20</option>
            </select>
          </div>

          {/* CHECKBOX DOKUNMA/TIKLAMA ALANI BÜYÜTÜLDÜ */}
          <label htmlFor="ihracatCheck" style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#fef3c7", padding: "8px 12px", borderRadius: "6px", border: "1px solid #f59e0b", height: "38px", cursor: "pointer", userSelect: "none" }}>
            <input type="checkbox" id="ihracatCheck" checked={ihracatMi} onChange={(e) => handleIhracatToggle(e.target.checked)} style={{ width: "18px", height: "18px", cursor: "pointer" }} />
            <span style={{ fontSize: "12px", fontWeight: "800", color: "#92400e" }}>
              🌍 İhracat (KDV %0)
            </span>
          </label>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {islemVerisi && (
            <button type="button" onClick={() => { formuSifirla(); onIptal(); }} style={{ backgroundColor: "#64748b", color: "white", border: "none", padding: "10px 16px", borderRadius: "6px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
              İptal
            </button>
          )}

          {islemVerisi?.tip === "duzenle" && (
            <button type="button" onClick={topluUygula} style={{ backgroundColor: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", padding: "8px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", cursor: "pointer" }} title="Aynı özellikteki seçili diğer ürünlere de bu değişiklikleri uygula">
              🔄 Seçili Ürünlere de Uygula
            </button>
          )}

          <button type="button" onClick={ekle} disabled={!formDoluMu} style={{ backgroundColor: islemVerisi?.tip === "duzenle" ? "#10b981" : "#0f2942", color: "white", border: "none", padding: "10px 22px", borderRadius: "6px", fontSize: "13px", fontWeight: "800", cursor: formDoluMu ? "pointer" : "not-allowed", opacity: formDoluMu ? 1 : 0.6, boxShadow: "0 4px 6px rgba(0,0,0,0.15)" }}>
            {islemVerisi?.tip === "duzenle" ? "💾 Sadece Bu Ürünü Kaydet" : "📥 Sepete Ekle"}
          </button>
        </div>

      </div>
    </section>
  );
}