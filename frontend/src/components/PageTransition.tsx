"use client";

import { motion } from "framer-motion";

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{
        duration: 0.65,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
        animate={{ opacity: [0, 1, 0], scale: [0.7, 1.15, 1.4], rotate: 8 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="pointer-events-none fixed left-1/2 top-24 z-[9999] -translate-x-1/2 text-5xl"
      >
        ✨
      </motion.div>

      {children}
    </motion.div>
  );
}