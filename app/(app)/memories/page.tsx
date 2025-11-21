"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useMemories } from "@/hooks/useMemories";
import { MemoryTimeline } from "@/components/memories/MemoryTimeline";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { motion } from "framer-motion";
import { deleteImageFromR2 } from "@/lib/r2";

export default function MemoriesPage() {
  const router = useRouter();
  const { memories, loading, deleteMemory } = useMemories();

  const handleDelete = async (id: string) => {
    const memory = memories.find((m) => m.id === id);
    if (!memory) return;

    const success = await deleteMemory(id);

    if (success && memory.imageUrl) {
      // Delete image from R2 (don't await, fire and forget)
      try {
        await deleteImageFromR2(memory.imageUrl);
      } catch (error) {
        console.error("Error deleting image from R2:", error);
      }
    }
  };

  return (
    <>
      <MobileHeader title="Souvenirs" />

      <div className="pt-16 px-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-vif" />
          </div>
        ) : (
          <MemoryTimeline memories={memories} onDelete={handleDelete} />
        )}
      </div>

      {/* FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push("/memories/new")}
        className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-rose-vif to-rose-pastel text-white rounded-full shadow-love flex items-center justify-center z-40"
      >
        <Plus className="h-6 w-6" />
      </motion.button>
    </>
  );
}
