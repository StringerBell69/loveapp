# Supabase Database Setup

## Instructions de configuration

### 1. Créer un projet Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Noter l'URL du projet et la clé ANON

### 2. Configurer les variables d'environnement

Créer un fichier `.env.local` à la racine du projet:

```bash
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
```

### 3. Exécuter le script de migration

Dans le dashboard Supabase:

1. Aller dans SQL Editor
2. Copier tout le contenu de `migrations/001_initial_schema.sql`
3. Coller dans l'éditeur SQL
4. Cliquer sur "Run"

Cela créera:
- Les tables `couples`, `user_profiles`, `events`
- Les index pour les performances
- Les politiques de sécurité RLS (Row Level Security)
- Les triggers et fonctions

### 4. Configurer l'authentification

Dans le dashboard Supabase > Authentication > Providers:

1. Activer "Email" provider
2. (Optionnel) Configurer d'autres providers (Google, etc.)

### 5. Vérification

Après avoir exécuté le script:
- Vérifier que les 3 tables sont créées dans "Table Editor"
- Vérifier que RLS est activé pour chaque table
- Tester la connexion depuis l'application

## Structure de la base de données

### Table: couples
- `id`: UUID (clé primaire)
- `couple_code`: VARCHAR(6) (code unique à 6 caractères)
- `anniversary_date`: DATE (optionnel)
- `created_at`: TIMESTAMP

### Table: user_profiles
- `id`: UUID (référence auth.users)
- `name`: VARCHAR(100)
- `couple_id`: UUID (référence couples)
- `avatar_url`: TEXT (optionnel)
- `created_at`: TIMESTAMP

### Table: events
- `id`: UUID (clé primaire)
- `couple_id`: UUID (référence couples)
- `title`: VARCHAR(255)
- `description`: TEXT (optionnel)
- `event_date`: DATE
- `event_time`: TIME (optionnel)
- `event_type`: ENUM ('date', 'anniversary', 'todo')
- `color`: VARCHAR(7) (code couleur hex)
- `created_by`: UUID (référence auth.users)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

## Sécurité (RLS)

Toutes les tables ont Row Level Security activé:
- Les utilisateurs ne peuvent voir que les données de leur couple
- Les utilisateurs peuvent modifier leur propre profil
- Les utilisateurs peuvent créer/modifier/supprimer les événements de leur couple
