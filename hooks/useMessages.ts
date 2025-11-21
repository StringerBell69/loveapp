// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCouple } from "@/src/contexts/CoupleContext";
import type { LoveNote, NewLoveNote } from "@/lib/db/schema";

export function useMessages() {
  const [messages, setMessages] = useState<LoveNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { couple } = useCouple();
  const supabase = createClient();

  // Fetch messages
  useEffect(() => {
    if (!couple?.id) {
      setMessages([]);
      setLoading(false);
      return;
    }

    fetchMessages();
  }, [couple?.id]);

  async function fetchMessages() {
    if (!couple?.id) return;

    try {
      const { data, error } = await supabase
        .from("love_notes")
        .select("*")
        .eq("couple_id", couple.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setMessages(data as LoveNote[]);

      // Count unread messages
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const unread = (data as LoveNote[]).filter((m) => {
          const toUserId = (m as any).to_user_id || m.toUserId;
          const isRead = (m as any).is_read || m.isRead;
          return toUserId === userData.user.id && !isRead;
        }).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }

  // Send message
  async function sendMessage(
    toUserId: string,
    message: string
  ): Promise<LoveNote | null> {
    if (!couple?.id) return null;

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;

      const newMessage: Omit<NewLoveNote, "id" | "created_at"> = {
        couple_id: couple.id,
        from_user_id: userData.user.id,
        to_user_id: toUserId,
        message,
        is_read: false,
        read_at: null,
      };

      const { data, error } = await supabase
        .from("love_notes")
        .insert(newMessage as any)
        .select()
        .single();

      if (error) throw error;

      setMessages((prev) => [...prev, data as LoveNote]);
      return data as LoveNote;
    } catch (error) {
      console.error("Error sending message:", error);
      return null;
    }
  }

  // Mark message as read
  async function markAsRead(messageId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("love_notes")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        } as any)
        .eq("id", messageId);

      if (error) throw error;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, isRead: true, readAt: new Date().toISOString() }
            : m
        )
      );

      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));

      return true;
    } catch (error) {
      console.error("Error marking message as read:", error);
      return false;
    }
  }

  // Mark all messages as read
  async function markAllAsRead(): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;

      const { error } = await supabase
        .from("love_notes")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        } as any)
        .eq("to_user_id", userData.user.id)
        .eq("is_read", false);

      if (error) throw error;

      setMessages((prev) =>
        prev.map((m) => {
          const toUserId = (m as any).to_user_id || m.toUserId;
          const isRead = (m as any).is_read || m.isRead;
          return toUserId === userData.user.id && !isRead
            ? { ...m, isRead: true, readAt: new Date().toISOString() }
            : m;
        })
      );

      setUnreadCount(0);

      return true;
    } catch (error) {
      console.error("Error marking all messages as read:", error);
      return false;
    }
  }

  // Delete message
  async function deleteMessage(messageId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("love_notes")
        .delete()
        .eq("id", messageId);

      if (error) throw error;

      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      return true;
    } catch (error) {
      console.error("Error deleting message:", error);
      return false;
    }
  }

  return {
    messages,
    loading,
    unreadCount,
    sendMessage,
    markAsRead,
    markAllAsRead,
    deleteMessage,
    refetch: fetchMessages,
  };
}
