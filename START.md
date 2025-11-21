# 🚀 START - Démarrage Ultra-Rapide

**3 étapes pour lancer l'app en 5 minutes!**

---

## 📋 Avant de commencer

Vous avez besoin de:
- [ ] Un compte [Supabase](https://supabase.com) (gratuit)
- [ ] Un compte [Cloudflare](https://cloudflare.com) (gratuit)
- [ ] Bun ou Node.js installé

---

## ⚡ Étape 1: Installation (2 min)

```bash
# Cloner le projet
git clone https://github.com/StringerBell69/loveapp.git
cd loveapp

# Installer TOUT (base + Phase 5)
./quickstart.sh
```

Le script installe automatiquement toutes les dépendances!

---

## 🔐 Étape 2: Configuration (2 min)

### A. Créer un projet Supabase

1. [supabase.com](https://supabase.com) → New Project
2. Noter: **URL**, **anon key**, **database password**

### B. Créer un bucket R2

1. [dash.cloudflare.com](https://dash.cloudflare.com) → R2 → Create bucket
2. Create API Token (Read & Write)
3. Noter: **Account ID**, **Access Key**, **Secret Key**, **Public URL**

### C. Remplir .env.local

Le fichier existe déjà, il suffit de le remplir:

```bash
nano .env.local
```

Remplacer:
- `your_supabase_project_url` → Votre URL Supabase
- `your_supabase_anon_key` → Votre anon key
- `your_password` → Votre database password
- `your_cloudflare_account_id` → Account ID
- `your_r2_access_key_id` → Access Key ID
- `your_r2_secret_access_key` → Secret Access Key
- `https://pub-xxxxx.r2.dev` → Votre Public URL R2

Les clés VAPID sont déjà générées par quickstart.sh!

---

## 💾 Étape 3: Base de Données (1 min)

### A. Push le schema

```bash
bun db:push
```

✅ Crée les 25 tables automatiquement!

### B. Exécuter les fonctions SQL

Aller dans **Supabase Dashboard** → **SQL Editor**

Copier-coller et exécuter ces 3 fichiers dans l'ordre:

1. **setup-functions.sql** (fonctions et triggers)
2. **rls-policies.sql** (sécurité)
3. **seed-questions.sql** (70 questions)

Tous les fichiers sont dans `lib/db/`

---

## 🎉 C'est Prêt!

```bash
bun dev
```

Ouvrir: **http://localhost:3000**

---

## ✅ Checklist

- [ ] `./quickstart.sh` exécuté
- [ ] Projet Supabase créé
- [ ] Bucket R2 créé
- [ ] `.env.local` rempli avec credentials
- [ ] `bun db:push` réussi
- [ ] 3 fichiers SQL exécutés dans Supabase
- [ ] `bun dev` lance l'app
- [ ] http://localhost:3000 fonctionne

---

## 🆘 Problème?

### L'app ne se lance pas

```bash
# Vérifier les variables d'environnement
cat .env.local | grep SUPABASE

# Réinstaller
rm -rf node_modules .next
bun install
bun dev
```

### Erreur de connexion Supabase

1. Vérifier l'URL dans `.env.local`
2. Vérifier que le projet Supabase n'est pas en pause
3. Vérifier le password de la database

### Erreur "Table already exists"

C'est normal! Drizzle ne push que les changements.

### Besoin d'aide?

Consulter:
- **[TEST-DB-PUSH.md](TEST-DB-PUSH.md)** - Guide de test détaillé
- **[SETUP.md](SETUP.md)** - Setup complet step-by-step
- **[COMMANDES.md](COMMANDES.md)** - Toutes les commandes
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Résolution de problèmes

---

## 🎯 Prochaines Étapes

Une fois l'app lancée:

1. **Créer un compte** sur `/signup`
2. **Créer un couple** (code généré automatiquement)
3. **Tester les features**:
   - 📅 Ajouter un événement
   - 💕 Uploader un souvenir
   - 💬 Envoyer un message
   - ✨ Créer un item bucket list
   - 😊 Noter ton humeur
   - ❓ Répondre à la question du jour

4. **Explorer les phases**:
   - Phase 1: Calendrier
   - Phase 2: Souvenirs & Messages
   - Phase 3: Bucket List, Wishlist, Rituels
   - Phase 4: Humeurs, Gratitude, Questions
   - Phase 5: PWA, Stats, Thèmes, Export

---

## 📱 Installer comme PWA

Une fois l'app en production:

1. Ouvrir sur mobile (Chrome/Safari)
2. Menu → "Ajouter à l'écran d'accueil"
3. L'app s'installe comme une vraie app native!

---

**Enjoy! 💕✨**

*Made with ❤️ for couples who love to plan together*

