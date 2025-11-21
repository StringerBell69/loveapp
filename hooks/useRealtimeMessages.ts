// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCouple } from "./useCouple";
import type { LoveNote } from "@/lib/db/schema";

export function useRealtimeMessages(onNewMessage?: (message: LoveNote) => void) {
  const [isTyping, setIsTyping] = useState(false);
  const { couple } = useCouple();
  const supabase = createClient();

  useEffect(() => {
    if (!couple?.id) return;

    // Subscribe to new messages
    const channel = supabase
      .channel("love-notes-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "love_notes",
          filter: `couple_id=eq.${couple.id}`,
        },
        (payload) => {
          const newMessage = payload.new as LoveNote;

          // Call callback if provided
          if (onNewMessage) {
            onNewMessage(newMessage);
          }

          // Show browser notification if user gave permission
          if (
            typeof window !== "undefined" &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            // Only notify if message is for current user
            supabase.auth.getUser().then(({ data }) => {
              if (data.user && newMessage.toUserId === data.user.id) {
                new Notification("Nouveau message 💕", {
                  body: newMessage.message,
                  icon: "/icon-192.png",
                });
              }
            });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "love_notes",
          filter: `couple_id=eq.${couple.id}`,
        },
        (payload) => {
          // Handle message updates (e.g., mark as read)
          console.log("Message updated:", payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [couple?.id, onNewMessage]);

  // Broadcast typing indicator
  async function broadcastTyping(isTyping: boolean) {
    if (!couple?.id) return;

    const channel = supabase.channel(`typing:${couple.id}`);

    if (isTyping) {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        channel.send({
          type: "broadcast",
          event: "typing",
          payload: { userId: userData.user.id, isTyping: true },
        });
      }
    }
  }

  // Listen for typing indicator
  useEffect(() => {
    if (!couple?.id) return;

    const channel = supabase
      .channel(`typing:${couple.id}`)
      .on("broadcast", { event: "typing" }, (payload) => {
        // Get current user
        supabase.auth.getUser().then(({ data }) => {
          if (data.user && payload.payload.userId !== data.user.id) {
            setIsTyping(payload.payload.isTyping);

            // Auto-hide typing indicator after 3 seconds
            if (payload.payload.isTyping) {
              setTimeout(() => setIsTyping(false), 3000);
            }
          }
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [couple?.id]);

  // Request notification permission
  async function requestNotificationPermission() {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }
    }
  }

  return {
    isTyping,
    broadcastTyping,
    requestNotificationPermission,
  };
}
