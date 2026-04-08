import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function WithdrawPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [currency, setCurrency] = useState("TON");
  const [amount, setAmount] = useState("1");
  const [destinationAddress, setDestinationAddress] = useState("");

  async function load() {
    const data = await fetch(`${API_URL}/withdrawals`).then((r) => r.json());
    setWallet(data.wallet);
    setItems(data.items || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function submit() {
    const data = await fetch(`${API_URL}/withdrawals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currency, amount: Number(amount), destinationAddress }),
    }).then((r) => r.json());

    if (!data.success) {
      alert(data.message || "Failed");
      return;
    }
    await load();
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Withdraw</h1>
      <div>Eligible: {wallet?.eligibleRewardBalance ?? 0}</div>
      <div>Locked: {wallet?.lockedRewardBalance ?? 0}</div>
      <div>Withdrawn total: {wallet?.withdrawnTotal ?? 0}</div>

      <div style={{ marginTop: 16 }}>
        <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
          <option value="TON">TON</option>
          <option value="USDT">USDT</option>
        </select>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" />
        <input value={destinationAddress} onChange={(e) => setDestinationAddress(e.target.value)} placeholder="Destination" />
        <button onClick={submit}>Create Request</button>
      </div>

      <h2 style={{ marginTop: 24 }}>History</h2>
      {items.map((x) => (
        <div key={x.id} style={{ borderBottom: "1px solid #eee", padding: "8px 0" }}>
          <div>{x.currency} {x.amount}</div>
          <div>{x.status}</div>
        </div>
      ))}
    </div>
  );
}
