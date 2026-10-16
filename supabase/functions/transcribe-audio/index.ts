import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { audioBase64, mimeType } = await req.json();

    if (!audioBase64) {
      return new Response(
        JSON.stringify({ success: false, error: "Audio requerido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const detectedMime = mimeType || "audio/webm";
    const binaryString = atob(audioBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // --- Provider 1: Groq Whisper Large v3 (Más potente y ultrarrápido ~350ms en LPU) ---
    const groqKey = Deno.env.get("GROQ_API_KEY") || Deno.env.get("GROQ_API_KEY2");
    if (groqKey) {
      try {
        const groqFormData = new FormData();
        const ext = detectedMime.includes("mp4") ? "m4a" : detectedMime.includes("wav") ? "wav" : "webm";
        groqFormData.append("file", new Blob([bytes], { type: detectedMime }), `audio.${ext}`);
        groqFormData.append("model", "whisper-large-v3");
        groqFormData.append("language", "es");
        groqFormData.append("response_format", "json");

        const groqRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${groqKey}` },
          body: groqFormData,
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          if (groqData.text && groqData.text.trim()) {
            return new Response(
              JSON.stringify({ text: groqData.text.trim(), provider: "Groq Whisper Large v3", success: true }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
          }
        }
        console.warn("Groq Whisper falló, probando Cloudflare Whisper...");
      } catch (groqErr) {
        console.warn("Error Groq Whisper:", groqErr instanceof Error ? groqErr.message : groqErr);
      }
    }

    // --- Provider 2: Cloudflare Whisper Large v3 Turbo ---
    const cfToken = Deno.env.get("CF_API_TOKEN");
    const cfAccount = Deno.env.get("CF_ACCOUNT_ID");

    if (cfToken && cfAccount) {
      try {
        const formData = new FormData();
        formData.append("audio", new Blob([bytes], { type: detectedMime }));

        const cfResponse = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${cfAccount}/ai/run/@cf/openai/whisper-large-v3-turbo`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${cfToken}` },
            body: formData,
          },
        );

        if (cfResponse.ok) {
          const cfData = await cfResponse.json();
          if (cfData.success && cfData.result?.text) {
            const text = cfData.result.text.trim();
            if (text) {
              return new Response(
                JSON.stringify({ text, provider: "Cloudflare Whisper Turbo", success: true }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
              );
            }
          }
        }
        console.warn("Cloudflare Whisper falló, probando Gemini Audio Multimodal...");
      } catch (cfError) {
        console.warn("Error Cloudflare Whisper:", cfError instanceof Error ? cfError.message : cfError);
      }
    }

    // --- Provider 3: Gemini Multimodal Audio (Flash) ---
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (geminiKey) {
      const GEMINI_MODELS = [
        "gemini-3.6-flash",
        "gemini-3.5-flash-lite",
        "gemini-3.1-flash",
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
      ];

      for (const model of GEMINI_MODELS) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
          const geminiRes = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      inline_data: {
                        mime_type: detectedMime,
                        data: audioBase64,
                      },
                    },
                    {
                      text: "Transcribe exactamente este audio en español. Es una nota de voz clínica para fisioterapia. Devuelve únicamente el texto transcrito, sin notas ni explicaciones.",
                    },
                  ],
                },
              ],
              generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
            }),
          });

          if (geminiRes.ok) {
            const geminiData = await geminiRes.json();
            const responseText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (responseText && responseText.trim()) {
              return new Response(
                JSON.stringify({ text: responseText.trim(), provider: `Gemini Multimodal (${model})`, success: true }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
              );
            }
          }
        } catch (gemErr) {
          console.warn(`Error Gemini (${model}):`, gemErr);
        }
      }
    }

    // --- Provider 4: Hugging Face Whisper Large v3 ---
    const hfToken = Deno.env.get("HF_API_TOKEN") || Deno.env.get("HF_API_TOKEN2");
    if (hfToken) {
      try {
        const hfRes = await fetch("https://api-inference.huggingface.co/models/openai/whisper-large-v3", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${hfToken}`,
            "Content-Type": detectedMime,
          },
          body: bytes,
        });

        if (hfRes.ok) {
          const hfData = await hfRes.json();
          const text = hfData?.text;
          if (text && text.trim()) {
            return new Response(
              JSON.stringify({ text: text.trim(), provider: "HuggingFace Whisper Large v3", success: true }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
          }
        }
      } catch (hfErr) {
        console.warn("Error HuggingFace Whisper:", hfErr);
      }
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: "Todos los proveedores de transcripción en cascada (Groq, Cloudflare, Gemini, HuggingFace) fallaron o no están configurados.",
      }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error?.message || "Error interno al procesar audio" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
