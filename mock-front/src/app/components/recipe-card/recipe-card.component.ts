import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { Recipe } from '../../models/recipe.model';
import { DifficultyLabelPipe } from '../../pipes/difficulty-label.pipe';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [DecimalPipe, DifficultyLabelPipe],
  templateUrl: './recipe-card.component.html',
  styleUrls: ['./recipe-card.component.scss'],
})
export class RecipeCardComponent {
  @Input() recipe!: Recipe;
  @Output() view = new EventEmitter<string>();
  @Output() favorite = new EventEmitter<string>();
}
