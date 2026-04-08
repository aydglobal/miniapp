import AdminShell from "../ui/AdminShell";
import AdminCard from "../ui/AdminCard";
import { useAdminEvents, useStartAdminEvent, useStopAdminEvent } from "../hooks/useAdminEvents";

export default function AdminEventsPage() {
  const events = useAdminEvents();
  const start = useStartAdminEvent();
  const stop = useStopAdminEvent();

  if (events.isLoading) return <AdminShell><div>Loading...</div></AdminShell>;
  if (events.isError || !events.data) return <AdminShell><div>Error loading events.</div></AdminShell>;

  return (
    <AdminShell>
      <AdminCard title="Live Events" subtitle="Canlı event başlat / durdur">
        <div className="space-y-3">
          {events.data.data.map((event: any) => (
            <div key={event.key} className="rounded-[20px] bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">{event.title}</div>
                  <div className="mt-1 text-sm text-[#A8B3CF]">{event.key}</div>
                </div>
                <div className={`rounded-full px-3 py-1 text-xs ${event.isEnabled ? "bg-green-500/20 text-green-300" : "bg-white/10 text-[#A8B3CF]"}`}>
                  {event.isEnabled ? "Active" : "Inactive"}
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => start.mutate(event.key)}
                  className="rounded-xl bg-white/10 px-4 py-3 text-sm"
                >
                  Start
                </button>
                <button
                  onClick={() => stop.mutate(event.key)}
                  className="rounded-xl bg-white/10 px-4 py-3 text-sm"
                >
                  Stop
                </button>
              </div>
            </div>
          ))}
        </div>
      </AdminCard>
    </AdminShell>
  );
}
