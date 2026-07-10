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
        resolve(canvas.toDataURL('image/png'));
      } catch (e) { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = yol;
  });
}

function siradakiProformaNoGetir() {
  let sayac = localStorage.getItem("proforma_sayac");
  if (!sayac || isNaN(sayac)) sayac = 1;
  else sayac = parseInt(sayac, 10);

  const yil = new Date().getFullYear();
  const formatliSayac = sayac.toString().padStart(3, "0");
  const noMetni = `${yil}/${formatliSayac}`;
  localStorage.setItem("proforma_sayac", sayac + 1);
  return noMetni;
}

function siradakiTeklifNoGetir() {
  let sayac = localStorage.getItem("teklif_sayac");
  if (!sayac || isNaN(sayac)) sayac = 1;
  else sayac = parseInt(sayac, 10);

  const yil = new Date().getFullYear();
  const formatliSayac = sayac.toString().padStart(3, "0");
  const noMetni = `${yil}/T-${formatliSayac}`;
  localStorage.setItem("teklif_sayac", sayac + 1);
  return noMetni;
}

const birimFormatla = (birim) => {
  if (birim === "ad") return "ADET";
  if (birim === "m²") return "m²";
  if (birim === "mt") return "mt";
  return "ADET";
};

const ortakFooter = {
  stack: [
    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }], margin: [0, 0, 0, 5] },
    { text: "Karataş Ayna Kristal Cam İns.Lim.Şti. / Çalım Sok No:19 SİTELER ANKARA", fontSize: 8, alignment: "left" },
    { text: "TEL: 0 312 348 9162  FAX: 0 312 348 70 78 | www.karatascam.com.tr", fontSize: 8, alignment: "left" }
  ],
  margin: [40, 0, 40, 20]
};

// ==========================================
// 1. DÜZ METİN TEKLİF PDF'İ
// ==========================================
export async function teklifPdfIndir(teklif, sepet, mevcutNo = null) {
  const logo1 = await gorseliBase64eCevir("/logo1.png");
  const logo2 = await gorseliBase64eCevir("/logo2.png");
  const belgeNo = mevcutNo || siradakiTeklifNoGetir();

  const urunSatirlari = sepet.flatMap((satir) => {
    const aciklamaEki = satir.ozelAciklama ? ` (${satir.ozelAciklama})` : "";
    const birimMetni = birimFormatla(satir.secilenBirim);
    const miktarMetni = `${satir.miktar} ${birimMetni}  x  ${paraFormatla(satir.birimFiyat, satir.paraBirimi)}/${satir.secilenBirim || 'ad'}`;
    return [
      { text: satir.urunAciklamasi + aciklamaEki, bold: true, margin: [0, 6, 0, 2] },
      { text: `${miktarMetni}  =  ${paraFormatla(satir.toplamTutar, satir.paraBirimi)} + KDV`, alignment: "right", margin: [0, 0, 0, 4] }
    ];
  });

  const genelToplamlar = genelToplamHesapla(sepet);
  const genelKdvler = genelKdvHesapla(sepet);
  
  const genelToplamSatirlari = Object.entries(genelToplamlar).map(([paraBirimi, tutar]) => ({
    text: [
      { text: `GENEL TOPLAM (${paraBirimi}) : `, bold: true },
      { text: `${paraFormatla(tutar, paraBirimi)} + KDV` }
    ],
    fontSize: 12, alignment: "right", margin: [0, 4, 0, 4]
  }));

  let yalnizMetni = "";
  Object.entries(genelToplamlar).forEach(([paraBirimi, tutar]) => {
    const kdvTutar = genelKdvler[paraBirimi] || 0;
    if (yalnizMetni !== "") yalnizMetni += " + ";
    yalnizMetni += sayiyiYaziyaCevir(tutar + kdvTutar, paraBirimi);
  });
  if (!yalnizMetni) yalnizMetni = "sıfır";

  const tarihObj = typeof teklif.tarih === "string" ? new Date(teklif.tarih) : (teklif.tarih || new Date());
  const tarihYazisi = tarihObj.toLocaleDateString("tr-TR");

  const notlarIcerigi = [];
  if (teklif.notlar && teklif.notlar.trim() !== "") {
    notlarIcerigi.push(
      { text: "1. Notlar ______________ :", bold: true, fontSize: 10, margin: [0, 15, 0, 5] },
      { text: teklif.notlar, fontSize: 10, margin: [15, 0, 0, 0] }
    );
  }

  if (!mevcutNo) {
    try {
      await supabase.from('teklifler').insert([{
        teklif_no: belgeNo, tur: 'TEKLİF', musteri_adi: teklif.musteriAdi, proje_adi: teklif.projeAdi,
        ilgili_kisi: teklif.ilgiliKisi, notlar: teklif.notlar, tarih: tarihObj.toISOString().split('T')[0], sepet: sepet
      }]);
    } catch (e) { console.error(e); }
  }

  const docDefinition = {
    pageMargins: [40, 115, 40, 60],
    header: {
      stack: [
        {
          columns: [
            {
              stack: [
                { text: [{ text: 'KARATAŞ', fontSize: 34, color: '#222222' }, { text: 'CAM', fontSize: 34, bold: true, color: '#222222' }] },
                { text: 'KARATAŞ AYNA KRİSTAL CAM MOB. İNŞ. TUR. NAK. MET. SAN. VE TİC. LTD. ŞTİ.', fontSize: 9, margin: [0, 5, 0, 0] }
              ],
              alignment: 'left', margin: [0, 10, 0, 0], width: '*'
            },
            { width: 'auto', stack: [ logo1 ? { image: logo1, height: 40, margin: [0, 5, 15, 0] } : { text: '' } ] },
            { width: 'auto', stack: [ logo2 ? { image: logo2, height: 40, margin: [0, 5, 0, 0] } : { text: '' } ] }
          ]
        },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1.5 }], margin: [0, 10, 0, 0] }
      ],
      margin: [40, 20, 40, 0]
    },
    footer: ortakFooter,
    content: [
      {
        columns: [
          { text: "TEKLİFTİR.", fontSize: 10, width: '*' },
          { stack: [{ text: `Tarih: ${tarihYazisi}`, alignment: "right", fontSize: 10 }, { text: `No: ${belgeNo}`, alignment: "right", fontSize: 10 }], width: 'auto' }
        ],
        margin: [0, 0, 0, 10]
      },
      { text: teklif.musteriAdi, fontSize: 10 },
      { text: teklif.ilgiliKisi, fontSize: 10, margin: [0, 0, 0, 10] },
      ...(teklif.projeAdi && teklif.projeAdi.trim() !== "" 
        ? [{ text: `Proje Adı: ${teklif.projeAdi}`, bold: true, fontSize: 11, margin: [0, 0, 0, 10] }] 
        : []),
      { text: "İhtiyacınız olan camlara ilişkin fiyat teklifimiz aşağıdaki gibidir:", fontSize: 10, margin: [0, 0, 0, 10] },
      ...urunSatirlari,
      ...genelToplamSatirlari,
      { text: `YALNIZ: ${yalnizMetni}.`, bold: true, fontSize: 10, margin: [0, 35, 0, 10] },
      ...notlarIcerigi,
      { text: "Saygılarımla,", italics: true, alignment: "right", margin: [0, 30, 0, 2] },
      { text: "Sercan Temel", bold: true, alignment: "right", margin: [0, 0, 0, 25] },
      { text: "Almış olduğunuz teklifin teyidi için mutlaka onay veriniz.", bold: true, fontSize: 10 },
      { text: "Firma ismi ve kaşesi / Onayı / Özel notlar", fontSize: 10 }
    ],
    defaultStyle: { font: "Roboto" }
  };
  pdfMake.createPdf(docDefinition).download(`Karatascam_Teklif_${teklif.musteriAdi}.pdf`);
}

// ==========================================
// 2. TABLOLU PROFORMA FATURA PDF'İ
// ==========================================
export async function proformaPdfIndir(teklif, sepet, mevcutNo = null) {
  const logo1 = await gorseliBase64eCevir("/logo1.png");
  const logo2 = await gorseliBase64eCevir("/logo2.png");
  const belgeNo = mevcutNo || siradakiProformaNoGetir();

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
    const birimMetniBicimli = birimFormatla(satir.secilenBirim);
    const miktarMetni = `${satir.miktar} ${birimMetniBicimli}`;
    const birimFiyatMetni = satir.birimFiyat ? `${paraFormatla(satir.birimFiyat, satir.paraBirimi)} / ${satir.secilenBirim || 'ad'}` : "-";
    const aciklamaMetni = satir.ozelAciklama || "-";

    tabloGövdesi.push([
      { text: satir.urunAciklamasi, fontSize: 9, margin: [5, 5, 0, 5], alignment: 'left' },
      { text: aciklamaMetni, fontSize: 9, alignment: 'center', margin: [0, 5, 0, 5] },
      { text: miktarMetni, fontSize: 9, alignment: 'center', margin: [0, 5, 0, 5] },
      // YENİ: Fiyat ve Tutar kısımlarına noWrap eklendi (tek satıra kilitlendi)
      { text: birimFiyatMetni, fontSize: 9, alignment: 'center', margin: [0, 5, 0, 5], noWrap: true },
      { text: `% ${satir.kdvOrani}`, fontSize: 9, alignment: 'center', margin: [0, 5, 0, 5], noWrap: true },
      { text: `${paraFormatla(satir.toplamTutar, satir.paraBirimi)}`, fontSize: 9, alignment: 'right', margin: [0, 5, 5, 5], noWrap: true }
    ]);
  });

  const genelToplamlar = genelToplamHesapla(sepet);
  const genelKdvler = genelKdvHesapla(sepet);
  
  let yalnizMetni = "";
  Object.entries(genelToplamlar).forEach(([paraBirimi, tutar]) => {
    const kdvTutar = genelKdvler[paraBirimi] || 0;
    if (yalnizMetni !== "") yalnizMetni += " + ";
    yalnizMetni += sayiyiYaziyaCevir(tutar + kdvTutar, paraBirimi);
  });
  if (!yalnizMetni) yalnizMetni = "sıfır";

  const tarihObj = typeof teklif.tarih === "string" ? new Date(teklif.tarih) : (teklif.tarih || new Date());
  const tarihYazisi = tarihObj.toLocaleDateString("tr-TR");
  const kdvSecilenOran = sepet[0]?.kdvOrani ? `KDV %${sepet[0].kdvOrani}` : "KDV %20";

  // YENİ: Toplamlar kısmı BİRİM FİYAT'tan başlıyor (colSpan: 3 ve colSpan: 2 kurgusu)
  Object.entries(genelToplamlar).forEach(([paraBirimi, tutar]) => {
    const kdvTutar = genelKdvler[paraBirimi] || 0;
    tabloGövdesi.push(
      [
        { text: '', colSpan: 3, border: [false, false, false, false] }, {}, {}, 
        { text: `TOPLAM`, colSpan: 2, alignment: 'right', bold: true, margin: [0, 3, 5, 3], fillColor: '#f5f5f5' }, {}, 
        { text: paraFormatla(tutar, paraBirimi), alignment: 'right', margin: [0, 3, 5, 3], fillColor: '#f5f5f5', noWrap: true }
      ],
      [
        { text: '', colSpan: 3, border: [false, false, false, false] }, {}, {}, 
        { text: kdvSecilenOran, colSpan: 2, alignment: 'right', bold: true, margin: [0, 3, 5, 3], fillColor: '#f5f5f5' }, {}, 
        { text: paraFormatla(kdvTutar, paraBirimi), alignment: 'right', margin: [0, 3, 5, 3], fillColor: '#f5f5f5', noWrap: true }
      ],
      [
        { text: '', colSpan: 3, border: [false, false, false, false] }, {}, {}, 
        { text: `GENEL TOPLAM`, colSpan: 2, alignment: 'right', bold: true, margin: [0, 3, 5, 3], fillColor: '#e0e0e0' }, {}, 
        { text: paraFormatla(tutar + kdvTutar, paraBirimi), alignment: 'right', margin: [0, 3, 5, 3], fillColor: '#e0e0e0', noWrap: true }
      ]
    );
  });

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

  if (!mevcutNo) {
    try {
      await supabase.from('teklifler').insert([{
        teklif_no: belgeNo, tur: 'PROFORMA', musteri_adi: teklif.musteriAdi, proje_adi: teklif.projeAdi,
        ilgili_kisi: teklif.ilgiliKisi, notlar: teklif.notlar, tarih: tarihObj.toISOString().split('T')[0], sepet: sepet
      }]);
    } catch (e) { console.error(e); }
  }

  const docDefinition = {
    pageMargins: [40, 115, 40, 60],
    header: {
      stack: [
        {
          columns: [
            {
              stack: [
                { text: [{ text: 'KARATAŞ', fontSize: 34, color: '#222222' }, { text: 'CAM', fontSize: 34, bold: true, color: '#222222' }] },
                { text: 'KARATAŞ AYNA KRİSTAL CAM MOB. İNŞ. TUR. NAK. MET. SAN. VE TİC. LTD. ŞTİ.', fontSize: 9, margin: [0, 5, 0, 0] }
              ],
              alignment: 'left', margin: [0, 10, 0, 0], width: '*'
            },
            { width: 'auto', stack: [ logo1 ? { image: logo1, height: 40, margin: [0, 5, 15, 0] } : { text: '' } ] },
            { width: 'auto', stack: [ logo2 ? { image: logo2, height: 40, margin: [0, 5, 0, 0] } : { text: '' } ] }
          ]
        },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1.5 }], margin: [0, 10, 0, 0] }
      ],
      margin: [40, 20, 40, 0]
    },
    footer: ortakFooter,
    content: [
      {
        columns: [
          { text: teklif.projeAdi && teklif.projeAdi.trim() !== "" ? `Proje Adı: ${teklif.projeAdi}` : "", bold: true, fontSize: 10, width: '*' },
          { stack: [{ text: `Tarih: ${tarihYazisi}`, alignment: "right", fontSize: 10 }, { text: `No: ${belgeNo}`, alignment: "right", fontSize: 10 }], width: 'auto' }
        ],
        margin: [0, 0, 0, 10]
      },
      { text: "PROFORMA FATURA", style: "header", alignment: "center", bold: true, fontSize: 14, margin: [0, 10, 0, 20] },
      { text: dikkatineSatiri, bold: true, fontSize: 10, margin: [0, 0, 0, 10] },
      {
        table: { 
          headerRows: 1, 
          // YENİ: Sütun genişlikleri özel olarak ayarlandı. Malın cinsi daha geniş, Tutar sütunu daha korunaklı.
          widths: ['20%', '*', '13%', '15%', '11%', '17%'], 
          body: tabloGövdesi 
        },
        layout: { hLineWidth: () => 1, vLineWidth: () => 1, hLineColor: () => '#aaaaaa', vLineColor: () => '#aaaaaa' }
      },
      { text: `YALNIZ: ${yalnizMetni}.`, bold: true, fontSize: 10, margin: [0, 35, 0, 10] },
      ...notlarIcerigi,
      { stack: [{ text: "İŞBANKASI / SİTELER ŞUBESİ", bold: true, fontSize: 10, margin: [0, 20, 0, 10] }, { text: `IBAN NO  :  TR26 0006 4000 0014 2210 2141 37`, fontSize: 10 }] },
      { text: "Saygılarımla,", italics: true, alignment: "right", margin: [0, 30, 0, 2] },
      { text: "Sercan Temel", bold: true, alignment: "right", margin: [0, 0, 0, 25] },
      { text: "Almış olduğunuz teklifin teyidi için mutlaka onay veriniz.", bold: true, fontSize: 10 },
      { text: "Firma ismi ve kaşesi / Onayı / Özel notlar", fontSize: 10 }
    ],
    defaultStyle: { font: "Roboto" }
  };
  pdfMake.createPdf(docDefinition).download(`Proforma_Fatura_${teklif.musteriAdi}.pdf`);
}