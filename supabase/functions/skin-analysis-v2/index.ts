import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ============================================================================
// Enhanced Gemini Analysis Endpoint for Dr Beauté Noire v2
// 360 Beauty Coach for Melanin-Rich Skin
// ============================================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profile, latest_check_in, photos, language } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build comprehensive context
    const context = {
      profile: profile || {},
      check_in_history: latest_check_in ? {
        session_count: 1,
        last_check_in: latest_check_in.session_date,
        previous_score: latest_check_in.overall_score,
        previous_concerns: latest_check_in.derived_features?.detected_concerns || [],
      } : null,
      photos_provided: !!photos,
    };

    const systemPrompt = language === 'fr'
      ? `Tu es un dermatologue expert spécialisé dans les soins des peaux riches en mélanine. Tu es maintenant un coach beauté 360° qui fournit des conseils personnalisés, professionnels et non génériques.

DIRECTIVES CRITIQUES:
1. Ceci est un conseil cosmétique UNIQUEMENT, PAS un diagnostic médical.
2. Si tu détectes des signes graves (acné sévère/kystique, changements cutanés rapides, irritation persistante), recommande de consulter un dermatologue.
3. Fournis des recommandations spécifiques, pas génériques.
4. Pour chaque étape clé (nettoyant/traitement/hydratant/SPF), fournis EXACTEMENT 3 choix de produits:
   - Meilleur choix (best)
   - Option budget (budget)
   - Option premium (premium)
5. Inclus des orientations sur les outils & actions (massage, gua sha, rouleau, etc.) avec durée, fréquence et règles d'arrêt.
6. Adapte les routines selon:
   - Type de peau & sensibilité
   - Préoccupations principales (max 3)
   - Climat (humide/sec/froid/chaud)
   - Budget (budget/standard/premium)
   - Historique des check-ins si disponible

STRUCTURE DE RÉPONSE (JSON STRICT, sans backticks, sans texte supplémentaire):
{
  "overall_score": 85,
  "summary": "Résumé personnalisé basé sur l'analyse...",
  "derived_features": {
    "uneven_tone_score": 75,
    "texture_score": 80,
    "oiliness_score": 60,
    "barrier_comfort_score": 85,
    "detected_concerns": ["hyperpigmentation", "brillance"],
    "ai_notes": "Notes détaillées..."
  },
  "routine": {
    "morning": [
      {
        "step_order": 1,
        "category": "cleanser",
        "title": "Nettoyer",
        "instructions": "Instructions détaillées...",
        "timing": "30 secondes",
        "products": {
          "best": {
            "product_name": "Nom du produit",
            "brand": "Marque",
            "key_ingredients": ["ingredient1", "ingredient2"],
            "why_recommended": "Pourquoi ce produit convient...",
            "how_to_use": "Comment utiliser...",
            "cautions": "Précautions (test patch, etc.)",
            "alternatives": ["Alternative 1", "Alternative 2"],
            "estimated_price": 25.00
          },
          "budget": { ... },
          "premium": { ... }
        }
      }
    ],
    "midday": [ ... optional ... ],
    "evening": [ ... ],
    "weekly": [ ... ]
  },
  "tools_and_actions": [
    {
      "tool": "Massage facial",
      "instructions": "Techniques...",
      "duration": "2-3 minutes",
      "frequency": "Quotidien",
      "stop_if": "Rougeur ou irritation"
    }
  ],
  "nutrition_basics": {
    "hydration": "Conseil...",
    "anti_inflammatory": "Aliments...",
    "protein_fiber": "Équilibre..."
  },
  "safety_notes": [
    "Ceci est un conseil cosmétique uniquement, pas un diagnostic médical.",
    "Consultez un dermatologue si: acné sévère, changements rapides, irritation persistante."
  ]
}`
      : `You are an expert dermatologist specializing in melanin-rich skin care. You are now a 360° beauty coach providing personalized, professional, and non-generic guidance.

CRITICAL DIRECTIVES:
1. This is cosmetic guidance ONLY, NOT medical diagnosis.
2. If you detect serious signs (severe/cystic acne, rapid skin changes, persistent irritation), recommend seeing a dermatologist.
3. Provide specific, not generic, recommendations.
4. For each key step (cleanser/treatment/moisturizer/SPF), provide EXACTLY 3 product picks:
   - Best pick (best)
   - Budget pick (budget)
   - Premium pick (premium)
5. Include tools & actions guidance (massage, gua sha, roller, etc.) with duration, frequency, and stop rules.
6. Adapt routines based on:
   - Skin type & sensitivity
   - Main concerns (max 3)
   - Climate (humid/dry/cold/hot)
   - Budget tier (budget/standard/premium)
   - Check-in history if available

RESPONSE STRUCTURE (STRICT JSON, no backticks, no extra text):
{
  "overall_score": 85,
  "summary": "Personalized summary based on analysis...",
  "derived_features": {
    "uneven_tone_score": 75,
    "texture_score": 80,
    "oiliness_score": 60,
    "barrier_comfort_score": 85,
    "detected_concerns": ["hyperpigmentation", "shine"],
    "ai_notes": "Detailed notes..."
  },
  "routine": {
    "morning": [
      {
        "step_order": 1,
        "category": "cleanser",
        "title": "Cleanse",
        "instructions": "Detailed instructions...",
        "timing": "30 seconds",
        "products": {
          "best": {
            "product_name": "Product Name",
            "brand": "Brand",
            "key_ingredients": ["ingredient1", "ingredient2"],
            "why_recommended": "Why this product fits...",
            "how_to_use": "How to use...",
            "cautions": "Cautions (patch test, etc.)",
            "alternatives": ["Alternative 1", "Alternative 2"],
            "estimated_price": 25.00
          },
          "budget": { ... },
          "premium": { ... }
        }
      }
    ],
    "midday": [ ... optional ... ],
    "evening": [ ... ],
    "weekly": [ ... ]
  },
  "tools_and_actions": [
    {
      "tool": "Facial massage",
      "instructions": "Techniques...",
      "duration": "2-3 minutes",
      "frequency": "Daily",
      "stop_if": "Redness or irritation"
    }
  ],
  "nutrition_basics": {
    "hydration": "Guidance...",
    "anti_inflammatory": "Foods...",
    "protein_fiber": "Balance..."
  },
  "safety_notes": [
    "This is cosmetic guidance only, not medical diagnosis.",
    "See a dermatologist if: severe acne, rapid changes, persistent irritation."
  ]
}`;

    const userPrompt = language === 'fr'
      ? `Analyse ce profil et génère une routine personnalisée complète:

PROFIL:
- Type de peau: ${profile.skin_type || 'Non spécifié'}
- Sensibilité: ${profile.sensitivity || 'Non spécifié'}
- Préoccupations: ${(profile.concerns || []).join(', ') || 'Aucune'}
- Climat: ${profile.climate || 'Non spécifié'}
- Budget: ${profile.budget_tier || 'Standard'}
- Fréquence de rasage: ${profile.shaving_frequency || 'Non spécifié'}
- Allergies: ${(profile.allergies || []).join(', ') || 'Aucune'}
${context.check_in_history ? `
HISTORIQUE:
- Score précédent: ${context.check_in_history.previous_score}/100
- Préoccupations précédentes: ${context.check_in_history.previous_concerns.join(', ')}
` : ''}
${photos ? 'Photos de peau fournies pour analyse visuelle.' : ''}

Génère:
1. Score global (0-100) & résumé personnalisé
2. Scores de métriques dérivées (ton, texture, brillance, barrière)
3. Routine matin (≤4 étapes) avec 3 choix de produits par étape clé
4. Routine mi-journée (optionnel, principalement SPF)
5. Routine soir (≤4 étapes) avec 3 choix de produits
6. Routine hebdomadaire (≤3 éléments)
7. Outils & actions (massage, gua sha, etc.)
8. Bases nutrition (hydratation, anti-inflammatoire, protéines/fibres)
9. Notes de sécurité`
      : `Analyze this profile and generate a complete personalized routine:

PROFILE:
- Skin type: ${profile.skin_type || 'Not specified'}
- Sensitivity: ${profile.sensitivity || 'Not specified'}
- Concerns: ${(profile.concerns || []).join(', ') || 'None'}
- Climate: ${profile.climate || 'Not specified'}
- Budget tier: ${profile.budget_tier || 'Standard'}
- Shaving frequency: ${profile.shaving_frequency || 'Not specified'}
- Allergies: ${(profile.allergies || []).join(', ') || 'None'}
${context.check_in_history ? `
HISTORY:
- Previous score: ${context.check_in_history.previous_score}/100
- Previous concerns: ${context.check_in_history.previous_concerns.join(', ')}
` : ''}
${photos ? 'Skin photos provided for visual analysis.' : ''}

Generate:
1. Overall score (0-100) & personalized summary
2. Derived metric scores (tone, texture, shine, barrier)
3. Morning routine (≤4 steps) with 3 product picks per key step
4. Midday routine (optional, mainly SPF reapply)
5. Evening routine (≤4 steps) with 3 product picks
6. Weekly routine (≤3 items)
7. Tools & actions (massage, gua sha, etc.)
8. Nutrition basics (hydration, anti-inflammatory, protein/fiber)
9. Safety notes`;

    // Build messages array with vision support
    const messages: Array<{
      role: string;
      content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
    }> = [{ role: "system", content: systemPrompt }];

    // If photos provided, include them
    if (photos && (photos.front || photos.left || photos.right)) {
      const contentParts: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
        { type: "text", text: userPrompt },
      ];

      if (photos.front) contentParts.push({ type: "image_url", image_url: { url: photos.front } });
      if (photos.left) contentParts.push({ type: "image_url", image_url: { url: photos.left } });
      if (photos.right) contentParts.push({ type: "image_url", image_url: { url: photos.right } });

      messages.push({ role: "user", content: contentParts });
    } else {
      messages.push({ role: "user", content: userPrompt });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp",
        messages,
        temperature: 0.7,
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
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse JSON response
    let analysisResult;
    try {
      let cleanContent = content.trim();
      // Remove markdown formatting if present
      if (cleanContent.startsWith("```json")) cleanContent = cleanContent.slice(7);
      if (cleanContent.startsWith("```")) cleanContent = cleanContent.slice(3);
      if (cleanContent.endsWith("```")) cleanContent = cleanContent.slice(0, -3);
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
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
