import { PropsWithChildren } from "react";
import BottomNav from "./BottomNav";

export default function GameLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-md px-4 pb-24 pt-4">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
