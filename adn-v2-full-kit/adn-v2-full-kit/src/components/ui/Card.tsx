import React from "react";
import clsx from "clsx";
import { motion } from "framer-motion";

type Props = React.HTMLAttributes<HTMLDivElement> & { strong?: boolean; animate?: boolean };

export default function Card({ strong, animate = false, className, children, ...props }: Props) {
  const cls = clsx(strong ? "adn-panel-strong" : "adn-panel", "adn-interactive", className);

  if (animate) {
    return (
      <motion.div
        className={cls}
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        {...(props as any)}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cls} {...props}>
      {children}
    </div>
  );
}
