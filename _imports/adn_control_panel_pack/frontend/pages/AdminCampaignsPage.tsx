import AdminShell from "../ui/AdminShell";
import AdminCard from "../ui/AdminCard";
import { useAdminCampaigns, useTriggerAdminCampaign } from "../hooks/useAdminCampaigns";

export default function AdminCampaignsPage() {
  const campaigns = useAdminCampaigns();
  const trigger = useTriggerAdminCampaign();

  if (campaigns.isLoading) return <AdminShell><div>Loading...</div></AdminShell>;
  if (campaigns.isError || !campaigns.data) return <AdminShell><div>Error loading campaigns.</div></AdminShell>;

  return (
    <AdminShell>
      <AdminCard title="Notification Campaigns" subtitle="Segment bazlı bildirim kampanyalarını yönet">
        <div className="space-y-3">
          {campaigns.data.data.map((item: any) => (
            <div key={item.key} className="rounded-[20px] bg-white/5 p-4">
              <div className="font-semibold">{item.title}</div>
              <div className="mt-1 text-sm text-[#A8B3CF]">Audience: {item.audienceSegment}</div>
              <div className="mt-1 text-sm text-[#A8B3CF]">Status: {item.status}</div>
              <button
                onClick={() => trigger.mutate(item.key)}
                className="mt-3 rounded-xl bg-white/10 px-4 py-3 text-sm"
              >
                Trigger
              </button>
            </div>
          ))}
        </div>
      </AdminCard>
    </AdminShell>
  );
}
