import { useState } from "react";
import { teklifPdfIndir, proformaPdfIndir } from "../utils/pdfOlustur";
import { genelToplamHesapla } from "../utils/hesaplama";

export default function CiktiButonu({ teklif, sepet }) {
  // Hangi PDF'in üretildiğini takip etmek için state'i güncelledik.
  // 'teklif' | 'proforma' | null değerlerini alacak.
  const [islemDurumu, setIslemDurumu] = useState(null);

  if (sepet.length === 0) return null;

  async function indirTeklif() {
    setIslemDurumu("teklif");
    try {
      const genelToplam = genelToplamHesapla(sepet);
      await teklifPdfIndir(teklif, sepet, genelToplam);
    } finally {
      setIslemDurumu(null);
    }
  }

  async function indirProforma() {
    setIslemDurumu("proforma");
    try {
      // Proforma fonksiyonumuz kendi içinde toplamı hallediyor.
      await proformaPdfIndir(teklif, sepet);
    } finally {
      setIslemDurumu(null);
    }
  }

  return (
    <section className="panel">
      <h2 className="panel__baslik">Çıktı Yönetimi</h2>
      
      {/* Butonların yan yana düzgün durması için bir flex container ekledik */}
      <div style={{ display: "flex", gap: "1rem" }}>
        
        {/* 1. Orijinal Buton (Düz Teklif) */}
        <button 
          className="buton buton--birincil" 
          onClick={indirTeklif} 
          disabled={islemDurumu !== null}
        >
          {islemDurumu === "teklif" ? "Hazırlanıyor…" : "Teklifi Resmi PDF Olarak İndir"}
        </button>

        {/* 2. Yeni Buton (Proforma Fatura) */}
        <button 
          className="buton buton--birincil" 
          onClick={indirProforma} 
          disabled={islemDurumu !== null}
        >
          {islemDurumu === "proforma" ? "Hazırlanıyor…" : "Proforma Fatura Olarak İndir"}
        </button>
        
      </div>
    </section>
  );
}