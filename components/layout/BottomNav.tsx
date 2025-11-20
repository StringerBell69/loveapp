"use client";

import { Home, Calendar, Heart, Settings, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Accueil" },
  { href: "/calendar", icon: Calendar, label: "Calendrier" },
  { href: "/favorites", icon: Heart, label: "Favoris", disabled: true },
  { href: "/settings", icon: Settings, label: "Paramètres" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border shadow-lg">
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          // Center item (Plus) is handled differently
          if (index === 2) {
            return (
              <div key={item.href} className="relative flex flex-col items-center justify-center flex-1">
                <motion.div
                  className={cn(
                    "absolute -top-8 w-14 h-14 rounded-full gradient-love shadow-love flex items-center justify-center",
                    item.disabled && "opacity-50 cursor-not-allowed"
                  )}
                  whileTap={!item.disabled ? { scale: 0.9 } : undefined}
                >
                  <Icon className="w-6 h-6 text-white" />
                </motion.div>
                <span className="text-xs text-muted-foreground mt-2 opacity-0">
                  {item.label}
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 py-2 transition-colors",
                item.disabled && "pointer-events-none opacity-50"
              )}
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
