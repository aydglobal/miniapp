export default function RewardToast({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-[#111A33] px-4 py-3 text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-1 text-xs text-[#A8B3CF]">{body}</div>
    </div>
  );
}
