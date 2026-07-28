import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { teklifPdfIndir, proformaPdfIndir } from '../utils/pdfOlustur';
import { imalatPdfIndir } from '../utils/pdfImalatOlustur';

export default function OnayYonetimi() {
  const [bekleyenler, setBekleyenler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [secilenTeklif, setSecilenTeklif] = useState(null);

  const bekleyenleriGetir = async () => {
    setYukleniyor(true);
    const { data, error } = await supabase.from('teklifler').select('*').eq('onay_durumu', 'bekliyor').order('tarih', { ascending: false });
    if (error) console.error('Bekleyen teklifler getirilemedi:', error);
    else setBekleyenler(data || []);
    setYukleniyor(false);
  };

  useEffect(() => { bekleyenleriGetir(); }, []);

  const teklifiOnayla = async (id) => {
    const { error } = await supabase.from('teklifler').update({ onay_durumu: 'onaylandi' }).eq('id', id);
    if (error) alert('Onaylama sırasında hata oluştu!');
    else { alert('Teklif başarıyla onaylandı.'); setSecilenTeklif(null); bekleyenleriGetir(); }
  };

  const teklifiReddet = async (id) => {
    if (!window.confirm('Bu teklifi kalıcı olarak reddetmek ve silmek istediğinize emin misiniz?')) return;
    const { error } = await supabase.from('teklifler').delete().eq('id', id);
    if (error) alert('Reddetme sırasında hata oluştu!');
    else { alert('Teklif silindi.'); setSecilenTeklif(null); bekleyenleriGetir(); }
  };

  // Seçilen teklifi PDF'in anlayacağı formata çeviriyoruz
  const formatiUyarla = (dbItem) => ({
    musteriAdi: dbItem.musteri_adi,
    ilgiliKisi: dbItem.ilgili_kisi,
    projeAdi: dbItem.proje_adi,
    teklifNo: dbItem.teklif_no,
    notlar: dbItem.notlar,
    odemeSekli: dbItem.odeme_sekli,
    tarih: dbItem.tarih
  });

  return (
    <div style={{ padding: '30px 40px', maxWidth: '1200px', margin: '0 auto', fontFamily: '"Segoe UI", sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
        <div>
          <h2 style={{ color: '#0f2942', margin: '0 0 6px 0', fontSize: '24px', fontWeight: '800', letterSpacing: '-0.3px' }}>Yönetici Onay Paneli</h2>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>Personellerin hazırladığı ve onay bekleyen kurumsal teklif listesi.</p>
        </div>
        <button onClick={bekleyenleriGetir} style={{ backgroundColor: '#0f2942', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13.5px' }}>
          Listeyi Yenile
        </button>
      </div>

      {bekleyenler.length === 0 ? (
        <div style={{ backgroundColor: 'white', padding: '50px', borderRadius: '12px', textAlign: 'center', color: '#64748b', border: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '15px', fontWeight: '600', margin: 0 }}>Şu an onay bekleyen herhangi bir teklif bulunmuyor.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {bekleyenler.map((item) => (
            <div key={item.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '22px', border: '1px solid #e2e8f0', borderLeft: '5px solid #0f2942', display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={{ backgroundColor: '#f1f5f9', color: '#0f2942', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '700', border: '1px solid #cbd5e1' }}>BEKLEYEN İŞLEM</span>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>{new Date(item.tarih).toLocaleDateString('tr-TR')}</span>
                </div>
                <h3 style={{ color: '#0f2942', fontSize: '17px', margin: '0 0 10px 0', fontWeight: '700' }}>{item.musteri_adi}</h3>
                <p style={{ color: '#475569', fontSize: '13.5px', margin: '0 0 4px 0' }}><b>Proje:</b> {item.proje_adi || '-'}</p>
                <p style={{ color: '#475569', fontSize: '13.5px', margin: '0' }}><b>İlgili:</b> {item.ilgili_kisi || '-'}</p>
              </div>

              <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '15px', marginTop: 'auto' }}>
                <button onClick={() => setSecilenTeklif(item)} style={{ flex: 1, backgroundColor: '#f8fafc', color: '#0f2942', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
                  İncele & PDF Gör
                </button>
                <button onClick={() => teklifiOnayla(item.id)} style={{ backgroundColor: '#0f2942', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
                  Onayla
                </button>
                <button onClick={() => teklifiReddet(item.id)} style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
                  Reddet
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {secilenTeklif && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '14px', width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', padding: '35px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <h3 style={{ color: '#0f2942', marginTop: 0, borderBottom: '2px solid #0f2942', paddingBottom: '12px', fontSize: '18px', fontWeight: '800' }}>
              Teklif Detay İncelemesi
            </h3>
            
            {/* YÖNETİCİ PDF ÖNİZLEME BUTONLARI */}
            <div style={{ display: 'flex', gap: '10px', margin: '20px 0', padding: '15px', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
              <div style={{ fontWeight: '700', color: '#0f2942', alignSelf: 'center', marginRight: '10px' }}>PDF Önizleme:</div>
              <button onClick={() => teklifPdfIndir(formatiUyarla(secilenTeklif), secilenTeklif.sepet, secilenTeklif.sepet2, secilenTeklif.teklif_no, true)} style={{ backgroundColor: 'white', color: '#0f2942', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>Teklif</button>
              <button onClick={() => proformaPdfIndir(formatiUyarla(secilenTeklif), secilenTeklif.sepet, secilenTeklif.sepet2, secilenTeklif.teklif_no, true)} style={{ backgroundColor: 'white', color: '#0f2942', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>Proforma</button>
              <button onClick={() => imalatPdfIndir(formatiUyarla(secilenTeklif), secilenTeklif.sepet, secilenTeklif.sepet2, secilenTeklif.teklif_no, true)} style={{ backgroundColor: 'white', color: '#0f2942', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>İmalat</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '20px 0', fontSize: '14px', color: '#334155' }}>
              <div><b>Müşteri:</b> {secilenTeklif.musteri_adi}</div>
              <div><b>Proje:</b> {secilenTeklif.proje_adi || '-'}</div>
              <div><b>İlgili Kişi:</b> {secilenTeklif.ilgili_kisi || '-'}</div>
              <div><b>Ödeme Şekli:</b> {secilenTeklif.odeme_sekli || 'Belirtilmemiş'}</div>
            </div>

            <h4 style={{ color: '#0f2942', marginTop: '20px', marginBottom: '10px', fontSize: '15px', fontWeight: '700' }}>1. Seçenek Ürünleri</h4>
            <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', fontSize: '13.5px', border: '1px solid #e2e8f0' }}>
              {secilenTeklif.sepet && secilenTeklif.sepet.length > 0 ? secilenTeklif.sepet.map((urun, idx) => (
                <div key={idx} style={{ marginBottom: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}><b>{urun.urunAciklamasi}</b> - {urun.miktarDetay}</div>
              )) : <p style={{ margin: 0, color: '#64748b' }}>Bu sepette ürün yok.</p>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              <button onClick={() => setSecilenTeklif(null)} style={{ backgroundColor: '#64748b', color: 'white', border: 'none', padding: '11px 22px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>Kapat</button>
              <button onClick={() => teklifiOnayla(secilenTeklif.id)} style={{ backgroundColor: '#0f2942', color: 'white', border: 'none', padding: '11px 22px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>Onayla & Arşive Ekle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}