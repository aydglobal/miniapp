import { useEffect, useState } from "react";
import { adminFetch } from "../../lib/api";

export default function NotificationsPage() {
  const [summary, setSummary] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    adminFetch("/admin/notifications/summary").then((res) => setSummary(res.data));
    adminFetch("/admin/notifications/logs").then((res) => setLogs(res.items));
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h1>Notification Admin</h1>
      {summary && (
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <div>Queued: {summary.queued}</div>
          <div>Sent today: {summary.sentToday}</div>
        </div>
      )}

      <div>
        {logs.map((item) => (
          <div key={item.id} style={{ border: "1px solid #333", borderRadius: 12, padding: 12, marginBottom: 10 }}>
            <div><strong>{item.type}</strong> / {item.status}</div>
            <div>{item.messageText}</div>
            <div>{new Date(item.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
