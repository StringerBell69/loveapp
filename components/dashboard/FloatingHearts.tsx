"use client";

import { motion } from "framer-motion";

export function FloatingHearts() {
  const hearts = ["💕", "❤️", "💗", "💖", "💝"];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {hearts.map((heart, i) => (
        <motion.div
          key={i}
          className="absolute text-6xl opacity-10"
          style={{
            left: `${10 + i * 20}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            rotate: [-5, 5, -5],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
        >
          {heart}
        </motion.div>
      ))}
    </div>
  );
}
