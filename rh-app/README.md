# appRH (Vite + React + TypeScript)

Documentation d'installation et d'usage pour l'application RH front-end construite avec Vite, React 19 et TypeScript.

## Prérequis
- Node.js 20+ et npm
- Accès au backend exposant l'API (par défaut proxifiée sur `/api` ou `http://localhost:5171/api`).

## Installation
1. Cloner le dépôt et se placer dans `rh-app`.
2. Installer les dépendances :
   ```bash
   npm install
   ```

## Lancer le projet
- **Développement** (avec HMR) :
  ```bash
  npm run dev
  ```
  Vite démarre sur `http://localhost:5173`.

- **Lint** :
  ```bash
  npm run lint
  ```

- **Build production** :
  ```bash
  npm run build
  ```

- **Prévisualisation du build** :
  ```bash
  npm run preview
  ```

## Connexion et comptes
- **Administrateur** :
  - Email : `admin@sge.com`
  - Mot de passe : `Admin123!`
- **Utilisateur** : utiliser le formulaire d'inscription pour créer un compte en renseignant email, mot de passe et l'identifiant de l'employé rattaché (champ `employeeId`). Une fois le compte créé, la connexion se fait avec l'email et le mot de passe saisis.

## Configuration de l'API
- L'URL de base par défaut est `/api` (ou `http://localhost:5171/api` en développement si vous contournez le proxy).
- Vous pouvez tester ou mettre à jour l'URL de l'API depuis la modale « Paramètres API » accessible via la barre supérieure.
- Les appels HTTP sont gérés par `src/HTTP/httpClient.ts` (Axios + gestion du token d'accès). L'URL courante est mémorisée dans le localStorage (`appRH_api_base_url`).

## Architecture du projet
- **Entrée** : `src/main.tsx` monte `App.tsx` et charge les styles globaux.
- **Composants** : organisation par domaine sous `src/components/` (auth, layout, dashboard, employees, departments, attendances). `DashboardLayout` orchestre les vues principales (départements, employés, présences) et les actions d'import/export.
- **État global** : `src/store/useAppStore.ts` assemble des *slices* Zustand pour l'authentification, les préférences, le dashboard et les données métiers (`src/store/slices/*`). Les préférences (mode d'affichage, base URL) sont persistées.
- **Services** :
  - `src/services/auth.service.ts` : gestion du cycle de login/refresh/logout et stockage du refresh token dans un cookie.
  - `src/services/toasts.service.ts` : notifications utilisateur.
- **Hooks et utilitaires** :
  - `src/hooks/useFeatureReminder.ts` : rappel des fonctionnalités manquantes côté API.
  - `src/utils/errorHandling.ts`, `src/utils/decode.ts` : normalisation des erreurs et validation Zod des réponses API.
- **Interfaces / codecs** : définitions Zod dans `src/interfaces` (auth, employés, départements, présences, absences) utilisées pour typer et valider les échanges réseau.

## Fonctionnalités clés
- Authentification avec rafraîchissement automatique du token et formulaire d'inscription/connexion.
- Tableau de bord basculant entre départements, employés et présences avec création/édition/suppression.
- Import/Export des employés via fichiers (Excel/CSV) lorsque l'API fichier est disponible.
- Paramétrage dynamique de l'URL d'API et détection de santé des services.
- Notifications toast pour les actions (authentification, import/export, erreurs).

## Structure des styles
Les styles globaux se trouvent dans `src/index.css` et `src/App.css`, combinant Tailwind (via `@tailwindcss/vite`) et classes utilitaires personnalisées.
