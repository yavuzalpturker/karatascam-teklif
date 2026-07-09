import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { paraFormatla, genelToplamHesapla, genelKdvHesapla, sayiyiYaziyaCevir } from "./hesaplama";

pdfMake.vfs = pdfFonts?.pdfMake?.vfs || pdfFonts?.vfs || pdfFonts?.default?.pdfMake?.vfs || pdfFonts?.default?.vfs;

// YENİ NÜKLEER SEÇENEK: Bozuk/Sahte JPG'leri tarayıcıya zorla çizdirip %100 saf PNG'ye dönüştüren sistem
async function gorseliBase64eCevir(yol) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        // Görünmez bir tuval yaratıp resmi içine çiziyoruz
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        // Çizilen bu resmi PDF'in asla reddedemeyeceği saf bir PNG koduna çeviriyoruz!
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

const SABIT_MADDELER = [
  "Nakliye, montaj ve işçilik bedeli dahil fiyatlarımızdır.",
  "Teslim süresi; imalat onayından sonra 2-3 hafta arasıdır.",
  "Körkasa, güçlendirme profili hariçtir.",
  "Alüminyum ve aksesuarlar RAL boyalı olacaktır.",
  "Ödeme; %50 sipariş onayında, %25 malzeme şantiye tesliminde, kalan kısmı iş tesliminde nakit yapılacaktır.",
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

// ==========================================
// 1. DÜZ METİN TEKLİF PDF'İ
// ==========================================
export async function teklifPdfIndir(teklif, sepet) {
  const sagLogo = await gorseliBase64eCevir("/birinci-logo.jpg");

  const urunSatirlari = sepet.flatMap((satir) => [
    { text: satir.urunAciklamasi, bold: true, margin: [0, 6, 0, 2] },
    {
      text: `${satir.miktarDetay}  =  ${paraFormatla(satir.toplamTutar, satir.paraBirimi)} + KDV`,
      alignment: "right",
      margin: [0, 0, 0, 4],
    },
  ]);

  const genelToplamlar = genelToplamHesapla(sepet);
  const genelToplamSatirlari = Object.entries(genelToplamlar).map(([paraBirimi, tutar]) => ({
    text: `GENEL TOPLAM (${paraBirimi}) : ${paraFormatla(tutar, paraBirimi)} + KDV`,
    bold: true,
    fontSize: 12,
    alignment: "right",
    margin: [0, 4, 0, 4],
  }));

  const tarihYazisi = teklif.tarih.toLocaleDateString("tr-TR");

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
              margin: [0, 10, 0, 0]
            },
            sagLogo ? { image: sagLogo, width: 140, alignment: 'right' } : { text: '', width: 140 }
          ]
        },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }], margin: [0, 8, 0, 0] }
      ],
      margin: [40, 20, 40, 0]
    },
      
    footer: {
      stack: [
        { text: "Karataş Ayna Kristal Cam Ltd. Şti./ Çalım Sok No:19 SİTELER ANKARA", fontSize: 8 },
        { text: "TEL: 0 312 348 9162  FAX: 0 312 348 70 78", fontSize: 8 },
        { text: "www.karatascam.com.tr  |  info@karatascam.com.tr", fontSize: 8 },
      ],
      margin: [40, 0, 40, 20],
    },
    content: [
      { text: "TEKLİFTİR.", fontSize: 10, margin: [0, 0, 0, 2] },
      { text: teklif.musteriAdi, fontSize: 10 },
      { text: teklif.ilgiliKisi, fontSize: 10, margin: [0, 0, 0, 10] },
      { text: `Proje Adı: ${teklif.projeAdi}`, bold: true, fontSize: 11 },
      { text: `Tarih: ${tarihYazisi}`, fontSize: 10, margin: [0, 0, 0, 10] },
      { text: "İhtiyacınız olan camlara ilişkin fiyat teklifimiz aşağıdaki gibidir:", fontSize: 10, margin: [0, 0, 0, 10] },
      ...urunSatirlari,
      ...genelToplamSatirlari,
      ...SABIT_MADDELER.map((madde) => ({
        text: `* ${madde}`,
        fontSize: 9,
        margin: [2, 0, 0, 2],
      })),
      { text: "Saygılarımla,", italics: true, alignment: "right", margin: [0, 20, 0, 2] },
      { text: "Sercan Temel", bold: true, alignment: "right", margin: [0, 0, 0, 30] },
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
  const sagLogo = await gorseliBase64eCevir("/birinci-logo.jpg");
  
  const tarihYazisi = teklif.tarih.toLocaleDateString("tr-TR");
  const belgeNo = siradakiProformaNoGetir(); 

  const tabloGövdesi = [
    [
      { text: 'MALIN CİNSİ', bold: true, fillColor: '#eeeeee', margin: [5, 5, 0, 5], alignment: 'left' },
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
        { text: '', colSpan: 3, border: [false, false, false, false] }, {}, {}, 
        { text: `TOPLAM`, alignment: 'right', bold: true, margin: [0, 3, 5, 3], fillColor: '#f5f5f5' }, 
        { text: paraFormatla(tutar, paraBirimi), alignment: 'right', bold: true, margin: [0, 3, 5, 3], fillColor: '#f5f5f5' }
      ],
      [
        { text: '', colSpan: 3, border: [false, false, false, false] }, {}, {}, 
        { text: `HESAPLANAN KDV`, alignment: 'right', bold: true, margin: [0, 3, 5, 3], fillColor: '#f5f5f5' }, 
        { text: paraFormatla(kdvTutar, paraBirimi), alignment: 'right', bold: true, margin: [0, 3, 5, 3], fillColor: '#f5f5f5' }
      ],
      [
        { text: '', colSpan: 3, border: [false, false, false, false] }, {}, {}, 
        { text: `GENEL TOPLAM`, alignment: 'right', bold: true, margin: [0, 3, 5, 3], fillColor: '#e0e0e0' }, 
        { text: paraFormatla(genelToplam, paraBirimi), alignment: 'right', bold: true, margin: [0, 3, 5, 3], fillColor: '#e0e0e0' }
      ]
    );
  });

  if (!yalnizMetni) yalnizMetni = "sıfır";

  let kisi = (teklif.ilgiliKisi || "").toLocaleUpperCase("tr-TR");
  kisi = kisi.replace(/DİKKATİNE/g, "").replace(/[,;]/g, "").trim();
  const dikkatineSatiri = kisi ? `${kisi} DİKKATİNE;` : "";

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
              margin: [0, 10, 0, 0]
            },
            sagLogo ? { image: sagLogo, width: 140, alignment: 'right' } : { text: '', width: 140 }
          ]
        },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }], margin: [0, 8, 0, 0] }
      ],
      margin: [40, 20, 40, 0]
    },
      
    footer: {
      stack: [
        { text: `YALNIZ: ${yalnizMetni}.`, fontSize: 10, margin: [0, 0, 0, 2] },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }], margin: [0, 0, 0, 5] },
        { text: "Çalım Caddesi No : 19 Siteler - Altındağ / ANKARA   •   Tel : 0312. 348 91 62 (Pbx)   •   Fax : 0312. 348 70 78", fontSize: 8, alignment: "center" },
        { text: "web: www.karatascam.com.tr   •   e-mail: info@karatascam.com.tr   •   Mersis No: 0522 0626 2270 0015", fontSize: 8, alignment: "center" },
      ],
      margin: [40, 0, 40, 20],
    },
    content: [
      { text: `Tarih: ${tarihYazisi}`, alignment: "right", fontSize: 10 },
      { text: `No: ${belgeNo}`, alignment: "right", fontSize: 10, margin: [0, 2, 0, 5] },
      { text: "PROFORMA FATURA", style: "header", alignment: "center", bold: true, fontSize: 14, margin: [0, 10, 0, 20] },
      { text: dikkatineSatiri, bold: true, fontSize: 10, margin: [0, 0, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto', 'auto'],
          body: tabloGövdesi
        },
        layout: {
          hLineWidth: function (i, node) { return 1; },
          vLineWidth: function (i, node) { return 1; },
          hLineColor: function (i, node) { return '#aaaaaa'; },
          vLineColor: function (i, node) { return '#aaaaaa'; },
        }
      }
    ],
    defaultStyle: { font: "Roboto" },
  };

  const dosyaAdi = `Proforma_Fatura_${teklif.musteriAdi}.pdf`;
  pdfMake.createPdf(docDefinition).download(dosyaAdi);
}