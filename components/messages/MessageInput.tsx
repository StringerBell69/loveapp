"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface MessageInputProps {
  onSend: (message: string) => Promise<void>;
  onTyping?: (isTyping: boolean) => void;
}

export function MessageInput({ onSend, onTyping }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Broadcast typing indicator
    if (onTyping) {
      onTyping(true);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage || sending) return;

    try {
      setSending(true);
      setMessage("");

      // Stop typing indicator
      if (onTyping) {
        onTyping(false);
      }

      await onSend(trimmedMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessage(trimmedMessage);
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="bg-white border-t border-gray-200 p-4"
    >
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyPress}
            placeholder="Écrivez un message..."
            rows={1}
            disabled={sending}
            className="w-full px-4 py-3 pr-12 rounded-2xl border border-gray-200 focus:border-rose-vif focus:ring-2 focus:ring-rose-vif/20 outline-none transition-all resize-none max-h-32 disabled:opacity-50"
          />
        </div>

        <Button
          type="submit"
          size="icon"
          disabled={!message.trim() || sending}
          className="rounded-full w-12 h-12 flex-shrink-0"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      <p className="text-xs text-gray-400 mt-2">
        Appuyez sur Entrée pour envoyer, Shift+Entrée pour une nouvelle ligne
      </p>
    </motion.form>
  );
}
