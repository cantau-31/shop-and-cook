# Shop & Cook

**Shop & Cook** est une application web full-stack dédiée à la création, la consultation et le partage de recettes de cuisine.

Chaque recette est composée d’ingrédients structurés (quantité et unité), d’étapes de préparation, d’une durée, d’un niveau de difficulté, et peut être notée ou commentée par les utilisateurs.

Le projet est construit autour d’une architecture moderne et prête pour le déploiement.

---

## Stack technique

| Composant        | Technologie                                 |
| ---------------- | ------------------------------------------- |
| Frontend         | Angular 17, TailwindCSS                     |
| Backend          | NestJS (Node.js, TypeScript)                |
| Base de données  | MySQL                                       |
| ORM              | TypeORM                                     |
| Authentification | JWT (access & refresh tokens)               |
| Tests            | Jest, Cypress                               |
| Déploiement      | Vercel (front), Render (API), Railway (BDD) |

---

## Structure du projet

```
shop-and-cook/
├── frontend/   # Application Angular
├── backend/    # API NestJS
├── sql/        # Scripts SQL (création et seeds)
├── docs/       # Documentation, maquettes, UML
└── README.md
```

---

## Installation
Cloner le dépôt

```bash
git clone https://github.com/<ton_pseudo>/shop-and-cook.git
cd shop-and-cook
```
 
Démarrer le backend

```bash
cd backend
npm install
npm run start:dev
```

### Démarrer le frontend

```bash
cd ../frontend
npm install
npm start
```

---

## Variables d’environnement

### Backend (`.env`)

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=shopcook
JWT_SECRET=supersecret
```

### Frontend (`.env`)

```
API_URL=http://localhost:3000/api/v1
```

---

## Tests

* **Tests unitaires** : `npm run test`
* **Tests end-to-end** : `npm run e2e`

---

## Déploiement

* Frontend : Vercel
* Backend : Render
* Base de données MySQL : Railway

---

## Auteur

**Julien Cantau**
Développeur Full Stack

---

Si tu veux, je peux aussi :

* le rendre **plus académique** (pour un dossier scolaire),
* **plus marketing** (portfolio / recruteur),
* ou **plus technique** (orienté dev senior).
