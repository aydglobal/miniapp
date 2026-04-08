import React from "react";

type Props = { title?: string; subtitle?: string; children: React.ReactNode };

export default function AppShell({ title, subtitle, children }: Props) {
  return (
    <div className="adn-shell relative">
      {/* Scanline overlay */}
      <div className="adn-scanlines fixed inset-0 z-0 pointer-events-none" />

      {/* Ambient orbs */}
      <div
        className="fixed pointer-events-none z-0"
        style={{
          top: "-10%",
          left: "-5%",
          width: "50vw",
          height: "50vw",
          background: "radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 65%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="fixed pointer-events-none z-0"
        style={{
          top: "-8%",
          right: "-5%",
          width: "45vw",
          height: "45vw",
          background: "radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 65%)",
          filter: "blur(40px)",
        }}
      />

      <div className="adn-container relative z-10 py-6 md:py-8">
        {(title || subtitle) && (
          <div className="mb-6 md:mb-8">
            {title ? <h1 className="adn-title">{title}</h1> : null}
            {subtitle ? <p className="adn-subtitle mt-2 max-w-2xl">{subtitle}</p> : null}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
