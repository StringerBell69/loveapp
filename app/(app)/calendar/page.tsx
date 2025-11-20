"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { FAB } from "@/components/layout/FAB";
import { CalendarView } from "@/components/calendar/CalendarView";
import { EventCard } from "@/components/calendar/EventCard";
import { useEvents } from "@/hooks/useEvents";
import { fadeIn, slideUp, staggerContainer, staggerItem } from "@/lib/animations";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Calendar as CalendarIcon } from "lucide-react";

const eventTypeLabels: Record<string, string> = {
  date: "Date",
  anniversary: "Anniversaire",
  todo: "À faire",
};

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const { events, getEventsByDate, deleteEvent, loading } = useEvents();
  const { toast } = useToast();
  const router = useRouter();

  const selectedDateEvents = selectedDate
    ? getEventsByDate(format(selectedDate, "yyyy-MM-dd"))
    : [];

  const selectedEvent = selectedEventId
    ? events.find((e) => e.id === selectedEventId)
    : null;

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId);
  };

  const handleCloseEventDialog = () => {
    setSelectedEventId(null);
  };

  const handleEditEvent = () => {
    if (selectedEvent) {
      router.push(`/calendar/${selectedEvent.id}/edit`);
    }
  };

  const handleDeleteEvent = async () => {
    if (selectedEvent) {
      try {
        await deleteEvent(selectedEvent.id);
        toast({
          title: "Événement supprimé",
          description: "L'événement a été supprimé avec succès",
        });
        handleCloseEventDialog();
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'événement",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <div className="text-6xl">💕</div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div variants={fadeIn} initial="initial" animate="animate">
      <MobileHeader title="Calendrier" />

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Calendar */}
        <motion.div
          variants={slideUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.1 }}
        >
          <CalendarView
            events={events}
            onDateClick={handleDateClick}
            selectedDate={selectedDate}
          />
        </motion.div>

        {/* Events for selected date */}
        {selectedDate && (
          <motion.div
            variants={slideUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-semibold flex items-center gap-2 px-1">
              <CalendarIcon className="w-5 h-5" />
              {format(selectedDate, "EEEE d MMMM", { locale: fr })}
            </h3>

            {selectedDateEvents.length > 0 ? (
              <motion.div
                className="space-y-2"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {selectedDateEvents.map((event) => (
                  <motion.div key={event.id} variants={staggerItem}>
                    <EventCard
                      event={event}
                      onClick={() => handleEventClick(event.id)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="p-8 text-center border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Aucun événement ce jour</p>
                <Button
                  onClick={() => router.push(`/calendar/new?date=${format(selectedDate, "yyyy-MM-dd")}`)}
                  variant="link"
                  className="mt-2"
                >
                  Ajouter un événement
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <FAB href="/calendar/new" />

      {/* Event Detail Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={handleCloseEventDialog}>
        {selectedEvent && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${selectedEvent.color}20` }}
                >
                  {eventTypeLabels[selectedEvent.event_type] === "Date" && "💕"}
                  {eventTypeLabels[selectedEvent.event_type] === "Anniversaire" && "🎂"}
                  {eventTypeLabels[selectedEvent.event_type] === "À faire" && "✅"}
                </div>
                <div>
                  <DialogTitle>{selectedEvent.title}</DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    {eventTypeLabels[selectedEvent.event_type]}
                  </p>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              {selectedEvent.description && (
                <div>
                  <p className="text-sm font-medium mb-1">Description</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedEvent.description}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium mb-1">Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(selectedEvent.event_date), "EEEE d MMMM yyyy", {
                    locale: fr,
                  })}
                  {selectedEvent.event_time && ` à ${selectedEvent.event_time.slice(0, 5)}`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Couleur:</p>
                <div
                  className="w-6 h-6 rounded-full border-2 border-border"
                  style={{ backgroundColor: selectedEvent.color }}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={handleCloseEventDialog}
              >
                Fermer
              </Button>
              <Button
                variant="secondary"
                onClick={handleEditEvent}
              >
                Modifier
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteEvent}
              >
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </motion.div>
  );
}
