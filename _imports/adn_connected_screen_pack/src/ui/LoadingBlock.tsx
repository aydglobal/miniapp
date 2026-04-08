export default function LoadingBlock({ title = "Yükleniyor..." }: { title?: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[#0B1224] p-5 text-center text-[#A8B3CF]">
      {title}
    </div>
  );
}
