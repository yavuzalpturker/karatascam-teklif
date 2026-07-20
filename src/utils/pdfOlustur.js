import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { paraFormatla, genelToplamHesapla, genelKdvHesapla, sayiyiYaziyaCevir } from "./hesaplama";
import { supabase } from "../lib/supabaseClient";

pdfMake.vfs = pdfFonts?.pdfMake?.vfs || pdfFonts?.vfs || pdfFonts?.default?.pdfMake?.vfs || pdfFonts?.default?.vfs;

async function gorseliBase64eCevir(yol) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const safPng = canvas.toDataURL('image/png');
        resolve(safPng);
      } catch (e) {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = yol;
  });
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

// ==========================================
// 1. DÜZ METİN TEKLİF PDF'İ
// ==========================================
export async function teklifPdfIndir(teklif, sepet, teklifNo, onizlemeMi = false) {
  const logoSisecam = await gorseliBase64eCevir("/sisecam.png");
  const logoIso = await gorseliBase64eCevir("/birinci-logo.jpg");

  const { data: ayarlar } = await supabase.from('ayarlar').select('*').eq('id', 1).single();
  const imzalayanKisi = teklif.imzalayan || ayarlar?.imzalayan || "Sercan Temel";
  const dinamikSartlar = ayarlar?.sartlar ? ayarlar.sartlar.split('\n').filter(s => s.trim() !== '') : SOZLESME_SARTLARI;

  const urunSatirlari = sepet.flatMap((satir) => {
    let baslik = satir.urunAciklamasi;
    if (satir.ozelAciklama && satir.ozelAciklama.trim() !== "" && satir.ozelAciklama.trim() !== satir.urunAciklamasi) {
      baslik += ` - ${satir.ozelAciklama}`;
    }

    return [
      { text: baslik, bold: true, margin: [0, 6, 0, 2] },
      {
        text: `${satir.miktarDetay}  =  ${paraFormatla(satir.toplamTutar, satir.paraBirimi)} + KDV`,
        alignment: "right",
        margin: [0, 0, 0, 4],
      },
    ];
  });

  const genelToplamlar = genelToplamHesapla(sepet);
  const genelKdvler = genelKdvHesapla(sepet); 

  const genelToplamSatirlari = Object.entries(genelToplamlar).map(([paraBirimi, tutar]) => {
    const kdvTutar = genelKdvler[paraBirimi] || 0;
    const kdvDahilToplam = tutar + kdvTutar;

    return [
      {
        text: `GENEL TOPLAM (${paraBirimi}) : ${paraFormatla(tutar, paraBirimi)} + KDV`,
        bold: true, fontSize: 11, alignment: "right", margin: [0, 4, 0, 2]
      },
      {
        text: `KDV DAHİL TOPLAM : ${paraFormatla(kdvDahilToplam, paraBirimi)}`,
        bold: true, fontSize: 12, alignment: "right", margin: [0, 0, 0, 8], color: '#333'
      }
    ];
  }).flat(); 

  const tarihYazisi = teklif.tarih.toLocaleDateString("tr-TR");
  const belgeNo = teklifNo || siradakiProformaNoGetir(); 

  const docDefinition = {
    pageMargins: [40, 100, 40, 60],
    header: ortakHeaderOlustur(logoSisecam, logoIso),
    footer: ORTAK_FOOTER,
    content: [
      { text: "FİYAT TEKLİFİ.", fontSize: 10, margin: [0, 0, 0, 2] },
      {
        columns: [
          {
            stack: [
              { text: teklif.musteriAdi, fontSize: 10, bold: true },
              { 
                text: (!teklif.ilgiliKisi || teklif.ilgiliKisi.includes("Sn.")) ? teklif.ilgiliKisi : `Sn. ${teklif.ilgiliKisi} Dikkatine,`, 
                fontSize: 10, 
                margin: [0, 2, 0, 10] 
              },
              { text: `Proje Adı: ${teklif.projeAdi}`, bold: true, fontSize: 11 }
            ],
            alignment: 'left'
          },
          {
            stack: [
              { text: `Tarih: ${tarihYazisi}`, fontSize: 10 },
              { text: `No: ${belgeNo}`, fontSize: 10 }
            ],
            alignment: 'right'
          }
        ],
        margin: [0, 10, 0, 20]
      },
      { text: "İhtiyacınız olan ürünlere ilişkin teklifimiz aşağıdaki gibidir:", fontSize: 10, margin: [0, 0, 0, 10] },
      ...urunSatirlari,
      ...genelToplamSatirlari,
      
      ...(teklif.notlar ? teklif.notlar.split('\n').map((satir) => ({
        text: `* ${satir}`,
        fontSize: 9,
        margin: [2, 0, 0, 2],
      })) : []),
      { 
        stack: [
          { text: "Saygılarımla,", italics: true, alignment: "right", margin: [0, 15, 0, 2] },
          { 
            text: `${imzalayanKisi}`, 
            bold: true, 
            alignment: "right", 
            margin: [0, 0, 0, 15] 
          }
        ]
      },
      
      { text: "Almış olduğunuz teklifin teyidi için mutlaka onay veriniz.", bold: true, fontSize: 10 },
      // KAŞE İÇİN GENİŞ BOŞLUK (MARGİN 70 YAPILDI)
      { text: "Firma ismi ve kaşesi / Onayı / Özel notlar", fontSize: 10, margin: [0, 0, 0, 70] },
      
      {
        stack: dinamikSartlar.map(sart => ({
          text: sart,
          fontSize: 8,
          margin: [0, 0, 0, 2]
        })),
        margin: [0, 0, 0, 0]
      }
    ],
    defaultStyle: { font: "Roboto" },
  };

  const dosyaAdi = `Karatascam_Teklif_${teklif.musteriAdi}.pdf`;
  
  const pdfDoc = pdfMake.createPdf(docDefinition);
  if (onizlemeMi) {
    pdfDoc.open();
  } else {
    pdfDoc.download(dosyaAdi);
  }
}

// ==========================================
// 2. TABLOLU PROFORMA FATURA PDF'İ
// ==========================================
export async function proformaPdfIndir(teklif, sepet, teklifNo, onizlemeMi = false) {
  const logoSisecam = await gorseliBase64eCevir("/sisecam.png");
  const logoIso = await gorseliBase64eCevir("/birinci-logo.jpg");
  
  const { data: ayarlar } = await supabase.from('ayarlar').select('*').eq('id', 1).single();
  const imzalayanKisi = teklif.imzalayan || ayarlar?.imzalayan || "Sercan Temel";
  const bankaIban = ayarlar?.iban || "TR26 0006 4000 0014 2210 2141 37";
  const dinamikSartlar = ayarlar?.sartlar ? ayarlar.sartlar.split('\n').filter(s => s.trim() !== '') : SOZLESME_SARTLARI;

  const tarihYazisi = teklif.tarih.toLocaleDateString("tr-TR");
  const belgeNo = teklifNo || siradakiProformaNoGetir(); 

  const tabloGövdesi = [
    [
      { text: 'MALIN CİNSİ', bold: true, fillColor: '#eeeeee', margin: [5, 5, 0, 5], alignment: 'left' },
      { text: 'AÇIKLAMA', bold: true, fillColor: '#eeeeee', margin: [5, 5, 0, 5], alignment: 'left' },
      { text: 'ADET / METRAJ', bold: true, fillColor: '#eeeeee', margin: [0, 5, 0, 5], alignment: 'center' },
      { text: 'BİRİM FİYAT', bold: true, fillColor: '#eeeeee', margin: [0, 5, 0, 5], alignment: 'center' },
      { text: 'KDV ORANI', bold: true, fillColor: '#eeeeee', margin: [0, 5, 0, 5], alignment: 'center' },
      { text: 'TUTAR', bold: true, fillColor: '#eeeeee', margin: [0, 5, 0, 5], alignment: 'center' }
    ]
  ];

  sepet.forEach(satir => {
    let miktarMetni = satir.miktarDetay;
    let birimFiyatMetni = "-";
    
    if (satir.miktarDetay && satir.miktarDetay.includes(" x ")) {
      const parcalar = satir.miktarDetay.split(" x ");
      miktarMetni = parcalar[0].trim();
      birimFiyatMetni = parcalar[1].trim();
    }

    tabloGövdesi.push([
      { text: satir.urunAciklamasi, fontSize: 9, margin: [5, 5, 0, 5], alignment: 'left' },
      { text: satir.ozelAciklama || "-", fontSize: 9, margin: [5, 5, 0, 5], alignment: 'left' },
      { text: miktarMetni, fontSize: 9, alignment: 'center', margin: [0, 5, 0, 5] },
      { text: birimFiyatMetni, fontSize: 9, alignment: 'center', margin: [0, 5, 0, 5] },
      { text: `% ${satir.kdvOrani}`, fontSize: 9, alignment: 'center', margin: [0, 5, 0, 5] },
      { text: `${paraFormatla(satir.toplamTutar, satir.paraBirimi)}`, fontSize: 9, alignment: 'right', margin: [0, 5, 5, 5] }
    ]);
  });

  const genelToplamlar = genelToplamHesapla(sepet);
  const genelKdvler = genelKdvHesapla(sepet);
  
  let yalnizMetni = "";

  Object.entries(genelToplamlar).forEach(([paraBirimi, tutar]) => {
    const kdvTutar = genelKdvler[paraBirimi] || 0;
    const genelToplam = tutar + kdvTutar;

    if (yalnizMetni !== "") yalnizMetni += " + ";
    yalnizMetni += sayiyiYaziyaCevir(genelToplam, paraBirimi);

    tabloGövdesi.push(
      [
        { text: '', colSpan: 4, border: [false, false, false, false] }, {}, {}, {}, 
        { text: `TOPLAM`, alignment: 'right', bold: true, margin: [0, 3, 5, 3], fillColor: '#f5f5f5' }, 
        { text: paraFormatla(tutar, paraBirimi), alignment: 'right', bold: true, margin: [0, 3, 5, 3], fillColor: '#f5f5f5' }
      ],
      [
        { text: '', colSpan: 4, border: [false, false, false, false] }, {}, {}, {}, 
        { text: `KDV %20`, alignment: 'right', bold: true, margin: [0, 3, 5, 3], fillColor: '#f5f5f5' }, 
        { text: paraFormatla(kdvTutar, paraBirimi), alignment: 'right', bold: true, margin: [0, 3, 5, 3], fillColor: '#f5f5f5' }
      ],
      [
        { text: '', colSpan: 4, border: [false, false, false, false] }, {}, {}, {}, 
        { text: `GENEL TOPLAM`, alignment: 'right', bold: true, margin: [0, 3, 5, 3], fillColor: '#e0e0e0' }, 
        { text: paraFormatla(genelToplam, paraBirimi), alignment: 'right', bold: true, margin: [0, 3, 5, 3], fillColor: '#e0e0e0' }
      ]
    );
  });

  if (!yalnizMetni) yalnizMetni = "sıfır";

  let kisi = (teklif.ilgiliKisi || "").toLocaleUpperCase("tr-TR");
  kisi = kisi.replace(/DİKKATİNE/g, "").replace(/[,;]/g, "").trim();
  
  if (kisi && !kisi.startsWith("SN.") && !kisi.startsWith("SN ")) {
    kisi = `Sn. ${kisi}`;
  }
  
  const dikkatineSatiri = kisi ? `${kisi} Dikkatine;` : "";

  const docDefinition = {
    pageMargins: [40, 100, 40, 60],
    header: ortakHeaderOlustur(logoSisecam, logoIso),
    footer: ORTAK_FOOTER,
    content: [
      {
        columns: [
          { text: `Proje Adı: ${teklif.projeAdi || ""}`, bold: true, fontSize: 10, alignment: 'left' },
          {
            stack: [
              { text: `Tarih: ${tarihYazisi}`, fontSize: 10 },
              { text: `No: ${belgeNo}`, fontSize: 10 }
            ],
            alignment: 'right'
          }
        ],
        margin: [0, 10, 0, 20]
      },
      { text: "PROFORMA FATURA", style: "header", alignment: "center", bold: true, fontSize: 14, margin: [0, 0, 0, 20] },
      { text: dikkatineSatiri, bold: true, fontSize: 10, margin: [0, 0, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*', 'auto', 'auto', 'auto', 'auto'],
          body: tabloGövdesi
        },
        layout: {
          hLineWidth: function (i, node) { return 1; },
          vLineWidth: function (i, node) { return 1; },
          hLineColor: function (i, node) { return '#aaaaaa'; },
          vLineColor: function (i, node) { return '#aaaaaa'; },
        }
      },
      
      { text: [ {text: 'YALNIZ: ', bold: true}, `${yalnizMetni}.` ], fontSize: 10, alignment: 'right', margin: [0, 4, 0, 20] },
      
      {
        columns: [
          {
            stack: [
              { text: 'İŞBANKASI / SİTELER ŞUBESİ', bold: true, fontSize: 10, margin: [0, 0, 0, 5] },
              { text: `IBAN NO : ${bankaIban}`, fontSize: 10 }
            ],
            alignment: 'left'
          },
          {
            stack: [
              { text: 'Saygılarımla,', italics: true, fontSize: 11, margin: [0, 0, 0, 2] },
              { text: `${imzalayanKisi}`, bold: true, fontSize: 11 }
            ],
            alignment: 'right'
          }
        ],
        margin: [0, 10, 0, 15]
      },
      { text: "Almış olduğunuz teklifin teyidi için mutlaka onay veriniz.", bold: true, fontSize: 10 },
      // KAŞE İÇİN GENİŞ BOŞLUK (MARGİN 70 YAPILDI)
      { text: "Firma ismi ve kaşesi / Onayı / Özel notlar", fontSize: 10, margin: [0, 0, 0, 70] },
      
      {
        stack: dinamikSartlar.map(sart => ({
          text: sart,
          fontSize: 8,
          margin: [0, 0, 0, 2]
        })),
        margin: [0, 0, 0, 0]
      }
    ],
    defaultStyle: { font: "Roboto" },
  };

  const dosyaAdi = `Proforma_Fatura_${teklif.musteriAdi}.pdf`;
  
  const pdfDoc = pdfMake.createPdf(docDefinition);
  if (onizlemeMi) {
    pdfDoc.open();
  } else {
    pdfDoc.download(dosyaAdi);
  }
}