import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { RecipeQueryParams } from '../../models/recipe.model';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-recipe-filters',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './recipe-filters.component.html',
  styleUrls: ['./recipe-filters.component.scss'],
})
export class RecipeFiltersComponent implements OnInit, OnDestroy {
  @Input() categories: Category[] = [];
  @Output() filterChange = new EventEmitter<RecipeQueryParams>();

  private destroy$ = new Subject<void>();

  filterForm = this.fb.group({
    q: [''],
    category: [''],
    difficulty: [''],
    maxTime: [''],
  });

  difficulties = [
    { label: 'Facile', value: 'easy' },
    { label: 'Moyenne', value: 'medium' },
    { label: 'Difficile', value: 'hard' },
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.filterChange.emit({
          q: value.q || undefined,
          category: value.category || undefined,
          difficulty:
            (value.difficulty as RecipeQueryParams['difficulty']) || undefined,
          maxTime: value.maxTime ? Number(value.maxTime) : undefined,
        });
      });
  }

  reset(): void {
    this.filterForm.reset();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
