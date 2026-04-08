import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export default function LeaderboardPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    apiFetch("/leaderboard/global")
      .then((res) => setItems(res.items))
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h1>Leaderboard</h1>
      {items.map((item) => (
        <div key={item.userId} style={{ display: "grid", gridTemplateColumns: "50px 1fr 120px", padding: 8, borderBottom: "1px solid #222" }}>
          <div>#{item.rank}</div>
          <div>{item.username || item.userId}</div>
          <div>{Math.floor(item.effectiveScore)}</div>
        </div>
      ))}
    </div>
  );
}
