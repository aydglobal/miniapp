import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function PayoutsPage() {
  const [items, setItems] = useState<any[]>([]);

  async function load() {
    const data = await fetch(`${API_URL}/admin/payouts`).then((r) => r.json());
    setItems(data.items || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function action(id: string, type: "approve" | "send" | "reject") {
    const body = type === "send" ? { externalTxId: "manual_tx_" + Date.now() } :
      type === "reject" ? { rejectionReason: "Admin review reject" } : {};

    const data = await fetch(`${API_URL}/admin/payouts/${id}/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json());

    if (!data.success) alert(data.message || "Action failed");
    await load();
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Payout Requests</h1>
      {items.map((x) => (
        <div key={x.id} style={{ border: "1px solid #ddd", borderRadius: 10, marginBottom: 12, padding: 12 }}>
          <div><strong>{x.user?.username || x.userId}</strong></div>
          <div>{x.currency} {x.amount}</div>
          <div>Status: {x.status}</div>
          <div>Risk: {x.riskScore}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={() => action(x.id, "approve")}>Approve</button>
            <button onClick={() => action(x.id, "send")}>Mark Sent</button>
            <button onClick={() => action(x.id, "reject")}>Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}
