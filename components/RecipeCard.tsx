import React from 'react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  onImageLoad?: () => void;
}

const RecipeCard = React.forwardRef<HTMLDivElement, RecipeCardProps>(({ recipe, onImageLoad }, ref) => {
  return (
    <div ref={ref} className="bg-slate rounded-lg shadow-xl overflow-hidden border border-gray-700">
      <div className="aspect-[3/4] w-full overflow-hidden">
        <img 
          src={recipe.imageUrl} 
          alt={recipe.name} 
          className="w-full h-full object-cover"
          onLoad={onImageLoad}
          crossOrigin="anonymous"
        />
      </div>
      <div className="p-6 md:p-8 text-cream">
        <h3 className="text-3xl md:text-4xl font-bold text-cream font-serif text-center">{recipe.name}</h3>
        {recipe.modifier && <p className="text-center text-lg text-copper font-medium mt-1">{recipe.modifier}</p>}
        
        {recipe.nutritionalInfo && (
           <div className="mt-6 p-4 bg-charcoal rounded-lg">
             <h4 className="text-lg font-semibold font-serif text-center text-copper mb-3">Estimated Nutrition (per serving)</h4>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
               {Object.entries(recipe.nutritionalInfo).map(([key, value]) => (
                  <div key={key}>
                    <p className="font-bold text-lg text-cream">{value}</p>
                    <p className="text-sm text-stone-400">{key}</p>
                  </div>
               ))}
             </div>
           </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-8">
          <div>
            <h4 className="text-xl font-semibold font-serif text-cream border-b-2 border-gray-700 pb-2 mb-4">Ingredients</h4>
            <ul className="space-y-2 list-disc list-inside text-stone-300">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>
                    {ingredient}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xl font-semibold font-serif text-cream border-b-2 border-gray-700 pb-2 mb-4">Preparation</h4>
            <ol className="space-y-3 list-decimal list-inside text-stone-300">
              {recipe.steps.map((step, index) => (
                <li key={index} className="pl-2">
                    {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
});

export default RecipeCard;