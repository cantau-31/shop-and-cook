# Shop & Cook
Parfait 🔥 on va faire ça proprement, étape par étape — tu vas avoir un **dépôt GitHub pro**, prêt à héberger ton projet *Shop & Cook (Angular + NestJS + MySQL)*.

**Shop & Cook** est une application web full-stack permettant de créer, consulter et partager des recettes de cuisine.
Chaque recette contient des ingrédients structurés (quantité + unité), des étapes, une durée, une difficulté, et peut être notée/commentée par les utilisateurs.

## Stack technique

| Partie | Technologie |
|--------|--------------|
| Frontend | Angular 17 + TailwindCSS |
| Backend | NestJS (Node.js + TypeScript) |
| Base de données | MySQL |
| ORM | TypeORM |
| Auth | JWT (Access + Refresh) |
| Tests | Jest / Cypress |
| Hébergement | Vercel (front), Render (API), Railway (MySQL) |

---

## Structure du projet
```

shop-and-cook/
├── frontend/ → Angular app
├── backend/  → NestJS API
├── sql/      → Scripts SQL (BDD + seeds)
├── docs/     → Maquettes, cahier des charges, UML
└── README.md

````

---

## ⚙️ Installation

### Cloner le repo
```bash
git clone https://github.com/<ton_pseudo>/shop-and-cook.git
cd shop-and-cook
````

### Lancer le backend

```bash
cd backend
npm install
npm run start:dev
```

### Lancer le frontend

```bash
cd ../frontend
npm install
npm start
```

---

## Variables d’environnement

### Backend (.env)

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=shopcook
JWT_SECRET=supersecret
```

### Frontend (.env)

```
API_URL=http://localhost:3000/api/v1
```

---

## Tests

* **Unitaires** : `npm run test`
* **End-to-End** : `npm run e2e`

---

## Déploiement

* Frontend : [Vercel](https://vercel.com/)
* Backend : [Render](https://render.com/)
* Base MySQL : [Railway](https://railway.app/)

---

## Auteurs

* Julien Cantau — Développeur Full Stack
