import { GoogleGenAI, Type } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey });


const recipeDetailsSchema = {
  type: Type.OBJECT,
  properties: {
    ingredients: {
      type: Type.ARRAY,
      description: "A detailed list of ingredients, including specific quantities (e.g., '1 cup flour', '2 tbsp olive oil').",
      items: {
        type: Type.STRING,
      },
    },
    steps: {
      type: Type.ARRAY,
      description: "A list of step-by-step preparation and cooking instructions.",
      items: {
        type: Type.STRING,
      },
    },
  },
  required: ["ingredients", "steps"],
};

const nutritionalInfoSchema = {
  type: Type.OBJECT,
  properties: {
    Calories: { type: Type.STRING, description: "Total calories per serving, e.g., '350 kcal'" },
    Protein: { type: Type.STRING, description: "Total protein per serving, e.g., '15g'" },
    Carbohydrates: { type: Type.STRING, description: "Total carbohydrates per serving, e.g., '40g'" },
    Fat: { type: Type.STRING, description: "Total fat per serving, e.g., '20g'" },
  },
   required: ["Calories", "Protein", "Carbohydrates", "Fat"],
}

export const generateRecipeDetails = async (
  recipeName: string,
  dietaryModifier: string
): Promise<{ ingredients: string[]; steps: string[] }> => {
  const modifierText = dietaryModifier ? `${dietaryModifier} ` : '';
  const prompt = `Generate a recipe for ${modifierText}${recipeName}. Provide a detailed list of ingredients with quantities and step-by-step preparation instructions.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: recipeDetailsSchema,
    },
  });

  const jsonText = response.text.trim();
  const data = JSON.parse(jsonText);
  
  if (!data.ingredients || !data.steps) {
    throw new Error("Invalid response format from API for recipe details.");
  }

  return {
    ingredients: data.ingredients,
    steps: data.steps,
  };
};

export const generateNutritionalInfo = async (ingredients: string[]): Promise<Record<string, string>> => {
  const prompt = `Based on the following list of ingredients, provide an estimated nutritional breakdown per serving. Ingredients: ${ingredients.join(', ')}.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: nutritionalInfoSchema,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Failed to generate nutritional info, returning empty object.", error);
    // Return a default object on failure to avoid breaking the UI
    return {
      Calories: "N/A",
      Protein: "N/A",
      Carbohydrates: "N/A",
      Fat: "N/A",
    };
  }
};


export const generateRecipeImage = async (
  recipeName: string,
  dietaryModifier: string
): Promise<string> => {
  const modifierText = dietaryModifier ? `${dietaryModifier} ` : "";
  const prompt = `Professional food photography of ${modifierText}${recipeName}. High resolution, appetizing, studio lighting, on a clean, elegant dark charcoal background.`;

  try {
    // 1️⃣ Try high-quality Imagen model (requires billing)
    const response = await ai.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: "image/jpeg",
        aspectRatio: "3:4",
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }

    throw new Error("No image returned from Imagen API.");
  } catch (imagenError) {
    console.warn("⚠️ Imagen failed, falling back to Gemini...", imagenError);

    try {
      // 2️⃣ Fallback to Gemini text-based image generation (works on free tier)
      const textPrompt = `
        Create a realistic food image of ${modifierText}${recipeName}.
        The image should look delicious and well-lit.
        Return only a base64-encoded JPEG image starting with "data:image/jpeg;base64,".
      `;

      const geminiResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: textPrompt,
      });

      const imageData = geminiResponse.text.trim();

      if (imageData.startsWith("data:image")) {
        return imageData;
      } else {
        throw new Error("Invalid base64 image format from Gemini.");
      }
    } catch (geminiError) {
      console.error("❌ Gemini fallback also failed:", geminiError);
      // 3️⃣ Final fallback: use local or CDN placeholder image
      return "/placeholder.jpg"; // store placeholder.jpg in /public
    }
  }
};
