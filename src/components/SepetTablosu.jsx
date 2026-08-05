import { useState } from "react";
import { paraFormatla, genelToplamHesapla, genelKdvHesapla } from "../utils/hesaplama";

export default function SepetTablosu({ 
  sepet = [], 
  gecmisUzunluk = 0,
  onGeriAl,
  onTemizle, 
  onSil, 
  onDuzenle, 
  onTekrarEt, 
  onTopluFiyatGuncelle 
}) {
  const [modalAcik, setModalAcik] = useState(false);
  const [hedefToplam, setHedefToplam] = useState("");
  const [suruklenenIndex, setSuruklenenIndex] = useState(null);

  if (!sepet || sepet.length === 0) {
    return (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px dashed #cbd5e1" }}>
        <span style={{ color: "#64748b", fontSize: "13px" }}>Sepette henüz ürün bulunmuyor.</span>
        {gecmisUzunluk > 0 && onGeriAl && (
          <button
            type="button"
            onClick={onGeriAl}
            style={{ backgroundColor: "#d97706", color: "white", border: "none", padding: "5px 12px", borderRadius: "4px", fontSize: "11.5px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
          >
            ↩️ Geri Al
          </button>
        )}
      </div>
    );
  }

  // --- ÜRÜN İSİMLERİNE GÖRE DİNAMİK GRUP RENKLERİ ÜRETME ---
  const grupRenkleriPaleti = [
    "#ffffff", // Beyaz
    "#f0fdf4", // Açık Yeşil
    "#eff6ff", // Açık Mavi
    "#fefce8", // Açık Sarı
    "#fdf4ff", // Açık Mor / Pembe
    "#fdf2f8", // Açık Gül
    "#f0fdfa"  // Açık Turkuaz
  ];

  const benzersizUrunler = [...new Set(sepet.map(item => item.urunAciklamasi || "DİĞER"))];
  const renkMap = {};
  benzersizUrunler.forEach((isim, idx) => {
    renkMap[isim] = grupRenkleriPaleti[idx % grupRenkleriPaleti.length];
  });

  // --- SÜRÜKLE & BIRAK (DRAG AND DROP) FONKSİYONLARI ---
  const handleDragStart = (e, index) => {
    setSuruklenenIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, hedefIndex) => {
    e.preventDefault();
    if (suruklenenIndex === null || suruklenenIndex === hedefIndex) return;

    const yeniSepet = [...sepet];
    const [tasinanUrun] = yeniSepet.splice(suruklenenIndex, 1);
    yeniSepet.splice(hedefIndex, 0, tasinanUrun);

    setSuruklenenIndex(null);

    if (onTopluFiyatGuncelle) {
      onTopluFiyatGuncelle(yeniSepet);
    }
  };

  const tumunuSecVeyaKaldir = (durum) => {
    const yeniSepet = sepet.map(item => ({ ...item, secili: durum }));
    if (onTopluFiyatGuncelle) {
      onTopluFiyatGuncelle(yeniSepet);
    }
  };

  const tekliSecimDegistir = (index, durum) => {
    const yeniSepet = [...sepet];
    yeniSepet[index] = { ...yeniSepet[index], secili: durum };
    if (onTopluFiyatGuncelle) {
      onTopluFiyatGuncelle(yeniSepet);
    }
  };

  const topluFiyatDagit = () => {
    const girilenHedef = parseFloat(hedefToplam);
    if (!girilenHedef || girilenHedef <= 0) {
      alert("Lütfen geçerli bir hedef toplam tutar giriniz!");
      return;
    }

    const toplamMiktar = sepet.reduce((toplam, item) => toplam + (Number(item.miktar) || 1), 0);

    if (toplamMiktar <= 0) {
      alert("Sepetteki ürün miktarı geçersiz!");
      return;
    }

    const yeniBirimFiyat = girilenHedef / toplamMiktar;

    const yeniSepet = sepet.map((item) => {
      const yeniToplamTutar = Number((item.miktar * yeniBirimFiyat).toFixed(2));
      const birimFiyatStr = yeniBirimFiyat.toFixed(2);
      let yeniMiktarDetay = `${item.miktar} ${item.secilenBirim || item.birim || 'm²'} x ${birimFiyatStr} ₺`;

      return {
        ...item,
        birimFiyat: Number(birimFiyatStr),
        toplamTutar: yeniToplamTutar,
        miktarDetay: yeniMiktarDetay
      };
    });

    if (onTopluFiyatGuncelle) {
      onTopluFiyatGuncelle(yeniSepet);
    }

    setModalAcik(false);
    setHedefToplam("");
  };

  // --- SADECE SEÇİLİ OLAN ÜRÜNLERİN CANLI METRAJ HESAPLAMASI ---
  const seciliUrunler = (sepet || []).filter(item => item.secili !== false);
  const seciliMetraj = seciliUrunler.reduce((acc, item) => {
    const birim = (item.secilenBirim || item.birim || "m²").toLowerCase();
    const miktarVal = Number(item.miktar || item.toplamM2 || 0);
    const adetVal = Number(item.orijinalMiktar !== undefined ? item.orijinalMiktar : (item.adet || 1));

    acc.toplamAdet += adetVal;

    if (birim.includes("m²") || birim.includes("m2")) {
      acc.toplamM2 += miktarVal;
    } else if (birim.includes("mt")) {
      acc.toplamMt += miktarVal;
    }
    return acc;
  }, { toplamM2: 0, toplamMt: 0, toplamAdet: 0 });

  const genelToplamlar = genelToplamHesapla(sepet);
  const genelKdvler = genelKdvHesapla(sepet); 
  const hepsiSeciliMi = sepet.length > 0 && sepet.every(item => item.secili !== false);

  return (
    <div style={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid #cbd5e1", padding: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginBottom: "10px" }}>
        {gecmisUzunluk > 0 && onGeriAl && (
          <button
            type="button"
            onClick={onGeriAl}
            style={{ backgroundColor: "#d97706", color: "white", border: "none", padding: "6px 14px", borderRadius: "5px", fontSize: "12px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}
          >
            ↩️ Geri Al
          </button>
        )}

        <button
          type="button"
          onClick={() => setModalAcik(true)}
          style={{ backgroundColor: "#0284c7", color: "white", border: "none", padding: "6px 14px", borderRadius: "5px", fontSize: "12px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}
        >
          💰 Toplu Fiyat / m² Dağıt
        </button>

        <button
          type="button"
          onClick={onTemizle}
          style={{ backgroundColor: "#475569", color: "white", border: "none", padding: "6px 14px", borderRadius: "5px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}
        >
          🗑️ Sepeti Temizle
        </button>
      </div>

      {modalAcik && (
        <div style={{ backgroundColor: "#f0f9ff", border: "1px solid #0284c7", borderRadius: "6px", padding: "12px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#0369a1" }}>Hedef Toplam Tutar (KDV Hariç):</span>
          <input
            type="number"
            placeholder="Örn: 50000"
            value={hedefToplam}
            onChange={(e) => setHedefToplam(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "13px", width: "160px" }}
          />
          <button
            type="button"
            onClick={topluFiyatDagit}
            style={{ backgroundColor: "#0284c7", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
          >
            m² Fiyatlarını Hesapla ve Dağıt
          </button>
          <button
            type="button"
            onClick={() => setModalAcik(false)}
            style={{ backgroundColor: "#94a3b8", color: "white", border: "none", padding: "6px 10px", borderRadius: "4px", fontSize: "12px", cursor: "pointer" }}
          >
            İptal
          </button>
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ backgroundColor: "#0f2942", color: "white", textAlign: "left" }}>
              <th style={{ padding: "10px", textAlign: "center", width: "30px", borderRadius: "4px 0 0 0" }} title="Sürüklemek için tut">↕️</th>
              <th style={{ padding: "10px", textAlign: "center", width: "40px" }}>
                <input 
                  type="checkbox"
                  checked={hepsiSeciliMi}
                  onChange={(e) => tumunuSecVeyaKaldir(e.target.checked)}
                  title="İmalat Listesi İçin Tümünü Seç / Kaldır"
                  style={{ cursor: "pointer", width: "16px", height: "16px" }}
                />
              </th>
              <th style={{ padding: "10px", textAlign: "center", width: "70px" }}>Poz No</th>
              <th style={{ padding: "10px" }}>Ürün Açıklaması</th>
              <th style={{ padding: "10px" }}>Özel Açıklama</th>
              <th style={{ padding: "10px", textAlign: "center", color: "#38bdf8" }}>Ölçü (En x Boy)</th>
              <th style={{ padding: "10px", textAlign: "center", color: "#38bdf8" }}>Adet</th>
              <th style={{ padding: "10px", textAlign: "center" }}>Ölçü / Miktar</th>
              <th style={{ padding: "10px", textAlign: "center" }}>KDV</th>
              <th style={{ padding: "10px", textAlign: "right" }}>Toplam Tutar</th>
              <th style={{ padding: "10px", textAlign: "center", borderRadius: "0 4px 0 0" }}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {sepet.map((satir, index) => {
              const tamMetin = `${satir.ozelAciklama || ""} ${satir.miktarDetay || ""} ${satir.urunAciklamasi || ""}`;
              const olcuMatch = tamMetin.match(/(\d+)\s*[xX×]\s*(\d+)/);
              const enBoyMetni = olcuMatch ? `${olcuMatch[1]} × ${olcuMatch[2]} mm` : "-";

              const gercekAdet = satir.orijinalMiktar || satir.hamVeri?.miktar || satir.adet || 1;

              const urunGrubuAdi = satir.urunAciklamasi || "DİĞER";
              const grupArkaPlani = renkMap[urunGrubuAdi] || "#ffffff";

              return (
                <tr 
                  key={index} 
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  style={{ 
                    borderBottom: "1px solid #e2e8f0", 
                    backgroundColor: suruklenenIndex === index ? "#e0f2fe" : grupArkaPlani,
                    cursor: "grab",
                    opacity: suruklenenIndex === index ? 0.5 : 1,
                    transition: "background-color 0.2s"
                  }}
                  title="Aynı türdeki ürünler otomatik aynı renkte gruplanır. Sürükleyip yerini değiştirebilirsiniz."
                >
                  <td style={{ padding: "10px", textAlign: "center", color: "#94a3b8", fontWeight: "bold" }}>☰</td>
                  <td style={{ padding: "10px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox"
                      checked={satir.secili !== false}
                      onChange={(e) => tekliSecimDegistir(index, e.target.checked)}
                      title="İmalat Listesine Ekle"
                      style={{ cursor: "pointer", width: "16px", height: "16px" }}
                    />
                  </td>
                  <td style={{ padding: "10px", textAlign: "center", fontWeight: "700", color: "#0f2942" }}>
                    {satir.pozNo || "-"}
                  </td>
                  <td style={{ padding: "10px", fontWeight: "600", color: "#1e293b" }}>
                    {satir.urunAciklamasi}
                  </td>
                  <td style={{ padding: "10px", color: "#64748b", fontSize: "12px" }}>
                    {satir.ozelAciklama || "-"}
                  </td>
                  <td style={{ padding: "10px", textAlign: "center", fontWeight: "800", color: "#0369a1", fontSize: "14px", backgroundColor: "rgba(240, 249, 255, 0.7)" }}>
                    {enBoyMetni}
                  </td>
                  <td style={{ padding: "10px", textAlign: "center", fontWeight: "800", color: "#0f2942", fontSize: "14px", backgroundColor: "rgba(248, 250, 252, 0.7)" }}>
                    {gercekAdet} Adet
                  </td>
                  <td style={{ padding: "10px", textAlign: "center", color: "#334155" }}>
                    {satir.miktarDetay}
                  </td>
                  <td style={{ padding: "10px", textAlign: "center" }}>
                    %{satir.kdvOrani}
                  </td>
                  <td style={{ padding: "10px", textAlign: "right", fontWeight: "700", color: "#0f2942" }}>
                    {paraFormatla(satir.toplamTutar, satir.paraBirimi)}
                  </td>
                  <td style={{ padding: "10px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "flex", gap: "5px", justifyContent: "center", alignItems: "center" }}>
                      {onDuzenle && (
                        <button
                          type="button"
                          onClick={() => onDuzenle(index, satir)}
                          style={{ backgroundColor: "#1e40af", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", cursor: "pointer" }}
                        >
                          Düzenle
                        </button>
                      )}
                      {onTekrarEt && (
                        <button
                          type="button"
                          onClick={() => onTekrarEt(satir)}
                          style={{ backgroundColor: "#334155", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", cursor: "pointer" }}
                        >
                          Tekrar
                        </button>
                      )}
                      {onSil && (
                        <button
                          type="button"
                          onClick={() => onSil(index)}
                          style={{ backgroundColor: "#991b1b", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", cursor: "pointer" }}
                        >
                          Sil
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* --- SEPET TABLOSUNUN ALTINDA CANLI HESAPLAYAN METRAJ ÖZET BANNER'I --- */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        backgroundColor: "#f0fdf4", 
        border: "1px solid #16a34a", 
        padding: "10px 16px", 
        borderRadius: "6px", 
        marginTop: "14px", 
        color: "#166534",
        fontSize: "13px"
      }}>
        <div style={{ fontWeight: "800" }}>
          📊 SEÇİLİ ÜRÜN METRAJ ÖZETİ
        </div>
        <div style={{ display: "flex", gap: "20px", fontWeight: "700" }}>
          <span>🔹 Toplam Adet: <strong style={{ color: "#0f2942", fontSize: "14px" }}>{seciliMetraj.toplamAdet} Parça</strong></span>
          <span>📐 Seçili Alan: <strong style={{ color: "#15803d", fontSize: "14px" }}>{seciliMetraj.toplamM2.toFixed(2)} m²</strong></span>
          {seciliMetraj.toplamMt > 0 && (
            <span>📏 Seçili Metretül: <strong style={{ color: "#b45309", fontSize: "14px" }}>{seciliMetraj.toplamMt.toFixed(2)} mt</strong></span>
          )}
        </div>
      </div>

      <div style={{ marginTop: "15px", paddingTop: "10px", borderTop: "2px solid #0f2942", display: "flex", justifyContent: "flex-end", gap: "20px", flexWrap: "wrap", fontSize: "13px" }}>
        {Object.entries(genelToplamlar).map(([paraBirimi, tutar]) => {
          const kdvTutar = genelKdvler[paraBirimi] || 0;
          const kdvDahilToplam = tutar + kdvTutar;

          return (
            <div key={paraBirimi} style={{ textAlign: "right" }}>
              <span>Ara Toplam ({paraBirimi}): <strong>{paraFormatla(tutar, paraBirimi)} + KDV</strong></span>
              <span style={{ margin: "0 10px", color: "#cbd5e1" }}>|</span>
              <span>KDV: <strong>{paraFormatla(kdvTutar, paraBirimi)}</strong></span>
              <span style={{ margin: "0 10px", color: "#cbd5e1" }}>|</span>
              <span style={{ fontSize: "15px", color: "#0f2942" }}>KDV Dahil Toplam: <strong>{paraFormatla(kdvDahilToplam, paraBirimi)}</strong></span>
            </div>
          );
        })}
      </div>
    </div>
  );
}