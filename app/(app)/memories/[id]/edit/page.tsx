"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useMemories } from "@/hooks/useMemories";
import { MemoryForm } from "@/components/memories/MemoryForm";
import { MobileHeader } from "@/components/layout/MobileHeader";
import type { Memory } from "@/lib/db/schema";
import { deleteImageFromR2 } from "@/lib/r2";

export default function EditMemoryPage() {
  const params = useParams();
  const { getMemoryById, updateMemory } = useMemories();
  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemory = async () => {
      const data = await getMemoryById(params.id as string);
      setMemory(data);
      setLoading(false);
    };

    fetchMemory();
  }, [params.id]);

  const handleSubmit = async (data: {
    title: string;
    description?: string;
    imageUrl: string;
    memoryDate: string;
    category?: string;
  }) => {
    if (!memory) return;

    // If image changed, delete old image from R2
    if (data.imageUrl !== memory.imageUrl) {
      try {
        await deleteImageFromR2(memory.imageUrl);
      } catch (error) {
        console.error("Error deleting old image from R2:", error);
      }
    }

    await updateMemory(memory.id, {
      title: data.title,
      description: data.description || null,
      imageUrl: data.imageUrl,
      memoryDate: data.memoryDate,
      category: data.category || null,
    });
  };

  if (loading) {
    return (
      <>
        <MobileHeader title="Modifier le souvenir" showBack />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-vif" />
        </div>
      </>
    );
  }

  if (!memory) {
    return (
      <>
        <MobileHeader title="Modifier le souvenir" showBack />
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Souvenir introuvable
          </h3>
        </div>
      </>
    );
  }

  return (
    <>
      <MobileHeader title="Modifier le souvenir" showBack />

      <div className="pt-16 px-4">
        <MemoryForm memory={memory} onSubmit={handleSubmit} />
      </div>
    </>
  );
}
