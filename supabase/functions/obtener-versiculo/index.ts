import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY")!
);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    let categoria = "general";

    if (req.method === "POST") {
      try {
        const body = await req.json();
        if (body && body.categoria) {
          categoria = body.categoria;
        }
      } catch {
        // use default
      }
    } else {
      const url = new URL(req.url);
      const q = url.searchParams.get("categoria");
      if (q) categoria = q;
    }

    let query = supabase
      .from("versiculos")
      .select("id, cita, texto, categoria")
      .limit(30);

    if (categoria && categoria !== "general") {
      query = query.eq("categoria", categoria);
    }

    const { data, error } = await query;

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!data || data.length === 0) {
      // Fallback básico si la tabla estuviera vacía
      return new Response(
        JSON.stringify({
          cita: "Filipenses 4:13",
          texto: "Todo lo puedo en Cristo que me fortalece.",
          categoria: "fortaleza",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const randomItem = data[Math.floor(Math.random() * data.length)];

    return new Response(JSON.stringify(randomItem), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
