"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventForm } from "@/components/calendar/EventForm";
import { useEvents } from "@/hooks/useEvents";
import { useToast } from "@/components/ui/use-toast";
import { fadeIn, slideUp } from "@/lib/animations";
import type { Database } from "@/types/database.types";

type EventInsert = Database["public"]["Tables"]["events"]["Insert"];

function NewEventContent() {
  const [loading, setLoading] = useState(false);
  const { createEvent } = useEvents();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");

  const handleSubmit = async (
    data: Omit<EventInsert, "couple_id" | "created_by">
  ) => {
    setLoading(true);
    try {
      await createEvent(data);

      // Confetti animation
      toast({
        title: "Événement créé ! 💕",
        description: "Votre événement a été ajouté avec succès",
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
          <h1 className="text-xl font-bold">Nouvel événement ✨</h1>
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
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function NewEventPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-6xl animate-pulse">💕</div>
      </div>
    }>
      <NewEventContent />
    </Suspense>
  );
}
