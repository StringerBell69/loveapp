"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventForm } from "@/components/calendar/EventForm";
import { useEvents } from "@/hooks/useEvents";
import { useToast } from "@/components/ui/use-toast";
import { fadeIn, slideUp } from "@/lib/animations";
import type { Database } from "@/types/database.types";

type EventUpdate = Database["public"]["Tables"]["events"]["Update"];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditEventPage({ params }: PageProps) {
  const [loading, setLoading] = useState(false);
  const { events, updateEvent } = useEvents();
  const router = useRouter();
  const { toast } = useToast();
  const resolvedParams = use(params);
  const event = events.find((e) => e.id === resolvedParams.id);

  useEffect(() => {
    if (!event) {
      toast({
        title: "Événement introuvable",
        description: "L'événement que vous recherchez n'existe pas",
        variant: "destructive",
      });
      router.push("/calendar");
    }
  }, [event, router, toast]);

  const handleSubmit = async (data: EventUpdate) => {
    if (!event) return;

    setLoading(true);
    try {
      await updateEvent(event.id, data);

      toast({
        title: "Événement modifié ! 💕",
        description: "Vos modifications ont été enregistrées",
      });

      router.push("/calendar");
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        title: "Erreur",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-6xl animate-pulse">💕</div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-background"
      variants={fadeIn}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <div className="gradient-love-subtle border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Modifier l'événement</h1>
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <X className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Form */}
      <motion.div
        className="max-w-2xl mx-auto p-4"
        variants={slideUp}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.1 }}
      >
        <div className="bg-white rounded-xl shadow-card p-6">
          <EventForm
            event={event}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
