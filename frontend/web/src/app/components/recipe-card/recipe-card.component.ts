import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DecimalPipe, TitleCasePipe } from '@angular/common';

import { Recipe } from '../../models/recipe.model';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [DecimalPipe, TitleCasePipe],
  templateUrl: './recipe-card.component.html',
  styleUrls: ['./recipe-card.component.scss'],
})
export class RecipeCardComponent {
  @Input() recipe!: Recipe;
  @Output() view = new EventEmitter<string>();
  @Output() favorite = new EventEmitter<string>();
}
