import React from 'react';
import { Recipe } from '../types';

interface CommunityFeedProps {
  recipes: Recipe[];
}

const CommunityFeed: React.FC<CommunityFeedProps> = ({ recipes }) => {
  if (recipes.length === 0) {
    return null;
  }

  return (
    <section className="mt-16">
      <h2 className="text-3xl font-bold text-center text-cream mb-8 font-serif">Community Discoveries</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {recipes.map((recipe, index) => (
          <div key={`${recipe.name}-${index}`} className="bg-slate rounded-lg shadow-xl overflow-hidden border border-gray-700 transform hover:-translate-y-2 transition-transform duration-300">
            <div className="aspect-[3/4] w-full overflow-hidden">
              <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold font-serif text-cream truncate">{recipe.name}</h3>
              {recipe.modifier && <p className="text-sm text-copper">{recipe.modifier}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CommunityFeed;