import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export default function ReferralPage() {
  const [data, setData] = useState<any>(null);
  const [codeInput, setCodeInput] = useState("");

  async function load() {
    const res = await apiFetch("/referral");
    setData(res);
  }

  async function apply() {
    await apiFetch("/referral/apply", {
      method: "POST",
      body: JSON.stringify({ code: codeInput }),
    });
    await load();
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  if (!data) return <div>Yükleniyor...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1>Referral</h1>
      <p>Kodun: <strong>{data.code.code}</strong></p>
      <p>Toplam: {data.totals.total} | Aktif: {data.totals.active} | Ödüllü: {data.totals.rewarded}</p>

      <div style={{ margin: "16px 0" }}>
        <input value={codeInput} onChange={(e) => setCodeInput(e.target.value)} placeholder="Referral code gir" />
        <button onClick={apply}>Uygula</button>
      </div>

      <div>
        {data.links.map((item: any) => (
          <div key={item.id} style={{ border: "1px solid #333", borderRadius: 12, padding: 12, marginBottom: 8 }}>
            <div>Status: {item.status}</div>
            <div>Quality: {item.qualityScore}</div>
            <div>Reward: {item.rewardGranted ? "yes" : "no"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
