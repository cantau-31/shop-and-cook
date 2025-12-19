#!/bin/bash

# Script pour migrer tous les templates Angular vers la syntaxe moderne (@if, @for, etc.)

echo "Migration des templates Angular vers la syntaxe moderne..."

# Fonction pour migrer *ngIf vers @if
migrate_ngif() {
    local file="$1"
    # Remplace *ngIf="condition; else template" par @if (condition) { ... } @else { <ng-container *ngTemplateOutlet="template"></ng-container> }
    sed -i '' 's/\*ngIf="\([^"]*\); else \([^"]*\)"/@if (\1) {/g' "$file"
    
    # Remplace *ngIf="condition as variable; else template" par @if (condition; as variable) { ... } @else { <ng-container *ngTemplateOutlet="template"></ng-container> }
    sed -i '' 's/\*ngIf="\([^"]*\) as \([^;]*\); else \([^"]*\)"/@if (\1; as \2) {/g' "$file"
    
    # Remplace *ngIf="condition as variable" par @if (condition; as variable) {
    sed -i '' 's/\*ngIf="\([^"]*\) as \([^"]*\)"/@if (\1; as \2) {/g' "$file"
    
    # Remplace *ngIf="condition" par @if (condition) {
    sed -i '' 's/\*ngIf="\([^"]*\)"/@if (\1) {/g' "$file"
}

# Fonction pour migrer *ngFor vers @for
migrate_ngfor() {
    local file="$1"
    # Remplace *ngFor="let item of items; trackBy: trackFn" par @for (item of items; track trackFn($index, item)) {
    sed -i '' 's/\*ngFor="let \([^[:space:]]*\) of \([^;]*\); trackBy: \([^"]*\)"/@for (\1 of \2; track \3($index, \1)) {/g' "$file"
    
    # Remplace *ngFor="let item of items; let i = index" par @for (item of items; track $index) {
    sed -i '' 's/\*ngFor="let \([^[:space:]]*\) of \([^;]*\); let [^[:space:]]* = index"/@for (\1 of \2; track $index) {/g' "$file"
    
    # Remplace *ngFor="let item of items" par @for (item of items; track $index) {
    sed -i '' 's/\*ngFor="let \([^[:space:]]*\) of \([^"]*\)"/@for (\1 of \2; track $index) {/g' "$file"
}

# Trouve tous les fichiers HTML dans le projet Angular
find /Users/Julien_CANTAU/ecole/shop-and-cook/frontend/web/src/app -name "*.component.html" -type f | while read file; do
    echo "Migration de $file..."
    migrate_ngif "$file"
    migrate_ngfor "$file"
done

echo "Migration terminée!"