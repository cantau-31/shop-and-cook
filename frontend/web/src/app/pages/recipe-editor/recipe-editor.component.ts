import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Recipe } from '../../models/recipe.model';
import { RecipeService } from '../../services/recipe.service';
import { Category } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';

type IngredientFormGroup = FormGroup<{
  name: FormControl<string>;
  quantity: FormControl<number>;
  unit: FormControl<string>;
}>;

type RecipeFormGroup = FormGroup<{
  title: FormControl<string>;
  category: FormControl<string>;
  servings: FormControl<number>;
  durationMinutes: FormControl<number>;
  difficulty: FormControl<string>;
  imageUrl: FormControl<string>;
  description: FormControl<string>;
  isPublished: FormControl<boolean>;
  ingredients: FormArray<IngredientFormGroup>;
  steps: FormArray<FormControl<string>>;
}>;

@Component({
  selector: 'app-recipe-editor',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './recipe-editor.component.html',
  styleUrls: ['./recipe-editor.component.scss'],
})
export class RecipeEditorComponent implements OnInit {
  recipeId: string | null = null;
  isSaving = false;
  categories: Category[] = [];
  difficulties = [
    { label: 'Facile', value: 'easy' },
    { label: 'Moyenne', value: 'medium' },
    { label: 'Difficile', value: 'hard' },
  ];

  recipeForm: RecipeFormGroup = this.fb.nonNullable.group({
    title: ['', Validators.required],
    category: [''],
    servings: [2, [Validators.required, Validators.min(1)]],
    durationMinutes: [30, [Validators.required, Validators.min(1)]],
    difficulty: ['easy', Validators.required],
    imageUrl: ['', Validators.required],
    description: [''],
    isPublished: [true],
    ingredients: this.fb.array<IngredientFormGroup>([
      this.createIngredientGroup(),
    ]),
    steps: this.fb.array<FormControl<string>>([this.createStepControl()]),
  });

  constructor(
    private fb: FormBuilder,
    private recipeService: RecipeService,
    private router: Router,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
  ) {}

  ngOnInit(): void {
    this.recipeId = this.route.snapshot.paramMap.get('id');
    this.loadCategories();
    if (this.recipeId) {
      this.loadRecipe(this.recipeId);
    }
  }

  get ingredients(): FormArray<IngredientFormGroup> {
    return this.recipeForm.get('ingredients') as FormArray<IngredientFormGroup>;
  }

  get steps(): FormArray<FormControl<string>> {
    return this.recipeForm.get('steps') as FormArray<FormControl<string>>;
  }

  addIngredient(): void {
    this.ingredients.push(this.createIngredientGroup());
  }

  removeIngredient(index: number): void {
    if (this.ingredients.length > 1) {
      this.ingredients.removeAt(index);
    }
  }

  addStep(): void {
    this.steps.push(this.createStepControl());
  }

  removeStep(index: number): void {
    if (this.steps.length > 1) {
      this.steps.removeAt(index);
    }
  }

  submit(): void {
    if (this.recipeForm.invalid) {
      this.recipeForm.markAllAsTouched();
      return;
    }
    this.isSaving = true;
    const payload = this.buildPayload();

    const request$ = this.recipeId
      ? this.recipeService.updateRecipe(this.recipeId, payload)
      : this.recipeService.createRecipe(payload);

    request$.subscribe({
      next: (recipe) => {
        this.router.navigate(['/recipe', recipe.id]);
      },
      error: () => {
        this.isSaving = false;
      },
    });
  }

  private createIngredientGroup(): IngredientFormGroup {
    return this.fb.nonNullable.group({
      name: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0.1)]],
      unit: ['', Validators.required],
    });
  }

  private createStepControl(): FormControl<string> {
    return this.fb.nonNullable.control('', Validators.required);
  }

  private loadRecipe(id: string): void {
    this.recipeService.getRecipeById(id).subscribe({
      next: (recipe) => {
        const derivedDuration =
          (recipe.durationMinutes ??
            Number(recipe.prepMinutes ?? 0) +
              Number(recipe.cookMinutes ?? 0)) ||
          30;

        this.recipeForm.patchValue({
          title: recipe.title,
          category: recipe.categoryId?.toString() ?? '',
          servings: recipe.servings ?? 2,
          durationMinutes: derivedDuration,
          difficulty: this.normalizeDifficulty(recipe.difficulty),
          imageUrl: recipe.coverUrl ?? recipe.imageUrl ?? '',
          description: recipe.description ?? '',
          isPublished: recipe.isPublished ?? true,
        });

        this.recipeForm.setControl(
          'ingredients',
          this.fb.array<IngredientFormGroup>(
            recipe.ingredients.map((ingredient) =>
              this.fb.nonNullable.group({
                name: [ingredient.name, Validators.required],
                quantity: [
                  ingredient.quantity,
                  [Validators.required, Validators.min(0.1)],
                ],
                unit: [ingredient.unit, Validators.required],
              }),
            ),
          ),
        );

        this.recipeForm.setControl(
          'steps',
          this.fb.array<FormControl<string>>(
            recipe.steps.map((step) =>
              this.fb.nonNullable.control(step, Validators.required),
            ),
          ),
        );
      },
    });
  }

  private loadCategories(): void {
    this.categoryService.list().subscribe({
      next: (items) => (this.categories = items),
      error: () => {
        this.categories = [];
      },
    });
  }

  private buildPayload(): Partial<Recipe> {
    const formValue = this.recipeForm.getRawValue();
    const totalMinutes = Number(formValue.durationMinutes) || 0;
    const prepMinutes = Math.max(Math.floor(totalMinutes / 2), 0);
    const cookMinutes = Math.max(totalMinutes - prepMinutes, 0);
    const categoryValue = (formValue.category ?? '').toString().trim();
    const parsedCategory =
      categoryValue === '' ? undefined : Number(categoryValue);
    const categoryIdNumber =
      parsedCategory !== undefined && Number.isFinite(parsedCategory)
        ? parsedCategory
        : undefined;

    return {
      title: formValue.title,
      categoryId: categoryIdNumber,
      servings: Number(formValue.servings) || 1,
      prepMinutes,
      cookMinutes,
      difficulty: this.difficultyToNumber(formValue.difficulty),
      coverUrl: formValue.imageUrl || undefined,
      isPublished: formValue.isPublished ?? true,
      ingredients: formValue.ingredients.map((ingredient) => ({
        name: ingredient.name,
        quantity: Number(ingredient.quantity),
        unit: ingredient.unit,
      })),
      steps: formValue.steps.filter((step) => !!step),
    };
  }

  private normalizeDifficulty(value: Recipe['difficulty']): string {
    if (typeof value === 'number') {
      if (value <= 2) return 'easy';
      if (value >= 4) return 'hard';
      return 'medium';
    }
    return value || 'easy';
  }

  private difficultyToNumber(value: string | number): number {
    if (typeof value === 'number') {
      return value;
    }
    const map: Record<string, number> = {
      easy: 1,
      medium: 3,
      hard: 5,
    };
    const key = value.toLowerCase();
    return map[key] ?? 1;
  }
}
