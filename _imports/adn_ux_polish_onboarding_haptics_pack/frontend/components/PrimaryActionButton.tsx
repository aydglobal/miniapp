import { ButtonHTMLAttributes } from "react";

export default function PrimaryActionButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`w-full rounded-[18px] bg-gradient-to-r from-[#46D7FF] to-[#8F6BFF] px-5 py-4 font-semibold text-[#050816] shadow-[0_0_24px_rgba(70,215,255,0.28)] transition active:scale-[0.98] disabled:opacity-45 ${props.className || ""}`}
    />
  );
}
