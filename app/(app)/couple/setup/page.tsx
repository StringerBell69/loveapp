"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, Heart, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCouple } from "@/hooks/useCouple";
import { useToast } from "@/components/ui/use-toast";
import { FloatingHearts } from "@/components/dashboard/FloatingHearts";
import { fadeIn, slideUp, scaleIn } from "@/lib/animations";

export default function CoupleSetupPage() {
  const [coupleCode, setCoupleCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { createCouple, joinCouple } = useCouple();
  const router = useRouter();
  const { toast } = useToast();

  const handleCreateCouple = async () => {
    setLoading(true);
    try {
      const couple = await createCouple();

      setGeneratedCode(couple.couple_code);

      toast({
        title: "Couple créé ! 💕",
        description: "Partagez le code avec votre moitié",
      });
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

  const handleJoinCouple = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await joinCouple(coupleCode);

      toast({
        title: "Couple rejoint ! 💖",
        description: "Vous êtes maintenant connectés",
      });

      router.push("/");
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

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    toast({
      title: "Code copié ! 📋",
      description: "Vous pouvez maintenant le partager",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen gradient-love-subtle relative">
      <FloatingHearts />

      <div className="relative z-10 max-w-2xl mx-auto p-4 pt-12">
        <motion.div
          className="text-center mb-8"
          variants={fadeIn}
          initial="initial"
          animate="animate"
        >
          <motion.div
            className="text-7xl mb-4"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            💕
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Créons votre espace à deux
          </h1>
          <p className="text-muted-foreground">
            Créez un nouveau couple ou rejoignez celui de votre moitié
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Create Couple Card */}
          <motion.div
            variants={slideUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-love h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full gradient-love flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle>Créer un couple</CardTitle>
                </div>
                <CardDescription>
                  Générez un code unique à partager avec votre moitié
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!generatedCode ? (
                  <Button
                    onClick={handleCreateCouple}
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    Créer notre couple
                  </Button>
                ) : (
                  <motion.div
                    className="space-y-4"
                    variants={scaleIn}
                    initial="initial"
                    animate="animate"
                  >
                    <div className="p-6 bg-gradient-love rounded-lg text-center">
                      <p className="text-white/80 text-sm mb-2">
                        Votre code couple 🔐
                      </p>
                      <p className="text-3xl font-bold text-white tracking-wider mb-3">
                        {generatedCode}
                      </p>
                      <Button
                        onClick={copyCode}
                        variant="secondary"
                        size="sm"
                        className="gap-2"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copié !
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copier le code
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Partagez ce code avec votre moitié pour qu'elle puisse
                      vous rejoindre
                    </p>
                    <Button onClick={handleContinue} className="w-full">
                      Continuer
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Join Couple Card */}
          <motion.div
            variants={slideUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-love h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Rejoindre un couple</CardTitle>
                </div>
                <CardDescription>
                  Entrez le code partagé par votre moitié
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJoinCouple} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Code du couple</Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="ABC123"
                      value={coupleCode}
                      onChange={(e) =>
                        setCoupleCode(e.target.value.toUpperCase())
                      }
                      maxLength={6}
                      className="text-center text-2xl tracking-widest font-bold"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading || coupleCode.length !== 6}
                    className="w-full"
                    size="lg"
                  >
                    Rejoindre
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
