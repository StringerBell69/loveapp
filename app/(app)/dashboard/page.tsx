"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { FAB } from "@/components/layout/FAB";
import { DaysCounter } from "@/components/dashboard/DaysCounter";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { LastMemoryCard } from "@/components/dashboard/LastMemoryCard";
import { UnreadMessagesCard } from "@/components/dashboard/UnreadMessagesCard";
import { useCouple } from "@/hooks/useCouple";
import { fadeIn, staggerContainer, staggerItem } from "@/lib/animations";

export default function DashboardPage() {
  const { couple, loading } = useCouple();
  const router = useRouter();

  useEffect(() => {
    // Redirect to couple setup if not in a couple
    if (!loading && !couple) {
      router.push("/couple/setup");
    }
  }, [couple, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <div className="text-6xl mb-4">💕</div>
          <p className="text-muted-foreground">Chargement...</p>
        </motion.div>
      </div>
    );
  }

  if (!couple) {
    return null; // Will redirect
  }

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="min-h-screen"
    >
      <MobileHeader title="Notre Calendrier 💕" gradient />

      <motion.div
        className="max-w-2xl mx-auto p-4 space-y-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Days Counter */}
        <motion.div variants={staggerItem}>
          <DaysCounter />
        </motion.div>

        {/* Upcoming Events */}
        <motion.div variants={staggerItem}>
          <UpcomingEvents />
        </motion.div>

        {/* Last Memory */}
        <motion.div variants={staggerItem}>
          <LastMemoryCard />
        </motion.div>

        {/* Unread Messages */}
        <motion.div variants={staggerItem}>
          <UnreadMessagesCard />
        </motion.div>
      </motion.div>

      {/* FAB to add event */}
      <FAB href="/calendar/new" />
    </motion.div>
  );
}
