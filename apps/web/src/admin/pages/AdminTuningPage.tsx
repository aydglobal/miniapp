import { useEffect, useState } from 'react';
import { adminFetch } from '../../lib/adminApi';

type TuningState = {
  tap: {
    baseReward: number;
    critChance: number;
    critMultiplier: number;
    comboResetMs: number;
  };
  economy: {
    dailyRewardMultiplier: number;
    missionRewardMultiplier: number;
    shopPriceMultiplier: number;
    passiveIncomeMultiplier: number;
  };
  loot: {
    jackpotChance: number;
    legendaryWeight: number;
    mythicWeight: number;
  };
};

export function AdminTuningPage() {
  const [tuning, setTuning] = useState<TuningState | null>(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    const response = await adminFetch<{ success: true; data: TuningState }>('/api/admin/tuning');
    setTuning(response.data);
  }

  useEffect(() => {
    load().catch((error) => setMessage(error instanceof Error ? error.message : 'Panel yuklenemedi.'));
  }, []);

  async function save() {
    if (!tuning) return;
    setSaving(true);
    try {
      const response = await adminFetch<{ success: true; data: TuningState }>('/api/admin/tuning', {
        method: 'POST',
        body: JSON.stringify(tuning)
      });
      setTuning(response.data);
      setMessage('Live tuning kaydedildi.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kayit basarisiz.');
    } finally {
      setSaving(false);
    }
  }

  if (!tuning) {
    return <div style={emptyStyle}>Live tuning yukleniyor...</div>;
  }

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Live tuning</h1>
          <p style={copyStyle}>Tap, ekonomi ve loot degerlerini oyunu bozmadan canli sekilde yonet.</p>
        </div>
        <button style={primaryButtonStyle} onClick={save} disabled={saving}>
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      <div style={gridStyle}>
        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>Tap cekirdegi</h2>
          <Field label="Base reward">
            <input type="number" value={tuning.tap.baseReward} onChange={(event) => setTuning({ ...tuning, tap: { ...tuning.tap, baseReward: Number(event.target.value) } })} style={inputStyle} />
          </Field>
          <Field label="Crit chance">
            <input type="number" step="0.001" value={tuning.tap.critChance} onChange={(event) => setTuning({ ...tuning, tap: { ...tuning.tap, critChance: Number(event.target.value) } })} style={inputStyle} />
          </Field>
          <Field label="Crit multiplier">
            <input type="number" step="0.1" value={tuning.tap.critMultiplier} onChange={(event) => setTuning({ ...tuning, tap: { ...tuning.tap, critMultiplier: Number(event.target.value) } })} style={inputStyle} />
          </Field>
          <Field label="Combo reset (ms)">
            <input type="number" value={tuning.tap.comboResetMs} onChange={(event) => setTuning({ ...tuning, tap: { ...tuning.tap, comboResetMs: Number(event.target.value) } })} style={inputStyle} />
          </Field>
        </section>

        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>Ekonomi</h2>
          <Field label="Daily reward x">
            <input type="number" step="0.05" value={tuning.economy.dailyRewardMultiplier} onChange={(event) => setTuning({ ...tuning, economy: { ...tuning.economy, dailyRewardMultiplier: Number(event.target.value) } })} style={inputStyle} />
          </Field>
          <Field label="Mission reward x">
            <input type="number" step="0.05" value={tuning.economy.missionRewardMultiplier} onChange={(event) => setTuning({ ...tuning, economy: { ...tuning.economy, missionRewardMultiplier: Number(event.target.value) } })} style={inputStyle} />
          </Field>
          <Field label="Shop price x">
            <input type="number" step="0.05" value={tuning.economy.shopPriceMultiplier} onChange={(event) => setTuning({ ...tuning, economy: { ...tuning.economy, shopPriceMultiplier: Number(event.target.value) } })} style={inputStyle} />
          </Field>
          <Field label="Passive income x">
            <input type="number" step="0.05" value={tuning.economy.passiveIncomeMultiplier} onChange={(event) => setTuning({ ...tuning, economy: { ...tuning.economy, passiveIncomeMultiplier: Number(event.target.value) } })} style={inputStyle} />
          </Field>
        </section>

        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>Loot</h2>
          <Field label="Jackpot chance">
            <input type="number" step="0.0001" value={tuning.loot.jackpotChance} onChange={(event) => setTuning({ ...tuning, loot: { ...tuning.loot, jackpotChance: Number(event.target.value) } })} style={inputStyle} />
          </Field>
          <Field label="Legendary weight">
            <input type="number" value={tuning.loot.legendaryWeight} onChange={(event) => setTuning({ ...tuning, loot: { ...tuning.loot, legendaryWeight: Number(event.target.value) } })} style={inputStyle} />
          </Field>
          <Field label="Mythic weight">
            <input type="number" value={tuning.loot.mythicWeight} onChange={(event) => setTuning({ ...tuning, loot: { ...tuning.loot, mythicWeight: Number(event.target.value) } })} style={inputStyle} />
          </Field>
        </section>
      </div>

      {message ? <div style={messageStyle}>{message}</div> : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={fieldStyle}>
      <span style={fieldLabelStyle}>{label}</span>
      {children}
    </label>
  );
}

const pageStyle: React.CSSProperties = { display: 'grid', gap: 18 };
const headerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' };
const titleStyle: React.CSSProperties = { margin: 0, fontSize: 28 };
const copyStyle: React.CSSProperties = { margin: '8px 0 0', color: 'rgba(255,255,255,0.68)', maxWidth: 700, lineHeight: 1.6 };
const gridStyle: React.CSSProperties = { display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' };
const cardStyle: React.CSSProperties = { padding: 18, borderRadius: 22, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' };
const sectionTitleStyle: React.CSSProperties = { margin: '0 0 14px', fontSize: 18 };
const fieldStyle: React.CSSProperties = { display: 'grid', gap: 8, marginTop: 12 };
const fieldLabelStyle: React.CSSProperties = { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8, color: 'rgba(255,255,255,0.62)' };
const inputStyle: React.CSSProperties = { borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: '#0e1624', color: 'white', padding: '12px 14px' };
const primaryButtonStyle: React.CSSProperties = { border: 'none', borderRadius: 16, background: 'linear-gradient(135deg, #ffd35f, #ff8a4c)', color: '#160c03', padding: '14px 18px', fontWeight: 800, cursor: 'pointer' };
const messageStyle: React.CSSProperties = { padding: 14, borderRadius: 16, background: 'rgba(104, 232, 166, 0.12)', border: '1px solid rgba(104, 232, 166, 0.2)', color: '#b6ffd6' };
const emptyStyle: React.CSSProperties = { color: 'white' };
