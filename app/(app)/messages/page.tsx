"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCouple } from "@/src/contexts/CoupleContext";
import { useMessages } from "@/hooks/useMessages";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { MessageList } from "@/components/messages/MessageList";
import { MessageInput } from "@/components/messages/MessageInput";
import { MobileHeader } from "@/components/layout/MobileHeader";
import type { LoveNote } from "@/lib/db/schema";

export default function MessagesPage() {
  const { user } = useAuth();
  const { couple, partner } = useCouple();
  const { messages, loading, sendMessage, markAsRead, refetch } = useMessages();
  const { isTyping, broadcastTyping, requestNotificationPermission } =
    useRealtimeMessages((newMessage: LoveNote) => {
      // Callback for new messages
      refetch();

      // Mark as read if message is for current user
      const toUserId = (newMessage as any).to_user_id || newMessage.toUserId;
      const isRead = (newMessage as any).is_read || newMessage.isRead;
      if (user && toUserId === user.id && !isRead) {
        setTimeout(() => {
          markAsRead(newMessage.id);
        }, 1000);
      }
    });

  // Mark unread messages as read when opening the page
  useEffect(() => {
    if (user && messages.length > 0) {
      messages.forEach((message) => {
        const toUserId = (message as any).to_user_id || message.toUserId;
        const isRead = (message as any).is_read || message.isRead;
        if (toUserId === user.id && !isRead) {
          markAsRead(message.id);
        }
      });
    }
  }, [user, messages.length]);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const handleSendMessage = async (message: string) => {
    if (!partner?.id) return;
    await sendMessage(partner.id, message);
  };

  const handleTyping = (typing: boolean) => {
    broadcastTyping(typing);
  };

  return (
    <div className="flex flex-col h-screen">
      <MobileHeader
        title={partner?.name || "Messages"}
        subtitle={isTyping ? "En train d'écrire..." : undefined}
      />

      <div className="flex-1 overflow-hidden flex flex-col pt-16 pb-16">
        <MessageList
          messages={messages}
          currentUserId={user?.id || ""}
          partnerName={partner?.name}
          isTyping={isTyping}
          loading={loading}
        />

        <MessageInput onSend={handleSendMessage} onTyping={handleTyping} />
      </div>
    </div>
  );
}
