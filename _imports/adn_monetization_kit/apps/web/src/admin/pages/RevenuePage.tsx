import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function RevenuePage() {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_URL}/admin/revenue`)
      .then((r) => r.json())
      .then((d) => setSummary(d.summary));
  }, []);

  if (!summary) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Revenue Summary</h1>
      <div>Gross Paid Stars: {summary.grossPaidStars}</div>
      <div>Paid Payments: {summary.paidPayments}</div>
      <div>Pending Withdrawals: {summary.pendingWithdrawals}</div>
      <div>Sent Withdrawals: {summary.sentWithdrawals}</div>
    </div>
  );
}
