# Documentation Technique Frontend Angular - Shop & Cook

## 1. ARCHITECTURE GLOBALE

### 1.1 Framework et Version
- **Framework** : Angular 17
- **Architecture** : Standalone Components (nouvelle approche Angular 17+)
- **Language** : TypeScript
- **Styling** : SCSS + Bootstrap 5

### 1.2 Avantages des Standalone Components
```typescript
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html'
})
```

**Pourquoi standalone ?**
- Plus simple que les modules Angular classiques
- Import direct des dépendances dans chaque composant
- Meilleure encapsulation
- Tree-shaking plus efficace
- Moins de code boilerplate

### 1.3 Structure du Projet
```
src/app/
├── components/          # Composants réutilisables
│   ├── navbar/         # Navigation principale
│   ├── footer/         # Pied de page
│   ├── recipe-card/    # Carte de recette
│   ├── recipe-filters/ # Filtres de recherche
│   ├── loading-spinner/# Indicateur de chargement
│   └── comment-*       # Gestion des commentaires
├── pages/              # Pages/Vues principales
│   ├── home/          # Page d'accueil
│   ├── recipe-detail/ # Détail d'une recette
│   ├── recipe-editor/ # Création/édition de recette
│   ├── auth/          # Pages d'authentification
│   └── profile/       # Profil utilisateur
├── services/          # Services métier
│   ├── auth.service.ts    # Gestion authentification
│   ├── recipe.service.ts  # API recettes
│   └── comment.service.ts # API commentaires
├── guards/            # Guards de route
├── interceptors/      # Intercepteurs HTTP
└── models/           # Interfaces TypeScript
```

## 2. SYNTAX MODERNE ANGULAR 17

### 2.1 Control Flow Syntax (Nouvelle Syntaxe)

**ANCIEN (Angular <17) :**
```html
<div *ngIf="recipes.length > 0; else noRecipes">
  <div *ngFor="let recipe of recipes; trackBy: trackRecipe">
    <!-- contenu -->
  </div>
</div>
<ng-template #noRecipes>
  <p>Aucune recette trouvée</p>
</ng-template>
```

**NOUVEAU (Angular 17+) :**
```html
@if (recipes && recipes.length > 0) {
  @for (recipe of recipes; track recipe.id) {
    <app-recipe-card [recipe]="recipe"></app-recipe-card>
  }
} @else {
  <p>Aucune recette trouvée</p>
}
```

**Avantages de la nouvelle syntaxe :**
- Plus lisible et intuitive
- Moins de templates auxiliaires nécessaires
- Meilleure performance (pas de ng-template)
- Syntaxe plus proche d'autres frameworks
- TypeScript peut mieux analyser le code

### 2.2 Directive @for avec track
```html
@for (recipe of recipes; track recipe.id) {
  <!-- Angular utilise recipe.id pour optimiser le rendu -->
}
```
**Pourquoi track est important :**
- Évite les re-rendus inutiles quand la liste change
- Améliore les performances avec de grandes listes
- Maintient l'état des composants enfants

### 2.3 Directive @if avec conditions complexes
```html
@if (loading) {
  <app-loading-spinner></app-loading-spinner>
} @else if (error) {
  <div class="alert alert-danger">{{ error }}</div>
} @else if (recipes && !recipes.length) {
  <p class="text-center">Aucune recette trouvée.</p>
} @else {
  <!-- Liste des recettes -->
}
```

## 3. COMPOSANTS DÉTAILLÉS

### 3.1 HomeComponent (Page d'accueil)

```typescript
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RecipeFiltersComponent,
    RecipeCardComponent, 
    LoadingSpinnerComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  recipes: Recipe[] = [];
  totalItems = 0;
  page = 1;
  limit = 9;
  loading = false;
  error: string | null = null;
  filters: RecipeQueryParams = {};

  constructor(
    private recipeService: RecipeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRecipes();
  }

  onFiltersChange(newFilters: RecipeQueryParams): void {
    this.filters = newFilters;
    this.page = 1;
    this.loadRecipes();
  }

  private loadRecipes(): void {
    this.loading = true;
    this.error = null;

    const params: RecipeQueryParams = {
      ...this.filters,
      page: this.page,
      limit: this.limit
    };

    this.recipeService.getRecipes(params).subscribe({
      next: (response: any) => {
        this.recipes = response.items || [];
        this.totalItems = response.total || 0;
      },
      error: () => {
        this.error = 'Impossible de charger les recettes.';
        this.recipes = [];
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
```

**Points techniques importants :**

1. **Injection de dépendances** : Les services sont injectés via le constructeur
2. **Cycle de vie** : `ngOnInit()` appelé après l'initialisation du composant
3. **Observables et RxJS** : Utilisation de `.subscribe()` avec next/error/complete
4. **Spread operator** : `...this.filters` pour fusionner les filtres
5. **Type safety** : Variables typées avec TypeScript

### 3.2 RecipeCardComponent (Composant réutilisable)

```typescript
@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [],
  template: `
    <div class="card recipe-card">
      <img [src]="recipe.coverUrl || 'assets/placeholder.jpg'" 
           [alt]="recipe.title" 
           class="card-img-top">
      <div class="card-body">
        <h5 class="card-title">{{ recipe.title }}</h5>
        <p class="card-text">{{ recipe.description }}</p>
        <div class="recipe-meta">
          <span class="badge bg-primary">{{ recipe.difficulty }}/5</span>
          <span class="time">{{ recipe.prepTime + recipe.cookTime }} min</span>
        </div>
        <button (click)="onView()" class="btn btn-primary">Voir</button>
        <button (click)="onFavorite()" 
                [class]="{'btn-danger': isFavorite, 'btn-outline-danger': !isFavorite}"
                class="btn">♥</button>
      </div>
    </div>
  `
})
export class RecipeCardComponent {
  @Input() recipe!: Recipe;
  @Input() isFavorite = false;
  
  @Output() view = new EventEmitter<string>();
  @Output() favorite = new EventEmitter<string>();

  onView(): void {
    this.view.emit(this.recipe.id);
  }

  onFavorite(): void {
    this.favorite.emit(this.recipe.id);
  }
}
```

**Concepts clés :**

1. **@Input()** : Propriétés reçues du composant parent
2. **@Output()** : Événements émis vers le composant parent
3. **EventEmitter** : Mécanisme de communication parent-enfant
4. **Property Binding** : `[src]="recipe.coverUrl"`
5. **Event Binding** : `(click)="onView()"`
6. **Interpolation** : `{{ recipe.title }}`
7. **Class Binding** : `[class]="{'btn-danger': isFavorite}"`

### 3.3 RecipeFiltersComponent

```typescript
@Component({
  selector: 'app-recipe-filters',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="filterForm" (ngSubmit)="onSubmit()">
      <div class="row">
        <div class="col-md-4">
          <input type="text" 
                 formControlName="search" 
                 placeholder="Rechercher..."
                 class="form-control">
        </div>
        <div class="col-md-3">
          <select formControlName="category" class="form-select">
            <option value="">Toutes catégories</option>
            @for (cat of categories; track cat.id) {
              <option [value]="cat.name">{{ cat.name }}</option>
            }
          </select>
        </div>
        <div class="col-md-3">
          <select formControlName="difficulty" class="form-select">
            <option value="">Toute difficulté</option>
            <option value="easy">Facile</option>
            <option value="medium">Moyen</option>
            <option value="hard">Difficile</option>
          </select>
        </div>
        <div class="col-md-2">
          <button type="submit" class="btn btn-primary w-100">Filtrer</button>
        </div>
      </div>
    </form>
  `
})
export class RecipeFiltersComponent implements OnInit {
  @Output() filterChange = new EventEmitter<RecipeQueryParams>();

  filterForm = this.fb.group({
    search: [''],
    category: [''],
    difficulty: ['']
  });

  categories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    
    // Écoute les changements de formulaire
    this.filterForm.valueChanges
      .pipe(debounceTime(300)) // Attendre 300ms avant d'émettre
      .subscribe(values => {
        this.filterChange.emit(this.buildQueryParams(values));
      });
  }

  private buildQueryParams(formValues: any): RecipeQueryParams {
    const params: RecipeQueryParams = {};
    
    if (formValues.search) params.q = formValues.search;
    if (formValues.category) params.category = formValues.category;
    if (formValues.difficulty) params.difficulty = formValues.difficulty;
    
    return params;
  }
}
```

**Concepts avancés :**

1. **Reactive Forms** : `FormBuilder`, `FormGroup`
2. **RxJS Operators** : `debounceTime()` pour éviter trop d'appels API
3. **Pipe operator** : Chainâge des opérateurs RxJS
4. **Form Validation** : Possible avec `Validators`
5. **Two-way binding** vs **Reactive Forms**

## 4. SERVICES ET INJECTION DE DÉPENDANCES

### 4.1 RecipeService

```typescript
@Injectable({
  providedIn: 'root' // Service singleton
})
export class RecipeService {
  private readonly apiUrl = 'http://localhost:3000/api/v1/recipes';

  constructor(private http: HttpClient) {}

  getRecipes(params?: RecipeQueryParams): Observable<PaginatedResponse<Recipe>> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof RecipeQueryParams];
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.append(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<Recipe>>(this.apiUrl, { 
      params: httpParams 
    });
  }

  getRecipeById(id: string): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.apiUrl}/${id}`);
  }

  createRecipe(recipe: CreateRecipeDto): Observable<Recipe> {
    return this.http.post<Recipe>(this.apiUrl, recipe);
  }

  updateRecipe(id: string, recipe: UpdateRecipeDto): Observable<Recipe> {
    return this.http.put<Recipe>(`${this.apiUrl}/${id}`, recipe);
  }
}
```

**Patterns utilisés :**

1. **Singleton Pattern** : `providedIn: 'root'`
2. **Observable Pattern** : Toutes les méthodes retournent des Observables
3. **HttpParams Builder** : Construction dynamique des paramètres URL
4. **Generic Types** : `Observable<Recipe>`, `PaginatedResponse<Recipe>`
5. **REST API Pattern** : GET, POST, PUT mapping

### 4.2 AuthService avec JWT

```typescript
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Vérifier si un token existe au démarrage
    const token = localStorage.getItem('access_token');
    if (token && !this.isTokenExpired(token)) {
      this.loadCurrentUser();
    }
  }

  login(credentials: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/v1/auth/login', credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('refresh_token', response.refresh_token);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    return token ? !this.isTokenExpired(token) : false;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp < Date.now() / 1000;
    } catch {
      return true;
    }
  }
}
```

**Concepts avancés :**

1. **BehaviorSubject** : État partagé entre composants
2. **RxJS tap()** : Effet de bord sans modifier le stream
3. **JWT Decoding** : `atob()` pour décoder le payload
4. **LocalStorage** : Persistance côté client
5. **Observable Stream** : `currentUser$` pour réactivité

## 5. ROUTING ET GUARDS

### 5.1 Configuration des Routes

```typescript
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'recipe/:id', component: RecipeDetailComponent },
  {
    path: 'recipes/new',
    component: RecipeEditorComponent,
    canActivate: [AuthGuard] // Protection par authentification
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: '' } // Route par défaut (404)
];
```

### 5.2 AuthGuard

```typescript
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    } else {
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: state.url } 
      });
      return false;
    }
  }
}
```

**Concepts de routing :**

1. **Route Parameters** : `:id` dans les URLs
2. **Query Parameters** : `?returnUrl=/profile`
3. **Route Guards** : Protection des routes
4. **Lazy Loading** : Chargement différé des modules
5. **Redirections** : Gestion des routes invalides

## 6. INTERCEPTEURS HTTP

### 6.1 Auth Interceptor

```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    
    const token = localStorage.getItem('access_token');
    
    if (token) {
      // Cloner la requête et ajouter l'en-tête Authorization
      const authRequest = request.clone({
        headers: request.headers.set('Authorization', `Bearer ${token}`)
      });
      
      return next.handle(authRequest).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            // Token expiré, déconnecter l'utilisateur
            this.authService.logout();
          }
          return throwError(() => error);
        })
      );
    }
    
    return next.handle(request);
  }
}
```

**Fonctionnalités :**

1. **Request Cloning** : Les requêtes HTTP sont immutables
2. **Header Manipulation** : Ajout automatique du token JWT
3. **Error Handling** : Gestion centralisée des erreurs 401
4. **RxJS catchError** : Interception des erreurs

## 7. MODELS ET INTERFACES TYPESCRIPT

### 7.1 Models de données

```typescript
export interface Recipe {
  id: string;
  title: string;
  slug: string;
  description?: string;
  coverUrl?: string;
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  difficulty: number;
  steps: string[];
  category?: Category;
  author: User;
  ingredients: RecipeIngredient[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface RecipeQueryParams {
  q?: string;           // Recherche textuelle
  category?: string;    // Filtre par catégorie
  difficulty?: string;  // Filtre par difficulté
  maxTime?: number;     // Temps maximum
  page?: number;        // Pagination
  limit?: number;       // Nombre d'éléments par page
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
```

**Avantages du typage :**

1. **Type Safety** : Erreurs détectées à la compilation
2. **IntelliSense** : Autocomplétion dans l'IDE
3. **Documentation** : Les interfaces servent de documentation
4. **Refactoring** : Renommage sécurisé des propriétés

### 7.2 DTOs (Data Transfer Objects)

```typescript
export interface CreateRecipeDto {
  title: string;
  description?: string;
  coverUrl?: string;
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  difficulty: number;
  steps: string[];
  categoryId?: number;
  ingredients: CreateRecipeIngredientDto[];
}

export interface UpdateRecipeDto extends Partial<CreateRecipeDto> {
  // Toutes les propriétés de CreateRecipeDto deviennent optionnelles
}
```

## 8. GESTION D'ÉTAT ET RÉACTIVITÉ

### 8.1 Pattern avec BehaviorSubject

```typescript
@Injectable({
  providedIn: 'root'
})
export class RecipeStateService {
  private recipesSubject = new BehaviorSubject<Recipe[]>([]);
  public recipes$ = this.recipesSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private recipeService: RecipeService) {}

  loadRecipes(params?: RecipeQueryParams): void {
    this.loadingSubject.next(true);
    
    this.recipeService.getRecipes(params).subscribe({
      next: (response) => {
        this.recipesSubject.next(response.items);
        this.loadingSubject.next(false);
      },
      error: () => {
        this.loadingSubject.next(false);
      }
    });
  }

  addRecipe(recipe: Recipe): void {
    const current = this.recipesSubject.value;
    this.recipesSubject.next([recipe, ...current]);
  }
}
```

### 8.2 Utilisation dans les composants

```typescript
export class HomeComponent implements OnInit, OnDestroy {
  recipes$ = this.recipeState.recipes$;
  loading$ = this.recipeState.loading$;
  
  private destroy$ = new Subject<void>();

  constructor(private recipeState: RecipeStateService) {}

  ngOnInit(): void {
    this.recipeState.loadRecipes();
    
    // Exemple d'Observable composition
    combineLatest([
      this.recipes$,
      this.loading$
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(([recipes, loading]) => {
      // Logique basée sur les deux états
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

**Patterns RxJS avancés :**

1. **combineLatest** : Combinaison de plusieurs Observables
2. **takeUntil** : Désabonnement automatique
3. **Subject pour cleanup** : Éviter les memory leaks

## 9. OPTIMISATIONS DE PERFORMANCE

### 9.1 OnPush Change Detection

```typescript
@Component({
  selector: 'app-recipe-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`
})
export class RecipeCardComponent {
  @Input() recipe!: Recipe;
  
  constructor(private cdr: ChangeDetectorRef) {}

  // Forcer la détection si nécessaire
  forceUpdate(): void {
    this.cdr.markForCheck();
  }
}
```

### 9.2 TrackBy Functions

```typescript
export class HomeComponent {
  trackRecipe(index: number, recipe: Recipe): string {
    return recipe.id; // Angular utilise l'ID pour optimiser le rendu
  }
}
```

```html
@for (recipe of recipes; track trackRecipe($index, recipe)) {
  <app-recipe-card [recipe]="recipe"></app-recipe-card>
}
```

### 9.3 Lazy Loading et Code Splitting

```typescript
const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  }
];
```

## 10. TESTING (Concepts à connaître)

### 10.1 Unit Testing avec Jasmine/Karma

```typescript
describe('RecipeService', () => {
  let service: RecipeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RecipeService]
    });
    service = TestBed.inject(RecipeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should fetch recipes', () => {
    const mockRecipes = [/* mock data */];
    
    service.getRecipes().subscribe(recipes => {
      expect(recipes.items).toEqual(mockRecipes);
    });

    const req = httpMock.expectOne('/api/v1/recipes');
    expect(req.request.method).toBe('GET');
    req.flush({ items: mockRecipes });
  });
});
```

### 10.2 Component Testing

```typescript
describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let recipeService: jasmine.SpyObj<RecipeService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('RecipeService', ['getRecipes']);

    TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: RecipeService, useValue: spy }
      ]
    });

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    recipeService = TestBed.inject(RecipeService) as jasmine.SpyObj<RecipeService>;
  });

  it('should load recipes on init', () => {
    recipeService.getRecipes.and.returnValue(of({ items: [] }));
    
    component.ngOnInit();
    
    expect(recipeService.getRecipes).toHaveBeenCalled();
  });
});
```

## 11. QUESTIONS D'EXAMEN POSSIBLES

### Questions sur Angular 17 :
1. **"Quelle est la différence entre *ngIf et @if ?"**
   - Nouvelle syntaxe de control flow plus performante
   - Pas besoin de ng-template
   - Meilleure lisibilité

2. **"Pourquoi utiliser standalone components ?"**
   - Simplicité (pas de modules)
   - Meilleur tree-shaking
   - Imports directs

3. **"Comment fonctionne la détection de changements ?"**
   - Zone.js par défaut
   - OnPush pour optimiser
   - ChangeDetectorRef pour contrôler

### Questions sur RxJS :
4. **"Différence entre Subject et BehaviorSubject ?"**
   - BehaviorSubject a une valeur initiale
   - Émet la dernière valeur aux nouveaux abonnés

5. **"Comment éviter les memory leaks ?"**
   - takeUntil() avec destroy$
   - unsubscribe() dans ngOnDestroy
   - async pipe dans les templates

### Questions sur TypeScript :
6. **"Avantages du typage statique ?"**
   - Détection d'erreurs à la compilation
   - IntelliSense et autocomplétion
   - Refactoring sécurisé

7. **"Différence entre interface et class ?"**
   - Interface : contrat, compile-time only
   - Class : blueprint, runtime existence

Cette documentation couvre tous les aspects techniques majeurs de votre frontend Angular. Chaque concept est expliqué avec du code concret tiré de votre projet.