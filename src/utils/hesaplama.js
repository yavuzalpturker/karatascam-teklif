const SEMBOLLER = { TRY: "₺", USD: "$", EUR: "€" };

/**
 * @param {object} urun - Ürün bilgisi
 * @param {number} enCm
 * @param {number} boyCm
 * @param {number} adet - Hesaplanmış toplam miktar
 * @param {number} birimFiyat - Birim fiyat
 * @param {string} paraBirimi - TRY / USD / EUR
 * @param {number} kdvOrani - KDV yüzdesi
 * @param {string} [birim] - Gerçek birim: "m²", "mt" veya "ad".
 */
export function satirHesapla(urun, enCm, boyCm, adet, birimFiyat, paraBirimi = "TRY", kdvOrani = 20, birim = null) {
  const metrekare = (enCm * boyCm) / 10000;
  const toplamMetrekare = metrekare * adet;
  const sembol = SEMBOLLER[paraBirimi] || "₺";

  const gercekBirim = birim || urun.hesap_turu;

  let tutar;
  let detay;

  if (gercekBirim === "m2" || gercekBirim === "m²") {
    const nihaiM2 = (toplamMetrekare > 0 && !isNaN(toplamMetrekare)) ? toplamMetrekare : adet;
    tutar = nihaiM2 * birimFiyat;
    detay = `${nihaiM2.toFixed(2)} m² x ${birimFiyat.toFixed(2)} ${sembol}`;
  } else if (gercekBirim === "mt") {
    tutar = adet * birimFiyat;
    detay = `${adet.toFixed(2)} mt x ${birimFiyat.toFixed(2)} ${sembol}`;
  } else {
    tutar = adet * birimFiyat;
    detay = `${adet} adet x ${birimFiyat.toFixed(2)} ${sembol}`;
  }

  const tutarNum = Number(tutar.toFixed(2));
  const kdvYuzde = Number(kdvOrani) || 20;
  const kdvTutarNum = Number((tutarNum * (kdvYuzde / 100)).toFixed(2));

  return {
    urunAciklamasi: urun.aciklama || urun.Açıklama || "Ürün",
    miktarDetay: detay,
    toplamTutar: tutarNum,
    paraBirimi,
    kdvOrani: kdvYuzde,
    kdvTutari: kdvTutarNum
  };
}

export function genelToplamHesapla(sepet = []) {
  return sepet.reduce((toplam, satir) => {
    const pb = satir.paraBirimi || "TRY";
    toplam[pb] = (toplam[pb] || 0) + (Number(satir.toplamTutar) || 0);
    return toplam;
  }, {});
}

// KDV'Yİ CANLI OLARAK TOPLAM TUTAR VE KDV ORANINDAN GARANTİ HESAPLAR
export function genelKdvHesapla(sepet = []) {
  return sepet.reduce((toplam, satir) => {
    const pb = satir.paraBirimi || "TRY";
    const tutar = Number(satir.toplamTutar) || 0;
    const kdvOran = satir.kdvOrani !== undefined && satir.kdvOrani !== null ? Number(satir.kdvOrani) : 20;
    
    const hesaplananKdv = (tutar * kdvOran) / 100;

    toplam[pb] = (toplam[pb] || 0) + hesaplananKdv;
    return toplam;
  }, {});
}

export function paraFormatla(deger, paraBirimi = "TRY") {
  const sembol = SEMBOLLER[paraBirimi] || "₺";
  const num = Number(deger) || 0;
  return `${num.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${sembol}`;
}

// Sayıyı boşluksuz şekilde yazıya çeviren (çek mantığı) fonksiyon
export function sayiyiYaziyaCevir(sayi, paraBirimi = "TRY") {
  const birler = ["", "bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz"];
  const onlar = ["", "on", "yirmi", "otuz", "kırk", "elli", "altmış", "yetmiş", "seksen", "doksan"];
  const binler = ["", "bin", "milyon", "milyar", "trilyon"];

  const pbIsim = { TRY: "TL", USD: "Dolar", EUR: "Euro" };
  const kurusIsim = { TRY: "Kuruş", USD: "Sent", EUR: "Sent" };

  let anaBirim = pbIsim[paraBirimi] || paraBirimi;
  let altBirim = kurusIsim[paraBirimi] || "Sent";

  let tamKisim = Math.floor(sayi);
  let ondalikKisim = Math.round((sayi - tamKisim) * 100);

  function ucluCevir(deger) {
    let yazi = "";
    let yuzler = Math.floor(deger / 100);
    let onlarBas = Math.floor((deger % 100) / 10);
    let birlerBas = deger % 10;

    if (yuzler > 0) {
      if (yuzler === 1) yazi += "yüz";
      else yazi += birler[yuzler] + "yüz";
    }
    yazi += onlar[onlarBas];
    yazi += birler[birlerBas];
    return yazi;
  }

  if (tamKisim === 0 && ondalikKisim === 0) return `sıfır ${anaBirim}`;

  let yaziSonuc = "";
  let basamak = 0;
  let temp = tamKisim;

  while (temp > 0) {
    let uclu = temp % 1000;
    if (uclu > 0) {
      let ucluYazi = ucluCevir(uclu);
      if (basamak === 1 && uclu === 1) {
        yaziSonuc = "bin" + yaziSonuc;
      } else {
        yaziSonuc = ucluYazi + binler[basamak] + yaziSonuc;
      }
    }
    temp = Math.floor(temp / 1000);
    basamak++;
  }

  let sonuc = yaziSonuc ? `${yaziSonuc} ${anaBirim}` : `sıfır ${anaBirim}`;

  if (ondalikKisim > 0) {
    let kurusYazi = ucluCevir(ondalikKisim);
    sonuc += ` ${kurusYazi} ${altBirim}`;
  }

  return sonuc;
}