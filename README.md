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
- **Auth**: Supabase Auth
- **Validation**: Zod
- **Dates**: date-fns

## 🚀 Installation et Configuration

### 1. Cloner et installer

```bash
git clone <repository-url>
cd loveapp
npm install
```

### 2. Configuration Supabase

1. Créer un compte sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Exécuter le script SQL : `supabase/migrations/001_initial_schema.sql`
4. Récupérer l'URL et la clé ANON

### 3. Variables d'environnement

Créer `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Lancer l'application

```bash
npm run dev
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
├── lib/                  # Utilitaires
├── types/                # Types TypeScript
└── supabase/             # Migrations SQL
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

```bash
npm run dev      # Développement
npm run build    # Build production
npm run start    # Production
npm run lint     # Linter
```

## 📄 Licence

Propriétaire - Tous droits réservés

---

**Fait avec 💕**
