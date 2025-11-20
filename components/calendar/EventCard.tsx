"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Clock, MoreVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Database } from "@/types/database.types";

type Event = Database["public"]["Tables"]["events"]["Row"];

const eventTypeEmojis: Record<string, string> = {
  date: "💕",
  anniversary: "🎂",
  todo: "✅",
};

interface EventCardProps {
  event: Event;
  onClick?: () => void;
}

export function EventCard({ event, onClick }: EventCardProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="p-4 hover:shadow-love transition-all">
        <div className="flex items-start gap-3">
          <div
            className="w-1 h-full rounded-full flex-shrink-0"
            style={{ backgroundColor: event.color }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl flex-shrink-0">
                {eventTypeEmojis[event.event_type] || "📅"}
              </span>
              <h3 className="font-semibold text-foreground truncate">
                {event.title}
              </h3>
            </div>

            {event.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {event.description}
              </p>
            )}

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>
                {format(new Date(event.event_date), "EEEE d MMMM", {
                  locale: fr,
                })}
              </span>
              {event.event_time && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{event.event_time.slice(0, 5)}</span>
                </div>
              )}
            </div>
          </div>
          <button
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // Handle menu open
            }}
          >
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </Card>
    </motion.div>
  );
}
