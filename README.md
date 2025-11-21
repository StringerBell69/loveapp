# Notre Calendrier 💕 - Calendrier de Couple

Application web mobile-first pour couples, permettant de partager et organiser vos moments précieux ensemble.

## ✨ Fonctionnalités Phase 1 (MVP)

### 🔐 Authentification
- Inscription et connexion sécurisées avec Supabase Auth
- Gestion des sessions utilisateurs
- Design romantique avec animations douces

### 💕 Système de Couple
- Création d'un couple avec code unique à 6 caractères
- Rejoindre un couple via code de partage
- Gestion de la date d'anniversaire
- Visualisation des membres du couple

### 📅 Calendrier Partagé
- Vue calendrier mensuel interactive
- Navigation fluide entre les mois
- Indicateurs visuels des événements par jour
- Sélection de date pour voir les événements

### 🗓️ Gestion d'Événements
- Création d'événements (Dates, Anniversaires, Tâches)
- Modification et suppression d'événements
- Descriptions et heures optionnelles
- 6 couleurs personnalisables
- Synchronisation en temps réel entre les partenaires

### 🏠 Dashboard Romantique
- Compteur de jours ensemble avec animation
- Compte à rebours jusqu'au prochain anniversaire
- Liste des 3 prochains événements
- Design avec coeurs flottants animés

### 🎨 Thème Visuel "Amour"
- Palette de couleurs douces (rose, lavande, pêche, crème)
- Animations fluides et micro-interactions
- Design mobile-first optimisé
- Coins arrondis et ombres douces partout

## 🏗️ Stack Technique

- **Framework**: Next.js 14 (App Router)
- **Langage**: TypeScript (strict mode)
- **UI**: shadcn/ui (customisé)
- **Styling**: TailwindCSS v4
- **Animations**: Framer Motion
- **Database**: Supabase PostgreSQL
- **ORM**: Drizzle ORM
- **Auth**: Supabase Auth
- **Validation**: Zod
- **Dates**: date-fns

## 🚀 Installation et Configuration

### 1. Cloner et installer

```bash
git clone <repository-url>
cd loveapp
npm install
# ou avec bun
bun install
```

### 2. Configuration Supabase

1. Créer un compte sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Récupérer :
   - **Project URL** et **ANON key** (Settings > API)
   - **Database URL** (Settings > Database > Connection string > URI)

### 3. Variables d'environnement

Créer `.env.local` à partir de `.env.example` :

```bash
cp .env.example .env.local
```

Remplir les valeurs :

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=postgresql://postgres:password@project.supabase.co:5432/postgres
```

### 4. Push du schéma de base de données

```bash
npm run db:push
# ou avec bun
bun db:push
```

Ensuite, exécuter les RLS policies dans le SQL Editor de Supabase :

```bash
# Copier le contenu de lib/db/rls-policies.sql
# et l'exécuter dans Supabase SQL Editor
```

### 5. Lancer l'application

```bash
npm run dev
# ou avec bun
bun dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 📁 Structure du Projet

```
loveapp/
├── app/
│   ├── (auth)/           # Authentification
│   ├── (app)/            # App principale
│   └── layout.tsx
├── components/
│   ├── ui/               # shadcn/ui customisé
│   ├── layout/           # Navigation
│   ├── dashboard/        # Dashboard
│   └── calendar/         # Calendrier
├── hooks/                # Hooks React
├── lib/
│   ├── db/               # Drizzle ORM (schema, config, RLS)
│   ├── supabase/         # Supabase client config
│   └── utils/            # Utilitaires
├── types/                # Types TypeScript
└── drizzle.config.ts     # Config Drizzle Kit
```

## 🎨 Palette de Couleurs

```
Rose Pastel: #FFB3BA
Rose Vif:    #FF6B9D
Lavande:     #C7CEEA
Pêche:       #FFC9B9
Crème:       #FFF5F0
```

## 🔒 Sécurité

- Row Level Security (RLS) activé sur toutes les tables
- Sessions sécurisées avec Supabase Auth
- Middleware Next.js pour protéger les routes
- Validation Zod sur tous les formulaires

## 📝 Scripts

### Application

```bash
npm run dev      # Développement
npm run build    # Build production
npm run start    # Production
npm run lint     # Linter
```

### Base de données (Drizzle)

```bash
npm run db:push      # Push schema to database
npm run db:pull      # Pull schema from database
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio (GUI)
```

**Avec Bun** : Remplacez `npm run` par `bun` (ex: `bun db:push`)

## 📄 Licence

Propriétaire - Tous droits réservés

---

**Fait avec 💕**
