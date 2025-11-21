"use client";

import { useEffect, useRef } from "react";
import { format, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import type { LoveNote } from "@/lib/db/schema";
import { MessageBubble } from "./MessageBubble";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

interface MessageListProps {
  messages: LoveNote[];
  currentUserId: string;
  partnerName?: string;
  isTyping?: boolean;
  loading?: boolean;
}

export function MessageList({
  messages,
  currentUserId,
  partnerName,
  isTyping,
  loading,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isTyping]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-rose-vif animate-spin" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-rose-pastel to-lavande flex items-center justify-center">
            <span className="text-3xl">💕</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun message
          </h3>
          <p className="text-gray-500">
            Envoyez votre premier message à votre partenaire
          </p>
        </motion.div>
      </div>
    );
  }

  // Group messages by date
  const groupedMessages: { date: Date; messages: LoveNote[] }[] = [];
  let currentGroup: { date: Date; messages: LoveNote[] } | null = null;

  messages.forEach((message) => {
    // Handle both camelCase and snake_case field names from Supabase
    const createdAt = (message as any).created_at || message.createdAt;
    const messageDate = new Date(createdAt);

    // Skip invalid dates
    if (isNaN(messageDate.getTime())) {
      console.warn("Invalid message date:", createdAt);
      return;
    }

    if (!currentGroup || !isSameDay(currentGroup.date, messageDate)) {
      currentGroup = { date: messageDate, messages: [message] };
      groupedMessages.push(currentGroup);
    } else {
      currentGroup.messages.push(message);
    }
  });

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-6 space-y-6"
    >
      {groupedMessages.map((group, groupIndex) => (
        <div key={groupIndex}>
          {/* Date separator */}
          <div className="flex items-center justify-center mb-4">
            <div className="px-4 py-1 bg-gray-100 rounded-full text-xs text-gray-500">
              {format(group.date, "d MMMM yyyy", { locale: fr })}
            </div>
          </div>

          {/* Messages */}
          {group.messages.map((message) => {
            const fromUserId = (message as any).from_user_id || message.fromUserId;
            return (
              <MessageBubble
                key={message.id}
                message={message}
                isFromCurrentUser={fromUserId === currentUserId}
                partnerName={partnerName}
              />
            );
          })}
        </div>
      ))}

      {/* Typing indicator */}
      <AnimatePresence>
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex justify-start mb-4"
          >
            <div className="bg-white shadow-sm px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                  className="w-2 h-2 bg-gray-400 rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                  className="w-2 h-2 bg-gray-400 rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                  className="w-2 h-2 bg-gray-400 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={bottomRef} />
    </div>
  );
}
