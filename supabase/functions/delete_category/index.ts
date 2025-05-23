import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "@shared/cors.ts";
import { executeSqlQuery } from "@shared/db.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { categoryId, userId } = await req.json();

    // Validate input
    if (!categoryId || !userId) {
      return new Response(
        JSON.stringify({ error: "Category ID and userId are required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // First delete all logs for this category
    const deleteLogsQuery = `
      DELETE FROM logs
      WHERE category_id = '${categoryId}' AND user_id = '${userId}';
    `;
    await executeSqlQuery(deleteLogsQuery);

    // Then delete the category
    const deleteCategoryQuery = `
      DELETE FROM categories
      WHERE id = '${categoryId}' AND user_id = '${userId}'
      RETURNING id;
    `;

    const result = await executeSqlQuery(deleteCategoryQuery);
    const deletedId = result.data?.[0]?.id;

    if (!deletedId) {
      return new Response(
        JSON.stringify({ error: "Category not found or not owned by user" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        },
      );
    }

    return new Response(JSON.stringify({ success: true, deletedId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
