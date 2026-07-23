import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts?.pdfMake?.vfs || pdfFonts?.vfs || pdfFonts?.default?.pdfMake?.vfs || pdfFonts?.default?.vfs;

async function gorseliBase64eCevir(yol) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
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

function imalatTabloOlustur(sepet, baslikMetni) {
  if (!sepet || sepet.length === 0) return { tabloGövdesi: [], toplamAdet: 0, toplamM2: 0, toplamMtul: 0 };

  const tabloGövdesi = [
    [
      { text: 'POZ NO', bold: true, fillColor: '#eeeeee', margin: [0, 5, 0, 5], alignment: 'center' },
      { text: baslikMetni ? `${baslikMetni} - MALIN CİNSİ` : 'MALIN CİNSİ', bold: true, fillColor: '#eeeeee', margin: [5, 5, 0, 5], alignment: 'left' },
      { text: 'AÇIKLAMA & ÇİZİM', bold: true, fillColor: '#eeeeee', margin: [5, 5, 0, 5], alignment: 'left' },
      { text: 'EN', bold: true, fillColor: '#eeeeee', margin: [0, 5, 0, 5], alignment: 'center' },
      { text: 'BOY', bold: true, fillColor: '#eeeeee', margin: [0, 5, 0, 5], alignment: 'center' },
      { text: 'ADET', bold: true, fillColor: '#eeeeee', margin: [0, 5, 0, 5], alignment: 'center' },
      { text: 'MİKTAR\n(m²)', bold: true, fillColor: '#eeeeee', margin: [0, 5, 0, 5], alignment: 'center' },
      { text: 'METRETÜL\n(mtül)', bold: true, fillColor: '#eeeeee', margin: [0, 5, 0, 5], alignment: 'center' }
    ]
  ];

  let genelToplamAdet = 0;
  let genelToplamM2 = 0;
  let genelToplamMtul = 0;

  sepet.forEach(satir => {
    const tamMetin = `${satir.ozelAciklama || ""} ${satir.miktarDetay || ""} ${satir.urunAciklamasi || ""}`;

    let en = 0;
    let boy = 0;
    let adetDegeri = 1;
    let miktarM2 = 0;

    const olcuMatch = tamMetin.match(/(\d+)\s*[xX×]\s*(\d+)/);
    if (olcuMatch) {
      en = parseFloat(olcuMatch[1]);
      boy = parseFloat(olcuMatch[2]);
    }

    const adetMatch = tamMetin.match(/(?:-\s*)?(\d+)\s*Adet/i);
    if (adetMatch) {
      adetDegeri = parseInt(adetMatch[1], 10);
    }

    const m2Match = tamMetin.match(/(?:Toplam:\s*)?([\d.]+)\s*m²/i);
    if (m2Match) {
      miktarM2 = parseFloat(m2Match[1]);
    }

    let metretul = 0;
    let metretulYazi = "-";

    if (en > 0 && boy > 0 && adetDegeri > 0) {
      metretul = (2 * (en + boy) / 1000) * adetDegeri;
      metretulYazi = `${metretul.toFixed(2)}`;
    }

    genelToplamAdet += adetDegeri;
    genelToplamM2 += miktarM2;
    genelToplamMtul += metretul;

    let temizAciklama = satir.ozelAciklama || "";
    temizAciklama = temizAciklama
      .replace(/\(\s*\d+\s*[xX×]\s*\d+\s*mm[^)]*\)/gi, "")
      .replace(/\d+\s*[xX×]\s*\d+\s*mm/gi, "")
      .replace(/\d+\s*Adet/gi, "")
      .replace(/Toplam:\s*[\d.]+\s*m²/gi, "")
      .replace(/[-–—]/g, " ")
      .trim();

    const ozelAciklamaStack = [];

    if (temizAciklama.length > 0) {
      ozelAciklamaStack.push({ text: temizAciklama, fontSize: 9, margin: [0, 0, 0, 6], alignment: 'left' });
    }

    if (satir.gorsel) {
      ozelAciklamaStack.push({
        image: satir.gorsel,
        width: 100, 
        alignment: 'center',
        margin: [0, 4, 0, 4]
      });
    }

    if (ozelAciklamaStack.length === 0) {
      ozelAciklamaStack.push({ text: "-", fontSize: 9, alignment: 'left', color: '#94a3b8' });
    }

    tabloGövdesi.push([
      { text: satir.pozNo || "-", fontSize: 10, bold: true, alignment: 'center', margin: [0, 5, 0, 5] },
      { text: satir.urunAciklamasi, fontSize: 9, bold: true, margin: [5, 5, 0, 5], alignment: 'left' },
      { stack: ozelAciklamaStack, margin: [5, 5, 5, 5] },
      { text: en > 0 ? `${en}` : "-", fontSize: 12, bold: true, alignment: 'center', margin: [0, 5, 0, 5] },
      { text: boy > 0 ? `${boy}` : "-", fontSize: 12, bold: true, alignment: 'center', margin: [0, 5, 0, 5] },
      { text: `${adetDegeri}`, fontSize: 11, bold: true, alignment: 'center', margin: [0, 5, 0, 5] },
      { text: miktarM2 > 0 ? `${miktarM2.toFixed(2)}` : "-", fontSize: 9, bold: true, alignment: 'center', margin: [0, 5, 0, 5] },
      { text: metretulYazi, fontSize: 9, bold: true, alignment: 'center', margin: [0, 5, 0, 5] }
    ]);
  });

  tabloGövdesi.push([
    { text: 'GENEL TOPLAM', colSpan: 5, alignment: 'right', bold: true, fillColor: '#f5f5f5', margin: [0, 5, 5, 5] },
    {}, {}, {}, {}, 
    { text: `${genelToplamAdet}\nAdet`, alignment: 'center', bold: true, fillColor: '#f5f5f5', margin: [0, 5, 0, 5] },
    { text: `${genelToplamM2.toFixed(2)}\nm²`, alignment: 'center', bold: true, fillColor: '#f5f5f5', margin: [0, 5, 0, 5] },
    { text: `${genelToplamMtul.toFixed(2)}\nmtül`, alignment: 'center', bold: true, fillColor: '#f5f5f5', margin: [0, 5, 0, 5] }
  ]);

  return { tabloGövdesi, toplamAdet: genelToplamAdet, toplamM2: genelToplamM2, toplamMtul: genelToplamMtul };
}

export async function imalatPdfIndir(teklif, sepet1, sepet2 = [], teklifNo, onizlemeMi = false) {
  const logoSisecam = await gorseliBase64eCevir("/sisecam.png");
  const logoIso = await gorseliBase64eCevir("/birinci-logo.jpg");
  
  const tarihYazisi = teklif.tarih ? new Date(teklif.tarih).toLocaleDateString("tr-TR") : new Date().toLocaleDateString("tr-TR");
  const belgeNo = teklif.teklifNo || teklifNo || "İMALAT-LİSTESİ"; 
  const siparisNoMetni = teklif.siparisNo ? `Sipariş No: ${teklif.siparisNo}` : null;

  const ikiliMi = sepet2 && sepet2.length > 0;

  const sonuc1 = imalatTabloOlustur(sepet1, ikiliMi ? "1. SEÇENEK" : null);
  const sonuc2 = ikiliMi ? imalatTabloOlustur(sepet2, "2. SEÇENEK") : null;

  const headerDefinition = {
    stack: [
      {
        columns: [
          {
            stack: [
              {
                text: [
                  { text: 'KARATAŞ', fontSize: 24, color: '#222222' },
                  { text: 'CAM - İMALAT LİSTESİ', fontSize: 24, bold: true, color: '#0f2942' }
                ]
              },
              { text: 'ATÖLYE / FABRİKA ÜRETİM VE KESİM BİLGİ FİŞİ', fontSize: 9, bold: true, color: '#666', margin: [0, 4, 0, 0] }
            ],
            alignment: 'left',
            margin: [0, 5, 0, 0]
          },
          {
            columns: [
              logoSisecam ? { image: logoSisecam, width: 45, margin: [0, 10, 10, 0] } : null,
              logoIso ? { image: logoIso, width: 65, margin: [0, 0, 0, 0] } : null
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

  const footerDefinition = {
    stack: [
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }], margin: [0, 0, 0, 5] },
      { text: "BU BELGE YALNIZCA İMALAT VE KESİM BİRİMİ İÇİNDİR. FİYAT BİLGİSİ İÇERMEZ.", fontSize: 8, bold: true, alignment: "center", color: "#990000" },
    ],
    margin: [40, 0, 40, 20],
  };

  let kisi = (teklif.ilgiliKisi || "").toLocaleUpperCase("tr-TR");
  kisi = kisi.replace(/DİKKATİNE/g, "").replace(/[,;]/g, "").trim();
  if (kisi && !kisi.startsWith("SN.") && !kisi.startsWith("SN ")) {
    kisi = `Sn. ${kisi}`;
  }

  const icerikDizisi = [
    {
      columns: [
        {
          stack: [
            { text: `Müşteri: ${teklif.musteriAdi || "-"}`, bold: true, fontSize: 11 },
            { text: `İlgili: ${kisi || "-"}`, fontSize: 10, margin: [0, 2, 0, 4] },
            { text: `Proje: ${teklif.projeAdi || "-"}`, bold: true, fontSize: 10, color: '#0f2942' }
          ],
          alignment: 'left'
        },
        {
          stack: [
            { text: `Tarih: ${tarihYazisi}`, fontSize: 10 },
            { text: `No: ${belgeNo}`, fontSize: 10, bold: true },
            // SİPARİŞ NUMARASI RENGİ KOYU SİYAH YAPILDI VE BOYUTU BÜYÜTÜLDÜ
            siparisNoMetni ? { text: siparisNoMetni, fontSize: 10, bold: true, color: '#000000', margin: [0, 3, 0, 0] } : null
          ].filter(Boolean),
          alignment: 'right'
        }
      ],
      margin: [0, 5, 0, 15]
    },
    { text: "ÜRETİM VE KESİM LİSTESİ", alignment: "center", bold: true, fontSize: 13, margin: [0, 0, 0, 15], color: '#0f2942' },
    
    {
      table: {
        headerRows: 1,
        widths: [35, '*', 70, 40, 40, 30, 45, 45],
        body: sonuc1.tabloGövdesi
      },
      layout: {
        hLineWidth: function () { return 1; },
        vLineWidth: function () { return 1; },
        hLineColor: function () { return '#aaaaaa'; },
        vLineColor: function () { return '#aaaaaa'; },
      }
    }
  ];

  if (sonuc2 && sepet2.length > 0) {
    icerikDizisi.push(
      { text: "", margin: [0, 15, 0, 15] },
      {
        table: {
          headerRows: 1,
          widths: [35, '*', 70, 40, 40, 30, 45, 45],
          body: sonuc2.tabloGövdesi
        },
        layout: {
          hLineWidth: function () { return 1; },
          vLineWidth: function () { return 1; },
          hLineColor: function () { return '#aaaaaa'; },
          vLineColor: function () { return '#aaaaaa'; },
        }
      }
    );
  }

  if (teklif.notlar && teklif.notlar.trim() !== "") {
    icerikDizisi.push({
      stack: [
        { text: "Özel Notlar / Uyarılar:", bold: true, fontSize: 10, margin: [0, 15, 0, 4], color: '#990000' },
        ...teklif.notlar.split('\n').map(satir => ({ text: `• ${satir}`, fontSize: 9, margin: [0, 0, 0, 2] }))
      ]
    });
  }

  const docDefinition = {
    pageMargins: [40, 90, 40, 50],
    header: headerDefinition,
    footer: footerDefinition,
    content: icerikDizisi,
    defaultStyle: { font: "Roboto" },
  };

  const dosyaAdi = `Imalat_Listesi_${teklif.musteriAdi || "Yeni"}_${belgeNo}.pdf`;
  
  const pdfDoc = pdfMake.createPdf(docDefinition);
  if (onizlemeMi) {
    pdfDoc.open();
  } else {
    pdfDoc.download(dosyaAdi);
  }
}