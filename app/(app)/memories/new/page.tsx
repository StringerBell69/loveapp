"use client";

import { useMemories } from "@/hooks/useMemories";
import { MemoryForm } from "@/components/memories/MemoryForm";
import { MobileHeader } from "@/components/layout/MobileHeader";

export default function NewMemoryPage() {
  const { createMemory } = useMemories();

  const handleSubmit = async (data: {
    title: string;
    description?: string;
    imageUrl: string;
    memoryDate: string;
    category?: string;
  }) => {
    await createMemory({
      title: data.title,
      description: data.description || null,
      imageUrl: data.imageUrl,
      memoryDate: data.memoryDate,
      category: data.category || null,
    });
  };

  return (
    <>
      <MobileHeader title="Nouveau souvenir" showBack />

      <div className="pt-16 px-4">
        <MemoryForm onSubmit={handleSubmit} />
      </div>
    </>
  );
}
