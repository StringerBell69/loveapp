"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { fadeIn, slideUp } from "@/lib/animations";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast({
        title: "Bienvenue ! 💕",
        description: "Connexion réussie",
      });
      router.push("/");
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        title: "Erreur de connexion",
        description: err.message || "Email ou mot de passe incorrect",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            💕
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Bienvenue !
          </h1>
          <p className="text-muted-foreground">
            Connectez-vous pour retrouver votre moitié
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
              <CardTitle>Connexion</CardTitle>
              <CardDescription>
                Entrez vos identifiants pour continuer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Connexion..." : "Se connecter"}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">
                    Pas encore de compte ?{" "}
                  </span>
                  <Link
                    href="/register"
                    className="text-primary hover:underline font-medium"
                  >
                    Créer un compte
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
