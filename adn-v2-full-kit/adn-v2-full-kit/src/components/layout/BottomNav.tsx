import React from "react";
import clsx from "clsx";
import { Home, ListChecks, ShoppingBag, Zap, User } from "lucide-react";
import { motion } from "framer-motion";

type Tab = "home" | "tasks" | "market" | "boost" | "profile";
type Props = { active: Tab; onChange: (tab: Tab) => void };

const items = [
  { key: "home", label: "Home", icon: Home },
  { key: "tasks", label: "Tasks", icon: ListChecks },
  { key: "market", label: "Market", icon: ShoppingBag },
  { key: "boost", label: "Boost", icon: Zap },
  { key: "profile", label: "Profile", icon: User },
] as const;

export default function BottomNav({ active, onChange }: Props) {
  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-24px)] max-w-md -translate-x-1/2 rounded-3xl adn-nav px-2 py-2">
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <motion.button
              key={item.key}
              onClick={() => onChange(item.key)}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className={clsx(
                "relative flex flex-col items-center justify-center rounded-2xl px-2 py-2 transition-all duration-200",
                isActive
                  ? "text-[#00e5ff]"
                  : "text-[#5a7a9e] hover:text-[#8ba8cc]"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: "rgba(0,229,255,0.10)",
                    border: "1px solid rgba(0,229,255,0.2)",
                    boxShadow: "0 0 16px rgba(0,229,255,0.15)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={clsx("relative h-4 w-4 z-10", isActive && "drop-shadow-[0_0_6px_rgba(0,229,255,0.8)]")}
              />
              <span
                className={clsx(
                  "relative z-10 mt-1 text-[11px] font-semibold",
                  isActive && "text-[#00e5ff]"
                )}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
