import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useUrunler = () => {
  const [urunler, setUrunler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState(null);

  useEffect(() => {
    const fetchUrunler = async () => {
      try {
        setYukleniyor(true);
        // Supabase'deki yeni sütun isimleriyle verileri çekiyoruz
        const { data, error } = await supabase
          .from('urunler')
          .select('id, turu, kodu, aciklama, aciklama_2, hesap_turu, fiyat');

        if (error) throw error;
        setUrunler(data || []);
      } catch (err) {
        console.error("Veri çekme hatası:", err.message);
        setHata(err.message);
      } finally {
        setYukleniyor(false);
      }
    };

    fetchUrunler();
  }, []);

  return { urunler, yukleniyor, hata };
};