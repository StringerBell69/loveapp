"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import type { Memory } from "@/lib/db/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface MemoryCardProps {
  memory: Memory;
  onDelete?: (id: string) => void;
}

export function MemoryCard({ memory, onDelete }: MemoryCardProps) {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);

  const formattedDate = format(new Date(memory.memoryDate), "d MMMM yyyy", {
    locale: fr,
  });

  const handleEdit = () => {
    router.push(`/memories/${memory.id}/edit`);
  };

  const handleDelete = () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce souvenir ?")) {
      onDelete?.(memory.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-2xl shadow-love overflow-hidden cursor-pointer"
      onClick={() => router.push(`/memories/${memory.id}`)}
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-rose-pastel/20 to-lavande/20 animate-pulse" />
        )}
        <img
          src={memory.imageUrl}
          alt={memory.title}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Menu */}
        <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full bg-white/90 hover:bg-white"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Category badge */}
        {memory.category && (
          <div className="absolute top-2 left-2">
            <span className="px-3 py-1 bg-white/90 rounded-full text-xs font-medium text-rose-vif">
              {memory.category}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {memory.title}
        </h3>

        {memory.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {memory.description}
          </p>
        )}

        <div className="flex items-center text-xs text-gray-400">
          <Calendar className="h-3.5 w-3.5 mr-1" />
          {formattedDate}
        </div>
      </div>
    </motion.div>
  );
}
