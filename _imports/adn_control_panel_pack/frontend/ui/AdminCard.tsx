import { PropsWithChildren } from "react";

export default function AdminCard({
  title,
  subtitle,
  children,
}: PropsWithChildren<{ title: string; subtitle?: string }>) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[#0B1224] p-5">
      <div className="text-lg font-semibold">{title}</div>
      {subtitle ? <div className="mt-1 text-sm text-[#A8B3CF]">{subtitle}</div> : null}
      <div className="mt-4">{children}</div>
    </div>
  );
}
