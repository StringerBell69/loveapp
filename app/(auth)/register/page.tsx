"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { fadeIn, slideUp } from "@/lib/animations";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, name);

      // Confettis de coeurs
      toast({
        title: "Compte créé ! 💖",
        description: "Bienvenue dans notre communauté d'amoureux",
      });

      router.push("/couple/setup");
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        title: "Erreur d'inscription",
        description: err.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { label: "", color: "" };
    if (password.length < 6) return { label: "Faible", color: "text-danger" };
    if (password.length < 10) return { label: "Moyen", color: "text-warning" };
    return { label: "Fort", color: "text-success" };
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        variants={fadeIn}
        initial="initial"
        animate="animate"
      >
        <motion.div
          className="text-center mb-8"
          variants={slideUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.1 }}
        >
          <motion.div
            className="text-7xl mb-4"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            💖
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Rejoignez-nous !
          </h1>
          <p className="text-muted-foreground">
            Créez votre compte et partagez vos moments
          </p>
        </motion.div>

        <motion.div
          variants={slideUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-love-strong border-border">
            <CardHeader>
              <CardTitle>Inscription</CardTitle>
              <CardDescription>
                Remplissez les informations ci-dessous
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Prénom</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Votre prénom"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  {password && (
                    <p className={`text-sm ${strength.color}`}>
                      Force: {strength.label}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    Confirmer le mot de passe
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Création..." : "Créer mon compte"}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">
                    Déjà un compte ?{" "}
                  </span>
                  <Link
                    href="/login"
                    className="text-primary hover:underline font-medium"
                  >
                    Se connecter
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
