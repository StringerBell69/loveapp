"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Copy, Check, Users, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { useCouple } from "@/src/contexts/CoupleContext";
import { useToast } from "@/components/ui/use-toast";
import { fadeIn, slideUp } from "@/lib/animations";

export default function CoupleSettingsPage() {
  const [anniversaryDate, setAnniversaryDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const { couple, profile, partnerProfile, updateCouple, leaveCouple } = useCouple();
  const router = useRouter();
  const { toast } = useToast();

  const copyCode = () => {
    if (couple?.couple_code) {
      navigator.clipboard.writeText(couple.couple_code);
      setCopied(true);
      toast({
        title: "Code copié ! 📋",
        description: "Vous pouvez maintenant le partager",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUpdateAnniversary = async () => {
    setLoading(true);
    try {
      await updateCouple(anniversaryDate);
      toast({
        title: "Date enregistrée ! 💕",
        description: "Votre date d'anniversaire a été mise à jour",
      });
      setAnniversaryDate("");
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        title: "Erreur",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveCouple = async () => {
    try {
      await leaveCouple();
      toast({
        title: "Couple quitté",
        description: "Vous avez quitté votre couple",
      });
      router.push("/couple/setup");
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        title: "Erreur",
        description: err.message,
        variant: "destructive",
      });
    }
    setShowLeaveDialog(false);
  };

  if (!couple) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Vous n'êtes pas dans un couple
          </p>
          <Button onClick={() => router.push("/couple/setup")}>
            Créer ou rejoindre un couple
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={fadeIn} initial="initial" animate="animate">
      <MobileHeader title="Paramètres du couple" />

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Couple Code Card */}
        <motion.div
          variants={slideUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔐 Code du couple
              </CardTitle>
              <CardDescription>
                Partagez ce code pour inviter votre moitié
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex-1 p-4 bg-secondary rounded-lg">
                  <p className="text-2xl font-bold text-center tracking-wider">
                    {couple.couple_code}
                  </p>
                </div>
                <Button
                  onClick={copyCode}
                  variant="outline"
                  size="icon"
                  className="h-12 w-12"
                >
                  {copied ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Anniversary Date Card */}
        <motion.div
          variants={slideUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Date d'anniversaire
              </CardTitle>
              <CardDescription>
                {couple.anniversary_date
                  ? "Modifiez votre date d'anniversaire"
                  : "Définissez votre date d'anniversaire"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {couple.anniversary_date && (
                <div className="p-4 bg-peche rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    Date actuelle
                  </p>
                  <p className="text-lg font-semibold">
                    {new Date(couple.anniversary_date).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="anniversary">
                  {couple.anniversary_date ? "Nouvelle date" : "Date"}
                </Label>
                <Input
                  id="anniversary"
                  type="date"
                  value={anniversaryDate}
                  onChange={(e) => setAnniversaryDate(e.target.value)}
                />
              </div>
              <Button
                onClick={handleUpdateAnniversary}
                disabled={loading || !anniversaryDate}
                className="w-full"
              >
                Enregistrer
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Members Card */}
        <motion.div
          variants={slideUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Membres du couple
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Current User */}
              <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                  {profile?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{profile?.name}</p>
                  <p className="text-sm text-muted-foreground">Vous</p>
                </div>
              </div>

              {/* Partner */}
              {partnerProfile ? (
                <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-semibold">
                    {partnerProfile.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{partnerProfile.name}</p>
                    <p className="text-sm text-muted-foreground">Votre moitié</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 border-2 border-dashed rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">
                    En attente de votre moitié...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Leave Couple */}
        <motion.div
          variants={slideUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.4 }}
        >
          <Card className="shadow-card border-destructive/20">
            <CardContent className="pt-6">
              <Button
                onClick={() => setShowLeaveDialog(true)}
                variant="destructive"
                className="w-full"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Quitter le couple
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Leave Dialog */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quitter le couple ?</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir quitter ce couple ? Cette action ne
              supprimera pas les événements existants.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLeaveDialog(false)}
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleLeaveCouple}>
              Quitter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
