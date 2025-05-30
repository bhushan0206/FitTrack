import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "@shared/cors.ts";
import { executeSqlQuery } from "@shared/db.ts";
import { mapCategoryFromDB } from "@shared/mappers.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { category, userId } = await req.json();

    // Validate input
    if (!category || !userId) {
      return new Response(
        JSON.stringify({ error: "Category data and userId are required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Prepare SQL query to insert category
    const query = `
      INSERT INTO categories (
        id, name, unit, daily_target, color, exercise_type, user_id
      ) VALUES (
        '${category.id}', 
        '${category.name}', 
        '${category.unit}', 
        ${category.dailyTarget}, 
        '${category.color || "#3b82f6"}', 
        '${category.exerciseType || "other"}', 
        '${userId}'
      ) 
      RETURNING *;
    `;

    // Execute the query
    const result = await executeSqlQuery(query);
    const insertedCategory = result.data?.[0]
      ? mapCategoryFromDB(result.data[0])
      : null;

    return new Response(
      JSON.stringify({ success: true, category: insertedCategory }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
