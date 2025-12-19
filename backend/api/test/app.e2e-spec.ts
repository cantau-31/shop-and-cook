import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';

describe('Shop & Cook API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('register -> login -> create recipe -> list', async () => {
    const email = `tester+${Date.now()}@shopcook.dev`;
    const password = 'Password123!';

    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password,
        displayName: 'E2E Tester'
      })
      .expect(201);

    expect(registerRes.body.accessToken).toBeDefined();

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

    const token = loginRes.body.accessToken;
    expect(token).toBeDefined();

    const recipeRes = await request(app.getHttpServer())
      .post('/recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: `Recette test ${Date.now()}`,
        categoryId: null,
        servings: 2,
        prepMinutes: 5,
        cookMinutes: 10,
        difficulty: 2,
        steps: ['Préparer les ingrédients', 'Cuire', 'Servir'],
        ingredients: [
          { name: 'Tomate', quantity: 2, unit: 'pcs' },
          { name: 'Sel', quantity: 1, unit: 'pinch' }
        ]
      })
      .expect(201);

    expect(recipeRes.body.id).toBeDefined();

    const listRes = await request(app.getHttpServer()).get('/recipes').expect(200);
    expect(Array.isArray(listRes.body.items)).toBe(true);
  });
});
