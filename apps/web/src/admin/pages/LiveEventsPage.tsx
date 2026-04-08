import { useState, useEffect } from 'react';
import { adminFetch } from '../../lib/adminApi';

interface LiveEvent {
  id: string;
  key: string;
  title: string;
  startsAt: string;
  endsAt: string;
  isEnabled: boolean;
  modifiersJson: string;
  remainingMs?: number;
}

export default function LiveEventsPage() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ key: '', title: '', startsAt: '', endsAt: '', modifiersJson: '{"tapMultiplier":2}' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminFetch<{ data: LiveEvent[] }>('/admin/events');
      setEvents(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminFetch('/admin/events', {
      method: 'POST',
      body: JSON.stringify(form)
    });
    setForm({ key: '', title: '', startsAt: '', endsAt: '', modifiersJson: '{"tapMultiplier":2}' });
    load();
  };

  const handleDelete = async (key: string) => {
    await adminFetch(`/admin/events/${key}`, { method: 'DELETE' });
    load();
  };

  const handleToggle = async (event: LiveEvent) => {
    const fn = event.isEnabled ? 'stop' : 'start';
    await adminFetch(`/admin/events/${event.key}/${fn}`, { method: 'POST' });
    load();
  };

  return (
    <div style={{ padding: 24, color: '#fff' }}>
      <h2>Live Events</h2>

      <form onSubmit={handleCreate} aria-label="Yeni live event oluştur" style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400 }}>
        <label htmlFor="le-key">Key</label>
        <input id="le-key" placeholder="Key" value={form.key} onChange={e => setForm(f => ({ ...f, key: e.target.value }))} required aria-required="true" />
        <label htmlFor="le-title">Başlık</label>
        <input id="le-title" placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required aria-required="true" />
        <label htmlFor="le-starts">Başlangıç</label>
        <input id="le-starts" type="datetime-local" value={form.startsAt} onChange={e => setForm(f => ({ ...f, startsAt: e.target.value }))} required aria-required="true" />
        <label htmlFor="le-ends">Bitiş</label>
        <input id="le-ends" type="datetime-local" value={form.endsAt} onChange={e => setForm(f => ({ ...f, endsAt: e.target.value }))} required aria-required="true" />
        <label htmlFor="le-mods">Modifiers JSON</label>
        <input id="le-mods" placeholder='{"tapMultiplier":2}' value={form.modifiersJson} onChange={e => setForm(f => ({ ...f, modifiersJson: e.target.value }))} />
        <button type="submit" aria-label="Live event oluştur">Oluştur</button>
      </form>

      {loading ? <p>Yükleniyor...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Başlık</th><th>Başlangıç</th><th>Bitiş</th><th>Durum</th><th>Kalan</th><th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {events.map(ev => (
              <tr key={ev.id}>
                <td>{ev.title}</td>
                <td>{new Date(ev.startsAt).toLocaleString('tr-TR')}</td>
                <td>{new Date(ev.endsAt).toLocaleString('tr-TR')}</td>
                <td>{ev.isEnabled ? '✅ Aktif' : '⏸ Pasif'}</td>
                <td>{ev.remainingMs ? `${Math.floor(ev.remainingMs / 60000)}dk` : '-'}</td>
                <td>
                  <button onClick={() => handleToggle(ev)}>{ev.isEnabled ? 'Durdur' : 'Başlat'}</button>
                  {' '}
                  <button onClick={() => handleDelete(ev.key)}>Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
