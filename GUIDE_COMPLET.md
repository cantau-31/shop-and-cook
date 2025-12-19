# 📚 Guide Complet du Projet Shop & Cook

## 🏗️ Vue d'Ensemble de l'Architecture

**Shop & Cook** est une application web full-stack de gestion de recettes de cuisine, développée avec une architecture moderne et scalable.

### Stack Technique
- **Frontend**: Angular 17 avec architecture standalone, Bootstrap 5
- **Backend**: NestJS 11 avec TypeScript
- **Base de données**: MySQL avec TypeORM
- **Authentification**: JWT (Access + Refresh tokens)
- **Documentation**: Swagger/OpenAPI

---

## 🎯 Backend - API NestJS

### Architecture Modulaire

Le backend suit l'architecture modulaire de NestJS avec 8 modules principaux :

#### 1. **AuthModule** - Authentification
- **Contrôleur**: `auth.controller.ts`
- **Service**: `auth.service.ts` 
- **Stratégies JWT**: `access-token.strategy.ts`, `refresh-token.strategy.ts`
- **DTOs**: `login.dto.ts`, `register.dto.ts`, `refresh.dto.ts`

**Fonctionnalités** :
```typescript
// Endpoints principaux
POST /auth/register    // Inscription (rate-limited: 5/min)
POST /auth/login       // Connexion (rate-limited: 10/min)  
POST /auth/refresh     // Renouvellement token
GET /auth/logout       // Déconnexion
```

**Sécurité** :
- Hashage bcrypt avec salt rounds configurables
- JWT avec expiration (Access: 15min, Refresh: 7j)
- Rate limiting sur les endpoints sensibles
- Validation stricte des entrées

#### 2. **UsersModule** - Gestion des utilisateurs
- **Entity**: `User` avec roles (USER/ADMIN)
- **Endpoints**:
```typescript
GET /me               // Profil utilisateur connecté
```

**Modèle User** :
```typescript
export class User {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  role: 'USER' | 'ADMIN';
  blockedAt?: Date;
  createdAt: Date;
  
  // Relations
  recipes: Recipe[];
  ratings: Rating[];
  comments: Comment[];
  favorites: Favorite[];
}
```

#### 3. **RecipesModule** - Cœur métier
- **Entity**: `Recipe` avec relations complexes
- **Endpoints**:
```typescript
GET /recipes              // Liste paginée avec filtres
GET /recipes/:id          // Détail d'une recette
POST /recipes             // Création (auth requise)
PUT /recipes/:id          // Modification (auteur ou admin)
DELETE /recipes/:id       // Suppression (admin uniquement)
```

**Modèle Recipe** :
```typescript
export class Recipe {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  coverUrl?: string;
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  difficulty: number;
  steps: string[];
  categoryId?: string;
  isPublished: boolean;
  
  // Relations
  author: User;
  category?: Category;
  ingredients: RecipeIngredient[];
  ratings: Rating[];
  comments: Comment[];
  favorites: Favorite[];
}
```

#### 4. **CommentsModule** - Système de commentaires
- **Endpoints**:
```typescript
GET /recipes/:id/comments     // Commentaires d'une recette
POST /recipes/:id/comments    // Ajouter commentaire (rate-limited)
DELETE /comments/:id          // Supprimer (auteur ou admin)
```

#### 5. **RatingsModule** - Système de notation
- **Endpoints**:
```typescript
POST /recipes/:id/rating      // Noter une recette (1-5)
```

#### 6. **FavoritesModule** - Gestion des favoris
- **Endpoints**:
```typescript
POST /recipes/:id/favorite    // Ajouter aux favoris
DELETE /recipes/:id/favorite  // Retirer des favoris
GET /me/favorites            // Liste des favoris utilisateur
```

#### 7. **CategoriesModule** - Catégorisation
- **Endpoints**:
```typescript
GET /categories              // Liste toutes les catégories
```

#### 8. **IngredientsModule** - Gestion des ingrédients
- Gestion des ingrédients avec quantités et unités
- Relation many-to-many avec Recipe via `RecipeIngredient`

### Sécurité et Guards

#### Guards Disponibles
```typescript
// Authentification JWT
@UseGuards(AccessTokenGuard)

// Vérification des rôles
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(['ADMIN'])

// Token de rafraîchissement
@UseGuards(RefreshTokenGuard)
```

#### Middlewares et Interceptors
- **Rate Limiting**: Protection contre le spam (Throttler)
- **CORS**: Configuration pour le frontend
- **Validation globale**: class-validator sur tous les endpoints
- **Documentation Swagger**: Auto-générée sur `/docs`

---

## 🎨 Frontend - Application Angular

### Architecture Standalone (Angular 17+)

Le frontend utilise la nouvelle architecture standalone d'Angular, éliminant le besoin de modules.

#### Structure des Composants

**1. Composants de Layout**
```typescript
// App principal
AppComponent (standalone)
├── NavbarComponent    // Navigation avec gestion auth
├── RouterOutlet      // Zone de contenu dynamique
└── FooterComponent   // Pied de page

// Navbar avec gestion d'état
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AsyncPipe],
})
export class NavbarComponent {
  user$ = this.authService.currentUser$; // Observable du user connecté
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
```

**2. Pages Principales**

```typescript
// Page d'accueil avec filtres et pagination
HomeComponent
├── RecipeFiltersComponent  // Filtres de recherche
├── RecipeCardComponent[]   // Grille de recettes
└── LoadingSpinnerComponent // État de chargement

// Détail d'une recette
RecipeDetailComponent  
├── CommentFormComponent    // Formulaire de commentaire
├── CommentListComponent    // Liste des commentaires
└── LoadingSpinnerComponent

// Éditeur de recettes
RecipeEditorComponent
├── Formulaires réactifs Angular
├── Gestion dynamique des ingrédients
└── Gestion dynamique des étapes
```

**3. Pages d'Authentification**
```typescript
// Connexion
LoginComponent (ReactiveFormsModule, validation)

// Inscription  
RegisterComponent (ReactiveFormsModule, validation)

// Mot de passe oublié
ForgotPasswordComponent (ReactiveFormsModule)
```

**4. Pages Administratives**
```typescript
// Panel admin
AdminComponent
├── Gestion des recettes
├── Gestion des commentaires
└── Actions d'administration
```

### Services Angular

#### 1. **AuthService** - Gestion de l'authentification
```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  
  login(payload: LoginPayload): Observable<User>
  register(payload: RegisterPayload): Observable<User>
  logout(): void
  isLoggedIn(): boolean
  hasRole(role: UserRole): boolean
  
  get token(): string | null // Récupère le token JWT
}
```

#### 2. **RecipeService** - API des recettes
```typescript
@Injectable({ providedIn: 'root' })
export class RecipeService {
  getRecipes(filters?: RecipeQueryParams): Observable<PaginatedResponse<Recipe>>
  getRecipeById(id: string): Observable<Recipe>
  createRecipe(payload: Partial<Recipe>): Observable<Recipe>
  updateRecipe(id: string, payload: Partial<Recipe>): Observable<Recipe>
  deleteRecipe(id: string): Observable<void>
  rateRecipe(id: string, rating: number): Observable<void>
  toggleFavorite(id: string): Observable<void>
}
```

#### 3. **CommentService** - Gestion des commentaires
```typescript
@Injectable({ providedIn: 'root' })
export class CommentService {
  getComments(recipeId: string): Observable<Comment[]>
  createComment(recipeId: string, content: string): Observable<Comment>
  deleteComment(id: string): Observable<void>
}
```

### Guards et Interceptors

#### AuthGuard - Protection des routes
```typescript
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Vérification de l'authentification
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { 
        queryParams: { redirectTo: route.url } 
      });
      return false;
    }
    
    // Vérification des rôles (admin, etc.)
    const allowedRoles = route.data['roles'] as UserRole[];
    if (allowedRoles && !allowedRoles.some(role => this.authService.hasRole(role))) {
      return false;
    }
    
    return true;
  }
}
```

#### AuthInterceptor - Injection automatique du JWT
```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.token;
    
    if (!token) return next.handle(req);
    
    const authRequest = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    
    return next.handle(authRequest);
  }
}
```

### Syntaxe de Contrôle de Flux Moderne

Le projet utilise la nouvelle syntaxe Angular 17+ :

#### Conditions (@if/@else)
```html
<!-- Ancienne syntaxe -->
<div *ngIf="user; else loginForm">Bienvenue {{ user.name }}</div>
<ng-template #loginForm>
  <app-login></app-login>
</ng-template>

<!-- Nouvelle syntaxe -->
@if (user) {
  <div>Bienvenue {{ user.name }}</div>
} @else {
  <app-login></app-login>
}
```

#### Boucles (@for)
```html
<!-- Ancienne syntaxe -->
<div *ngFor="let recipe of recipes; trackBy: trackRecipe">
  {{ recipe.title }}
</div>

<!-- Nouvelle syntaxe -->
@for (recipe of recipes; track recipe.id) {
  <div>{{ recipe.title }}</div>
}
```

---

## 🗄️ Base de Données MySQL

### Schéma de Base de Données

#### Tables Principales

**1. users**
```sql
CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  role ENUM('USER','ADMIN') DEFAULT 'USER',
  blocked_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**2. recipes**
```sql
CREATE TABLE recipes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  author_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(160) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  cover_url VARCHAR(255) NULL,
  servings INT UNSIGNED DEFAULT 1,
  prep_minutes INT UNSIGNED DEFAULT 0,
  cook_minutes INT UNSIGNED DEFAULT 0,
  difficulty TINYINT UNSIGNED DEFAULT 1,
  steps_json JSON NOT NULL,
  category_id BIGINT UNSIGNED NULL,
  is_published TINYINT DEFAULT 1,
  hidden_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);
```

**3. recipe_ingredients** (Table de liaison)
```sql
CREATE TABLE recipe_ingredients (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  recipe_id BIGINT UNSIGNED NOT NULL,
  ingredient_id BIGINT UNSIGNED NOT NULL,
  quantity DECIMAL(8,2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
);
```

**4. comments**
```sql
CREATE TABLE comments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  recipe_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**5. ratings**
```sql
CREATE TABLE ratings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  recipe_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  rating TINYINT UNSIGNED NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_user_recipe (user_id, recipe_id),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**6. favorites**
```sql
CREATE TABLE favorites (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  recipe_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_user_recipe (user_id, recipe_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);
```

### Relations et Contraintes

#### Modèle Relationnel
```
users (1) ←→ (N) recipes
recipes (N) ←→ (N) ingredients [via recipe_ingredients]
users (1) ←→ (N) comments
recipes (1) ←→ (N) comments  
users (1) ←→ (N) ratings
recipes (1) ←→ (N) ratings
users (1) ←→ (N) favorites
recipes (1) ←→ (N) favorites
categories (1) ←→ (N) recipes
```

---

## 🔐 Système d'Authentification et Autorisation

### Flow d'Authentification JWT

#### 1. **Inscription/Connexion**
```typescript
// Frontend - AuthService
login(payload: LoginPayload): Observable<User> {
  return this.http.post<AuthResponse>(`${baseUrl}/auth/login`, payload)
    .pipe(
      tap(response => this.persistSession(response)),
      map(response => response.user)
    );
}

private persistSession(response: AuthResponse): void {
  localStorage.setItem('sc_token', response.accessToken);
  localStorage.setItem('sc_user', JSON.stringify(response.user));
  this.currentUserSubject.next(response.user);
}
```

#### 2. **Backend - Validation et Token**
```typescript
// Backend - AuthService  
async login(dto: LoginDto) {
  const user = await this.usersService.findByEmail(dto.email);
  
  if (!user || !await bcrypt.compare(dto.password, user.passwordHash)) {
    throw new UnauthorizedException('Invalid credentials');
  }
  
  return this.buildAuthResponse(user);
}

private buildAuthResponse(user: User) {
  const payload: TokenPayload = { sub: user.id, role: user.role };
  
  return {
    accessToken: this.jwtService.sign(payload, { expiresIn: '15m' }),
    refreshToken: this.jwtService.sign(payload, { 
      secret: this.configService.get('auth.refreshSecret'),
      expiresIn: '7d' 
    }),
    user: {
      id: user.id,
      email: user.email,
      name: user.displayName,
      role: user.role
    }
  };
}
```

#### 3. **Gestion des Autorisations**

**Guards par Rôles** :
```typescript
// Backend - Décorateur de rôles
@Roles(['ADMIN'])
@UseGuards(AccessTokenGuard, RolesGuard)
@Delete('recipes/:id')
deleteRecipe(@Param('id') id: string) {
  return this.recipesService.delete(id);
}
```

**Guards Customisés** :
```typescript
// Guard "auteur ou admin"
@UseGuards(AccessTokenGuard, AuthorOrAdminGuard)
@Put('recipes/:id')
updateRecipe(@Param('id') id: string, @Body() dto: UpdateRecipeDto, @CurrentUser() user: any) {
  return this.recipesService.update(id, dto, user);
}
```

---

## 🌐 API Endpoints et Utilisation

### Endpoints Publics
```typescript
GET /recipes              // Liste des recettes avec pagination
GET /recipes/:id          // Détail d'une recette
GET /recipes/:id/comments // Commentaires d'une recette
GET /categories           // Liste des catégories
```

### Endpoints Authentifiés
```typescript
// Authentification
POST /auth/login          // Connexion
POST /auth/register       // Inscription  
POST /auth/refresh        // Renouvellement token

// Profil
GET /me                   // Profil utilisateur

// Recettes
POST /recipes             // Création de recette
PUT /recipes/:id          // Modification (auteur seulement)
DELETE /recipes/:id       // Suppression (admin seulement)

// Interactions
POST /recipes/:id/rating     // Noter une recette
POST /recipes/:id/favorite   // Ajouter aux favoris
DELETE /recipes/:id/favorite // Retirer des favoris
POST /recipes/:id/comments   // Commenter une recette
```

### Exemples de Requêtes

#### Recherche Avancée de Recettes
```typescript
// Frontend
const params: RecipeQueryParams = {
  q: 'pâtes',           // Recherche textuelle
  category: 'italian',   // Filtre par catégorie  
  difficulty: 'easy',    // Filtre par difficulté
  maxTime: 30,          // Temps maximum en minutes
  page: 1,              // Pagination
  limit: 12             // Nombre par page
};

this.recipeService.getRecipes(params).subscribe(response => {
  this.recipes = response.data;
  this.totalPages = response.meta.lastPage;
});
```

#### Création de Recette Complète
```typescript
// Frontend - RecipeEditorComponent
const recipeData = {
  title: 'Pâtes Carbonara',
  category: 'italian',
  durationMinutes: 20,
  difficulty: 'medium',
  description: 'Recette traditionnelle italienne...',
  ingredients: [
    { name: 'Pâtes', quantity: 400, unit: 'g' },
    { name: 'Lardons', quantity: 200, unit: 'g' },
    { name: 'Œufs', quantity: 3, unit: 'unités' }
  ],
  steps: [
    'Faire cuire les pâtes dans l\'eau salée',
    'Faire revenir les lardons',
    'Mélanger avec les œufs battus'
  ]
};

this.recipeService.createRecipe(recipeData).subscribe(recipe => {
  this.router.navigate(['/recipe', recipe.id]);
});
```

---

## 🎯 Fonctionnalités Métier

### 1. **Gestion des Recettes**

**Créateur de Recettes Avancé** :
- Gestion dynamique des ingrédients avec quantités/unités
- Étapes de préparation ordonnées
- Upload d'images (cover_url)
- Catégorisation automatique
- Génération de slug automatique
- Temps de préparation et cuisson séparés

**Recherche et Filtrage** :
```typescript
// Filtres disponibles
interface RecipeFilters {
  search: string;        // Recherche dans titre/description
  category: string;      // Filtre par catégorie
  difficulty: string;    // Facile/Moyen/Difficile  
  maxTime: number;       // Temps maximum total
  author: string;        // Recettes d'un auteur
}
```

### 2. **Système Social**

**Commentaires** :
- Commentaires imbriqués par recette
- Modération (suppression par auteur ou admin)
- Rate limiting anti-spam
- Affichage chronologique

**Notation** :
- Notes de 1 à 5 étoiles
- Une note par utilisateur par recette
- Calcul de moyenne automatique
- Historique des notes

**Favoris** :
- Ajout/suppression toggle
- Liste personnelle des favoris
- Synchronisation temps réel

### 3. **Panel Administrateur**

**Gestion du Contenu** :
```typescript
// AdminComponent - Fonctionnalités
- Modération des recettes
- Suppression de commentaires inappropriés  
- Gestion des utilisateurs (blocage)
- Statistiques d'utilisation
- Logs d'activité
```

### 4. **Expérience Utilisateur**

**États de Chargement** :
```html
<!-- LoadingSpinnerComponent réutilisable -->
@if (loading) {
  <app-loading-spinner [label]="'Chargement des recettes...'"></app-loading-spinner>
} @else {
  <!-- Contenu -->
}
```

**Gestion d'Erreurs** :
```typescript
// Services avec gestion d'erreur homogène
getRecipes().pipe(
  catchError(error => {
    this.notificationService.showError('Erreur lors du chargement');
    return of([]);
  })
);
```

**Navigation Intelligente** :
- Breadcrumbs automatiques
- Redirection post-connexion
- Guards de protection des routes
- Navigation conditionnelle selon les rôles

---

## 🚀 Déploiement et Configuration

### Variables d'Environnement

**Backend (.env)** :
```env
# Base de données
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=motdepasse
DB_NAME=shopcook

# JWT
JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=15m
REFRESH_SECRET=refreshsecretkey  
REFRESH_EXPIRES_IN=7d

# Sécurité
BCRYPT_SALT_ROUNDS=12
CORS_ORIGIN=http://localhost:4200
```

**Frontend (environment.ts)** :
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

### Scripts Disponibles

**Backend** :
```bash
npm run start:dev    # Mode développement avec hot-reload
npm run build        # Build de production
npm run start:prod   # Lancement en production
npm run test         # Tests unitaires
npm run seed         # Population de la base de données
```

**Frontend** :
```bash
npm start           # Serveur de développement (port 4200)
npm run build       # Build de production
npm run build:prod  # Build optimisé pour production
npm test           # Tests unitaires avec Karma
```

---

## 🔧 Points Techniques Avancés

### Performance et Optimisation

**Backend** :
- **Pagination automatique** : Toutes les listes sont paginées
- **Eager/Lazy loading** : Relations TypeORM optimisées
- **Caching** : Cache Redis pour les requêtes fréquentes
- **Rate limiting** : Protection contre les attaques DDoS
- **Validation** : class-validator pour toutes les entrées

**Frontend** :
- **OnPush Strategy** : Optimisation du change detection
- **TrackBy functions** : Performance des *ngFor optimisées  
- **Lazy loading** : Modules chargés à la demande
- **HTTP Interceptors** : Gestion centralisée des requêtes
- **Service Workers** : Cache offline des resources

### Sécurité Implémentée

**Backend** :
```typescript
// Rate limiting configuré
@Throttle(5, 60)  // 5 requêtes par minute max
@Post('comments')

// Validation stricte
@IsEmail()
@IsNotEmpty()
email: string;

// Hashage sécurisé  
const hash = await bcrypt.hash(password, 12);

// CORS configuré
app.enableCors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
});
```

**Frontend** :
```typescript
// Guards de protection
{ 
  path: 'admin', 
  component: AdminComponent,
  canActivate: [AuthGuard],
  data: { roles: ['ADMIN'] }
}

// Sanitization automatique
@Component({
  template: '{{ userInput | html }}'  // Échappe le HTML
})
```

---

## 📋 Résumé des Technologies

### Backend (NestJS)
- **Framework**: NestJS 11
- **Language**: TypeScript
- **ORM**: TypeORM
- **Base de données**: MySQL
- **Authentification**: JWT + Passport
- **Validation**: class-validator
- **Documentation**: Swagger
- **Tests**: Jest

### Frontend (Angular)
- **Framework**: Angular 17
- **Language**: TypeScript
- **UI**: Bootstrap 5
- **Architecture**: Standalone Components
- **State Management**: Services + RxJS
- **Formulaires**: Reactive Forms
- **Tests**: Jasmine + Karma

### DevOps
- **Développement**: Docker (optionnel)
- **CI/CD**: GitHub Actions
- **Déploiement**: Vercel (frontend) + Render (backend)
- **Monitoring**: Logs centralisés
- **Sécurité**: HTTPS, CORS, Rate Limiting

---

Ce guide te donne une compréhension complète du projet Shop & Cook. Tu peux maintenant répondre à toutes les questions sur l'architecture, les fonctionnalités, la sécurité, et l'implémentation technique.