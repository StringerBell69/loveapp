"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database.types";

type Event = Database["public"]["Tables"]["events"]["Row"];
type EventInsert = Database["public"]["Tables"]["events"]["Insert"];

const eventTypes = [
  { value: "date", label: "Date", emoji: "💕", color: "bg-rose-vif" },
  { value: "anniversary", label: "Anniversaire", emoji: "🎂", color: "bg-lavande" },
  { value: "todo", label: "À faire", emoji: "✅", color: "bg-peche" },
] as const;

const colors = [
  { value: "#FF6B9D", label: "Rose vif" },
  { value: "#C7CEEA", label: "Lavande" },
  { value: "#FFC9B9", label: "Pêche" },
  { value: "#FF8B94", label: "Corail" },
  { value: "#95E1D3", label: "Menthe" },
  { value: "#FFD93D", label: "Jaune" },
];

interface EventFormProps {
  event?: Event;
  onSubmit: (data: Omit<EventInsert, "couple_id" | "created_by">) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function EventForm({ event, onSubmit, onCancel, loading }: EventFormProps) {
  const [title, setTitle] = useState(event?.title || "");
  const [description, setDescription] = useState(event?.description || "");
  const [eventDate, setEventDate] = useState(event?.event_date || "");
  const [eventTime, setEventTime] = useState(event?.event_time || "");
  const [eventType, setEventType] = useState<"date" | "anniversary" | "todo">(
    (event?.event_type as "date" | "anniversary" | "todo") || "date"
  );
  const [color, setColor] = useState(event?.color || "#FF6B9D");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await onSubmit({
      title,
      description: description || null,
      event_date: eventDate,
      event_time: eventTime || null,
      event_type: eventType,
      color,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="flex items-center gap-2">
          ✨ Titre de l'événement
        </Label>
        <Input
          id="title"
          type="text"
          placeholder="Ex: Dîner romantique"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="text-lg"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="flex items-center gap-2">
          📝 Description (optionnel)
        </Label>
        <Textarea
          id="description"
          placeholder="Ajoutez des détails..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      {/* Date */}
      <div className="space-y-2">
        <Label htmlFor="date" className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Date
        </Label>
        <Input
          id="date"
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          required
        />
      </div>

      {/* Time */}
      <div className="space-y-2">
        <Label htmlFor="time" className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Heure (optionnel)
        </Label>
        <Input
          id="time"
          type="time"
          value={eventTime}
          onChange={(e) => setEventTime(e.target.value)}
        />
      </div>

      {/* Event Type */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">Type d'événement</Label>
        <div className="grid grid-cols-3 gap-2">
          {eventTypes.map((type) => (
            <motion.button
              key={type.value}
              type="button"
              onClick={() => setEventType(type.value)}
              className={cn(
                "p-4 rounded-lg border-2 transition-all relative",
                eventType === type.value
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              )}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-3xl mb-1">{type.emoji}</div>
              <div className="text-sm font-medium">{type.label}</div>
              {eventType === type.value && (
                <motion.div
                  layoutId="selectedType"
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <Check className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Couleur
        </Label>
        <div className="flex gap-2 flex-wrap">
          {colors.map((c) => (
            <motion.button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              className={cn(
                "w-12 h-12 rounded-full border-4 transition-all",
                color === c.value
                  ? "border-primary scale-110"
                  : "border-transparent hover:scale-105"
              )}
              style={{ backgroundColor: c.value }}
              whileTap={{ scale: 0.9 }}
              title={c.label}
            >
              {color === c.value && (
                <Check className="w-5 h-5 text-white mx-auto" />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={loading}
        >
          Annuler
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? "Enregistrement..." : event ? "Modifier" : "Créer"}
        </Button>
      </div>
    </form>
  );
}
