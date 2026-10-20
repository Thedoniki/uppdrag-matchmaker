import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function SuccessCheck() {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 52 52" className="h-14 w-14" aria-hidden="true">
      <circle cx="26" cy="26" r="24" className="fill-primary" />
      <motion.path
        d="M15 27 l7 7 l15 -15"
        fill="none"
        className="stroke-primary-foreground"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      />
    </svg>
  );
}
