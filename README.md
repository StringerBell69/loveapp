# 💕 Notre Calendrier - L'app pour couples qui aiment planifier ensemble

Une application web progressive (PWA) complète pour couples, construite avec Next.js 14, Supabase, et Drizzle ORM.

![Version](https://img.shields.io/badge/version-1.0.0-pink)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📚 Documentation Complète

**Guides de Démarrage:**
- **[START.md](START.md)** ⚡ - Démarrage ultra-rapide (5 min)
- **[SETUP.md](SETUP.md)** 📖 - Guide complet de configuration step-by-step
- **[COMMANDES.md](COMMANDES.md)** 📋 - Toutes les commandes à copier-coller
- **[TEST-DB-PUSH.md](TEST-DB-PUSH.md)** 🧪 - Guide de test du push database

**Guides d'Implémentation:**
- **[PHASE3_IMPLEMENTATION.md](PHASE3_IMPLEMENTATION.md)** - Planning & Projets
- **[PHASE4_IMPLEMENTATION.md](PHASE4_IMPLEMENTATION.md)** - Émotionnel & Connaissance
- **[PHASE5_IMPLEMENTATION.md](PHASE5_IMPLEMENTATION.md)** - Bonus & Polish (PWA, Stats, Export)

**Scripts d'Automatisation:**
- **[quickstart.sh](quickstart.sh)** 🤖 - Installation automatique de toutes les dépendances

**Fichiers SQL:**
- **[setup-functions.sql](lib/db/setup-functions.sql)** - Fonctions et triggers database
- **[rls-policies.sql](lib/db/rls-policies.sql)** - Politiques de sécurité RLS
- **[seed-questions.sql](lib/db/seed-questions.sql)** - 70 questions quotidiennes

---

## ✨ Features

### 📅 Phase 1 - Calendrier & Événements
- Calendrier interactif avec vue mensuelle
- 3 types d'événements: Dates, Anniversaires, Todos
- Système de couple avec code unique de partage
- Authentification sécurisée (Supabase Auth)

### 💕 Phase 2 - Souvenirs & Messages
- Timeline de souvenirs avec upload de photos (Cloudflare R2)
- Messagerie en temps réel entre partenaires
- Galerie photos avec catégories

### ✨ Phase 3 - Planning & Projets
- **Bucket List**: Rêves à réaliser ensemble avec statuts (todo/in_progress/done)
- **Wishlist**: Liste de souhaits avec système d'achat SECRET
- **Rituels**: Traditions à maintenir avec streak gamification

### 💖 Phase 4 - Émotionnel & Connaissance
- **Humeurs Quotidiennes**: 8 types d'humeur avec réactions du partenaire
- **Journal de Gratitude**: Gratitude quotidienne + gratitude partagée hebdomadaire
- **Questions du Jour**: Système de questions tournantes pour mieux se connaître

### 🚀 Phase 5 - Bonus & Polish
- **PWA**: Application installable avec mode hors ligne
- **Push Notifications**: 10 types de notifications (humeurs, rituels, questions, etc.)
- **Statistiques**: Dashboard complet avec graphiques et insights
- **Personnalisation**: 5 palettes de couleurs, dark mode, avatars
- **Export**: PDF, JSON, ICS (calendrier), ZIP avec photos
- **Accessibilité**: Font scale, reduced motion, high contrast

---

## 🚀 Quick Start

### Prérequis
- Node.js 18+ ou Bun 1.0+
- Compte Supabase (gratuit)
- Compte Cloudflare pour R2 Storage (gratuit)

### Installation automatique

```bash
# Cloner le repo
git clone https://github.com/StringerBell69/loveapp.git
cd loveapp

# Lancer le script d'installation
./quickstart.sh
```

### Installation manuelle

```bash
# Installer les dépendances
bun install

# Installer les dépendances Phase 5
bun add recharts jspdf jspdf-autotable ics jszip web-push
bun add -D @types/jspdf @types/jszip @types/web-push

# Copier et configurer l'environnement
cp .env.example .env.local
# Éditer .env.local avec vos credentials

# Migrer la base de données
bun db:push

# Générer les clés VAPID pour push notifications
npx web-push generate-vapid-keys

# Lancer le serveur de dev
bun dev
```

**📚 Pour la configuration complète: voir [SETUP.md](SETUP.md)**

---

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS v4
- Framer Motion (animations)
- shadcn/ui components

**Backend:**
- Supabase (Database + Auth + Realtime)
- Drizzle ORM
- PostgreSQL with RLS (Row Level Security)

**Storage:**
- Cloudflare R2 (photos et backups)

**PWA:**
- Service Worker avec cache strategies
- Web Push API
- Manifest.json

**Charts & Export:**
- Recharts (visualisations)
- jsPDF (export PDF)
- JSZip (archives)
- ICS (export calendrier)

### Structure du Projet

```
loveapp/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Routes d'authentification
│   ├── (app)/             # Routes de l'application
│   └── api/               # API routes
├── components/            # Composants React
│   ├── ui/               # shadcn/ui components
│   └── ...               # Feature components
├── hooks/                # Custom React hooks
│   ├── useCouple.ts
│   ├── useBucketList.ts
│   ├── useWishlist.ts
│   ├── useRituals.ts
│   ├── useMood.ts
│   ├── useGratitude.ts
│   ├── useQuestions.ts
│   ├── useStatistics.ts
│   └── usePreferences.ts
├── lib/
│   ├── db/               # Database schema & migrations
│   │   ├── schema.ts     # Drizzle schema
│   │   └── rls-policies.sql
│   ├── supabase/         # Supabase clients
│   ├── r2/               # R2 storage utilities
│   ├── export/           # Export utilities (PDF, JSON, ICS, ZIP)
│   ├── notifications/    # Push notification system
│   └── themes/           # Theme palettes
├── public/
│   ├── icons/            # PWA icons
│   ├── screenshots/      # PWA screenshots
│   ├── manifest.json     # PWA manifest
│   └── sw.js             # Service Worker
├── SETUP.md              # Guide complet de configuration
├── PHASE3_IMPLEMENTATION.md
├── PHASE4_IMPLEMENTATION.md
└── PHASE5_IMPLEMENTATION.md
```

---

## 📊 Database Schema

### Tables principales:

**Core:**
- `couples` - Couples avec code unique
- `user_profiles` - Profils utilisateurs
- `events` - Événements du calendrier
- `memories` - Souvenirs avec photos
- `love_notes` - Messages entre partenaires

**Phase 3 - Planning:**
- `bucket_list_items` - Bucket list avec progression
- `wishlist_items` - Wishlist avec achat secret
- `rituals` - Rituels et traditions
- `ritual_completions` - Historique des rituels

**Phase 4 - Émotionnel:**
- `daily_moods` - Humeurs quotidiennes
- `mood_reactions` - Réactions aux humeurs
- `gratitude_entries` - Gratitudes quotidiennes
- `gratitude_reactions` - Réactions aux gratitudes
- `shared_gratitude` - Gratitudes partagées
- `daily_questions` - Pool de questions
- `question_of_the_day` - Question du jour
- `question_answers` - Réponses aux questions
- `question_reactions` - Réactions aux réponses
- `notification_settings` - Paramètres de notifications

**Phase 5 - Bonus:**
- `user_preferences` - Préférences et personnalisation
- `backups` - Historique des backups
- `onboarding_progress` - Progression du tour guidé
- `feature_flags` - Flags de fonctionnalités
- `analytics_events` - Événements d'analytics

---

## 🎨 Thèmes

5 palettes de couleurs romantiques:

1. **Classique** 💕 - Rose, Lavande, Pêche
2. **Coucher de soleil** 🌅 - Rouge corail, Orange, Rose
3. **Océan** 🌊 - Bleu ciel, Turquoise, Bleu clair
4. **Lavande** 💜 - Violet clair, Lilas, Rose pâle
5. **Forêt** 🌲 - Vert menthe, Vert clair, Vert d'eau

Chaque thème disponible en mode clair et sombre.

---

## 🔐 Sécurité

- Row Level Security (RLS) sur toutes les tables
- Authentification Supabase avec JWT
- Données scopées par couple
- Upload de fichiers sécurisé avec validation
- HTTPS obligatoire en production
- CORS configuré pour R2

---

## 📱 PWA Features

- Installation sur mobile/desktop
- Mode hors ligne avec cache intelligent
- Push notifications (10 types)
- Icônes adaptatives
- Shortcuts dans le launcher
- Optimisé pour la performance

---

## 🌐 Déploiement

### Vercel (recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel --prod
```

Configuration requise:
- Variables d'environnement dans Vercel Dashboard
- Supabase configuré avec l'URL de production
- R2 CORS configuré pour le domaine de prod

### Autres plateformes

Compatible avec:
- Netlify
- Railway
- AWS Amplify
- Docker

---

## 🧪 Testing

```bash
# Linter
bun lint

# Type checking
bun run type-check

# Tests unitaires (si configurés)
bun test
```

---

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Guide complet de configuration
- **[PHASE3_IMPLEMENTATION.md](PHASE3_IMPLEMENTATION.md)** - Guide Phase 3 (Planning & Projets)
- **[PHASE4_IMPLEMENTATION.md](PHASE4_IMPLEMENTATION.md)** - Guide Phase 4 (Émotionnel & Connaissance)
- **[PHASE5_IMPLEMENTATION.md](PHASE5_IMPLEMENTATION.md)** - Guide Phase 5 (Bonus & Polish)

---

## 🤝 Contributing

Les contributions sont les bienvenues! Pour contribuer:

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📄 License

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 👥 Authors

- **StringerBell69** - *Initial work* - [@StringerBell69](https://github.com/StringerBell69)

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend as a Service
- [Vercel](https://vercel.com) - Hébergement
- [Cloudflare](https://cloudflare.com) - R2 Storage
- [shadcn/ui](https://ui.shadcn.com) - Composants UI
- [Drizzle ORM](https://orm.drizzle.team) - TypeScript ORM

---

## 💖 Support

Si vous aimez ce projet, n'hésitez pas à:
- ⭐ Star le repo
- 🐛 Signaler des bugs via les Issues
- 💡 Proposer des améliorations
- 📖 Améliorer la documentation

---

**Fait avec 💕 pour les couples qui aiment planifier ensemble**
