import React, { useState, useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';
import { Recipe } from './types';
import { generateRecipeDetails, generateRecipeImage, generateNutritionalInfo } from './services/geminiService';
import { ChefIcon, LoadingSpinner, HomeIcon, ShareIcon, TwitterIcon, FacebookIcon, CloseIcon } from './components/icons';
import RecipeForm from './components/RecipeForm';
import RecipeCard from './components/RecipeCard';

const App: React.FC = () => {
  const [page, setPage] = useState('home');
  const [recipeName, setRecipeName] = useState('');
  const [dietaryModifier, setDietaryModifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [showShareFallback, setShowShareFallback] = useState(false);
  const recipeCardRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async () => {
    if (!recipeName) return;
    setIsLoading(true);
    setRecipe(null);
    setShowShareFallback(false);

    try {
      const [details, imageUrl] = await Promise.all([
        generateRecipeDetails(recipeName, dietaryModifier),
        generateRecipeImage(recipeName, dietaryModifier)
      ]);

      // Fetch nutritional info after details are available
      const nutritionalInfo = await generateNutritionalInfo(details.ingredients);

      setRecipe({
        name: recipeName,
        modifier: dietaryModifier,
        imageUrl,
        ...details,
        nutritionalInfo,
      });
    } catch (error) {
      console.error("Failed to generate recipe:", error);
      alert("There was an error generating your recipe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownloadPdf = () => {
    if (recipeCardRef.current === null || !recipe) {
      return;
    }
    const cardElement = recipeCardRef.current;

    htmlToImage.toPng(cardElement, { cacheBust: true, backgroundColor: '#111827', skipFonts: true })
      .then((dataUrl) => {
        const cardWidth = cardElement.offsetWidth;
        const cardHeight = cardElement.offsetHeight;
        
        // Use jsPDF to create a PDF with the same dimensions as the card
        const pdf = new jsPDF({
          orientation: cardWidth > cardHeight ? 'l' : 'p', // landscape or portrait
          unit: 'px',
          format: [cardWidth, cardHeight]
        });

        pdf.addImage(dataUrl, 'PNG', 0, 0, cardWidth, cardHeight);
        pdf.save(`${recipe.name.toLowerCase().replace(/\s+/g, '-')}-recipe-card.pdf`);
      })
      .catch((err) => {
        console.error('Oops, something went wrong!', err);
        alert('Failed to generate PDF. Please try again.');
      });
  };
  
  const handleShare = async () => {
    if (recipeCardRef.current === null || !recipe) {
      return;
    }
    const cardElement = recipeCardRef.current;

    try {
      const dataUrl = await htmlToImage.toPng(cardElement, { cacheBust: true, backgroundColor: '#111827', skipFonts: true });
      
      const cardWidth = cardElement.offsetWidth;
      const cardHeight = cardElement.offsetHeight;
      
      const pdf = new jsPDF({
        orientation: cardWidth > cardHeight ? 'l' : 'p',
        unit: 'px',
        format: [cardWidth, cardHeight]
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, cardWidth, cardHeight);
      const pdfBlob = pdf.output('blob');
      
      const fileName = `${recipe.name.toLowerCase().replace(/\s+/g, '-')}-recipe-card.pdf`;
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

      const shareData = {
        title: `${recipe.name} Recipe`,
        text: `Check out this delicious ${recipe.name} recipe I generated with Chef's Vision!`,
        files: [file],
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        setShowShareFallback(true);
      }
    } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error("Sharing failed:", error);
          alert("Sorry, there was an error creating the shareable PDF.");
        }
    }
  };

  const Header = () => (
    <header className="flex justify-between items-center py-4">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setRecipe(null); setPage('home'); }}>
        <ChefIcon />
        <span className="font-bold text-2xl font-serif">Chef's Vision</span>
      </div>
       {page === 'generator' && (
         <button onClick={() => { setRecipe(null); setPage('home'); }} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate transition-colors">
            <HomeIcon />
            Home
         </button>
       )}
    </header>
  );

  return (
    <div className="bg-charcoal min-h-screen text-cream font-sans">
      <div className="container mx-auto px-6 py-4">
        <Header />
        
        {page === 'home' && (
            <main>
                <div className="grid md:grid-cols-2 items-center gap-12 pt-16 pb-24 md:pt-24">
                     <div className="text-center md:text-left">
                        <h1 className="text-5xl lg:text-7xl font-extrabold font-serif text-cream leading-tight mt-2">
                            <span className="text-copper">Visionary</span> Cooking.
                            <br />
                            <span className="text-copper">Perfected</span> Plates.
                        </h1>
                        <p className="mt-6 text-lg text-stone-400 max-w-md mx-auto md:mx-0">
                           Transform your culinary ideas into masterfully crafted recipes with stunning visuals. Describe your dish, and let our AI bring your vision to life.
                        </p>
                         <button onClick={() => setPage('generator')} className="mt-8 bg-copper hover:bg-copper-dark text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors">
                            Get Started
                        </button>
                    </div>
                    <div className="flex justify-center items-center">
                       <div className="relative w-full max-w-md aspect-[4/5] rounded-xl shadow-2xl overflow-hidden transform md:rotate-3 transition-transform duration-500 hover:rotate-0 hover:scale-105 border-2 border-slate">
                         <img 
                            src="./assets/home-food.avif" 
                            alt="visionary cooking" 
                            className="w-full h-full object-cover"
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-charcoal/20 to-transparent"></div>
                       </div>
                    </div>
                </div>
            </main>
        )}

        {page === 'generator' && (
          <main className="py-12">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold font-serif">Create Your Recipe</h1>
                <p className="text-stone-400 mt-2">Enter a dish and an optional modifier to generate your custom recipe card.</p>
              </div>
              <RecipeForm
                recipeName={recipeName}
                setRecipeName={setRecipeName}
                dietaryModifier={dietaryModifier}
                setDietaryModifier={setDietaryModifier}
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </div>

            <div className="mt-16 max-w-3xl mx-auto">
              {isLoading && (
                <div className="flex flex-col items-center justify-center text-center gap-4 p-8">
                   <LoadingSpinner />
                   <p className="text-lg font-semibold">Generating your masterpiece...</p>
                   <p className="text-stone-400">This can take a moment. The AI is preheating the oven!</p>
                </div>
              )}
              {recipe && (
                 <div className="flex flex-col items-center">
                    <RecipeCard
                        ref={recipeCardRef}
                        recipe={recipe}
                    />
                    <div className="flex flex-wrap justify-center gap-4 mt-8">
                        <button onClick={handleShare} className="flex items-center gap-2 bg-slate hover:bg-gray-600 text-cream font-bold py-2 px-5 rounded-lg transition-colors">
                           <ShareIcon />
                           Share Recipe
                       </button>
                       <button onClick={handleDownloadPdf} className="bg-slate hover:bg-gray-600 text-cream font-bold py-2 px-5 rounded-lg transition-colors">
                           Download PDF
                       </button>
                    </div>
                     {showShareFallback && (
                        <div className="mt-4 p-4 rounded-lg bg-slate border border-gray-700 w-full max-w-sm text-center">
                            <div className="flex justify-between items-center mb-3">
                                <p className="font-semibold">Sharing not supported</p>
                                <button onClick={() => setShowShareFallback(false)} className="p-1 rounded-full hover:bg-gray-600">
                                    <CloseIcon />
                                </button>
                            </div>
                            <p className="text-sm text-stone-400 mb-4">Your browser doesn't support direct file sharing. Use a link instead:</p>
                            <div className="flex justify-center gap-4">
                                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this ${recipe.name} recipe I made with Chef's Vision!`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white font-bold py-2 px-4 rounded-lg bg-[#1DA1F2] hover:bg-[#0c85d0] transition-colors">
                                    <TwitterIcon /> Twitter
                                </a>
                                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(`Check out this ${recipe.name} recipe I made with Chef's Vision!`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white font-bold py-2 px-4 rounded-lg bg-[#1877F2] hover:bg-[#166eeb] transition-colors">
                                    <FacebookIcon /> Facebook
                                </a>
                            </div>
                        </div>
                    )}
                </div>
              )}
            </div>
          </main>
        )}
      </div>
    </div>
  );
};

export default App;