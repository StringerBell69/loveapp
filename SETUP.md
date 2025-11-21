# 🚀 Guide Complet de Configuration - Notre Calendrier 💕

Guide step-by-step pour configurer et lancer le projet from scratch.

---

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Installation](#installation)
3. [Configuration Supabase](#configuration-supabase)
4. [Configuration Cloudflare R2](#configuration-cloudflare-r2)
5. [Variables d'Environnement](#variables-denvironnement)
6. [Base de Données](#base-de-données)
7. [Push Notifications](#push-notifications)
8. [PWA Assets](#pwa-assets)
9. [Lancement du Projet](#lancement-du-projet)
10. [Déploiement](#déploiement)
11. [Troubleshooting](#troubleshooting)

---

## 🛠️ Prérequis

### Logiciels requis:

- **Node.js** 18+ ou **Bun** 1.0+ (recommandé)
- **Git**
- Un compte **Supabase** (gratuit)
- Un compte **Cloudflare** pour R2 Storage (gratuit)

### Vérifier les installations:

\`\`\`bash
# Vérifier Bun
bun --version

# Ou Node.js
node --version
npm --version

# Vérifier Git
git --version
\`\`\`

---

## 📦 Installation

### 1. Cloner le repository

\`\`\`bash
git clone https://github.com/StringerBell69/loveapp.git
cd loveapp
\`\`\`

### 2. Installer les dépendances

\`\`\`bash
bun install
\`\`\`

Ou avec npm:

\`\`\`bash
npm install
\`\`\`

### 3. Installer les dépendances Phase 5 (PWA, Stats, Export)

\`\`\`bash
bun add recharts jspdf jspdf-autotable ics jszip web-push
bun add -D @types/jspdf @types/jszip @types/web-push
\`\`\`

Ou avec npm:

\`\`\`bash
npm install recharts jspdf jspdf-autotable ics jszip web-push
npm install -D @types/jspdf @types/jszip @types/web-push
\`\`\`

---

## 🗄️ Configuration Supabase

### 1. Créer un projet Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Se connecter / créer un compte
3. Cliquer sur "New Project"
4. Remplir:
   - **Name**: \`loveapp\` (ou votre choix)
   - **Database Password**: Choisir un mot de passe fort (NOTER CE MOT DE PASSE!)
   - **Region**: Choisir la région la plus proche
5. Cliquer sur "Create new project" (attendre ~2 minutes)

### 2. Récupérer les credentials Supabase

Une fois le projet créé:

1. Aller dans **Settings** (icône engrenage en bas à gauche)
2. Cliquer sur **API**
3. Noter ces informations:
   - **Project URL** (ex: \`https://xxxxx.supabase.co\`)
   - **Project API keys** → **anon public** (la clé qui commence par \`eyJ...\`)

4. Aller dans **Settings** → **Database**
5. Scroller jusqu'à **Connection string** → **URI**
6. Copier la connection string et remplacer \`[YOUR-PASSWORD]\` par le mot de passe choisi
   - Format: \`postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres\`

### 3. Configurer l'authentification

1. Aller dans **Authentication** → **Providers**
2. Activer **Email** provider
3. Configurer les paramètres:
   - Enable Email: ✓
   - Enable Email Confirmations: ✓ (ou ✗ pour dev)
   - Site URL: \`http://localhost:3000\` (pour dev) ou votre domaine (prod)

---

## ☁️ Configuration Cloudflare R2

### 1. Créer un bucket R2

1. Aller sur [dash.cloudflare.com](https://dash.cloudflare.com)
2. Se connecter / créer un compte
3. Dans le menu de gauche, cliquer sur **R2**
4. Cliquer sur **Create bucket**
5. Nom du bucket: \`loveapp-photos\` (ou votre choix)
6. Region: Automatic
7. Cliquer sur **Create bucket**

### 2. Créer les API tokens

1. Aller dans **R2** → **Overview**
2. Cliquer sur **Manage R2 API Tokens**
3. Cliquer sur **Create API token**
4. Configuration:
   - **Token name**: \`loveapp-token\`
   - **Permissions**: Object Read & Write
   - **TTL**: Forever (ou votre choix)
5. Cliquer sur **Create API Token**
6. **IMPORTANT**: Noter ces informations (elles ne seront plus affichées):
   - **Access Key ID**
   - **Secret Access Key**

### 3. Configurer le domaine public (optionnel mais recommandé)

1. Dans votre bucket, aller dans **Settings**
2. Section **Public Access**
3. Cliquer sur **Connect Domain** ou **Allow Access**
4. Suivre les instructions pour connecter un domaine/sous-domaine

Ou utiliser l'URL par défaut:
- Format: \`https://pub-xxxxx.r2.dev\` (visible dans les settings du bucket)

---

## 🔐 Variables d'Environnement

### 1. Copier le fichier exemple

\`\`\`bash
cp .env.example .env.local
\`\`\`

### 2. Remplir \`.env.local\`

Éditer le fichier \`.env.local\` avec vos vraies valeurs:

\`\`\`env
# ============================================
# SUPABASE
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...votre_anon_key

# ============================================
# DATABASE
# ============================================
DATABASE_URL=postgresql://postgres:VOTRE_PASSWORD@db.xxxxx.supabase.co:5432/postgres

# ============================================
# CLOUDFLARE R2 STORAGE
# ============================================
R2_ACCOUNT_ID=votre_account_id_cloudflare
R2_ACCESS_KEY_ID=votre_access_key_id
R2_SECRET_ACCESS_KEY=votre_secret_access_key
R2_BUCKET_NAME=loveapp-photos
NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-xxxxx.r2.dev

# ============================================
# PUSH NOTIFICATIONS (générer plus tard)
# ============================================
# NEXT_PUBLIC_VAPID_PUBLIC_KEY=
# VAPID_PRIVATE_KEY=

# ============================================
# OPTIONNEL - Analytics
# ============================================
# NEXT_PUBLIC_ANALYTICS_ID=
\`\`\`

**Comment trouver R2_ACCOUNT_ID:**
1. Dans Cloudflare Dashboard
2. En haut à droite de la page R2, dans l'URL: \`dash.cloudflare.com/{ACCOUNT_ID}/r2\`
3. Ou dans **R2** → **Overview** → Section droite "Account ID"

---

## 💾 Base de Données

### 1. Migrer le schéma avec Drizzle

\`\`\`bash
bun db:push
\`\`\`

Ou avec npm:

\`\`\`bash
npm run db:push
\`\`\`

Cette commande va:
- Créer toutes les tables (couples, events, memories, etc.)
- Créer tous les enums
- Configurer les relations et contraintes

### 2. Appliquer les fonctions SQL

Aller dans Supabase Dashboard → **SQL Editor** → **New query**

**Copier tout le contenu du fichier \`lib/db/rls-policies.sql\` et l'exécuter.**

Ce fichier contient:
- Toutes les politiques RLS (Row Level Security)
- Les fonctions de calcul (streak, stats, etc.)
- Les triggers automatiques

### 3. Seed les questions quotidiennes (Phase 4)

Dans **SQL Editor**, exécuter:

\`\`\`sql
-- Seed daily questions
INSERT INTO daily_questions (question_text, category) VALUES
-- Memories
('Quel est votre premier souvenir ensemble ?', 'memories'),
('Quelle est la chose la plus drôle qui vous soit arrivée ensemble ?', 'memories'),
('Quel voyage ensemble vous a le plus marqué ?', 'memories'),
('Quel moment difficile avez-vous surmonté ensemble ?', 'memories'),
('Quelle surprise avez-vous faite à votre partenaire dont vous êtes le plus fier ?', 'memories'),

-- Dreams
('Où rêvez-vous de voyager ensemble ?', 'dreams'),
('Comment imaginez-vous votre vie dans 10 ans ?', 'dreams'),
('Quel projet aimeriez-vous réaliser ensemble ?', 'dreams'),
('Quelle est votre maison de rêve ?', 'dreams'),
('Si vous pouviez vivre n''importe où, où iriez-vous ?', 'dreams'),

-- Love
('Qu''est-ce qui vous a fait tomber amoureux de votre partenaire ?', 'love'),
('Quelle est la qualité que vous préférez chez votre partenaire ?', 'love'),
('Comment votre partenaire vous rend-il/elle meilleur(e) ?', 'love'),
('Quel est votre langage d''amour principal ?', 'love'),
('Qu''est-ce qui vous fait vous sentir le plus aimé(e) ?', 'love'),

-- Preferences
('Pizza ou sushi ?', 'preferences'),
('Montagne ou mer ?', 'preferences'),
('Film ou série ?', 'preferences'),
('Sortie en ville ou soirée à la maison ?', 'preferences'),
('Grasse matinée ou lever tôt ?', 'preferences'),

-- Reflection
('Qu''avez-vous appris sur vous-même grâce à cette relation ?', 'reflection'),
('Comment gérez-vous les désaccords ensemble ?', 'reflection'),
('Quelle est votre plus grande force en tant que couple ?', 'reflection'),
('Comment maintenez-vous la romance au quotidien ?', 'reflection'),
('Qu''est-ce qui rend votre relation unique ?', 'reflection'),

-- Fun
('Si vous étiez un duo de super-héros, quels seraient vos pouvoirs ?', 'fun'),
('Quelle chanson représente le mieux votre couple ?', 'fun'),
('Si vous étiez des animaux, lesquels seriez-vous ?', 'fun'),
('Quel serait le nom de votre sitcom de couple ?', 'fun'),
('Si vous pouviez inviter 3 personnes (vivantes ou non) à dîner, qui choisiriez-vous ?', 'fun'),

-- Philosophy
('Qu''est-ce qui fait qu''une relation dure dans le temps ?', 'philosophy'),
('L''amour est-il un choix ou un sentiment ?', 'philosophy'),
('Qu''est-ce qui est le plus important : la communication ou la confiance ?', 'philosophy'),
('Comment définissez-vous le bonheur à deux ?', 'philosophy'),
('Quelle est votre philosophie de vie commune ?', 'philosophy')
ON CONFLICT DO NOTHING;
\`\`\`

### 4. Créer des indexes de performance (optionnel mais recommandé)

Dans **SQL Editor**, exécuter:

\`\`\`sql
-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_events_couple_date ON events(couple_id, event_date);
CREATE INDEX IF NOT EXISTS idx_memories_couple_date ON memories(couple_id, memory_date);
CREATE INDEX IF NOT EXISTS idx_moods_couple_date ON daily_moods(couple_id, date);
CREATE INDEX IF NOT EXISTS idx_gratitude_couple_date ON gratitude_entries(couple_id, date);
CREATE INDEX IF NOT EXISTS idx_rituals_couple ON rituals(couple_id);
CREATE INDEX IF NOT EXISTS idx_bucket_list_couple ON bucket_list_items(couple_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_created ON analytics_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_backups_couple_created ON backups(couple_id, created_at DESC);
\`\`\`

---

## 🔔 Push Notifications

### 1. Générer les clés VAPID

\`\`\`bash
npx web-push generate-vapid-keys
\`\`\`

Cette commande va afficher:

\`\`\`
=======================================
Public Key:
BEl62iUYgUivxIkv69yViEuiBIa-Ib...

Private Key:
bdSiGgUt-5UYIk...
=======================================
\`\`\`

### 2. Ajouter les clés dans \`.env.local\`

\`\`\`env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa-Ib...
VAPID_PRIVATE_KEY=bdSiGgUt-5UYIk...
\`\`\`

---

## 🎨 PWA Assets

### 1. Créer les dossiers

\`\`\`bash
mkdir -p public/icons
mkdir -p public/screenshots
\`\`\`

### 2. Générer les icônes

Vous avez besoin d'icônes dans ces tailles:
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

**Générateur en ligne (recommandé):**
1. Aller sur [realfavicongenerator.net](https://realfavicongenerator.net/)
2. Upload une image 512x512 (logo de l'app)
3. Télécharger et extraire dans \`public/icons/\`

---

## 🚀 Lancement du Projet

### 1. Mode développement

\`\`\`bash
bun dev
\`\`\`

Ou avec npm:

\`\`\`bash
npm run dev
\`\`\`

L'app sera accessible sur: **http://localhost:3000**

### 2. Vérifier que tout fonctionne

1. **Créer un compte**: Aller sur \`/signup\`
2. **Créer un couple**: Code couple généré automatiquement
3. **Rejoindre avec 2ème compte**: Utiliser le même code couple
4. **Tester les features**:
   - ✅ Créer un événement (Calendar)
   - ✅ Ajouter un souvenir avec photo (Memories)
   - ✅ Envoyer un message (Messages)
   - ✅ Ajouter un item à la bucket list (Projects)
   - ✅ Noter son humeur (Mood)
   - ✅ Répondre à la question du jour (Questions)

---

## 🌐 Déploiement

### Déploiement sur Vercel (recommandé)

\`\`\`bash
# Installer Vercel CLI
npm i -g vercel

# Login
vercel login

# Déployer
vercel

# Déployer en production
vercel --prod
\`\`\`

Puis ajouter les variables d'environnement dans l'interface Vercel:
**Settings** → **Environment Variables**

---

## 🔧 Troubleshooting

### Erreur: "Cannot connect to Supabase"

✅ **Solution:**
1. Vérifier que \`NEXT_PUBLIC_SUPABASE_URL\` et \`NEXT_PUBLIC_SUPABASE_ANON_KEY\` sont corrects
2. Vérifier que le projet Supabase est actif (pas en pause)
3. Redémarrer le serveur dev

### Erreur: "Database connection failed"

✅ **Solution:**
1. Vérifier \`DATABASE_URL\` (mot de passe correct ?)
2. Tester la connexion dans Supabase Dashboard → Database
3. Vérifier que l'IP est autorisée (Supabase autorise tout par défaut)

### Erreur: "R2 upload failed"

✅ **Solution:**
1. Vérifier les credentials R2 (Access Key ID et Secret)
2. Vérifier que le bucket existe
3. Vérifier les permissions du token (Read & Write)

---

## 📚 Scripts disponibles

\`\`\`bash
# Développement
bun dev              # Lancer le serveur de dev
bun build            # Build pour production
bun start            # Lancer la version build
bun lint             # Linter le code

# Database
bun db:push          # Push schema vers Supabase
bun db:pull          # Pull schema depuis Supabase
bun db:studio        # Ouvrir Drizzle Studio (interface DB)
\`\`\`

---

## ✅ Checklist de démarrage rapide

\`\`\`bash
# 1. Installation
git clone https://github.com/StringerBell69/loveapp.git
cd loveapp
bun install
bun add recharts jspdf jspdf-autotable ics jszip web-push
bun add -D @types/jspdf @types/jszip @types/web-push

# 2. Configuration
cp .env.example .env.local
# Éditer .env.local avec vos credentials

# 3. Database
bun db:push
# Exécuter rls-policies.sql dans Supabase SQL Editor
# Exécuter le seed des questions

# 4. Push Notifications
npx web-push generate-vapid-keys
# Ajouter les clés dans .env.local

# 5. Lancer
bun dev
\`\`\`

Ouvrir http://localhost:3000 🎉

---

## 🎉 Features de l'App

Une fois configurée, vous avez:

- 📅 **Calendrier** avec événements, anniversaires, todos
- 💕 **Souvenirs** avec photos (Cloudflare R2)
- 💬 **Messages** en temps réel
- ✨ **Bucket List** avec tracking de progression
- 🎁 **Wishlist** avec achat secret
- 🔄 **Rituels** avec streak gamification
- 😊 **Humeurs** quotidiennes avec réactions
- 🙏 **Gratitude** quotidienne + partagée
- ❓ **Questions** du jour avec reveal
- 📱 **PWA** installable
- 🔔 **Push notifications**
- 📊 **Statistiques** complètes
- 🎨 **5 thèmes** + dark mode
- 💾 **Export** PDF/JSON/ICS/ZIP
- ♿ **Accessibilité** complète

**Bon dev! 💕✨**
