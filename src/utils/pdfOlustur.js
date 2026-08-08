import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { paraFormatla, genelToplamHesapla, genelKdvHesapla, sayiyiYaziyaCevir } from "./hesaplama";

pdfMake.vfs = pdfFonts?.pdfMake?.vfs || pdfFonts?.vfs || pdfFonts?.default?.pdfMake?.vfs || pdfFonts?.default?.vfs;

function gorseliHazirla(kaynak, maxGenislik = null) {
  return new Promise((resolve) => {
    if (!kaynak) {
      resolve(null);
      return;
    }

    const img = new Image();
    img.onload = () => {
      try {
        let genislik = img.naturalWidth || img.width;
        let yukseklik = img.naturalHeight || img.height;

        if (maxGenislik && genislik > maxGenislik) {
          const oran = maxGenislik / genislik;
          genislik = Math.round(genislik * oran);
          yukseklik = Math.round(yukseklik * oran);
        }

        const canvas = document.createElement("canvas");
        canvas.width = genislik;
        canvas.height = yukseklik;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, genislik, yukseklik);

        const temizVeri = canvas.toDataURL("image/jpeg", 0.92);
        resolve(temizVeri);
      } catch (e) {
        console.error("Görsel PDF için hazırlanamadı:", e);
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = kaynak;
  });
}

async function gorseliBase64eCevir(yol) {
  return gorseliHazirla(yol, null);
}

const SOZLESME_SARTLARI = [
  "Sipariş miktarı +/- %10 değişimine kadar firma aynı birim fiyattan işi yapmayı taahhüt eder; aksi takdirde birim fiyat revize edilir.",
  "Vadeli satışlarda; siparişi takiben 10 gün içerisinde kıymetli evrak teslim edilmiş olacaktır aksi halde %5 aylık faiz uygulanacaktır.",
  "Ankara içi şantiye teslim fiyatlarımızdır. Montaj fiyatlara dahil değildir. Fiyatlar %10 fire oranına göre hazırlanmıştır.",
  "Sevkiyat sonrasında kırık, çatlak, atık vb. durumlarda 12 saat içerisinde tarafımıza bildirilmemesi durumunda firmamızın herhangi bir sorumluluğu bulunmamaktadır.",
  "Sözleşmedeki toplam metrajlar dışında çıkacak olan ölçüler ayrıca fiyatlandırılır. Kare, üçgen, yamuk vb. camlar dikdörtgen olarak hesaplanır. Şekilli camlar %25 fiyat farkı uygulanacaktır. 0,20m2 altında olan camlara %35 fiyat farkı uygulanacaktır.",
  "Verilen ölçülerden kaynaklı hatalar alıcıya aittir. Ölçü gecikmelerinden sorumluluk alıcıya aittir.",
  "Alıcının verdiği ölçü hatalarından kaynaklanan imalat hataları nedeniyle satıcıya kusur yüklenemez.",
  "Şantiyede zemin ve montaj yerinin hazır olmamasından kaynaklanan gecikmenin sorumluluğu alıcıya aittir.",
  "Zemin ve montaj yerinin hazır olmaması sebebiyle şantiyeye teslim ettirilen ya da imalatı yaptırılarak fabrikada bekletilen camların hasarlanmasından satıcı firma sorumlu değildir.",
  "Paletli sevk edilen camların paletleri boşatıldıktan sonra iade edilmesi alıcıya aittir. İade edilmeyen paletlerin bedelini alıcı ödemekle yükümlüdür. Paletler 10.000 + KDV depozito bedeli olarak faturalandırılacaktır.",
  "Sözleşme imzalandıktan sonra 7 gün içinde imalat ölçüsü verilmemesi halinde; malzeme ye gelen zamlardan doğacak vade farkı ve anında malzeme temini konusunda satıcı sorumlu olmayacaktır.",
  "Anlaşmazlıkların çözümünde taraflar arasındaki mail yazışmaları delil olarak kabul edilecektir.",
  "İş bu teklif yedi gün içinde onaylanmadığı taktir de reddedilmiş sayılacak ve firmamız teklifle bağlı olmayacaktır.",
  "Temperli camlar TS EN 1863, Lamine camlar TS EN12543, Isıcamlar TS EN 1279-1 standartlarına göre yapılacak olup standart içerisindeki töleranslar dışında herhangi bir kontrol şartı tarafımızdan kabul edilmemektedir."
];

const ISICAM_GARANTI_SARTLARI = [
  "Isıcam Yetkili Üretici firma, ürettiği Isıcam ünitelerini, başlangıçta veya kullanım süresince Isıcam ünitesinin iç yüzeyinde (ara boşlukta) tespit edilecek; çizik, kirlilik, leke ve buğulanma gibi Isıcam üretiminden kaynaklanan hatalara karşı 10 yıl süre ile garanti eder.",
  "Yukarıda belirtilen Üretim kaynaklı hataların olduğu Isıcam üniteleri herhangi bir bedel talep etmeksizin Isıcam Yetkili Üretici firma tarafından yenisi ile değiştirilerek montajı yapılır.",
  "Isıcam ünitelerinin montajı, isicam.com.tr'de yer alan ve Isıcam Yetkili Üreticileri'nden temin edilebilen \"Isıcam Montaj Kılavuzu\"ndaki detaylar dikkate alınarak yapılmalıdır. Isıcam üniteleri, Isıcam Yetkili Üreticisi firma tarafından monte edildiyse, montaj kaynaklı hatalardan dolayı bozulan Isıcam üniteleri de garanti kapsamı içindedir. Montajın Isıcam Yetkili Üreticisi dışında bir firma tarafından yapıldığı ve Isıcam ünitesindeki bozulmanın montaj kaynaklı olduğunun tespit edildiği durumlar garanti kapsamı dışındadır.",
  "Isıcam ünitelerinin montajı sırasında kullanılan ve ünite ile temas eden montaj malzemelerinin, Isıcam üretiminde kullanılan birincil (butil) ve ikincil yalıtım macunları (polisülfid, poliüretan, Isıcam dolgu silikonu) ile uyum testlerinin yaptırılması, montajı yapan firmanın sorumluluğundadır. Isıcam montajı öncesinde bu testlerin yaptırılmadığı durumlarda, Isıcam ünitelerinin kenarları ile herhangi bir montaj kimyasalının (yapıştırıcı, silikon vb) teması halinde söz konusu ürünler garanti kapsamı dışında kalacak olup, bu durumda yaşanan şikayetlerin giderilmesi montajı yapan firma sorumluluğunda olacaktır.",
  "Isıcam ünitelerinin kırılması durumunda, kırılmalar garanti kapsamı dışındadır.",
  "Karolajlı, jaluzili, boyalı alüminyum ara boşluk çıtalı, bombeli, delikli, bondingli, yarı bondingli, özel ve parça u cıtalı üniteler ve Isıcam ünitesinin dış yüzeyine sonradan yapılacak uygulamalarda (cam filmi, folyo, boya, yüzeyi aşındırma vb) üniteler Isıcam garanti kapsamının dışındadır.",
  "-30 dereceden düşük, +80 dereceden yüksek cam yüzeyi sıcaklıklarındaki kullanımlara ilişkin ürünler Isıcam garanti kapsamı dışındadır.",
  "Isıcam Yetkili Üreticisi'nin Isıcam ünitelerinin basınç, yükseklik ve diğer coğrafi şartlara uygunluğunu sağlaması ve gerekli gördüğü ambalaj ve paketleme önlemlerini alabilmesi için cam talebinde bulunan müşterinin montajın yapılacağı yeri Isıcam Yetkili Üreticisi'ne yazılı olarak bildirmesi gerekmektedir. Montajın yapılacağı yerin yazılı bildirilmemesi durumunda yukarıdaki nedenlerden kaynaklanan hatalar garanti kapsamı dışındadır.",
  "Isıcam üniteleri \"TS EN 1279 Cam - Binalarda Kullanılan - Cam Yalıtım Birimleri Standardı\"na göre üretilir ve kalite kontrolü bu standarda göre yapılır. Isıcam ünitesindeki hatalar bu standartlar kapsamında değerlendirilir. Söz konusu standartta belirtildiği gibi, Isıcam ünitelerinin dış yüzeyinde oluşan buğulanmalar hata olarak değerlendirilmez.",
  "Standart ve garanti şartları ile ilgili detaylı bilgiler www.isicam.com.tr web sitesinde yer almaktadır."
];

function isicamVarmiKontrolEt(sepet1, sepet2) {
  const tumUrunler = [...(sepet1 || []), ...(sepet2 || [])];
  return tumUrunler.some(satir => {
    const metin = `${satir.urunAciklamasi || ""} ${satir.ozelAciklama || ""}`.toLocaleUpperCase("TR-TR");
    return metin.includes("ISICAM") || metin.includes("ÜÇLÜ ISICAM");
  });
}

function siradakiProformaNoGetir() {
  let sayac = localStorage.getItem("proforma_sayac");
  if (!sayac) {
    sayac = 1;
  } else {
    sayac = parseInt(sayac, 10);
  }

  const yil = new Date().getFullYear();
  const formatliSayac = sayac.toString().padStart(3, "0");
  const noMetni = `${yil}/${formatliSayac}`;

  localStorage.setItem("proforma_sayac", sayac + 1);
  return noMetni;
}

function ortakHeaderOlustur(logoSisecam, logoIso) {
  return {
    stack: [
      {
        columns: [
          {
            stack: [
              {
                text: [
                  { text: 'KARATAŞ', fontSize: 26, color: '#222222' },
                  { text: 'CAM', fontSize: 26, bold: true, color: '#222222' }
                ]
              },
              { text: 'KARATAŞ AYNA KRİSTAL CAM MOB. İNŞ. TUR. NAK. MET. SAN. VE TİC. LTD. ŞTİ.', fontSize: 8, margin: [0, 4, 0, 0] }
            ],
            alignment: 'left',
            margin: [0, 5, 0, 0]
          },
          {
            columns: [
              logoSisecam ? { image: logoSisecam, width: 50, margin: [0, 10, 10, 0] } : null,
              logoIso ? { image: logoIso, width: 75, margin: [0, 0, 0, 0] } : null
            ].filter(Boolean),
            width: 'auto',
            alignment: 'right'
          }
        ]
      },
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }], margin: [0, 8, 0, 0] }
    ],
    margin: [40, 20, 40, 0]
  };
}

const ORTAK_FOOTER = {
  stack: [
    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }], margin: [0, 0, 0, 5] },
    { text: "Çalım Caddesi No : 19 Siteler - Altındağ / ANKARA   •   Tel : 0312. 348 91 62 (Pbx)   •   Fax : 0312. 348 70 78", fontSize: 8, alignment: "center" },
    { text: "web: www.karatascam.com.tr   •   e-mail: info@karatascam.com.tr   •   Mersis No: 0522 0626 2270 0015", fontSize: 8, alignment: "center" },
  ],
  margin: [40, 0, 40, 20],
};

async function sepetGorselleriniHazirla(sepet) {
  if (!sepet || sepet.length === 0) return [];
  return Promise.all(
    sepet.map(async (satir) => {
      if (!satir.gorsel) return satir;
      const temizGorsel = await gorseliHazirla(satir.gorsel, 700);
      return { ...satir, gorsel: temizGorsel || satir.gorsel };
    })
  );
}

function sepetIcerikOlustur(sepet, baslikMetni, teklif) {
  if (!sepet || sepet.length === 0) return [];

  const ihracatMi = teklif?.ihracatMi || teklif?.kdvMuaf || sepet.some(s => Number(s.kdvOrani) === 0);

  const urunSatirlari = sepet.map((satir) => {
    let baslik = satir.urunAciklamasi || "ÖZEL CAM ÜRÜNÜ";
    
    const enVal = satir.en || satir.hamVeri?.en || 0;
    const boyVal = satir.boy || satir.hamVeri?.boy || 0;
    const adetVal = satir.orijinalMiktar !== undefined && satir.orijinalMiktar !== null ? satir.orijinalMiktar : (satir.adet || satir.hamVeri?.miktar || 1);
    const m2Val = satir.miktar || 0;

    let temizAciklama = satir.ozelAciklama || "";
    if (!temizAciklama || temizAciklama.includes("{boy}")) {
      if (enVal > 0 && boyVal > 0) {
        temizAciklama = `(${enVal}×${boyVal} mm - ${adetVal} Adet - Toplam: ${m2Val.toFixed(2)} m²)`;
      } else {
        temizAciklama = `(${adetVal} Adet - Toplam: ${m2Val.toFixed(2)} m²)`;
      }
    }

    const elemanlar = [
      { text: baslik, bold: true, fontSize: 10, color: '#0f2942', margin: [0, 6, 0, 2] },
      { text: temizAciklama, fontSize: 9, color: '#333333', margin: [0, 0, 0, 4] }
    ];

    if (satir.gorsel) {
      elemanlar.push({
        image: satir.gorsel,
        fit: [130, 90], // Teklif sayfasında taşmayı önleyen sınırlandırma
        margin: [0, 4, 0, 6]
      });
    }

    elemanlar.push({
      text: `${satir.miktarDetay}   =   ${paraFormatla(satir.toplamTutar, satir.paraBirimi)}${ihracatMi ? "" : " + KDV"}`,
      alignment: "right",
      fontSize: 10,
      margin: [0, 0, 0, 8],
    });

    return {
      stack: elemanlar,
      unbreakable: true
    };
  });

  const genelToplamlar = genelToplamHesapla(sepet);
  const genelKdvler = genelKdvHesapla(sepet); 

  const genelToplamSatirlari = Object.entries(genelToplamlar).map(([paraBirimi, tutar]) => {
    const kdvOrani = ihracatMi ? 0 : (sepet[0]?.kdvOrani !== undefined ? Number(sepet[0].kdvOrani) : 20);
    const kdvTutar = ihracatMi ? 0 : (genelKdvler[paraBirimi] || 0);
    const genelToplam = tutar + kdvTutar;

    return [
      {
        canvas: [{ type: 'line', x1: 250, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#cccccc' }],
        margin: [0, 2, 0, 4],
        unbreakable: true
      },
      {
        text: `TOPLAM : ${paraFormatla(tutar, paraBirimi)}`,
        bold: true, fontSize: 10.5, alignment: "right", margin: [0, 0, 0, 2], unbreakable: true
      },
      {
        text: `KDV %${kdvOrani} : ${paraFormatla(kdvTutar, paraBirimi)}`,
        bold: true, fontSize: 10.5, alignment: "right", margin: [0, 0, 0, 2], unbreakable: true
      },
      {
        text: `GENEL TOPLAM : ${paraFormatla(genelToplam, paraBirimi)}`,
        bold: true, fontSize: 11, alignment: "right", margin: [0, 0, 0, 8], color: '#0f2942', unbreakable: true
      }
    ];
  }).flat();

  if (!baslikMetni) {
    return [...urunSatirlari, ...genelToplamSatirlari];
  }

  return [
    { text: baslikMetni, bold: true, fontSize: 11, color: '#0f2942', margin: [0, 8, 0, 4] },
    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#0f2942' }], margin: [0, 0, 0, 6] },
    ...urunSatirlari,
    ...genelToplamSatirlari
  ];
}

export async function teklifPdfIndir(teklif, sepet1, sepet2 = [], teklifNo, onizlemeMi = false) {
  const logoSisecam = await gorseliBase64eCevir("/sisecam.png");
  const logoIso = await gorseliBase64eCevir("/birinci-logo.jpg");

  const [temizSepet1, temizSepet2] = await Promise.all([
    sepetGorselleriniHazirla(sepet1),
    sepetGorselleriniHazirla(sepet2),
  ]);

  const imzalayanKisi = teklif.imzalayan || "Sercan Temel";
  const bankaIban = "TR26 0006 4000 0014 2210 2141 37";
  
  const isicamVar = isicamVarmiKontrolEt(sepet1, sepet2);
  const dinamikSartlar = isicamVar 
    ? [...SOZLESME_SARTLARI, ...ISICAM_GARANTI_SARTLARI] 
    : SOZLESME_SARTLARI;

  const ikiliMi = temizSepet2 && temizSepet2.length > 0;

  const birinciSecenekIcerik = sepetIcerikOlustur(temizSepet1, ikiliMi ? "1. SEÇENEK" : null, teklif);
  const ikinciSecenekIcerik = ikiliMi ? sepetIcerikOlustur(temizSepet2, "2. SEÇENEK", teklif) : [];

  const tarihYazisi = teklif.tarih ? new Date(teklif.tarih).toLocaleDateString("tr-TR") : new Date().toLocaleDateString("tr-TR");
  const belgeNo = teklif.teklifNo || teklifNo || siradakiProformaNoGetir(); 

  const bankaStack = [
    { text: 'İŞBANKASI / SİTELER ŞUBESİ', bold: true, fontSize: 9.5, margin: [0, 0, 0, 2] },
    { text: `IBAN NO : ${bankaIban}`, fontSize: 9.5, margin: [0, 0, 0, 2] }
  ];

  if (teklif.odemeSekli && teklif.odemeSekli.trim() !== "") {
    bankaStack.unshift({ 
      text: `ÖDEME ŞEKLİ : ${teklif.odemeSekli}`, 
      bold: true, 
      fontSize: 9.5, 
      color: '#0f2942', 
      margin: [0, 0, 0, 2] 
    });
  }

  const docDefinition = {
    pageMargins: [40, 95, 40, 55],
    header: ortakHeaderOlustur(logoSisecam, logoIso),
    footer: ORTAK_FOOTER,
    content: [
      { text: "FİYAT TEKLİFİ.", fontSize: 9.5, margin: [0, 0, 0, 2] },
      {
        columns: [
          {
            stack: [
              { text: teklif.musteriAdi, fontSize: 9.5, bold: true },
              { 
                text: (!teklif.ilgiliKisi || teklif.ilgiliKisi.includes("Sn.")) ? teklif.ilgiliKisi : `Sn. ${teklif.ilgiliKisi} Dikkatine,`, 
                fontSize: 9.5, 
                margin: [0, 2, 0, 8] 
              },
              { text: `Proje Adı: ${teklif.projeAdi}`, bold: true, fontSize: 10 }
            ],
            alignment: 'left'
          },
          {
            stack: [
              { text: `Tarih: ${tarihYazisi}`, fontSize: 9.5 },
              { text: `No: ${belgeNo}`, fontSize: 9.5, bold: true },
              teklif.siparisNo ? { text: `Sipariş No: ${teklif.siparisNo}`, fontSize: 9.5, bold: true, color: '#000000', margin: [0, 2, 0, 0] } : null
            ].filter(Boolean),
            alignment: 'right'
          }
        ],
        margin: [0, 6, 0, 14]
      },
      { text: "İhtiyacınız olan ürünlere ilişkin teklifimiz aşağıdaki gibidir:", fontSize: 9.5, margin: [0, 0, 0, 8] },
      
      ...birinciSecenekIcerik,
      ...ikinciSecenekIcerik,
      
      ...(teklif.notlar ? teklif.notlar.split('\n').map((satir) => ({
        text: `* ${satir}`,
        fontSize: 8.5,
        margin: [2, 4, 0, 1],
      })) : []),
      
      {
        columns: [
          {
            stack: bankaStack,
            alignment: 'left'
          },
          {
            stack: [
              { text: 'Saygılarımla,', italics: true, fontSize: 10, margin: [0, 0, 0, 1] },
              { text: `${imzalayanKisi}`, bold: true, fontSize: 10 }
            ],
            alignment: 'right'
          }
        ],
        margin: [0, 10, 0, 10],
        unbreakable: true
      },
      
      { text: "Almış olduğunuz teklifin teyidi için mutlaka onay veriniz.", bold: true, fontSize: 9.5 },
      { text: "Firma ismi ve kaşesi / Onayı / Özel notlar", fontSize: 9.5, margin: [0, 0, 0, 50] },
      
      {
        stack: dinamikSartlar.map(sart => ({
          text: sart,
          fontSize: isicamVar ? 7 : 7.5,
          margin: [0, 0, 0, 1.5]
        })),
        margin: [0, 0, 0, 0]
      }
    ],
    defaultStyle: { font: "Roboto" },
  };

  const temizMusteri = (teklif.musteriAdi || "Yeni").replace(/[^a-zA-Z0-9çÇğĞıİöÖşŞüÜ]/g, "_");
  const temizProje = (teklif.projeAdi || "Proje").replace(/[^a-zA-Z0-9çÇğĞıİöÖşŞüÜ]/g, "_");
  const dosyaAdi = `Karatascam_Teklif_${temizMusteri}_${temizProje}_${belgeNo}.pdf`;

  const pdfDoc = pdfMake.createPdf(docDefinition);
  if (onizlemeMi) {
    pdfDoc.open({ filename: dosyaAdi });
  } else {
    pdfDoc.download(dosyaAdi);
  }
}

function proformaTabloOlustur(sepet, baslikMetni, teklif) {
  if (!sepet || sepet.length === 0) return { tabloGövdesi: [], yalnizMetni: "", aciklamaSutunuGerekli: false };

  const ihracatMi = teklif?.ihracatMi || teklif?.kdvMuaf || sepet.some(s => Number(s.kdvOrani) === 0);

  // --- DİNAMİK AÇIKLAMA SÜTUNU KONTROLÜ ---
  let aciklamaSutunuGerekli = false;
  
  sepet.forEach(satir => {
    let safAciklama = (satir.hamVeri && satir.hamVeri.ozelAciklama) ? satir.hamVeri.ozelAciklama : (satir.ozelAciklama || "");
    
    safAciklama = safAciklama.replace(/\(.*?Toplam:.*?m²\)/gi, "");
    safAciklama = safAciklama.replace(/\(.*?Adet.*?m²\)/gi, "");
    safAciklama = safAciklama.replace(/\(.*?×.*?mm.*?\)/gi, "");
    safAciklama = safAciklama.replace(/\(\d+\s*Adet\)/gi, "");
    safAciklama = safAciklama.replace(/^\|\s*/g, "").replace(/\s*\|\s*$/g, ""); 
    safAciklama = safAciklama.trim();
    
    if (safAciklama.length > 0 || satir.gorsel) {
      aciklamaSutunuGerekli = true;
    }
    satir._safAciklama = safAciklama;
  });

  const headerRow = [
    { text: 'POZ NO', bold: true, fontSize: 8.5, fillColor: '#eeeeee', margin: [2, 4, 2, 4], alignment: 'center' },
    { text: baslikMetni ? `${baslikMetni} - MALIN CİNSİ` : 'MALIN CİNSİ', bold: true, fontSize: 8.5, fillColor: '#eeeeee', margin: [4, 4, 0, 4], alignment: 'left' }
  ];

  if (aciklamaSutunuGerekli) {
    headerRow.push({ text: 'AÇIKLAMA & ÇİZİM', bold: true, fontSize: 8.5, fillColor: '#eeeeee', margin: [4, 4, 0, 4], alignment: 'left' });
  }

  headerRow.push(
    { text: 'EN', bold: true, fontSize: 8.5, fillColor: '#eeeeee', margin: [2, 4, 2, 4], alignment: 'center' },
    { text: 'BOY', bold: true, fontSize: 8.5, fillColor: '#eeeeee', margin: [2, 4, 2, 4], alignment: 'center' },
    { text: 'ADET / m²', bold: true, fontSize: 8.5, fillColor: '#eeeeee', margin: [2, 4, 2, 4], alignment: 'center' },
    { text: 'BİRİM FİYAT', bold: true, fontSize: 8.5, fillColor: '#eeeeee', margin: [2, 4, 2, 4], alignment: 'center' },
    { text: 'KDV', bold: true, fontSize: 8.5, fillColor: '#eeeeee', margin: [2, 4, 2, 4], alignment: 'center' },
    { text: 'TUTAR', bold: true, fontSize: 8.5, fillColor: '#eeeeee', margin: [2, 4, 2, 4], alignment: 'center' }
  );

  const tabloGövdesi = [headerRow];

  sepet.forEach(satir => {
    let birimFiyatMetni = "-";
    if (satir.miktarDetay && satir.miktarDetay.includes(" x ")) {
      const parcalar = satir.miktarDetay.split(" x ");
      if (parcalar[1]) {
        birimFiyatMetni = parcalar[1].trim();
      }
    } else if (satir.birimFiyat) {
      birimFiyatMetni = paraFormatla(satir.birimFiyat, satir.paraBirimi);
    }

    const pozNo = satir.pozNo || "-";
    let malinCinsi = satir.urunAciklamasi || "ÖZEL CAM ÜRÜNÜ";
    
    const enVal = satir.en || satir.hamVeri?.en || 0;
    const boyVal = satir.boy || satir.hamVeri?.boy || 0;
    const adetVal = satir.orijinalMiktar !== undefined && satir.orijinalMiktar !== null ? satir.orijinalMiktar : (satir.adet || satir.hamVeri?.miktar || 1);
    const m2Val = satir.miktar || 0;

    const kullaniciAciklamasi = satir._safAciklama || "";

    const malinCinsiStack = [
      { text: malinCinsi, bold: true, fontSize: 10, color: '#0f2942', margin: [0, 0, 0, 2] }
    ];

    const aciklamaStack = [];

    if (aciklamaSutunuGerekli) {
      if (kullaniciAciklamasi) {
         aciklamaStack.push({ text: kullaniciAciklamasi, fontSize: 8.5, color: '#333333', margin: [0, 0, 0, 2] });
      }
      if (satir.gorsel) {
         aciklamaStack.push({ 
           image: satir.gorsel, 
           fit: [100, 75], // Proforma tablosunda hücre içine düzgün hizalama
           alignment: 'center', 
           margin: [0, 2, 0, 2] 
         });
      }
    }

    const enDegeri = (enVal > 0) ? `${enVal}` : "-";
    const boyDegeri = (boyVal > 0) ? `${boyVal}` : "-";
    
    const adetMetni = (adetVal !== null && adetVal !== undefined && adetVal !== "") 
      ? `${adetVal} Adet\n(${m2Val.toFixed(2)} m²)` 
      : "-";

    const satirKdvOrani = ihracatMi ? 0 : (satir.kdvOrani !== undefined ? Number(satir.kdvOrani) : 20);

    const dataRow = [
      { text: pozNo, fontSize: 8, alignment: 'center', margin: [2, 4, 2, 4] },
      { stack: malinCinsiStack, margin: [4, 4, 0, 4], alignment: 'left' }
    ];

    if (aciklamaSutunuGerekli) {
      dataRow.push({ stack: aciklamaStack, margin: [4, 4, 0, 4], alignment: 'left' });
    }

    dataRow.push(
      { text: enDegeri, fontSize: 8, alignment: 'center', margin: [2, 4, 2, 4] },
      { text: boyDegeri, fontSize: 8, alignment: 'center', margin: [2, 4, 2, 4] },
      { text: adetMetni, fontSize: 7.5, alignment: 'center', margin: [2, 4, 2, 4] },
      { text: birimFiyatMetni, fontSize: 8, alignment: 'center', margin: [2, 4, 2, 4] },
      { text: `%${satirKdvOrani}`, fontSize: 8, alignment: 'center', margin: [2, 4, 2, 4] },
      { text: `${paraFormatla(satir.toplamTutar, satir.paraBirimi)}`, fontSize: 8, alignment: 'right', margin: [2, 4, 4, 4] }
    );

    tabloGövdesi.push(dataRow);
  });

  const genelToplamlar = genelToplamHesapla(sepet);
  const genelKdvler = genelKdvHesapla(sepet); 
  const kdvOrani = ihracatMi ? 0 : (sepet[0]?.kdvOrani !== undefined ? Number(sepet[0].kdvOrani) : 20);
  
  let yalnizMetni = "";
  const colSpanCount = aciklamaSutunuGerekli ? 7 : 6; 

  Object.entries(genelToplamlar).forEach(([paraBirimi, tutar]) => {
    const kdvTutar = ihracatMi ? 0 : (genelKdvler[paraBirimi] || 0);
    const genelToplam = tutar + kdvTutar;

    if (yalnizMetni !== "") yalnizMetni += " + ";
    yalnizMetni += sayiyiYaziyaCevir(genelToplam, paraBirimi);

    tabloGövdesi.push(
      [
        { text: `TOPLAM`, colSpan: colSpanCount, alignment: 'right', bold: true, fontSize: 10, margin: [0, 4, 8, 4], fillColor: '#f5f5f5' },
        ...Array(colSpanCount - 1).fill({}),
        { text: paraFormatla(tutar, paraBirimi), colSpan: 2, alignment: 'right', bold: true, fontSize: 10, margin: [0, 4, 4, 4], fillColor: '#f5f5f5' },
        {}
      ],
      [
        { text: `KDV %${kdvOrani}`, colSpan: colSpanCount, alignment: 'right', bold: true, fontSize: 10, margin: [0, 4, 8, 4], fillColor: '#f5f5f5' },
        ...Array(colSpanCount - 1).fill({}),
        { text: paraFormatla(kdvTutar, paraBirimi), colSpan: 2, alignment: 'right', bold: true, fontSize: 10, margin: [0, 4, 4, 4], fillColor: '#f5f5f5' },
        {}
      ],
      [
        { text: `GENEL TOPLAM`, colSpan: colSpanCount, alignment: 'right', bold: true, fontSize: 11, margin: [0, 4, 8, 4], fillColor: '#e0e0e0' },
        ...Array(colSpanCount - 1).fill({}),
        { text: paraFormatla(genelToplam, paraBirimi), colSpan: 2, alignment: 'right', bold: true, fontSize: 11, margin: [0, 4, 4, 4], fillColor: '#e0e0e0' },
        {}
      ]
    );
  });

  return { tabloGövdesi, yalnizMetni, aciklamaSutunuGerekli };
}

export async function proformaPdfIndir(teklif, sepet1, sepet2 = [], teklifNo, onizlemeMi = false) {
  const logoSisecam = await gorseliBase64eCevir("/sisecam.png");
  const logoIso = await gorseliBase64eCevir("/birinci-logo.jpg");

  const [temizSepet1, temizSepet2] = await Promise.all([
    sepetGorselleriniHazirla(sepet1),
    sepetGorselleriniHazirla(sepet2),
  ]);
  
  const imzalayanKisi = teklif.imzalayan || "Sercan Temel";
  const bankaIban = "TR26 0006 4000 0014 2210 2141 37";
  
  const isicamVar = isicamVarmiKontrolEt(sepet1, sepet2);
  const dinamikSartlar = isicamVar 
    ? [...SOZLESME_SARTLARI, ...ISICAM_GARANTI_SARTLARI] 
    : SOZLESME_SARTLARI;

  const tarihYazisi = teklif.tarih ? new Date(teklif.tarih).toLocaleDateString("tr-TR") : new Date().toLocaleDateString("tr-TR");
  const belgeNo = teklif.teklifNo || teklifNo || siradakiProformaNoGetir(); 

  const ikiliMi = temizSepet2 && temizSepet2.length > 0;

  const sonuc1 = proformaTabloOlustur(temizSepet1, ikiliMi ? "1. SEÇENEK" : null, teklif);
  const sonuc2 = ikiliMi ? proformaTabloOlustur(temizSepet2, "2. Seçenek", teklif) : null;

  let kisi = (teklif.ilgiliKisi || "").toLocaleUpperCase("tr-TR");
  kisi = kisi.replace(/DİKKATİNE/g, "").replace(/[,;]/g, "").trim();
  if (kisi && !kisi.startsWith("SN.") && !kisi.startsWith("SN ")) {
    kisi = `Sn. ${kisi}`;
  }
  const dikkatineSatiri = kisi ? `${kisi} Dikkatine;` : "";

  const bankaStack = [
    { text: 'İŞBANKASI / SİTELER ŞUBESİ', bold: true, fontSize: 9.5, margin: [0, 0, 0, 2] },
    { text: `IBAN NO : ${bankaIban}`, fontSize: 9.5, margin: [0, 0, 0, 2] }
  ];

  if (teklif.odemeSekli && teklif.odemeSekli.trim() !== "") {
    bankaStack.unshift({ 
      text: `ÖDEME ŞEKLİ : ${teklif.odemeSekli}`, 
      bold: true, 
      fontSize: 9.5, 
      color: '#0f2942', 
      margin: [0, 0, 0, 2] 
    });
  }

  // --- SÜTUN GENİŞLİKLERİ (Açıklama & Çizim sütunu 110 piksele çıkarıldı) ---
  const widths1 = sonuc1.aciklamaSutunuGerekli 
    ? [30, '*', 110, 28, 28, 38, 45, 25, 70] 
    : [35, '*', 35, 35, 45, 55, 30, 78];

  const icerikDizisi = [
    {
      columns: [
        {
          stack: [
            { text: teklif.musteriAdi || "", fontSize: 9.5, bold: true }, 
            { text: `Proje Adı: ${teklif.projeAdi || ""}`, bold: true, fontSize: 9.5, margin: [0, 2, 0, 0] }
          ],
          alignment: 'left'
        },
        {
          stack: [
            { text: `Tarih: ${tarihYazisi}`, fontSize: 9.5 },
            { text: `No: ${belgeNo}`, fontSize: 9.5, bold: true },
            teklif.siparisNo ? { text: `Sipariş No: ${teklif.siparisNo}`, fontSize: 9.5, bold: true, color: '#000000', margin: [0, 2, 0, 0] } : null
          ].filter(Boolean),
          alignment: 'right'
        }
      ],
      margin: [0, 6, 0, 14]
    },
    { text: "PROFORMA FATURA", style: "header", alignment: "center", bold: true, fontSize: 13, margin: [0, 0, 0, 14] },
    { text: dikkatineSatiri, bold: true, fontSize: 9.5, margin: [0, 0, 0, 8] },
    
    {
      table: {
        headerRows: 1,
        dontBreakRows: true,
        widths: widths1,
        body: sonuc1.tabloGövdesi
      },
      layout: {
        hLineWidth: function (i, node) { return 0.5; },
        vLineWidth: function (i, node) { return 0.5; },
        hLineColor: function (i, node) { return '#cccccc'; },
        vLineColor: function (i, node) { return '#cccccc'; },
      }
    },
    { text: [ {text: ikiliMi ? 'YALNIZ (1. Seçenek): ' : 'YALNIZ: ', bold: true}, `${sonuc1.yalnizMetni}.` ], fontSize: 9, alignment: 'right', margin: [0, 4, 0, 14] }
  ];

  if (sonuc2 && temizSepet2.length > 0) {
    const widths2 = sonuc2.aciklamaSutunuGerekli 
      ? [30, '*', 110, 28, 28, 38, 45, 25, 70] 
      : [35, '*', 35, 35, 45, 55, 30, 78];

    icerikDizisi.push(
      { text: "", margin: [0, 6, 0, 6] },
      {
        table: {
          headerRows: 1,
          dontBreakRows: true,
          widths: widths2, 
          body: sonuc2.tabloGövdesi
        },
        layout: {
          hLineWidth: function (i, node) { return 0.5; },
          vLineWidth: function (i, node) { return 0.5; },
          hLineColor: function (i, node) { return '#cccccc'; },
          vLineColor: function (i, node) { return '#cccccc'; },
        }
      },
      { text: [ {text: 'YALNIZ (2. Seçenek): ', bold: true}, `${sonuc2.yalnizMetni}.` ], fontSize: 9, alignment: 'right', margin: [0, 4, 0, 14] }
    );
  }

  icerikDizisi.push(
    ...(teklif.notlar ? teklif.notlar.split('\n').map((satir) => ({
      text: `* ${satir}`,
      fontSize: 8.5,
      margin: [2, 4, 0, 1],
    })) : []),
    {
      columns: [
        {
          stack: bankaStack,
          alignment: 'left'
        },
        {
          stack: [
            { text: 'Saygılarımla,', italics: true, fontSize: 10, margin: [0, 0, 0, 1] },
            { text: `${imzalayanKisi}`, bold: true, fontSize: 10 }
          ],
          alignment: 'right'
        }
      ],
      margin: [0, 8, 0, 10],
      unbreakable: true
    },
    { text: "Almış olduğunuz teklifin teyidi için mutlaka onay veriniz.", bold: true, fontSize: 9.5 },
    { text: "Firma ismi ve kaşesi / Onayı / Özel notlar", fontSize: 9.5, margin: [0, 0, 0, 50] },
    {
      stack: dinamikSartlar.map(sart => ({
        text: sart,
        fontSize: isicamVar ? 7 : 7.5,
        margin: [0, 0, 0, 1.5]
      })),
      margin: [0, 0, 0, 0]
    }
  );

  const docDefinition = {
    pageMargins: [40, 95, 40, 55],
    header: ortakHeaderOlustur(logoSisecam, logoIso),
    footer: ORTAK_FOOTER,
    content: icerikDizisi,
    defaultStyle: { font: "Roboto" },
  };

  const temizMusteri = (teklif.musteriAdi || "Yeni").replace(/[^a-zA-Z0-9çÇğĞıİöÖşŞüÜ]/g, "_");
  const temizProje = (teklif.projeAdi || "Proje").replace(/[^a-zA-Z0-9çÇğĞıİöÖşŞüÜ]/g, "_");
  const dosyaAdi = `Proforma_Fatura_${temizMusteri}_${temizProje}_${belgeNo}.pdf`;

  const pdfDoc = pdfMake.createPdf(docDefinition);
  if (onizlemeMi) {
    pdfDoc.open({ filename: dosyaAdi });
  } else {
    pdfDoc.download(dosyaAdi);
  }
}