import { Pipe, PipeTransform } from '@angular/core';

type DifficultyValue = number | string | null | undefined;

@Pipe({
  name: 'difficultyLabel',
  standalone: true
})
export class DifficultyLabelPipe implements PipeTransform {
  private readonly labels: Record<string, string> = {
    easy: 'Facile',
    medium: 'Moyenne',
    hard: 'Difficile'
  };

  transform(value: DifficultyValue): string {
    if (value === null || value === undefined || value === '') {
      return 'Inconnue';
    }

    if (typeof value === 'number') {
      return this.fromNumeric(value);
    }

    const normalized = value.toString().trim().toLowerCase();
    return this.labels[normalized] ?? this.fromNumeric(Number(normalized));
  }

  private fromNumeric(value: number): string {
    if (Number.isNaN(value)) {
      return 'Inconnue';
    }
    if (value <= 2) {
      return this.labels['easy'];
    }
    if (value >= 4) {
      return this.labels['hard'];
    }
    return this.labels['medium'];
  }
}
