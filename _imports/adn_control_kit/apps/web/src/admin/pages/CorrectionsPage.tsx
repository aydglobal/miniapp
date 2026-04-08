import { useState } from "react";

export default function CorrectionsPage() {
  const [targetUserId, setTargetUserId] = useState("");
  const [bucket, setBucket] = useState("coins");
  const [amount, setAmount] = useState("0");
  const [note, setNote] = useState("");

  async function submit() {
    await fetch("/admin/corrections/balance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-idempotency-key": crypto.randomUUID(),
      },
      body: JSON.stringify({
        targetUserId,
        bucket,
        amount: Number(amount),
        note,
      }),
    });
    alert("Balance updated");
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Corrections</h1>
      <input value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)} placeholder="User ID" />
      <select value={bucket} onChange={(e) => setBucket(e.target.value)}>
        <option value="coins">Coins</option>
        <option value="adnBalance">ADN</option>
        <option value="eligibleRewardBalance">Eligible Reward</option>
        <option value="lockedRewardBalance">Locked Reward</option>
      </select>
      <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" />
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note" />
      <button onClick={submit}>Apply</button>
    </div>
  );
}
