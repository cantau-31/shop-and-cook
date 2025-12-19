# Shop & Cook API

Backend NestJS pour l’application Shop & Cook. Il expose une API REST documentée (Swagger) alimentée par MySQL + TypeORM, avec authentification JWT (access + refresh), validation forte et règles métier dédiées aux recettes, ingrédients, commentaires, notes et favoris.

## 🚀 Stack & caractéristiques

- NestJS 11 + TypeScript
- TypeORM (MySQL)
- Authentification JWT (access 15 min / refresh 7 j)
- class-validator / class-transformer & ValidationPipe globale
- Swagger disponible sur `/docs`
- Guards JWT, rôles (USER/ADMIN) et auteur-ou-admin
- Rate limiting sur `/auth/*` et `/comments/*`
- Gestion des erreurs homogène `{ code, message, details? }`

## 📦 Installation

```bash
cd backend/api
cp .env.example .env            # ajuster les variables d’environnement
npm install
```

Variables importantes (`.env`):

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=shopcook
JWT_SECRET=supersecret
JWT_EXPIRES_IN=15m
REFRESH_SECRET=anothersecret
REFRESH_EXPIRES_IN=7d
FRONTEND_ORIGIN=http://localhost:4200
```

### Base de données

Créer la base MySQL `shopcook` (ou celle déclarée dans `.env`) puis exécuter les migrations / scripts nécessaires. Un script de seed rapide est fourni :

```bash
npm run seed
```

Il crée :
- 1 admin (`admin@shopcook.dev / Admin123!`)
- 1 utilisateur de démonstration (`demo@shopcook.dev / Demo123!`)
- 3 catégories
- 1 recette + ingrédients associés

## 🏃 Scripts npm

| Commande | Description |
| --- | --- |
| `npm run start:dev` | Démarre l’API en mode watch |
| `npm run start` | Démarre en mode production |
| `npm run build` | Compile TypeScript -> dist |
| `npm run lint` | ESLint + fix |
| `npm run test` | Tests unitaires (Jest) |
| `npm run test:e2e` | Tests end-to-end |
| `npm run seed` | Script de pré-chargement de données |

## 🧭 Routes principales

Toutes les réponses d’erreurs suivent `{ code, message, details? }`.

### Auth (`/auth`)
- `POST /auth/register` – inscription (hash bcrypt)
- `POST /auth/login` – retourne `{ accessToken, refreshToken }`
- `POST /auth/refresh` – refresh token Bearer
- `POST /auth/logout` – invalide côté client (stateless)

### Utilisateur
- `GET /me` (JWT) – profil courant

### Recettes (`/recipes`)
- `GET /recipes?q=&category=&difficulty=&maxTime=&page=&limit=` – liste paginée
- `GET /recipes/:idOrSlug` – détails
- `POST /recipes` (USER) – crée une recette avec ingrédients
- `PUT /recipes/:id` (auteur/ADMIN) – met à jour recette + steps
- `PUT /recipes/:id/ingredients` (auteur/ADMIN) – remplace les ingrédients
- `PATCH /recipes/admin/:id/hide` (ADMIN) – soft delete via `hiddenAt`

### Ingrédients / catégories
- `GET /categories` – liste des catégories (utilisé par le front)

### Notes & commentaires
- `POST /recipes/:id/rating` (USER) – 1 note par user/recette, renvoie la moyenne
- `GET /recipes/:id/comments` – liste paginée publique
- `POST /recipes/:id/comments` (USER) – création
- `DELETE /comments/:id` (auteur <10 min ou ADMIN)

### Favoris
- `POST /recipes/:id/favorite` (USER)
- `DELETE /recipes/:id/favorite` (USER)
- `GET /me/favorites` (USER)

## ✅ Tests & vérifications

- **Unitaires** : services clés (`ratings.service.spec.ts` …). Ajoutez vos propres scenarii métier à mesure que le domaine grandit.
- **E2E** : `test/app.e2e-spec.ts` illustre le chemin happy-path (inscription → login → création de recette → récupération).

> 💡 Les tests nécessitent une base dédiée (ex. MySQL docker) ou un override TypeORM (SQLite). Configurez vos variables `.env.test` avant d’exécuter `npm run test:e2e`.

## 🔐 Sécurité & bonnes pratiques intégrées

- Hash BCrypt (salt 11 par défaut) + DTOs validés
- Guards JWT + Roles + AuthorOrAdmin
- Rate limiting via `@nestjs/throttler`
- CORS configurable (`FRONTEND_ORIGIN`)
- Swagger documenté avec bearerAuth
- Logger minimal sans fuite PII

## 📚 Swagger / docs

Après démarrage (`npm run start:dev`), la documentation est disponible sur :

```
http://localhost:3000/docs
```

## 🤝 Contribution

1. `npm install`
2. Créer une branche
3. Ajouter vos tests (`npm run test`)
4. Soumettre une PR détaillée

Bon développement sur Shop & Cook ! 🍳
