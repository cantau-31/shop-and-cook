export interface Comment {
  id: string;
  recipeId: string;
  authorName: string;
  authorId: string;
  message: string;
  createdAt: string;
  recipeTitle?: string;
}
