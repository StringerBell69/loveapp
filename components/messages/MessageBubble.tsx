"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import type { LoveNote } from "@/lib/db/schema";
import { Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
  message: LoveNote;
  isFromCurrentUser: boolean;
  partnerName?: string;
}

export function MessageBubble({
  message,
  isFromCurrentUser,
  partnerName,
}: MessageBubbleProps) {
  // Handle both camelCase and snake_case field names from Supabase
  const createdAt = (message as any).created_at || message.createdAt;
  const formattedTime = format(new Date(createdAt), "HH:mm", {
    locale: fr,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isFromCurrentUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`max-w-[75%] ${
          isFromCurrentUser ? "items-end" : "items-start"
        } flex flex-col`}
      >
        {/* Sender name (only for partner messages) */}
        {!isFromCurrentUser && partnerName && (
          <span className="text-xs text-gray-400 mb-1 px-3">{partnerName}</span>
        )}

        {/* Message bubble */}
        <div
          className={`px-4 py-3 rounded-2xl ${
            isFromCurrentUser
              ? "bg-gradient-to-br from-rose-vif to-rose-pastel text-white rounded-br-md"
              : "bg-white shadow-sm text-gray-900 rounded-bl-md"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.message}
          </p>
        </div>

        {/* Time and read status */}
        <div className="flex items-center gap-1 mt-1 px-3">
          <span className="text-xs text-gray-400">{formattedTime}</span>
          {isFromCurrentUser && (
            <span className="text-gray-400">
              {((message as any).is_read || message.isRead) ? (
                <CheckCheck className="h-3 w-3 text-rose-vif" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
