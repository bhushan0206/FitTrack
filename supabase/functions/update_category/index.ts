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
    if (!category || !userId || !category.id) {
      return new Response(
        JSON.stringify({
          error: "Category data with ID and userId are required",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Prepare SQL query to update category
    const query = `
      UPDATE categories
      SET 
        name = '${category.name}',
        unit = '${category.unit}',
        daily_target = ${category.dailyTarget},
        color = '${category.color || "#3b82f6"}',
        exercise_type = '${category.exerciseType || "other"}'
      WHERE 
        id = '${category.id}' AND
        user_id = '${userId}'
      RETURNING *;
    `;

    // Execute the query
    const result = await executeSqlQuery(query);
    const updatedCategory = result.data?.[0]
      ? mapCategoryFromDB(result.data[0])
      : null;

    if (!updatedCategory) {
      return new Response(
        JSON.stringify({ error: "Category not found or not owned by user" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        },
      );
    }

    return new Response(
      JSON.stringify({ success: true, category: updatedCategory }),
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
