import { ButtonHTMLAttributes } from "react";

export default function PrimaryButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`w-full rounded-[18px] bg-gradient-to-r from-[#46D7FF] to-[#8F6BFF] px-4 py-4 font-semibold text-[#050816] shadow-[0_0_24px_rgba(70,215,255,0.24)] disabled:opacity-50 ${props.className || ""}`}
    />
  );
}
