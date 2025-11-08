import { GoogleGenAI, Type } from "@google/genai";

// Gemini API setup
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey });

// ✅ Recipe schema
const recipeDetailsSchema = {
  type: Type.OBJECT,
  properties: {
    ingredients: {
      type: Type.ARRAY,
      description:
        "A detailed list of ingredients, including specific quantities (e.g., '1 cup flour', '2 tbsp olive oil').",
      items: { type: Type.STRING },
    },
    steps: {
      type: Type.ARRAY,
      description:
        "A list of step-by-step preparation and cooking instructions.",
      items: { type: Type.STRING },
    },
  },
  required: ["ingredients", "steps"],
};

// ✅ Nutritional info schema
const nutritionalInfoSchema = {
  type: Type.OBJECT,
  properties: {
    Calories: { type: Type.STRING, description: "Total calories per serving, e.g., '350 kcal'" },
    Protein: { type: Type.STRING, description: "Total protein per serving, e.g., '15g'" },
    Carbohydrates: { type: Type.STRING, description: "Total carbohydrates per serving, e.g., '40g'" },
    Fat: { type: Type.STRING, description: "Total fat per serving, e.g., '20g'" },
  },
  required: ["Calories", "Protein", "Carbohydrates", "Fat"],
};

// 🥣 Generate Recipe Details
export const generateRecipeDetails = async (
  recipeName: string,
  dietaryModifier: string
): Promise<{ ingredients: string[]; steps: string[] }> => {
  const modifierText = dietaryModifier ? `${dietaryModifier} ` : "";
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

// 🍽️ Generate Nutritional Info
export const generateNutritionalInfo = async (
  ingredients: string[]
): Promise<Record<string, string>> => {
  const prompt = `Based on the following list of ingredients, provide an estimated nutritional breakdown per serving. Ingredients: ${ingredients.join(
    ", "
  )}.`;

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
  const prompt = `Professional food photography of ${modifierText}${recipeName}. High resolution, realistic, appetizing, well-lit.`

  try {
    const response = await fetch("http://localhost:4000/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error("Server error: " + response.statusText);
    }

    const data = await response.json();
    return data.image; // base64 image URL
  } catch (error) {
    console.error("❌ Failed to generate image:", error);
    return "/placeholder.jpg"; // fallback
  }
};
