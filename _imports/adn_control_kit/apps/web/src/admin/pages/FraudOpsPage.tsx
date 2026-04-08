import { useEffect, useState } from "react";

export default function FraudOpsPage() {
  const [summary, setSummary] = useState<any>(null);
  const [cases, setCases] = useState<any[]>([]);

  useEffect(() => {
    fetch("/admin/fraud-ops/summary").then((r) => r.json()).then((d) => setSummary(d.summary));
    fetch("/admin/fraud-ops/cases").then((r) => r.json()).then((d) => setCases(d.items || []));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Fraud Ops</h1>
      {summary && (
        <div>
          <p>Open Cases: {summary.openCases}</p>
          <p>Locked Users: {summary.lockedUsers}</p>
          <p>Risky Devices: {summary.riskyDevices}</p>
        </div>
      )}

      <h2>Recent Cases</h2>
      {cases.map((item) => (
        <div key={item.id} style={{ border: "1px solid #333", padding: 12, marginBottom: 12 }}>
          <strong>{item.title}</strong>
          <div>{item.summary}</div>
          <div>Status: {item.status}</div>
          <div>Severity: {item.severity}</div>
        </div>
      ))}
    </div>
  );
}
