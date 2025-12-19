# Shop & Cook – Front mocké

Ce dossier est une copie fidèle du front Angular (`frontend/web`) mais branchée sur une fausse API embarquée (intercepteur `MockApiInterceptor`). Aucun backend n’est requis : toutes les requêtes HTTP sont interceptées et répondent avec les données du dossier `src/app/data/mock-data.ts`.

## Lancer

```bash
cd mock-front
npm install   # première fois
npm start     # http://localhost:4200
```

Les formulaires (auth, recettes, favoris…) fonctionnent comme dans l’application principale, mais les modifications sont simplement maintenues en mémoire pendant la session.

Pour ajuster les données initiales (recettes, catégories, utilisateurs), modifiez `src/app/data/mock-data.ts`.
