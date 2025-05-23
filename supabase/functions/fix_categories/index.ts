import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { categoryData, userId } = await req.json();

    // Validate input
    if (!categoryData || !userId) {
      return new Response(
        JSON.stringify({ error: "Category data and userId are required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Prepare SQL query to insert or update category
    const query = `
      INSERT INTO categories (
        id, name, unit, daily_target, color, exercise_type, user_id
      ) VALUES (
        '${categoryData.id}', 
        '${categoryData.name}', 
        '${categoryData.unit}', 
        ${categoryData.dailyTarget}, 
        '${categoryData.color || "#3b82f6"}', 
        '${categoryData.exerciseType || "other"}', 
        '${userId}'
      ) 
      ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name,
        unit = EXCLUDED.unit,
        daily_target = EXCLUDED.daily_target,
        color = EXCLUDED.color,
        exercise_type = EXCLUDED.exercise_type
      RETURNING *;
    `;

    // Execute the query using Pica passthrough
    const PICA_SECRET_KEY = Deno.env.get("PICA_SECRET_KEY");
    const PICA_SUPABASE_CONNECTION_KEY = Deno.env.get(
      "PICA_SUPABASE_CONNECTION_KEY",
    );
    const PROJECT_REF = Deno.env.get("SUPABASE_PROJECT_ID");
    const ACTION_ID = "conn_mod_def::GC40SckOddE::NFFu2-49QLyGsPBdfweitg";

    const response = await fetch(
      `https://api.picaos.com/v1/passthrough/v1/projects/${PROJECT_REF}/database/query`,
      {
        method: "POST",
        headers: {
          "x-pica-secret": PICA_SECRET_KEY,
          "x-pica-connection-key": PICA_SUPABASE_CONNECTION_KEY,
          "x-pica-action-id": ACTION_ID,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      },
    );

    if (response.status === 201) {
      const data = await response.json();
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      const error = await response.text();
      return new Response(
        JSON.stringify({ error: `Database error: ${error}` }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
