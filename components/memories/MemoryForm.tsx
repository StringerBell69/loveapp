"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "./ImageUploader";
import type { Memory } from "@/lib/db/schema";
import { motion } from "framer-motion";

interface MemoryFormProps {
  memory?: Memory;
  onSubmit: (data: {
    title: string;
    description?: string;
    imageUrl: string;
    memoryDate: string;
    category?: string;
  }) => Promise<void>;
}

export function MemoryForm({ memory, onSubmit }: MemoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: memory?.title || "",
    description: memory?.description || "",
    imageUrl: memory?.imageUrl || "",
    memoryDate: memory?.memoryDate || format(new Date(), "yyyy-MM-dd"),
    category: memory?.category || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.imageUrl) {
      alert("Veuillez ajouter une photo");
      return;
    }

    if (!formData.title.trim()) {
      alert("Veuillez ajouter un titre");
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        imageUrl: formData.imageUrl,
        memoryDate: formData.memoryDate,
        category: formData.category.trim() || undefined,
      });
      router.push("/memories");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6 pb-24"
    >
      {/* Image uploader */}
      <div>
        <Label>Photo *</Label>
        <div className="mt-2">
          <ImageUploader
            currentImage={formData.imageUrl}
            onUpload={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
            onRemove={() => setFormData((prev) => ({ ...prev, imageUrl: "" }))}
          />
        </div>
      </div>

      {/* Title */}
      <div>
        <Label htmlFor="title">Titre *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="Notre premier voyage..."
          required
          maxLength={255}
          className="mt-2"
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Un moment inoubliable..."
          rows={4}
          className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-vif focus:ring-2 focus:ring-rose-vif/20 outline-none transition-all resize-none"
        />
      </div>

      {/* Date */}
      <div>
        <Label htmlFor="memoryDate">Date du souvenir *</Label>
        <Input
          id="memoryDate"
          type="date"
          value={formData.memoryDate}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, memoryDate: e.target.value }))
          }
          required
          className="mt-2"
        />
      </div>

      {/* Category */}
      <div>
        <Label htmlFor="category">Catégorie</Label>
        <Input
          id="category"
          value={formData.category}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, category: e.target.value }))
          }
          placeholder="Voyage, Anniversaire, etc."
          maxLength={50}
          className="mt-2"
        />
      </div>

      {/* Submit buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
          className="flex-1"
        >
          Annuler
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading
            ? "Enregistrement..."
            : memory
            ? "Modifier"
            : "Créer le souvenir"}
        </Button>
      </div>
    </motion.form>
  );
}
