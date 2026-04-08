import { PropsWithChildren } from "react";

export default function GameShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-[#050816] text-[#F5F7FF]">
      <div className="mx-auto max-w-md px-4 pb-24 pt-4">
        {children}
      </div>
    </div>
  );
}
