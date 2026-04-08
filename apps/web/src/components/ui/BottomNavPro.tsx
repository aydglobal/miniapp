import React from "react";
import { motion } from "framer-motion";

type Item = {
  key: string;
  label: string;
  icon: React.ReactNode;
  badge?: boolean;
  badgeCount?: number;
};

type Props = {
  items: Item[];
  active: string;
  onChange: (key: string) => void;
};

export function BottomNavPro({ items, active, onChange }: Props) {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'min(100%, 760px)',
      zIndex: 40,
      borderRadius: '0',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(8,14,28,0.97)',
      backdropFilter: 'blur(20px)',
      padding: '8px 8px 12px',
      boxShadow: '0 -4px 24px rgba(0,0,0,0.3)',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${items.length}, 1fr)`,
        gap: 2,
      }}>
        {items.map((item) => {
          const isActive = active === item.key;
          return (
            <motion.button
              key={item.key}
              whileTap={{ scale: 0.92 }}
              onClick={() => onChange(item.key)}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 52,
                borderRadius: 12,
                border: 'none',
                background: isActive ? 'rgba(255,255,255,0.10)' : 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.40)',
                cursor: 'pointer',
                padding: '6px 4px 4px',
                transition: 'color 150ms ease, background 150ms ease',
              }}
            >
              <div style={{ position: 'relative', fontSize: 20, lineHeight: 1 }}>
                {item.icon}
                {item.badge && (
                  <span style={{
                    position: 'absolute',
                    top: -4,
                    right: -6,
                    minWidth: item.badgeCount && item.badgeCount > 1 ? 16 : 8,
                    height: item.badgeCount && item.badgeCount > 1 ? 16 : 8,
                    borderRadius: 999,
                    background: '#FF5EA8',
                    boxShadow: '0 0 8px rgba(255,94,168,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 9,
                    fontWeight: 800,
                    color: '#fff',
                    padding: item.badgeCount && item.badgeCount > 1 ? '0 3px' : 0,
                  }}>
                    {item.badgeCount && item.badgeCount > 1 ? item.badgeCount : ''}
                  </span>
                )}
              </div>
              <div style={{
                marginTop: 4,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>
                {item.label}
              </div>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
