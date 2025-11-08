export interface Recipe {
  name: string;
  modifier: string;
  imageUrl: string;
  ingredients: string[];
  steps: string[];
  nutritionalInfo?: Record<string, string>;
}
