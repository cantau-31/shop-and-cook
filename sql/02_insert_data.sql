USE shopcook;

-- Utilisateurs
INSERT INTO users (email, password_hash, display_name, role) VALUES
('admin@demo.com', '$2b$10$demoHashedPassword', 'Admin', 'ADMIN'),
('user1@demo.com', '$2b$10$demoHashedPassword', 'Alice', 'USER'),
('user2@demo.com', '$2b$10$demoHashedPassword', 'Bob', 'USER');

-- Catégories
INSERT INTO categories (name, slug) VALUES
('Entrée', 'entree'),
('Plat principal', 'plat-principal'),
('Dessert', 'dessert'),
('Végétarien', 'vegetarien'),
('Rapide', 'rapide');

-- Ingrédients
INSERT INTO ingredients (name, unit_default) VALUES
('Farine', 'g'),
('Sucre', 'g'),
('Beurre', 'g'),
('Oeuf', 'pcs'),
('Lait', 'ml'),
('Sel', 'g'),
('Pâtes', 'g'),
('Tomate', 'pcs'),
('Poulet', 'g');

-- Recette exemple
INSERT INTO recipes (author_id, title, slug, servings, prep_minutes, cook_minutes, difficulty, steps_json, category_id)
VALUES
(2, 'Pâtes à la sauce tomate', 'pates-sauce-tomate', 2, 10, 15, 1,
'["Faire cuire les pâtes.","Préparer la sauce tomate.","Mélanger et servir chaud."]', 2);

-- Lien ingrédients / recette
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES
(1, 7, 200, 'g'),
(1, 8, 2, 'pcs'),
(1, 6, 2, 'g');

-- Notes
INSERT INTO ratings (user_id, recipe_id, stars) VALUES
(3, 1, 5);

-- Commentaire
INSERT INTO comments (user_id, recipe_id, body) VALUES
(3, 1, 'Très bon et facile à faire !');
