"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Pencil, Trash2 } from "lucide-react";
import { useMemories } from "@/hooks/useMemories";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import type { Memory } from "@/lib/db/schema";
import { motion } from "framer-motion";
import { deleteImageFromR2 } from "@/lib/r2";

export default function MemoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getMemoryById, deleteMemory } = useMemories();
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

  const handleDelete = async () => {
    if (!memory) return;

    if (confirm("Êtes-vous sûr de vouloir supprimer ce souvenir ?")) {
      const success = await deleteMemory(memory.id);

      if (success) {
        // Delete image from R2
        try {
          await deleteImageFromR2(memory.imageUrl);
        } catch (error) {
          console.error("Error deleting image from R2:", error);
        }

        router.push("/memories");
      }
    }
  };

  if (loading) {
    return (
      <>
        <MobileHeader title="Souvenir" showBack />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-vif" />
        </div>
      </>
    );
  }

  if (!memory) {
    return (
      <>
        <MobileHeader title="Souvenir" showBack />
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Souvenir introuvable
          </h3>
          <p className="text-gray-500 mb-6">
            Ce souvenir n&apos;existe pas ou a été supprimé.
          </p>
          <Button onClick={() => router.push("/memories")}>
            Retour aux souvenirs
          </Button>
        </div>
      </>
    );
  }

  const formattedDate = format(new Date(memory.memoryDate), "d MMMM yyyy", {
    locale: fr,
  });

  return (
    <>
      <MobileHeader title="Souvenir" showBack />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-16"
      >
        {/* Image */}
        <div className="relative h-96 bg-gray-100">
          <img
            src={memory.imageUrl}
            alt={memory.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="px-4 py-6 space-y-6">
          {/* Category */}
          {memory.category && (
            <div>
              <span className="px-3 py-1 bg-rose-vif/10 text-rose-vif rounded-full text-xs font-medium">
                {memory.category}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900">{memory.title}</h1>

          {/* Date */}
          <div className="flex items-center text-gray-600">
            <Calendar className="h-5 w-5 mr-2 text-rose-vif" />
            <span>{formattedDate}</span>
          </div>

          {/* Description */}
          {memory.description && (
            <div>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {memory.description}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 pb-24">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push(`/memories/${memory.id}/edit`)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
