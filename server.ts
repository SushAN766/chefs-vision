import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

const PRIMARY_MODEL = "black-forest-labs/FLUX.1-dev";
const FALLBACK_MODEL = "runwayml/stable-diffusion-v1-5";

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", message: "ChefVision backend is running!" });
});

app.get("/", (req: Request, res: Response) => {
  res.send("ChefVision AI Recipe Generator Backend is live!");
});

app.get("/favicon.ico", (req: Request, res: Response) => res.status(204).end());

app.post("/api/generate-image", async (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  if (!HF_API_KEY) {
    console.error(" Missing Hugging Face API key!");
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  const generateFromModel = async (model: string) => {
    console.log(`Generating with model: ${model}`);
    const response = await fetch(
      `https://router.huggingface.co/hf-inference/models/${model}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );
    return response;
  };

  try {
    let response = await generateFromModel(PRIMARY_MODEL);

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(` Primary model failed (${response.status}): ${errorText}`);
      console.log(` Switching to fallback model: ${FALLBACK_MODEL}`);

      response = await generateFromModel(FALLBACK_MODEL);

      if (!response.ok) {
        const fallbackError = await response.text();
        console.error(` Fallback also failed: ${fallbackError}`);
        return res.status(500).json({ error: fallbackError });
      }
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    console.log("Image generated successfully!");
    res.json({ image: `data:image/png;base64,${base64Image}` });
  } catch (error) {
    console.error("Unexpected server error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
