import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Ayarlar() {
  const [imzalayan, setImzalayan] = useState('');
  const [iban, setIban] = useState('');
  const [sartlar, setSartlar] = useState('');
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [mesaj, setMesaj] = useState('');

  useEffect(() => {
    async function ayarlariGetir() {
      const { data, error } = await supabase.from('ayarlar').select('*').eq('id', 1).single();
      if (data) {
        setImzalayan(data.imzalayan || '');
        setIban(data.iban || '');
        setSartlar(data.sartlar || '');
      }
      if (error) console.error("Ayarlar çekilemedi:", error);
    }
    ayarlariGetir();
  }, []);

  async function ayarlariKaydet() {
    setKaydediliyor(true);
    setMesaj('');
    
    const { error } = await supabase
      .from('ayarlar')
      .update({ imzalayan, iban, sartlar })
      .eq('id', 1);

    if (error) {
      setMesaj('❌ Hata oluştu: ' + error.message);
    } else {
      setMesaj('✅ Ayarlar başarıyla güncellendi!');
      setTimeout(() => setMesaj(''), 3000);
    }
    setKaydediliyor(false);
  }

  return (
    <section className="panel" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h2 className="panel__baslik">⚙️ Sistem Ayarları</h2>
      <p className="bilgi-metni">Buradan yapılan değişiklikler anında yeni oluşturulacak PDF'lere yansır.</p>

      <label className="alan">
        <span>Teklifi İmzalayan Kişi (Varsayılan)</span>
        <input 
          type="text" 
          value={imzalayan} 
          onChange={(e) => setImzalayan(e.target.value)} 
          style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
        />
      </label>

      <label className="alan">
        <span>Şirket IBAN Bilgisi</span>
        <input 
          type="text" 
          value={iban} 
          onChange={(e) => setIban(e.target.value)} 
          style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
        />
      </label>

      <label className="alan">
        <span>PDF Altı Yasal Şartlar (Her satıra bir şart yazın)</span>
        <textarea 
          value={sartlar} 
          onChange={(e) => setSartlar(e.target.value)} 
          rows={12}
          style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", resize: "vertical" }}
        />
      </label>

      <button 
        className="buton buton--birincil" 
        onClick={ayarlariKaydet} 
        disabled={kaydediliyor}
        style={{ width: "100%", marginTop: "10px" }}
      >
        {kaydediliyor ? 'Kaydediliyor...' : '💾 Ayarları Kaydet'}
      </button>
      
      {mesaj && <p style={{ textAlign: "center", marginTop: "15px", fontWeight: "bold", color: mesaj.includes('✅') ? 'green' : 'red' }}>{mesaj}</p>}
    </section>
  );
}