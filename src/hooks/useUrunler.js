import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

/**
 * urunler tablosundan ürün listesini çeker.
 * Beklenen şema: id (uuid), aciklama (text), fiyat (numeric), hesap_turu ('m2' | 'adet')
 */
export function useUrunler() {
  const [urunler, setUrunler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState(null);

  useEffect(() => {
    let iptalEdildi = false;

    async function urunleriGetir() {
      setYukleniyor(true);
      const { data, error } = await supabase
        .from("urunler")
        .select("id, aciklama, hesap_turu")
        .order("aciklama", { ascending: true });

      if (iptalEdildi) return;

      if (error) {
        setHata(error.message);
      } else {
        setUrunler(data ?? []);
        setHata(null);
      }
      setYukleniyor(false);
    }

    urunleriGetir();
    return () => {
      iptalEdildi = true;
    };
  }, []);

  return { urunler, yukleniyor, hata };
}
