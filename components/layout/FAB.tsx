"use client";

import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface FABProps {
  onClick?: () => void;
  href?: string;
  className?: string;
}

export function FAB({ onClick, href, className }: FABProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      className={cn(
        "fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full gradient-love shadow-love-strong flex items-center justify-center",
        className
      )}
      whileTap={{ scale: 0.9, rotate: 90 }}
      whileHover={{ scale: 1.05, rotate: 90 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <Plus className="w-7 h-7 text-white" />
    </motion.button>
  );
}
