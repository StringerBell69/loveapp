# Guide de Configuration - Notre Calendrier 💕

Ce guide vous accompagne pas à pas dans la configuration de l'application.

## 📋 Prérequis

- Node.js 18+ installé
- npm ou yarn
- Un compte Supabase (gratuit)
- Git

## 🔧 Étape 1 : Configuration du Projet

### 1.1 Cloner le repository

```bash
git clone <repository-url>
cd loveapp
```

### 1.2 Installer les dépendances

```bash
npm install
```

Cela installera toutes les dépendances nécessaires :
- Next.js 14
- React 19
- Supabase
- Framer Motion
- TailwindCSS v4
- date-fns
- Zod
- etc.

## 🗄️ Étape 2 : Configuration Supabase

### 2.1 Créer un projet Supabase

1. Aller sur [https://supabase.com](https://supabase.com)
2. Se connecter ou créer un compte
3. Cliquer sur "New Project"
4. Remplir les informations :
   - **Name** : LoveApp (ou autre nom)
   - **Database Password** : Choisir un mot de passe fort
   - **Region** : Choisir la région la plus proche
   - **Pricing Plan** : Free (suffisant pour MVP)
5. Cliquer sur "Create new project"
6. Attendre que le projet soit créé (2-3 minutes)

### 2.2 Récupérer les clés API

1. Dans le dashboard Supabase, aller dans **Settings** → **API**
2. Copier les informations suivantes :
   - **Project URL** : `https://xxxxx.supabase.co`
   - **anon/public key** : `eyJhbG...` (une longue chaîne)

### 2.3 Créer la base de données

1. Dans le dashboard Supabase, aller dans **SQL Editor**
2. Cliquer sur "New query"
3. Copier tout le contenu du fichier `supabase/migrations/001_initial_schema.sql`
4. Coller dans l'éditeur SQL
5. Cliquer sur "Run" (en bas à droite)
6. Vérifier qu'il n'y a pas d'erreurs (message de succès)

### 2.4 Vérifier la création des tables

1. Aller dans **Table Editor**
2. Vérifier que 3 tables sont créées :
   - `couples`
   - `user_profiles`
   - `events`

### 2.5 Configurer l'authentification

1. Aller dans **Authentication** → **Providers**
2. S'assurer que "Email" est activé
3. Optionnel : Activer d'autres providers (Google, etc.)

## 🔑 Étape 3 : Variables d'Environnement

### 3.1 Créer le fichier .env.local

À la racine du projet, créer un fichier `.env.local` :

```bash
touch .env.local
```

### 3.2 Ajouter les variables

Ouvrir `.env.local` et ajouter :

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_projet_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

Remplacer les valeurs par celles récupérées à l'étape 2.2.

**Exemple :**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3.3 Vérifier le fichier .gitignore

S'assurer que `.env.local` est dans `.gitignore` pour ne pas commit les secrets :

```bash
cat .gitignore | grep ".env.local"
```

Si absent, l'ajouter :
```bash
echo ".env.local" >> .gitignore
```

## 🚀 Étape 4 : Lancer l'Application

### 4.1 Démarrer le serveur de développement

```bash
npm run dev
```

### 4.2 Accéder à l'application

Ouvrir le navigateur à : [http://localhost:3000](http://localhost:3000)

Vous devriez voir la page de connexion avec le thème romantique ! 💕

## ✅ Étape 5 : Tester l'Application

### 5.1 Créer un compte

1. Sur la page de connexion, cliquer sur "Créer un compte"
2. Remplir :
   - **Prénom** : Votre prénom
   - **Email** : Votre email
   - **Mot de passe** : Minimum 6 caractères
   - **Confirmation** : Même mot de passe
3. Cliquer sur "Créer mon compte"

### 5.2 Créer ou rejoindre un couple

Vous serez redirigé vers `/couple/setup`

**Option 1 : Créer un couple**
1. Cliquer sur "Créer notre couple"
2. Un code à 6 caractères sera généré
3. Copier ce code
4. Cliquer sur "Continuer"

**Option 2 : Rejoindre un couple**
1. Entrer le code partagé par votre partenaire
2. Cliquer sur "Rejoindre"

### 5.3 Explorer le dashboard

Vous devriez voir :
- Le compteur de jours (si date anniversaire définie)
- Les coeurs flottants en arrière-plan
- La navigation en bas avec 5 onglets

### 5.4 Créer un événement

1. Cliquer sur le bouton "+" (FAB en bas à droite)
2. Remplir le formulaire :
   - Titre
   - Description (optionnel)
   - Date
   - Heure (optionnel)
   - Type (Date/Anniversaire/À faire)
   - Couleur
3. Cliquer sur "Créer"

### 5.5 Voir le calendrier

1. Cliquer sur l'onglet "Calendrier" en bas
2. Voir le calendrier mensuel
3. Les jours avec événements ont des petits points colorés
4. Cliquer sur un jour pour voir les événements

## 🐛 Dépannage

### Erreur : "Invalid Supabase URL"

**Solution** : Vérifier que l'URL dans `.env.local` est correcte et commence par `https://`

### Erreur : "JWT expired" ou "Invalid API key"

**Solution** : Vérifier que la clé ANON est correctement copiée sans espaces

### Erreur : "Table does not exist"

**Solution** : Le script SQL n'a pas été exécuté. Retourner à l'étape 2.3

### Erreur : "Permission denied"

**Solution** : Vérifier que RLS est bien activé. Aller dans Supabase → Table Editor → Cliquer sur une table → Authentication → Vérifier "Enable RLS"

### L'application ne se lance pas

**Solution 1** : Supprimer `node_modules` et réinstaller
```bash
rm -rf node_modules
npm install
```

**Solution 2** : Vérifier la version de Node.js
```bash
node --version  # Doit être >= 18
```

### Les animations ne fonctionnent pas

**Solution** : Vider le cache du navigateur ou tester en mode incognito

## 🔐 Sécurité

### En développement

- Ne JAMAIS commit le fichier `.env.local`
- Ne JAMAIS partager vos clés API publiquement
- Utiliser la clé ANON (pas la clé SERVICE)

### En production

- Activer RLS sur toutes les tables (déjà fait)
- Vérifier les politiques de sécurité
- Utiliser HTTPS uniquement
- Configurer les CORS correctement

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Framer Motion](https://www.framer.com/motion/)
- [Documentation TailwindCSS](https://tailwindcss.com/docs)

## 🆘 Support

Si vous rencontrez des problèmes :

1. Vérifier ce guide de dépannage
2. Consulter les logs dans le terminal
3. Vérifier les logs Supabase (Dashboard → Logs)
4. Ouvrir une issue sur GitHub

---

**Bonne installation ! 💕**
