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
    const { userId } = await req.json();

    // Validate input
    if (!userId) {
      return new Response(JSON.stringify({ error: "userId is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Prepare SQL query to get categories for user
    const query = `
      SELECT * FROM categories WHERE user_id = '${userId}' ORDER BY name ASC;
    `;

    // Execute the query
    const result = await executeSqlQuery(query);
    const categories = result.data ? result.data.map(mapCategoryFromDB) : [];

    return new Response(JSON.stringify({ success: true, categories }), {
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
