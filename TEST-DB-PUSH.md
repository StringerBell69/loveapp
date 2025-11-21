# 🧪 Test Guide - Database Push

Guide rapide pour tester `bun db:push` et vérifier que tout fonctionne.

---

## ✅ Prérequis

Avant de lancer `bun db:push`, vous DEVEZ avoir:

1. ✅ Un projet Supabase créé
2. ✅ Le fichier `.env.local` créé et rempli avec vos credentials
3. ✅ Les dépendances installées (`bun install`)

---

## 🚀 Test du Push

### 1. Vérifier que .env.local existe

```bash
cat .env.local
```

Vous devez voir vos vraies credentials:
- `NEXT_PUBLIC_SUPABASE_URL` (https://xxxxx.supabase.co)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (eyJxxx...)
- `DATABASE_URL` (postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres)

### 2. Lancer le push

```bash
bun db:push
```

### 3. Vérifier le résultat

Vous devriez voir:

```
🚀 Pushing to database...
✓ Tables created
✓ Enums created
✓ Constraints added
✓ Indexes created
✓ Done!
```

---

## 📊 Tables Créées (25 tables)

Le push devrait créer toutes ces tables:

### Phase 1 & 2 - Core
- ✅ `couples` - Couples avec code unique
- ✅ `user_profiles` - Profils utilisateurs
- ✅ `events` - Événements du calendrier
- ✅ `memories` - Souvenirs avec photos
- ✅ `love_notes` - Messages entre partenaires

### Phase 3 - Planning & Projets
- ✅ `bucket_list_items` - Bucket list
- ✅ `wishlist_items` - Wishlist
- ✅ `rituals` - Rituels
- ✅ `ritual_completions` - Historique rituels

### Phase 4 - Émotionnel & Connaissance
- ✅ `daily_moods` - Humeurs quotidiennes
- ✅ `mood_reactions` - Réactions aux humeurs
- ✅ `gratitude_entries` - Gratitudes quotidiennes
- ✅ `gratitude_reactions` - Réactions aux gratitudes
- ✅ `shared_gratitude` - Gratitudes partagées
- ✅ `daily_questions` - Pool de questions
- ✅ `question_of_the_day` - Question du jour
- ✅ `question_answers` - Réponses
- ✅ `question_reactions` - Réactions aux réponses
- ✅ `notification_settings` - Paramètres notifications

### Phase 5 - Bonus & Polish
- ✅ `user_preferences` - Préférences utilisateur
- ✅ `backups` - Historique backups
- ✅ `onboarding_progress` - Progression onboarding
- ✅ `feature_flags` - Feature flags
- ✅ `analytics_events` - Événements analytics

---

## 🔍 Vérifier dans Supabase Dashboard

1. Aller sur [supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionner votre projet
3. Cliquer sur **Database** dans le menu de gauche
4. Cliquer sur **Tables**
5. Vous devriez voir les 25 tables listées ci-dessus

---

## 🐛 Troubleshooting

### Erreur: "DATABASE_URL not found"

```bash
# Vérifier que .env.local existe
ls -la .env.local

# Vérifier le contenu
cat .env.local | grep DATABASE_URL
```

**Solution**: Copier `.env.example` vers `.env.local` et remplir avec vos credentials:

```bash
cp .env.example .env.local
nano .env.local
```

### Erreur: "Connection refused"

**Causes possibles**:
1. ❌ URL Supabase incorrecte
2. ❌ Database password incorrect
3. ❌ Projet Supabase en pause (plan gratuit)

**Solution**:
1. Vérifier l'URL dans Supabase Dashboard > Settings > API
2. Vérifier le password (c'est celui choisi lors de la création du projet)
3. Réactiver le projet si en pause

### Erreur: "Table already exists"

C'est normal si vous avez déjà pushé le schema.

**Solution**: Drizzle ne fait rien si les tables existent déjà.

Si vous voulez recommencer à zéro:
1. Aller dans Supabase Dashboard > Database > Tables
2. Supprimer toutes les tables manuellement
3. Re-lancer `bun db:push`

### Erreur: "Syntax error near..."

**Cause**: Version de Drizzle incompatible

**Solution**:
```bash
bun update drizzle-orm drizzle-kit
bun db:push
```

---

## ✅ Prochaines Étapes

Une fois le `bun db:push` réussi:

1. **Exécuter les fonctions SQL**:
   - Dans Supabase SQL Editor
   - Exécuter `lib/db/setup-functions.sql`
   - Exécuter `lib/db/rls-policies.sql`
   - Exécuter `lib/db/seed-questions.sql`

2. **Lancer l'app**:
   ```bash
   bun dev
   ```

3. **Tester**:
   - Créer un compte sur http://localhost:3000/signup
   - Créer un couple
   - Tester les features

---

## 📚 Commandes Utiles

```bash
# Push le schema
bun db:push

# Ouvrir Drizzle Studio (interface visuelle)
bun db:studio

# Pull le schema depuis Supabase (si modifié manuellement)
bun db:pull

# Générer une migration
bun db:generate
```

---

## 🎯 Checklist Rapide

- [ ] `.env.local` créé avec credentials Supabase
- [ ] `bun install` exécuté
- [ ] `bun db:push` réussi sans erreur
- [ ] 25 tables visibles dans Supabase Dashboard
- [ ] `setup-functions.sql` exécuté dans SQL Editor
- [ ] `rls-policies.sql` exécuté dans SQL Editor
- [ ] `seed-questions.sql` exécuté dans SQL Editor
- [ ] `bun dev` lance l'app sans erreur
- [ ] Signup fonctionne
- [ ] Couple creation fonctionne

---

**Si tout est ✅, vous êtes prêt à développer! 🎉**

