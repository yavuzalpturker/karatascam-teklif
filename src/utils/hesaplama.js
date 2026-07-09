const SEMBOLLER = { TRY: "₺", USD: "$", EUR: "€" };

export function satirHesapla(urun, enCm, boyCm, adet, birimFiyat, paraBirimi = "USD", kdvOrani = 20) {
  const metrekare = (enCm * boyCm) / 10000;
  const toplamMetrekare = metrekare * adet;
  const sembol = SEMBOLLER[paraBirimi] || "$";

  let tutar;
  let detay;

  if (urun.hesap_turu === "m2") {
    tutar = toplamMetrekare * birimFiyat;
    detay = `${toplamMetrekare.toFixed(2)} m² x ${birimFiyat.toFixed(2)} ${sembol}`;
  } else {
    tutar = adet * birimFiyat;
    detay = `${adet} adet x ${birimFiyat.toFixed(2)} ${sembol}`;
  }

  const tutarNum = Number(tutar.toFixed(2));
  const kdvTutarNum = Number((tutarNum * (Number(kdvOrani) / 100)).toFixed(2));

  return {
    urunAciklamasi: urun.aciklama,
    miktarDetay: detay,
    toplamTutar: tutarNum,
    paraBirimi,
    kdvOrani: Number(kdvOrani),
    kdvTutari: kdvTutarNum
  };
}

export function genelToplamHesapla(sepet) {
  return sepet.reduce((toplam, satir) => {
    const pb = satir.paraBirimi || "USD";
    toplam[pb] = (toplam[pb] || 0) + satir.toplamTutar;
    return toplam;
  }, {});
}

export function genelKdvHesapla(sepet) {
  return sepet.reduce((toplam, satir) => {
    const pb = satir.paraBirimi || "USD";
    toplam[pb] = (toplam[pb] || 0) + (satir.kdvTutari || 0);
    return toplam;
  }, {});
}

export function paraFormatla(deger, paraBirimi = "USD") {
  const sembol = SEMBOLLER[paraBirimi] || "$";
  return `${deger.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${sembol}`;
}

// YENİ EKLENEN: Sayıyı boşluksuz şekilde yazıya çeviren (çek mantığı) fonksiyon
export function sayiyiYaziyaCevir(sayi, paraBirimi = "USD") {
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
        yaziSonuc = "bin" + yaziSonuc; // "birbin" yerine sadece "bin"
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