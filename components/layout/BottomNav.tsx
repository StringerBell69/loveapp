"use client";

import { Home, Calendar, Heart, Settings, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMessages } from "@/hooks/useMessages";

const navItems = [
  { href: "/", icon: Home, label: "Accueil" },
  { href: "/calendar", icon: Calendar, label: "Calendrier" },
  { href: "/messages", icon: Heart, label: "Messages" },
  { href: "/settings", icon: Settings, label: "Paramètres" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { unreadCount } = useMessages();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border shadow-lg">
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const isMessages = item.href === "/messages";

          // Center item (Plus) is handled differently
          if (index === 2) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center flex-1"
              >
                <motion.div
                  className="absolute -top-8 w-14 h-14 rounded-full gradient-love shadow-love flex items-center justify-center"
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon className="w-6 h-6 text-white" />

                  {/* Unread badge for messages */}
                  {isMessages && unreadCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-vif text-white flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </motion.div>
                  )}
                </motion.div>
                <span className="text-xs text-muted-foreground mt-2 opacity-0">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 py-2 transition-colors"
            >
              <motion.div
                className="relative flex flex-col items-center"
                whileTap={{ scale: 0.95 }}
              >
                <Icon
                  className={cn(
                    "w-6 h-6 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.div>
              <span
                className={cn(
                  "text-xs mt-1 transition-colors",
                  isActive ? "text-primary font-medium" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
