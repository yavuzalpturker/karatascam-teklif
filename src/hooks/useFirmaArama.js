import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useFirmaArama = (aramaMetni) => {
  const [sonuclar, setSonuclar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(false);

  useEffect(() => {
    if (!aramaMetni || aramaMetni.trim().length < 2) {
      setSonuclar([]);
      return;
    }

    const zamanlayici = setTimeout(async () => {
      try {
        setYukleniyor(true);
        const { data, error } = await supabase
          
          .from('firmalar')
          .select('firma_adi')
          .ilike('firma_adi', `%${aramaMetni}%`)
          .limit(20);

        if (error) throw error;
        setSonuclar(data || []);
      } catch (err) {
        console.error('Firma arama hatası:', err.message);
        setSonuclar([]);
      } finally {
        setYukleniyor(false);
      }
    }, 300); // 300ms yazma bitince ara

    return () => clearTimeout(zamanlayici);
  }, [aramaMetni]);

  return { sonuclar, yukleniyor };
};