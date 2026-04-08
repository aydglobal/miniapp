export default function EmptyState({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta?: string;
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] p-6 text-center">
      <div className="text-lg font-semibold">{title}</div>
      <div className="mt-2 text-sm text-[#A8B3CF]">{body}</div>
      {cta && <button className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm">{cta}</button>}
    </div>
  );
}
