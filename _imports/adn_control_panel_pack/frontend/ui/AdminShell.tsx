import { PropsWithChildren } from "react";

export default function AdminShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-6 rounded-[24px] border border-white/10 bg-[#0B1224] p-5">
          <div className="text-xs uppercase tracking-wide text-[#A8B3CF]">ADN Admin</div>
          <div className="mt-1 text-2xl font-bold">Live Control Panel</div>
        </div>
        {children}
      </div>
    </div>
  );
}
