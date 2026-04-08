import { useState } from 'react';
import { adminFetch } from '../../lib/adminApi';

export default function NotificationCampaigns() {
  const [form, setForm] = useState({
    segment: 'all',
    message: '',
    scheduledAt: ''
  });
  const [status, setStatus] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Gönderiliyor...');
    try {
      await adminFetch('/admin/notifications/campaign', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      setStatus('✅ Kampanya oluşturuldu');
      setForm({ segment: 'all', message: '', scheduledAt: '' });
    } catch (err: any) {
      setStatus(`❌ Hata: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: 24, color: '#fff' }}>
      <h2>Bildirim Kampanyaları</h2>

      <form onSubmit={handleSend} aria-label="Bildirim kampanyası oluştur" style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}>
        <label htmlFor="nc-segment">
          Hedef Segment
          <select id="nc-segment" value={form.segment} onChange={e => setForm(f => ({ ...f, segment: e.target.value }))} aria-label="Hedef segment seç">
            <option value="all">Tüm Kullanıcılar</option>
            <option value="churn_risk">Churn Risk</option>
            <option value="hot">Aktif</option>
            <option value="warm">Ilık</option>
            <option value="cold">Soğuk</option>
          </select>
        </label>

        <label htmlFor="nc-message">
          Mesaj
          <textarea
            id="nc-message"
            value={form.message}
            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            rows={4}
            required
            aria-required="true"
            placeholder="Bildirim metni..."
          />
        </label>

        <label htmlFor="nc-schedule">
          Zamanlama (opsiyonel)
          <input
            id="nc-schedule"
            type="datetime-local"
            value={form.scheduledAt}
            onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
            aria-label="Gönderim zamanı"
          />
        </label>

        <button type="submit" aria-label="Kampanya oluştur ve gönder">Kampanya Oluştur</button>
      </form>

      {status && <p role="status" aria-live="polite" style={{ marginTop: 12 }}>{status}</p>}
    </div>
  );
}
