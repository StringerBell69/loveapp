"use client";

import { motion } from "framer-motion";
import { User, Heart, LogOut, Settings as SettingsIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useCouple } from "@/hooks/useCouple";
import { fadeIn, slideUp, staggerContainer, staggerItem } from "@/lib/animations";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
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

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <motion.div variants={fadeIn} initial="initial" animate="animate">
      <MobileHeader title="Paramètres" showAvatar={false} />

      <motion.div
        className="max-w-2xl mx-auto p-4 space-y-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Profile Card */}
        <motion.div variants={staggerItem}>
          <Card className="p-6 shadow-card">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-secondary text-secondary-foreground text-xl">
                  {getInitials(profile?.name || user?.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{profile?.name}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Settings Links */}
        <motion.div variants={staggerItem} className="space-y-2">
          <Link href="/couple/settings">
            <Card className="p-4 hover:shadow-love transition-all cursor-pointer active:scale-98">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Paramètres du couple</p>
                  <p className="text-sm text-muted-foreground">
                    Gérez votre couple et vos dates
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Card className="p-4 opacity-50 cursor-not-allowed">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Profil</p>
                <p className="text-sm text-muted-foreground">
                  Modifier votre profil (bientôt)
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 opacity-50 cursor-not-allowed">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <SettingsIcon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Préférences</p>
                <p className="text-sm text-muted-foreground">
                  Notifications et thème (bientôt)
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Sign Out */}
        <motion.div variants={staggerItem}>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Se déconnecter
          </Button>
        </motion.div>

        {/* App Info */}
        <motion.div
          variants={staggerItem}
          className="text-center text-sm text-muted-foreground pt-4"
        >
          <p>Notre Calendrier 💕</p>
          <p className="text-xs mt-1">Version 1.0.0 (MVP)</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
