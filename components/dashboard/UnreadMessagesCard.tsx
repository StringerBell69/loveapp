"use client";

import { useRouter } from "next/navigation";
import { Heart, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useMessages } from "@/hooks/useMessages";
import { useCouple } from "@/hooks/useCouple";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function UnreadMessagesCard() {
  const router = useRouter();
  const { unreadCount, loading, messages } = useMessages();
  const { partner } = useCouple();

  const lastMessage = messages[messages.length - 1];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-rose-vif" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-20 bg-gray-100 rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card
        className="cursor-pointer relative overflow-hidden"
        onClick={() => router.push("/messages")}
      >
        {/* Unread badge */}
        {unreadCount > 0 && (
          <div className="absolute top-4 right-4 z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-6 h-6 rounded-full bg-rose-vif text-white flex items-center justify-center text-xs font-bold shadow-lg"
            >
              {unreadCount}
            </motion.div>
          </div>
        )}

        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-rose-vif" />
            Messages
          </CardTitle>
        </CardHeader>

        <CardContent>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-pastel to-lavande flex items-center justify-center mb-3">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Aucun message
              </p>
              <p className="text-xs text-gray-400">
                Envoyez votre premier message à {partner?.name || "votre partenaire"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-vif to-rose-pastel flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {partner?.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900">
                      {partner?.name || "Votre partenaire"}
                    </p>
                    {unreadCount > 0 && (
                      <span className="text-xs font-medium text-rose-vif">
                        {unreadCount} nouveau{unreadCount > 1 ? "x" : ""}
                      </span>
                    )}
                  </div>
                  {lastMessage && (
                    <p className="text-sm text-gray-500 truncate">
                      {lastMessage.message}
                    </p>
                  )}
                </div>
              </div>

              <Button variant="outline" className="w-full" size="sm">
                Ouvrir la conversation
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
