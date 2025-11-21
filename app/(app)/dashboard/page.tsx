"use client";

import { useEffect, useState } from "react";
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
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Only perform redirect logic once loading is complete
    if (!loading) {
      console.log("Loading complete:", { couple: !!couple, hasChecked });

      // Mark that we've completed the check
      if (!hasChecked) {
        setHasChecked(true);
      }

      // Redirect to couple setup if no couple exists
      if (!couple) {
        console.log("No couple found, redirecting to setup...");
        router.push("/couple/setup");
      }
    }
  }, [couple, loading, router, hasChecked]);

  // Show loading state while data is being fetched
  if (loading || !hasChecked) {
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

  // Show redirecting state if no couple (while redirect happens)
  if (!couple) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <div className="text-6xl mb-4">💕</div>
          <p className="text-muted-foreground">Redirection...</p>
        </motion.div>
      </div>
    );
  }

  // Only render dashboard when we have confirmed couple data
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
