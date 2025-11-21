# 🚀 Commandes Complètes pour Lancer le Projet

Guide ultra-rapide avec toutes les commandes à copier-coller.

---

## ⚡ Setup Rapide (Automatique)

```bash
# 1. Cloner le repo (si pas déjà fait)
git clone https://github.com/StringerBell69/loveapp.git
cd loveapp

# 2. Lancer le script d'installation automatique
./quickstart.sh
```

Le script `quickstart.sh` va:
- ✅ Installer toutes les dépendances (base + Phase 5)
- ✅ Créer `.env.local` depuis `.env.example`
- ✅ Générer les clés VAPID pour push notifications
- ✅ Créer les dossiers PWA (icons, screenshots)

---

## 🔧 Setup Manuel (Step-by-Step)

### 1. Installation des dépendances

```bash
# Dépendances de base
bun install

# Dépendances Phase 5 (PWA, Stats, Export)
bun add recharts jspdf jspdf-autotable ics jszip web-push
bun add -D @types/jspdf @types/jszip @types/web-push
```

### 2. Configuration de l'environnement

```bash
# Copier le fichier d'environnement
cp .env.example .env.local

# Éditer avec vos credentials (voir SETUP.md)
# Vous aurez besoin de:
# - Supabase URL et anon key
# - Database URL
# - R2 credentials (account ID, access keys, bucket name, public URL)
```

### 3. Générer les clés VAPID pour push notifications

```bash
npx web-push generate-vapid-keys
```

Copier les clés générées dans `.env.local`:
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=votre_public_key
VAPID_PRIVATE_KEY=votre_private_key
```

### 4. Créer les dossiers PWA

```bash
mkdir -p public/icons
mkdir -p public/screenshots
```

---

## 💾 Configuration de la Base de Données

### 1. Migrer le schéma

```bash
bun db:push
```

Cette commande crée toutes les tables:
- couples, user_profiles, events, memories, love_notes
- bucket_list_items, wishlist_items, rituals, ritual_completions
- daily_moods, gratitude_entries, daily_questions, question_answers, etc.
- user_preferences, backups, onboarding_progress, feature_flags, analytics_events

### 2. Appliquer les fonctions et triggers SQL

Aller dans **Supabase Dashboard** → **SQL Editor** → **New query**

Copier-coller et exécuter le contenu de:
```
lib/db/setup-functions.sql
```

Ce fichier crée:
- ✅ `calculate_ritual_streak()` - Calcul des streaks de rituels
- ✅ `generate_daily_question()` - Génération de question quotidienne
- ✅ `get_gratitude_streak()` - Calcul des streaks de gratitude
- ✅ `get_couple_stats()` - Statistiques complètes du couple
- ✅ `update_onboarding_milestone()` - Suivi automatique de progression
- ✅ Tous les triggers nécessaires
- ✅ Tous les indexes de performance

### 3. Appliquer les politiques RLS (Row Level Security)

Dans **Supabase SQL Editor**, exécuter:
```
lib/db/rls-policies.sql
```

Ce fichier configure la sécurité pour toutes les tables.

### 4. Seed les questions quotidiennes

Dans **Supabase SQL Editor**, exécuter:
```
lib/db/seed-questions.sql
```

Ce fichier ajoute:
- ✅ 70 questions réparties en 7 catégories
- ✅ Génère automatiquement la première question

---

## 🎨 Générer les Assets PWA

### Méthode automatique (recommandé)

1. Aller sur [realfavicongenerator.net](https://realfavicongenerator.net/)
2. Upload une image 512x512 (logo de votre app)
3. Télécharger le pack généré
4. Extraire dans `public/icons/`

### Méthode manuelle avec ImageMagick

```bash
# macOS
brew install imagemagick

# Linux
sudo apt-get install imagemagick

# Générer toutes les tailles depuis une image source
convert icon-source.png -resize 72x72 public/icons/icon-72x72.png
convert icon-source.png -resize 96x96 public/icons/icon-96x96.png
convert icon-source.png -resize 128x128 public/icons/icon-128x128.png
convert icon-source.png -resize 144x144 public/icons/icon-144x144.png
convert icon-source.png -resize 152x152 public/icons/icon-152x152.png
convert icon-source.png -resize 192x192 public/icons/icon-192x192.png
convert icon-source.png -resize 384x384 public/icons/icon-384x384.png
convert icon-source.png -resize 512x512 public/icons/icon-512x512.png
```

---

## 🚀 Lancer l'Application

### Mode développement

```bash
bun dev
```

Ouvrir http://localhost:3000

### Build pour production

```bash
# Build
bun run build

# Lancer la version production localement
bun start
```

---

## 🌐 Déploiement sur Vercel

### Installation Vercel CLI

```bash
npm i -g vercel
```

### Login

```bash
vercel login
```

### Déployer

```bash
# Premier déploiement (preview)
vercel

# Déploiement en production
vercel --prod
```

### Ajouter les variables d'environnement

Dans l'interface Vercel:
1. Aller sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionner votre projet
3. **Settings** → **Environment Variables**
4. Ajouter toutes les variables de `.env.local`

Ou en CLI:

```bash
# Ajouter chaque variable
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add DATABASE_URL
vercel env add R2_ACCOUNT_ID
vercel env add R2_ACCESS_KEY_ID
vercel env add R2_SECRET_ACCESS_KEY
vercel env add R2_BUCKET_NAME
vercel env add NEXT_PUBLIC_R2_PUBLIC_URL
vercel env add NEXT_PUBLIC_VAPID_PUBLIC_KEY
vercel env add VAPID_PRIVATE_KEY
```

---

## 📊 Scripts Disponibles

```bash
# Développement
bun dev              # Lancer le serveur de dev sur http://localhost:3000
bun build            # Build pour production
bun start            # Lancer la version build
bun lint             # Linter le code

# Database
bun db:push          # Push le schema Drizzle vers Supabase
bun db:pull          # Pull le schema depuis Supabase
bun db:generate      # Générer les migrations Drizzle
bun db:studio        # Ouvrir Drizzle Studio (interface visuelle DB)

# Nettoyage
bun run clean        # Nettoyer les fichiers build
```

---

## ✅ Checklist Complète de Setup

### Avant de commencer:
- [ ] Node.js 18+ ou Bun 1.0+ installé
- [ ] Git installé
- [ ] Compte Supabase créé
- [ ] Compte Cloudflare créé

### Installation:
- [ ] `git clone` + `cd loveapp`
- [ ] `bun install`
- [ ] `bun add recharts jspdf jspdf-autotable ics jszip web-push`
- [ ] `bun add -D @types/jspdf @types/jszip @types/web-push`

### Configuration Supabase:
- [ ] Projet Supabase créé
- [ ] URL et anon key récupérés
- [ ] Database URL récupérée (avec password)
- [ ] Auth configurée (email provider activé)

### Configuration Cloudflare R2:
- [ ] Bucket R2 créé
- [ ] API token créé (Read & Write)
- [ ] Account ID récupéré
- [ ] Public URL configurée
- [ ] CORS configuré

### Configuration locale:
- [ ] `.env.local` créé et rempli avec toutes les variables
- [ ] Clés VAPID générées et ajoutées
- [ ] Dossiers PWA créés (`public/icons`, `public/screenshots`)

### Base de données:
- [ ] `bun db:push` exécuté
- [ ] `setup-functions.sql` exécuté dans Supabase SQL Editor
- [ ] `rls-policies.sql` exécuté dans Supabase SQL Editor
- [ ] `seed-questions.sql` exécuté dans Supabase SQL Editor

### PWA:
- [ ] Icônes générées (8 tailles)
- [ ] Screenshots ajoutés (optionnel)

### Test local:
- [ ] `bun dev` lance sans erreur
- [ ] Signup fonctionne
- [ ] Couple creation fonctionne
- [ ] Upload photo fonctionne
- [ ] Toutes les pages accessibles

### Déploiement (optionnel):
- [ ] Déployé sur Vercel
- [ ] Variables d'environnement configurées en prod
- [ ] Supabase configuré avec URL de prod
- [ ] R2 CORS configuré avec domaine de prod
- [ ] App accessible et fonctionnelle

---

## 🆘 Commandes de Dépannage

### Problème de connexion Supabase

```bash
# Vérifier les variables d'environnement
cat .env.local | grep SUPABASE

# Tester la connexion dans le code
bun dev
# Ouvrir http://localhost:3000 et check la console
```

### Problème de database

```bash
# Réinitialiser et push le schema
bun db:push

# Ouvrir Drizzle Studio pour voir les tables
bun db:studio
```

### Problème d'upload R2

```bash
# Vérifier les credentials R2
cat .env.local | grep R2

# Vérifier que le bucket existe dans Cloudflare Dashboard
```

### Erreurs TypeScript

```bash
# Nettoyer et rebuild
rm -rf .next node_modules
bun install
bun run build
```

### Problème de push notifications

```bash
# Regénérer les clés VAPID
npx web-push generate-vapid-keys

# Les ajouter dans .env.local
# Redémarrer le serveur
```

---

## 📚 Ressources

**Documentation:**
- [SETUP.md](SETUP.md) - Guide complet de setup
- [README.md](README.md) - Documentation du projet
- [PHASE3_IMPLEMENTATION.md](PHASE3_IMPLEMENTATION.md) - Guide Phase 3
- [PHASE4_IMPLEMENTATION.md](PHASE4_IMPLEMENTATION.md) - Guide Phase 4
- [PHASE5_IMPLEMENTATION.md](PHASE5_IMPLEMENTATION.md) - Guide Phase 5

**Liens externes:**
- [Supabase Docs](https://supabase.com/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)

---

## 🎉 Et Voilà!

Après avoir suivi toutes ces étapes, vous aurez:

✅ Une app couple complète avec 5 phases de features  
✅ PWA installable avec mode hors ligne  
✅ Push notifications pour toutes les features  
✅ Base de données avec 25+ tables  
✅ Upload de photos sur Cloudflare R2  
✅ Statistiques et charts  
✅ 5 thèmes + dark mode  
✅ Export PDF/JSON/ICS/ZIP  
✅ Système de streak gamification  
✅ Questions quotidiennes  
✅ Messagerie en temps réel  

**Bon développement! 💕✨**

---

## 💡 Commande Ultime (Setup Complet)

Si vous avez déjà configuré Supabase, R2, et l'environnement:

```bash
# All-in-one setup
./quickstart.sh && \
bun db:push && \
echo "✅ Schema migrated!" && \
echo "📝 Now execute setup-functions.sql, rls-policies.sql, and seed-questions.sql in Supabase SQL Editor" && \
echo "🎨 Then generate PWA icons and run: bun dev"
```

---

**Support:** [GitHub Issues](https://github.com/StringerBell69/loveapp/issues)
