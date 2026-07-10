import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { paraFormatla, genelToplamHesapla, genelKdvHesapla, sayiyiYaziyaCevir } from "./hesaplama";

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

const ortakFooter = {
  stack: [
    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }], margin: [0, 0, 0, 5] },
    { text: "Karataş Ayna Kristal Cam İns.Lim.Şti. / Çalım Sok No:19 SİTELER ANKARA", fontSize: 8, alignment: "left" },
    { text: "TEL: 0 312 348 9162  FAX: 0 312 348 70 78", fontSize: 8, alignment: "left" },
    { text: "www.karatascam.com.tr  |  info@karatascam.com.tr", fontSize: 8, alignment: "left" },
  ],
  margin: [40, 0, 40, 20],
};

// ==========================================
// 1. DÜZ METİN TEKLİF PDF'İ
// ==========================================
export async function teklifPdfIndir(teklif, sepet) {
  const logo1 = await gorseliBase64eCevir("/logo1.png");
  const logo2 = await gorseliBase64eCevir("/logo2.png");

  const urunSatirlari = sepet.flatMap((satir) => {
    // DEĞİŞİKLİK: Sabit ölçü yerine elle girilen özel açıklamayı parantez içinde ekliyoruz
    const aciklamaEki = satir.ozelAciklama ? ` (${satir.ozelAciklama})` : "";
    return [
      { text: satir.urunAciklamasi + aciklamaEki, bold: true, margin: [0, 6, 0, 2] },
      {
        text: `${satir.miktarDetay}  =  ${paraFormatla(satir.toplamTutar, satir.paraBirimi)} + KDV`,
        alignment: "right",
        margin: [0, 0, 0, 4],
      },
    ];
  });

  const genelToplamlar = genelToplamHesapla(sepet);
  const genelKdvler = genelKdvHesapla(sepet);

  const genelToplamSatirlari = Object.entries(genelToplamlar).map(([paraBirimi, tutar]) => ({
    text: `GENEL TOPLAM (${paraBirimi}) : ${paraFormatla(tutar, paraBirimi)} + KDV`,
    bold: true,
    fontSize: 12,
    alignment: "right",
    margin: [0, 4, 0, 4],
  }));

  let yalnizMetni = "";
  Object.entries(genelToplamlar).forEach(([paraBirimi, tutar]) => {
    const kdvTutar = genelKdvler[paraBirimi] || 0;
    const genelToplam = tutar + kdvTutar;
    if (yalnizMetni !== "") yalnizMetni += " + ";
    yalnizMetni += sayiyiYaziyaCevir(genelToplam, paraBirimi);
  });
  if (!yalnizMetni) yalnizMetni = "sıfır";

  const tarihYazisi = teklif.tarih.toLocaleDateString("tr-TR");

  const notlarIcerigi = [];
  if (teklif.notlar && teklif.notlar.trim() !== "") {
    notlarIcerigi.push(
      { text: "1. Notlar ______________ :", bold: true, fontSize: 10, margin: [0, 15, 0, 5] }, 
      { text: teklif.notlar, fontSize: 10, margin: [15, 0, 0, 0] } 
    );
  }

  const docDefinition = {
    pageMargins: [40, 100, 40, 60],
    header: {
      stack: [
        {
          columns: [
            {
              text: [
                { text: 'KARATAŞ', fontSize: 26, color: '#222222' },
                { text: 'CAM', fontSize: 26, bold: true, color: '#222222' }
              ],
              alignment: 'left',
              margin: [0, 10, 0, 0],
              width: '*'
            },
            {
              width: 'auto',
              stack: [ logo1 ? { image: logo1, height: 35, margin: [0, 5, 15, 0] } : { text: '' } ]
            },
            {
              width: 'auto',
              stack: [ logo2 ? { image: logo2, height: 35, margin: [0, 5, 0, 0] } : { text: '' } ]
            }
          ]
        },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1.5 }], margin: [0, 10, 0, 0] }
      ],
      margin: [40, 20, 40, 0]
    },
    footer: ortakFooter,
    content: [
      { text: "TEKLİFTİR.", fontSize: 10, margin: [0, 0, 0, 2] },
      { text: teklif.musteriAdi, fontSize: 10 },
      { text: teklif.ilgiliKisi, fontSize: 10, margin: [0, 0, 0, 10] },
      { text: `Proje Adı: ${teklif.projeAdi}`, bold: true, fontSize: 11 },
      { text: `Tarih: ${tarihYazisi}`, fontSize: 10, margin: [0, 0, 0, 10] },
      { text: "İhtiyacınız olan camlara ilişkin fiyat teklifimiz aşağıdaki gibidir:", fontSize: 10, margin: [0, 0, 0, 10] },
      ...urunSatirlari,
      ...genelToplamSatirlari,
      { text: `YALNIZ: ${yalnizMetni}.`, bold: true, fontSize: 10, margin: [0, 35, 0, 10] },
      ...notlarIcerigi,
      { text: "Saygılarımla,", italics: true, alignment: "right", margin: [0, 30, 0, 2] },
      { text: "Sercan Temel", bold: true, alignment: "right", margin: [0, 0, 0, 25] },
      { text: "Almış olduğunuz teklifin teyidi için mutlaka onay veriniz.", bold: true, fontSize: 10 },
      { text: "Firma ismi ve kaşesi / Onayı / Özel notlar", fontSize: 10 },
    ],
    defaultStyle: { font: "Roboto" },
  };

  const dosyaAdi = `Karatascam_Teklif_${teklif.musteriAdi}.pdf`;
  pdfMake.createPdf(docDefinition).download(dosyaAdi);
}

// ==========================================
// 2. TABLOLU PROFORMA FATURA PDF'İ
// ==========================================
export async function proformaPdfIndir(teklif, sepet) {
  const logo1 = await gorseliBase64eCevir("/logo1.png");
  const logo2 = await gorseliBase64eCevir("/logo2.png");
  
  const tarihYazisi = teklif.tarih.toLocaleDateString("tr-TR");
  const belgeNo = siradakiProformaNoGetir(); 

  const tabloGövdesi = [
    [
      { text: 'MALIN CİNSİ', bold: true, fillColor: '#eeeeee', margin: [5, 5, 0, 5], alignment: 'left' },
      { text: 'AÇIKLAMA', bold: true, fillColor: '#eeeeee', margin: [0, 5, 0, 5], alignment: 'center' }, 
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

    // DEĞİŞİKLİK: Ölçü yerine tamamen formdan elle yazılan açıklamayı basıyoruz
    const aciklamaMetni = satir.ozelAciklama || "-";

    tabloGövdesi.push([
      { text: satir.urunAciklamasi, fontSize: 9, margin: [5, 5, 0, 5], alignment: 'left' },
      { text: aciklamaMetni, fontSize: 9, alignment: 'center', margin: [0, 5, 0, 5] }, 
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
        { text: `HESAPLANAN KDV`, alignment: 'right', bold: true, margin: [0, 3, 5, 3], fillColor: '#f5f5f5' }, 
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
  const dikkatineSatiri = kisi ? `${kisi} DİKKATİNE;` : "";

  const notlarIcerigi = [];
  if (teklif.notlar && teklif.notlar.trim() !== "") {
    notlarIcerigi.push(
      { text: "1. Notlar ______________ :", bold: true, fontSize: 10, margin: [0, 15, 0, 5] }, 
      { text: teklif.notlar, fontSize: 10, margin: [15, 0, 0, 0] } 
    );
  }

  const docDefinition = {
    pageMargins: [40, 100, 40, 60],
    header: {
      stack: [
        {
          columns: [
            {
              text: [
                { text: 'KARATAŞ', fontSize: 26, color: '#222222' },
                { text: 'CAM', fontSize: 26, bold: true, color: '#222222' }
              ],
              alignment: 'left',
              margin: [0, 10, 0, 0],
              width: '*'
            },
            {
              width: 'auto',
              stack: [ logo1 ? { image: logo1, height: 35, margin: [0, 5, 15, 0] } : { text: '' } ]
            },
            {
              width: 'auto',
              stack: [ logo2 ? { image: logo2, height: 35, margin: [0, 5, 0, 0] } : { text: '' } ]
            }
          ]
        },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1.5 }], margin: [0, 10, 0, 0] }
      ],
      margin: [40, 20, 40, 0]
    },
    footer: ortakFooter,
    content: [
      { text: `Tarih: ${tarihYazisi}`, alignment: "right", fontSize: 10 },
      { text: `No: ${belgeNo}`, alignment: "right", fontSize: 10, margin: [0, 2, 0, 5] },
      { text: "PROFORMA FATURA", style: "header", alignment: "center", bold: true, fontSize: 14, margin: [0, 10, 0, 20] },
      { text: dikkatineSatiri, bold: true, fontSize: 10, margin: [0, 0, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'], 
          body: tabloGövdesi
        },
        layout: {
          hLineWidth: function (i, node) { return 1; },
          vLineWidth: function (i, node) { return 1; },
          hLineColor: function (i, node) { return '#aaaaaa'; },
          vLineColor: function (i, node) { return '#aaaaaa'; },
        }
      },
      { text: `YALNIZ: ${yalnizMetni}.`, bold: true, fontSize: 10, margin: [0, 35, 0, 10] },
      ...notlarIcerigi,
      { 
        stack: [
          { text: "İŞBANKASI / SİTELER ŞUBESİ", bold: true, fontSize: 10, margin: [0, 20, 0, 10] },
          { text: "IBAN NO  :  TR26 0006 4000 0014 2210 2141 37", fontSize: 10 }
        ]
      }
    ],
    defaultStyle: { font: "Roboto" },
  };

  const dosyaAdi = `Proforma_Fatura_${teklif.musteriAdi}.pdf`;
  pdfMake.createPdf(docDefinition).download(dosyaAdi);
}