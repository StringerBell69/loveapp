"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useEvents } from "@/hooks/useEvents";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/animations";

const eventTypeEmojis: Record<string, string> = {
  date: "💕",
  anniversary: "🎂",
  todo: "✅",
};

export function UpcomingEvents() {
  const { getUpcomingEvents, loading } = useEvents();
  const upcomingEvents = getUpcomingEvents(3);

  if (loading) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2 px-1">
          🗓️ Prochains événements
        </h2>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-muted/30 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (upcomingEvents.length === 0) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2 px-1">
          🗓️ Prochains événements
        </h2>
        <Card className="p-8 text-center border-dashed">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground mb-1">Aucun événement prévu</p>
          <p className="text-sm text-muted-foreground">
            Ajoutez votre premier événement !
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          🗓️ Prochains événements
        </h2>
        <Link
          href="/calendar"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          Voir tout
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <motion.div
        className="space-y-2"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {upcomingEvents.map((event, index) => (
          <motion.div key={event.id} variants={staggerItem}>
            <Link href={`/calendar?event=${event.id}`}>
              <Card className="p-4 hover:shadow-love transition-all cursor-pointer active:scale-98">
                <div className="flex items-center gap-3">
                  <div
                    className="w-1 h-14 rounded-full"
                    style={{ backgroundColor: event.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">
                        {eventTypeEmojis[event.event_type] || "📅"}
                      </span>
                      <h3 className="font-semibold text-foreground truncate">
                        {event.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(event.event_date), "EEEE d MMMM", {
                        locale: fr,
                      })}
                      {event.event_time && ` à ${event.event_time.slice(0, 5)}`}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
