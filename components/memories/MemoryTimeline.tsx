"use client";

import { useMemo } from "react";
import { format, isSameMonth, isSameYear } from "date-fns";
import { fr } from "date-fns/locale";
import type { Memory } from "@/lib/db/schema";
import { MemoryCard } from "./MemoryCard";
import { motion } from "framer-motion";

interface MemoryTimelineProps {
  memories: Memory[];
  onDelete?: (id: string) => void;
}

export function MemoryTimeline({ memories, onDelete }: MemoryTimelineProps) {
  // Group memories by month/year
  const groupedMemories = useMemo(() => {
    const groups: Record<string, Memory[]> = {};

    memories.forEach((memory) => {
      const date = new Date(memory.memoryDate);
      const key = format(date, "MMMM yyyy", { locale: fr });

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(memory);
    });

    return groups;
  }, [memories]);

  const monthKeys = Object.keys(groupedMemories);

  if (monthKeys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-rose-pastel to-lavande flex items-center justify-center">
            <span className="text-4xl">📸</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Aucun souvenir pour le moment
          </h3>
          <p className="text-gray-500 mb-6">
            Commencez à créer vos souvenirs ensemble 💕
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
      {monthKeys.map((monthKey, index) => {
        const monthMemories = groupedMemories[monthKey];

        return (
          <motion.div
            key={monthKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Month header */}
            <div className="sticky top-0 z-10 bg-creme/80 backdrop-blur-sm py-3 mb-4">
              <h2 className="text-lg font-semibold text-rose-vif capitalize">
                {monthKey}
              </h2>
              <div className="h-0.5 bg-gradient-to-r from-rose-vif to-transparent mt-2" />
            </div>

            {/* Memories grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {monthMemories.map((memory) => (
                <MemoryCard
                  key={memory.id}
                  memory={memory}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
