import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profile, language } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const systemPrompt = language === 'fr' 
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

    const userPrompt = language === 'fr'
      ? `Analyse ce profil de peau et génère des recommandations personnalisées:

Type de peau: ${profile.skinType}
Préoccupations: ${profile.concerns.join(', ')}
Tranche d'âge: ${profile.ageRange}
Exposition au soleil: ${profile.sunExposure}
Routine actuelle: ${profile.currentRoutine}
${profile.photoData ? 'Photo de peau fournie pour analyse visuelle.' : ''}

Génère une analyse complète avec:
- Un score de santé de la peau (0-100)
- Un résumé personnalisé
- 3-4 recommandations prioritaires
- Une routine matin (4-5 étapes)
- Une routine soir (4-5 étapes)  
- 5-6 ingrédients recommandés (avec précautions pour peaux riches en mélanine)`
      : `Analyze this skin profile and generate personalized recommendations:

Skin Type: ${profile.skinType}
Concerns: ${profile.concerns.join(', ')}
Age Range: ${profile.ageRange}
Sun Exposure: ${profile.sunExposure}
Current Routine: ${profile.currentRoutine}
${profile.photoData ? 'Skin photo provided for visual analysis.' : ''}

Generate a complete analysis with:
- A skin health score (0-100)
- A personalized summary
- 3-4 priority recommendations
- A morning routine (4-5 steps)
- An evening routine (4-5 steps)
- 5-6 recommended ingredients (with cautions for melanin-rich skin)`;

    // Build Gemini API request
    const parts: Array<{text?: string; inline_data?: {mime_type: string; data: string}}> = [
      { text: `${systemPrompt}\n\n${userPrompt}` }
    ];

    // If photo is provided, include it as inline data
    if (profile.photoData) {
      // Extract base64 data from data URL (format: data:image/jpeg;base64,...)
      const matches = profile.photoData.match(/^data:image\/(\w+);base64,(.+)$/);
      if (matches) {
        const mimeType = `image/${matches[1]}`;
        const base64Data = matches[2];
        parts.push({
          inline_data: {
            mime_type: mimeType,
            data: base64Data
          }
        });
      }
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts
        }]
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to generate analysis" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      console.error("Invalid AI response structure:", JSON.stringify(data));
      throw new Error("No content in AI response");
    }

    // Parse the JSON response
    let analysisResult;
    try {
      // Clean up the response - remove any markdown formatting
      let cleanContent = content.trim();
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
      console.error("Failed to parse AI response:", content);
      throw new Error("Invalid AI response format");
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Skin analysis error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
