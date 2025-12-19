import 'reflect-metadata';

import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';

import { Category } from '../src/categories/entities/category.entity';
import { Favorite } from '../src/favorites/entities/favorite.entity';
import { Ingredient } from '../src/ingredients/entities/ingredient.entity';
import { Comment } from '../src/comments/entities/comment.entity';
import { Rating } from '../src/ratings/entities/rating.entity';
import { RecipeIngredient } from '../src/recipes/entities/recipe-ingredient.entity';
import { Recipe } from '../src/recipes/entities/recipe.entity';
import { User } from '../src/users/entities/user.entity';

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASS ?? '',
  database: process.env.DB_NAME ?? 'shopcook',
  entities: [User, Category, Ingredient, Recipe, RecipeIngredient, Rating, Comment, Favorite],
  synchronize: false
});

async function seed() {
  await dataSource.initialize();

  const userRepo = dataSource.getRepository(User);
  const categoryRepo = dataSource.getRepository(Category);
  const ingredientRepo = dataSource.getRepository(Ingredient);
  const recipeRepo = dataSource.getRepository(Recipe);
  const recipeIngredientRepo = dataSource.getRepository(RecipeIngredient);

  const admin = userRepo.create({
    email: 'admin@shopcook.dev',
    passwordHash: await bcrypt.hash('Admin123!', 11),
    displayName: 'Admin',
    role: 'ADMIN'
  });
  await userRepo.save(admin);

  const demoUser = userRepo.create({
    email: 'demo@shopcook.dev',
    passwordHash: await bcrypt.hash('Demo123!', 11),
    displayName: 'Demo User'
  });
  await userRepo.save(demoUser);

  const categories = await categoryRepo.save(
    categoryRepo.create([
      { name: 'Entrée', slug: 'entree' },
      { name: 'Plat', slug: 'plat' },
      { name: 'Dessert', slug: 'dessert' }
    ])
  );

  const pasta = ingredientRepo.create({ name: 'Pâtes', unitDefault: 'g' });
  const tomato = ingredientRepo.create({ name: 'Tomate', unitDefault: 'pièce' });
  await ingredientRepo.save([pasta, tomato]);

  const recipe = recipeRepo.create({
    title: 'Pâtes à la tomate',
    slug: 'pates-a-la-tomate',
    authorId: demoUser.id,
    servings: 2,
    prepMinutes: 10,
    cookMinutes: 15,
    difficulty: 1,
    steps: ['Cuire les pâtes', 'Préparer la sauce', 'Mélanger'],
    categoryId: categories[1].id,
    isPublished: true
  });
  await recipeRepo.save(recipe);

  await recipeIngredientRepo.save([
    recipeIngredientRepo.create({
      recipeId: recipe.id,
      ingredientId: pasta.id,
      quantity: 200,
      unit: 'g'
    }),
    recipeIngredientRepo.create({
      recipeId: recipe.id,
      ingredientId: tomato.id,
      quantity: 2,
      unit: 'pcs'
    })
  ]);

  console.log('Seed completed');
  await dataSource.destroy();
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
