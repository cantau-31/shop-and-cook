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

type IngredientFormGroup = FormGroup<{
  name: FormControl<string>;
  quantity: FormControl<number>;
  unit: FormControl<string>;
}>;

type RecipeFormGroup = FormGroup<{
  title: FormControl<string>;
  category: FormControl<string>;
  durationMinutes: FormControl<number>;
  difficulty: FormControl<string>;
  imageUrl: FormControl<string>;
  description: FormControl<string>;
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
  difficulties = [
    { label: 'Facile', value: 'easy' },
    { label: 'Moyenne', value: 'medium' },
    { label: 'Difficile', value: 'hard' },
  ];

  recipeForm: RecipeFormGroup = this.fb.nonNullable.group({
    title: ['', Validators.required],
    category: ['', Validators.required],
    durationMinutes: [30, [Validators.required, Validators.min(1)]],
    difficulty: ['easy', Validators.required],
    imageUrl: ['', Validators.required],
    description: [''],
    ingredients: this.fb.array<IngredientFormGroup>([
      this.createIngredientGroup(),
    ]),
    steps: this.fb.array<FormControl<string>>([this.createStepControl()]),
  });

  constructor(
    private fb: FormBuilder,
    private recipeService: RecipeService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.recipeId = this.route.snapshot.paramMap.get('id');
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
        this.recipeForm.patchValue({
          title: recipe.title,
          category: recipe.category,
          durationMinutes: recipe.durationMinutes,
          difficulty: recipe.difficulty,
          imageUrl: recipe.imageUrl,
          description: recipe.description,
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
              })
            )
          )
        );

        this.recipeForm.setControl(
          'steps',
          this.fb.array<FormControl<string>>(
            recipe.steps.map((step) =>
              this.fb.nonNullable.control(step, Validators.required)
            )
          )
        );
      },
    });
  }

  private buildPayload(): Partial<Recipe> {
    const formValue = this.recipeForm.getRawValue();

    return {
      title: formValue.title,
      category: formValue.category,
      durationMinutes: formValue.durationMinutes,
      difficulty: formValue.difficulty as Recipe['difficulty'],
      imageUrl: formValue.imageUrl,
      description: formValue.description,
      ingredients: formValue.ingredients.map((ingredient) => ({
        name: ingredient.name,
        quantity: Number(ingredient.quantity),
        unit: ingredient.unit,
      })),
      steps: formValue.steps.filter((step) => !!step),
    };
  }
}
