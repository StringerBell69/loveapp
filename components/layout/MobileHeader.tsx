"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useCouple } from "@/src/contexts/CoupleContext";
import { motion } from "framer-motion";
import Link from "next/link";

interface MobileHeaderProps {
  title: string;
  showAvatar?: boolean;
  gradient?: boolean;
}

export function MobileHeader({
  title,
  showAvatar = true,
  gradient = false,
}: MobileHeaderProps) {
  const { user } = useAuth();
  const { profile } = useCouple();

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.header
      className={`sticky top-0 z-10 ${
        gradient ? "gradient-love-subtle" : "bg-background"
      } border-b border-border`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center justify-between px-4 py-4 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          {title}
        </h1>

        {showAvatar && user && (
          <Link href="/settings">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Avatar>
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  {getInitials(profile?.name || user.email)}
                </AvatarFallback>
              </Avatar>
            </motion.div>
          </Link>
        )}
      </div>
    </motion.header>
  );
}
