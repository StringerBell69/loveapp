# Database - Drizzle ORM

Ce répertoire contient la configuration et le schéma de base de données utilisant **Drizzle ORM**.

## 📁 Structure

```
lib/db/
├── schema.ts          # Schéma Drizzle (tables, types)
├── index.ts           # Client Drizzle
├── rls-policies.sql   # Row Level Security policies
└── README.md          # Ce fichier
```

## 🗄️ Schéma de Base de Données

### Tables

#### `couples`
- `id`: UUID (PK, auto-generated)
- `couple_code`: VARCHAR(6) (unique)
- `anniversary_date`: DATE (nullable)
- `created_at`: TIMESTAMP

#### `user_profiles`
- `id`: UUID (PK, FK → auth.users)
- `name`: VARCHAR(100)
- `couple_id`: UUID (FK → couples, nullable)
- `avatar_url`: TEXT (nullable)
- `created_at`: TIMESTAMP

#### `events`
- `id`: UUID (PK, auto-generated)
- `couple_id`: UUID (FK → couples)
- `title`: VARCHAR(255)
- `description`: TEXT (nullable)
- `event_date`: DATE
- `event_time`: TEXT (nullable)
- `event_type`: ENUM ('date', 'anniversary', 'todo')
- `color`: VARCHAR(7)
- `created_by`: UUID (FK → auth.users)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

## 🚀 Utilisation

### Push du schéma

```bash
npm run db:push
# ou avec bun
bun db:push
```

### Générer des migrations

```bash
npm run db:generate
```

### Appliquer les migrations

```bash
npm run db:migrate
```

### Drizzle Studio (GUI)

```bash
npm run db:studio
```

Ouvre une interface web sur `https://local.drizzle.studio`

### Pull du schéma depuis la DB

```bash
npm run db:pull
```

## 🔒 Row Level Security (RLS)

Les policies RLS ne sont **pas gérées par Drizzle** car il ne supporte pas nativement RLS de PostgreSQL.

**Important** : Après avoir push le schéma, exécuter manuellement `rls-policies.sql` dans le SQL Editor de Supabase.

### Policies implémentées

- ✅ Les utilisateurs ne voient que leur couple
- ✅ Les utilisateurs ne voient que les événements de leur couple
- ✅ Les utilisateurs peuvent modifier leur propre profil
- ✅ Les utilisateurs peuvent créer/modifier/supprimer les événements de leur couple

## 🛠️ Fonctions Personnalisées

### `generate_couple_code()`

Fonction PostgreSQL qui génère un code unique de 6 caractères pour les couples.

**Caractères utilisés** : A-Z (sauf I, O) et 2-9 (évite confusion 0/O, 1/I)

### `update_updated_at_column()`

Trigger function qui met à jour automatiquement `updated_at` sur la table `events`.

## 📝 Types TypeScript

Les types sont générés automatiquement depuis le schéma :

```typescript
import type { Couple, UserProfile, Event } from "@/lib/db/schema";
```

Types disponibles :
- `Couple` / `NewCouple` (insert)
- `UserProfile` / `NewUserProfile` (insert)
- `Event` / `NewEvent` (insert)

## 🔄 Synchronisation

Pour synchroniser le schéma Drizzle avec une base existante :

```bash
# 1. Pull le schéma depuis Supabase
npm run db:pull

# 2. Vérifier les changements dans schema.ts

# 3. Push les modifications
npm run db:push
```

## 📚 Documentation

- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [Drizzle Kit Docs](https://orm.drizzle.team/kit-docs/overview)
- [PostgreSQL + Drizzle](https://orm.drizzle.team/docs/get-started-postgresql)
