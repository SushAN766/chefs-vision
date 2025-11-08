import React from 'react';

interface RecipeFormProps {
  recipeName: string;
  setRecipeName: (value: string) => void;
  dietaryModifier: string;
  setDietaryModifier: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const RecipeForm: React.FC<RecipeFormProps> = ({
  recipeName,
  setRecipeName,
  dietaryModifier,
  setDietaryModifier,
  onSubmit,
  isLoading,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="recipeName" className="block text-sm font-medium text-stone-300 mb-1">
            Recipe Name
          </label>
          <input
            type="text"
            id="recipeName"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            className="w-full px-4 py-2 border bg-slate border-gray-600 text-cream rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-copper focus:border-copper"
            placeholder="e.g., Classic Lasagna"
            required
          />
        </div>
        <div>
          <label htmlFor="dietaryModifier" className="block text-sm font-medium text-stone-300 mb-1">
            Dietary Modifier <span className="text-gray-500">(Optional)</span>
          </label>
          <input
            type="text"
            id="dietaryModifier"
            value={dietaryModifier}
            onChange={(e) => setDietaryModifier(e.target.value)}
            className="w-full px-4 py-2 border bg-slate border-gray-600 text-cream rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-copper focus:border-copper"
            placeholder="e.g., Gluten-Free, Vegan"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-bold text-white bg-copper hover:bg-copper-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-charcoal focus:ring-copper disabled:bg-opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Generating...' : 'Generate Recipe'}
      </button>
    </form>
  );
};

export default RecipeForm;