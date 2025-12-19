import { Recipe } from '../models/recipe.model';
import { Comment } from '../models/comment.model';
import { Category } from '../models/category.model';
import { User } from '../models/user.model';
import { Ingredient } from '../models/ingredient.model';

export interface MockUser extends User {
  password: string;
}

const ingredients = (...items: Array<[string, number, string]>): Ingredient[] =>
  items.map(([name, quantity, unit]) => ({ name, quantity, unit }));

export const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Entrée', slug: 'entree' },
  { id: '2', name: 'Plat', slug: 'plat' },
  { id: '3', name: 'Dessert', slug: 'dessert' },
];

export const MOCK_USERS: MockUser[] = [
  {
    id: '1',
    email: 'demo@shopcook.dev',
    displayName: 'Demo User',
    role: 'USER',
    password: 'Demo123!'
  },
  {
    id: '2',
    email: 'admin@shopcook.dev',
    displayName: 'Admin',
    role: 'ADMIN',
    password: 'Admin123!'
  }
];

export const MOCK_RECIPES: Recipe[] = [
  {
    id: 'r1',
    title: 'Tacos végé croustillants',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    category: 'Plat',
    durationMinutes: 25,
    difficulty: 2,
    rating: 4.5,
    description: 'Tortillas garnies de légumes rôtis, salsa mangue et sauce yaourt citronnée.',
    authorId: '1',
    authorName: 'Demo User',
    isFavorite: true,
    isPublished: true,
    servings: 2,
    prepMinutes: 10,
    cookMinutes: 15,
    categoryId: '2',
    coverUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    ingredients: ingredients(
      ['Tortillas de maïs', 4, 'pcs'],
      ['Pois chiches', 200, 'g'],
      ['Chou rouge', 100, 'g']
    ),
    steps: [
      'Rôtir les pois chiches au paprika.',
      'Préparer la salsa mangue + citron vert.',
      'Assembler les tacos et servir aussitôt.'
    ],
  },
  {
    id: 'r2',
    title: 'Bowl thaï peanut',
    imageUrl: 'https://images.unsplash.com/photo-1464306076886-da185f6a9d12?auto=format&fit=crop&w=800&q=80',
    category: 'Plat',
    durationMinutes: 35,
    difficulty: 3,
    rating: 4.8,
    description: 'Riz jasmin, légumes croquants, poulet mariné et sauce cacahuète.',
    authorId: '1',
    authorName: 'Demo User',
    isFavorite: false,
    isPublished: true,
    servings: 2,
    prepMinutes: 15,
    cookMinutes: 20,
    categoryId: '2',
    coverUrl: 'https://images.unsplash.com/photo-1464306076886-da185f6a9d12?auto=format&fit=crop&w=800&q=80',
    ingredients: ingredients(
      ['Riz jasmin', 150, 'g'],
      ['Carottes', 2, 'pcs'],
      ['Poulet', 250, 'g'],
      ['Beurre de cacahuète', 2, 'cs']
    ),
    steps: [
      'Cuire le riz puis laisser tiédir.',
      'Saisir le poulet mariné citronnelle.',
      'Assembler le bowl et napper de sauce.'
    ],
  },
  {
    id: 'r3',
    title: 'Cheesecake citron yuzu',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    category: 'Dessert',
    durationMinutes: 90,
    difficulty: 4,
    rating: 4.9,
    description: 'Base biscuit speculoos, appareil soyeux citron-yuzu et topping meringué.',
    authorId: '2',
    authorName: 'Admin',
    isFavorite: false,
    isPublished: true,
    servings: 6,
    prepMinutes: 40,
    cookMinutes: 50,
    categoryId: '3',
    coverUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    ingredients: ingredients(
      ['Spéculoos', 200, 'g'],
      ['Beurre', 80, 'g'],
      ['Fromage frais', 500, 'g']
    ),
    steps: [
      'Préparer la base biscuitée et tasser.',
      'Monter l’appareil citron yuzu.',
      'Cuire doucement puis refroidir nuit entière.'
    ],
  },
];

export const MOCK_COMMENTS: Comment[] = [
  {
    id: 'c1',
    recipeId: 'r1',
    authorId: '2',
    authorName: 'Admin',
    message: 'Hyper frais, je recommande !',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'c2',
    recipeId: 'r2',
    authorId: '1',
    authorName: 'Demo User',
    message: 'Sauce peanut incroyable 😍',
    createdAt: new Date().toISOString(),
  }
];

export const MOCK_FAVORITES: { userId: string; recipeId: string }[] = [
  { userId: '1', recipeId: 'r1' }
];

export const MOCK_RATINGS: { userId: string; recipeId: string; stars: number }[] = [
  { userId: '1', recipeId: 'r1', stars: 4 },
  { userId: '2', recipeId: 'r1', stars: 5 },
  { userId: '1', recipeId: 'r2', stars: 5 }
];
