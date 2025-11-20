"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useDaysCounter } from "@/hooks/useDaysCounter";
import { Card } from "@/components/ui/card";

export function DaysCounter() {
  const { daysTogether, daysUntilAnniversary, formatAnniversaryDate } =
    useDaysCounter();
  const [mounted, setMounted] = useState(false);
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && daysTogether > 0) {
      const controls = animate(count, daysTogether, {
        duration: 1.5,
        ease: "easeOut",
      });
      return controls.stop;
    }
  }, [mounted, daysTogether, count]);

  if (!mounted) return null;

  return (
    <div className="space-y-3">
      <Card className="relative overflow-hidden border-0 shadow-love-strong">
        {/* Background with floating hearts */}
        <div className="absolute inset-0 gradient-love opacity-95">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl opacity-20"
              style={{
                left: `${20 + i * 15}%`,
                bottom: 0,
              }}
              animate={{
                y: [0, -120],
                opacity: [0, 0.3, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.6,
                ease: "easeOut",
              }}
            >
              💕
            </motion.div>
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="text-5xl mb-3"
          >
            💕
          </motion.div>

          <p className="text-white text-sm uppercase tracking-wider mb-2 font-medium">
            Ensemble depuis
          </p>

          <motion.div className="text-6xl font-bold text-white mb-1">
            {rounded}
          </motion.div>

          <p className="text-white text-lg mb-3">
            {daysTogether === 1 ? "jour" : "jours"}
          </p>

          {formatAnniversaryDate() && (
            <p className="text-white/80 text-sm">
              Depuis le {formatAnniversaryDate()}
            </p>
          )}
        </div>
      </Card>

      {daysUntilAnniversary !== null && daysUntilAnniversary >= 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-peche border-0 p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎂</span>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Prochain anniversaire
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    Dans {daysUntilAnniversary} {daysUntilAnniversary === 1 ? "jour" : "jours"}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
