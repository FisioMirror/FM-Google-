import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  let text = "";
  let lang = "es";

  try {
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      text = body.text || "";
      lang = body.lang || "es";
    } else {
      const url = new URL(req.url);
      text = url.searchParams.get("text") || "";
      lang = url.searchParams.get("lang") || "es";
    }

    if (!text || !text.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: "Texto requerido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let cleanText = text
      .replace(/#+\s*/g, "")
      .replace(/[*_~`]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
      .trim();

    if (cleanText.length > 400) {
      cleanText = cleanText.substring(0, 397) + "...";
    }

    // 1. Fish Audio API
    const fishKey = Deno.env.get("FISH_AUDIO_API_KEY") || Deno.env.get("OPENROUTER_API_KEY");
    if (fishKey) {
      try {
        const fishRes = await fetch("https://api.fish.audio/v1/tts", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${fishKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: cleanText,
            format: "mp3",
          }),
        });

        if (fishRes.ok) {
          const ab = await fishRes.arrayBuffer();
          if (ab.byteLength > 100) {
            const b64 = btoa(String.fromCharCode(...new Uint8Array(ab)));
            return new Response(
              JSON.stringify({
                success: true,
                provider: "Fish Audio S2.1 Pro",
                mimeType: "audio/mp3",
                audioBase64: `data:audio/mp3;base64,${b64}`,
              }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      } catch (e) {
        console.warn("Fish Audio edge error:", e);
      }
    }

    // 2. Neural Audio Stream
    try {
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=${encodeURIComponent(lang)}&client=tw-ob`;
      const res = await fetch(ttsUrl, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      if (res.ok) {
        const ab = await res.arrayBuffer();
        if (ab.byteLength > 100) {
          const b64 = btoa(String.fromCharCode(...new Uint8Array(ab)));
          return new Response(
            JSON.stringify({
              success: true,
              provider: "Neural Humanized Voice",
              mimeType: "audio/mpeg",
              audioBase64: `data:audio/mpeg;base64,${b64}`,
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    } catch (e) {
      console.warn("Neural edge error:", e);
    }

    return new Response(
      JSON.stringify({ success: false, fallback: "local_speech_synthesis" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err?.message || "Error al sintetizar voz" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
