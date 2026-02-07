import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import cors from "cors";

// Keep global init ultra-light to avoid Firebase deploy "user code failed to load" timeouts.
// NO network calls, NO heavy SDK init at import time.
const allowedOrigins = [
  "https://drbn1-40b01.web.app",
  "https://drbn1-40b01.firebaseapp.com",
  "http://localhost:5173",
  "http://localhost:5174",
];

const corsHandler = cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
});

// Lazy singleton for Gemini client (created only when a request hits the function).
let geminiClient: any | null = null;

async function getGeminiClient() {
  if (geminiClient) return geminiClient;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Do not throw at module load; throw only at request-time.
    throw new Error(
      "Missing GEMINI_API_KEY. Set it with: npx firebase-tools functions:config:set gemini.key=\"...\" then redeploy, OR set env var in runtime."
    );
  }

  // Lazy import to keep cold-start + deploy analysis fast
  const mod = await import("@google/generative-ai");
  const { GoogleGenerativeAI } = mod;

  geminiClient = new GoogleGenerativeAI(apiKey);
  return geminiClient;
}

function normalizeBase64(input: string): { mimeType: string; base64: string } {
  // Accept:
  // 1) "data:image/jpeg;base64,...."
  // 2) "...." (base64 only)
  const trimmed = input.trim();

  const dataUrlMatch = trimmed.match(/^data:(.+?);base64,(.+)$/i);
  if (dataUrlMatch) {
    const mimeType = dataUrlMatch[1];
    const base64 = dataUrlMatch[2];
    return { mimeType, base64 };
  }

  // Default mimeType if unknown (Gemini can still handle; better to provide real mimeType from client)
  return { mimeType: "image/jpeg", base64: trimmed };
}

function assertPostJson(req: any) {
  if (req.method !== "POST") {
    const err: any = new Error("Method not allowed. Use POST.");
    err.statusCode = 405;
    throw err;
  }
  // Firebase functions does body parsing; but enforce JSON usage
  const contentType = (req.headers["content-type"] || "").toLowerCase();
  if (!contentType.includes("application/json")) {
    const err: any = new Error("Unsupported content-type. Use application/json.");
    err.statusCode = 415;
    throw err;
  }
}

function safeError(e: any) {
  return {
    message: e?.message ?? String(e),
    code: e?.code,
    statusCode: e?.statusCode,
  };
}

/**
 * Health check: quick ping to verify deploy.
 */
export const health = onRequest(
  { region: "us-central1", timeoutSeconds: 10 },
  (req, res) => {
    corsHandler(req, res, () => {
      res.status(200).json({ ok: true, service: "drbn-functions", time: new Date().toISOString() });
    });
  }
);

/**
 * skinAnalysis:
 * POST { profile: {...}, language?: "en"|"fr", photoData?: string }
 * Returns structured JSON plan with morningRoutine, eveningRoutine, etc.
 */
export const skinAnalysis = onRequest(
  { region: "us-central1", timeoutSeconds: 60, memory: "512MiB" },
  async (req, res) => {
    corsHandler(req, res, async () => {
      try {
        assertPostJson(req);

        const { profile, language = "en", photoData } = req.body ?? {};
        if (!profile) {
          return res.status(400).json({ ok: false, error: "Missing profile data." });
        }

        const client = await getGeminiClient();
        const model = client.getGenerativeModel({
          model: "gemini-1.5-flash",
        });

        // Build system prompt for JSON response
        const systemPrompt = language === "fr"
          ? `Tu es un dermatologue expert spécialisé dans les soins des peaux riches en mélanine. Analyse le profil de peau fourni et génère des recommandations personnalisées de soins.

IMPORTANT: Réponds UNIQUEMENT avec un objet JSON valide, sans texte supplémentaire, sans backticks, sans "json" au début. Le format doit être:

{
  "skinType": "le type de peau",
  "concerns": ["liste", "des", "préoccupations"],
  "overallScore": 85,
  "summary": "Résumé personnalisé de l'analyse",
  "recommendations": [
    {"title": "Titre", "description": "Description détaillée", "priority": "high|medium|low"}
  ],
  "morningRoutine": [
    {"step": 1, "product": "Produit", "instructions": "Instructions", "timing": "Durée"}
  ],
  "eveningRoutine": [
    {"step": 1, "product": "Produit", "instructions": "Instructions", "timing": "Durée"}
  ],
  "ingredients": [
    {"name": "Ingrédient", "benefit": "Bénéfice", "safeForMelaninRich": true, "caution": "optionnel"}
  ]
}`
          : `You are an expert dermatologist specializing in melanin-rich skin care. Analyze the provided skin profile and generate personalized skincare recommendations.

IMPORTANT: Respond ONLY with a valid JSON object, no additional text, no backticks, no "json" prefix. The format must be:

{
  "skinType": "the skin type",
  "concerns": ["list", "of", "concerns"],
  "overallScore": 85,
  "summary": "Personalized analysis summary",
  "recommendations": [
    {"title": "Title", "description": "Detailed description", "priority": "high|medium|low"}
  ],
  "morningRoutine": [
    {"step": 1, "product": "Product", "instructions": "Instructions", "timing": "Duration"}
  ],
  "eveningRoutine": [
    {"step": 1, "product": "Product", "instructions": "Instructions", "timing": "Duration"}
  ],
  "ingredients": [
    {"name": "Ingredient", "benefit": "Benefit", "safeForMelaninRich": true, "caution": "optional"}
  ]
}`;

        const userPrompt = language === "fr"
          ? `Analyse ce profil de peau et génère des recommandations personnalisées:

Type de peau: ${profile.skinType || "Non spécifié"}
Préoccupations: ${Array.isArray(profile.concerns) ? profile.concerns.join(", ") : profile.concerns || "Aucune"}
Tranche d'âge: ${profile.ageRange || "Non spécifié"}
Exposition au soleil: ${profile.sunExposure || "Non spécifié"}
Routine actuelle: ${profile.currentRoutine || "Non spécifié"}
${photoData ? "Photo de peau fournie pour analyse visuelle." : ""}

Génère une analyse complète avec:
- Un score de santé de la peau (0-100)
- Un résumé personnalisé
- 3-4 recommandations prioritaires
- Une routine matin (4-5 étapes)
- Une routine soir (4-5 étapes)
- 5-6 ingrédients recommandés (avec précautions pour peaux riches en mélanine)`
          : `Analyze this skin profile and generate personalized recommendations:

Skin Type: ${profile.skinType || "Not specified"}
Concerns: ${Array.isArray(profile.concerns) ? profile.concerns.join(", ") : profile.concerns || "None"}
Age Range: ${profile.ageRange || "Not specified"}
Sun Exposure: ${profile.sunExposure || "Not specified"}
Current Routine: ${profile.currentRoutine || "Not specified"}
${photoData ? "Skin photo provided for visual analysis." : ""}

Generate a complete analysis with:
- A skin health score (0-100)
- A personalized summary
- 3-4 priority recommendations
- A morning routine (4-5 steps)
- An evening routine (4-5 steps)
- 5-6 recommended ingredients (with cautions for melanin-rich skin)`;

        // Build content array
        const contentParts: any[] = [{ text: `${systemPrompt}\n\n${userPrompt}` }];

        // Add photo if provided
        if (photoData && typeof photoData === "string") {
          const { mimeType, base64 } = normalizeBase64(photoData);
          contentParts.push({
            inlineData: {
              data: base64,
              mimeType,
            },
          });
        }

        // Call Gemini
        const result = await model.generateContent(contentParts);
        const responseText = result?.response?.text?.() ?? "";

        if (!responseText) {
          return res.status(502).json({ ok: false, error: "Empty response from AI model." });
        }

        // Parse JSON response
        let analysisResult;
        try {
          let cleanContent = responseText.trim();
          if (cleanContent.startsWith("```json")) {
            cleanContent = cleanContent.slice(7);
          }
          if (cleanContent.startsWith("```")) {
            cleanContent = cleanContent.slice(3);
          }
          if (cleanContent.endsWith("```")) {
            cleanContent = cleanContent.slice(0, -3);
          }
          cleanContent = cleanContent.trim();

          analysisResult = JSON.parse(cleanContent);
        } catch (parseError) {
          logger.error("Failed to parse AI response", { responseText });
          return res.status(502).json({ ok: false, error: "Invalid AI response format." });
        }

        return res.status(200).json(analysisResult);
      } catch (e: any) {
        logger.error("skinAnalysis error", safeError(e));
        const status = e?.statusCode && Number.isInteger(e.statusCode) ? e.statusCode : 500;
        return res.status(status).json({ ok: false, error: safeError(e).message });
      }
    });
  }
);

/**
 * analyzePhoto (legacy endpoint for simple photo analysis):
 * POST { imageBase64: string, prompt?: string, lang?: "en"|"fr" }
 * Returns: { ok: true, analysisText: string }
 */
export const analyzePhoto = onRequest(
  { region: "us-central1", timeoutSeconds: 60, memory: "512MiB" },
  async (req, res) => {
    corsHandler(req, res, async () => {
      try {
        assertPostJson(req);

        const { imageBase64, prompt, lang } = req.body ?? {};
        if (!imageBase64 || typeof imageBase64 !== "string") {
          return res.status(400).json({ ok: false, error: "Missing imageBase64 (string)." });
        }

        // Basic size guard (base64 expands ~33%). Keep under ~6MB base64 to be safe.
        if (imageBase64.length > 8_000_000) {
          return res.status(413).json({ ok: false, error: "Image too large. Please upload a smaller image." });
        }

        const { mimeType, base64 } = normalizeBase64(imageBase64);

        const client = await getGeminiClient();
        const model = client.getGenerativeModel({
          model: "gemini-1.5-flash",
        });

        // System-style instruction (keep it non-medical)
        const language = lang === "fr" ? "French" : "English";
        const basePrompt =
          prompt && typeof prompt === "string" && prompt.trim().length > 0
            ? prompt.trim()
            : `You are a premium cosmetic beauty coach specialized in melanin-rich skin.
Analyze the selfie for cosmetic insights only (NOT medical diagnosis). Be specific and actionable.
Return concise, structured recommendations (cleanser/treatment/moisturizer/SPF + 1-2 weekly actions) and include safety cautions for irritation/PIH risk.
Write in ${language}.`;

        // Gemini multimodal content
        const result = await model.generateContent([
          { text: basePrompt },
          {
            inlineData: {
              data: base64,
              mimeType,
            },
          },
        ]);

        const analysisText = result?.response?.text?.() ?? "";
        if (!analysisText) {
          return res.status(502).json({ ok: false, error: "Empty response from AI model." });
        }

        return res.status(200).json({ ok: true, analysisText });
      } catch (e: any) {
        logger.error("analyzePhoto error", safeError(e));
        const status = e?.statusCode && Number.isInteger(e.statusCode) ? e.statusCode : 500;
        return res.status(status).json({ ok: false, error: safeError(e).message });
      }
    });
  }
);
