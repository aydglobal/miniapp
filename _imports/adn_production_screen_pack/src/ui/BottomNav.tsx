const items = [
  { label: "Home" },
  { label: "Shop" },
  { label: "Tasks" },
  { label: "Clan" },
  { label: "Profile" },
];

export default function BottomNav() {
  return (
    <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md border-t border-white/10 bg-[#0B1224]/95 backdrop-blur">
      <div className="grid grid-cols-5 gap-1 px-2 py-3 text-center text-[11px] text-[#A8B3CF]">
        {items.map((item) => (
          <button key={item.label} className="rounded-2xl px-2 py-2 hover:bg-white/5">
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
