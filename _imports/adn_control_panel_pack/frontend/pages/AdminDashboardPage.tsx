import AdminShell from "../ui/AdminShell";
import AdminCard from "../ui/AdminCard";
import { useAdminAnalytics } from "../hooks/useAdminAnalytics";

export default function AdminDashboardPage() {
  const analytics = useAdminAnalytics();

  if (analytics.isLoading) {
    return <AdminShell><div>Loading...</div></AdminShell>;
  }

  if (analytics.isError || !analytics.data) {
    return <AdminShell><div>Error loading analytics.</div></AdminShell>;
  }

  const data = analytics.data.data;

  return (
    <AdminShell>
      <div className="grid gap-4 md:grid-cols-3">
        <AdminCard title="DAU">
          <div className="text-3xl font-bold">{data.totals.dau}</div>
        </AdminCard>
        <AdminCard title="New Users">
          <div className="text-3xl font-bold">{data.totals.newUsers}</div>
        </AdminCard>
        <AdminCard title="Revenue (USD)">
          <div className="text-3xl font-bold">{data.totals.revenueUsd}</div>
        </AdminCard>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <AdminCard title="Retention">
          <div className="space-y-2 text-sm">
            <div>D1: {data.retention.d1}%</div>
            <div>D7: {data.retention.d7}%</div>
          </div>
        </AdminCard>

        <AdminCard title="Top Funnels">
          <div className="space-y-2 text-sm">
            {data.topFunnels.map((item: any) => (
              <div key={item.key} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                <span>{item.key}</span>
                <span>{item.conversionRate}%</span>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>
    </AdminShell>
  );
}
