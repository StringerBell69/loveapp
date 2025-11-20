"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Camera, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useMemories } from "@/hooks/useMemories";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function LastMemoryCard() {
  const router = useRouter();
  const { memories, loading } = useMemories();

  const lastMemory = memories[0]; // memories are already sorted by date desc

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-rose-vif" />
            Dernier souvenir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-32 bg-gray-100 rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  if (!lastMemory) {
    return (
      <Card className="cursor-pointer" onClick={() => router.push("/memories/new")}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-rose-vif" />
            Souvenirs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-pastel to-lavande flex items-center justify-center mb-3">
              <Plus className="h-8 w-8 text-white" />
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Aucun souvenir créé
            </p>
            <p className="text-xs text-gray-400">
              Créez votre premier souvenir ensemble
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formattedDate = format(new Date(lastMemory.memoryDate), "d MMM yyyy", {
    locale: fr,
  });

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card
        className="cursor-pointer overflow-hidden"
        onClick={() => router.push(`/memories/${lastMemory.id}`)}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-rose-vif" />
              Dernier souvenir
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                router.push("/memories");
              }}
              className="text-xs"
            >
              Tout voir
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative h-48">
            <img
              src={lastMemory.imageUrl}
              alt={lastMemory.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h3 className="font-semibold text-lg mb-1">{lastMemory.title}</h3>
              <p className="text-sm opacity-90">{formattedDate}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
