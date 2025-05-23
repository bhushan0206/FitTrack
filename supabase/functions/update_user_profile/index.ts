import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "@shared/cors.ts";
import { executeSqlQuery } from "@shared/db.ts";
import { mapProfileFromDB } from "@shared/mappers.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId, profileData } = await req.json();

    // Validate input
    if (!userId || !profileData) {
      return new Response(
        JSON.stringify({ error: "userId and profileData are required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Build the SET clause dynamically based on provided fields
    const updateFields = [];

    if (profileData.name !== undefined) {
      updateFields.push(`name = '${profileData.name}'`);
    }

    if (profileData.age !== undefined) {
      updateFields.push(`age = ${profileData.age}`);
    }

    if (profileData.gender !== undefined) {
      updateFields.push(`gender = '${profileData.gender}'`);
    }

    if (profileData.weight !== undefined) {
      updateFields.push(`weight = ${profileData.weight}`);
    }

    if (profileData.height !== undefined) {
      updateFields.push(`height = ${profileData.height}`);
    }

    if (profileData.fitnessGoal !== undefined) {
      updateFields.push(`fitness_goal = '${profileData.fitnessGoal}'`);
    }

    if (profileData.theme !== undefined) {
      updateFields.push(`theme = '${profileData.theme}'`);
    }

    if (profileData.accentColor !== undefined) {
      updateFields.push(`accent_color = '${profileData.accentColor}'`);
    }

    // If no fields to update, return early
    if (updateFields.length === 0) {
      return new Response(JSON.stringify({ error: "No fields to update" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Prepare SQL query to update profile
    const query = `
      UPDATE profiles 
      SET ${updateFields.join(", ")} 
      WHERE id = '${userId}'
      RETURNING *;
    `;

    // Execute the query
    const result = await executeSqlQuery(query);
    const updatedProfile = result.data?.[0]
      ? mapProfileFromDB(result.data[0])
      : null;

    // If weight is updated, add to weight history
    if (profileData.weight !== undefined) {
      const weightId = crypto.randomUUID();
      const today = new Date().toISOString().split("T")[0];

      const weightQuery = `
        INSERT INTO weight_history (id, date, weight, user_id)
        VALUES ('${weightId}', '${today}', ${profileData.weight}, '${userId}');
      `;

      await executeSqlQuery(weightQuery);
    }

    return new Response(
      JSON.stringify({ success: true, profile: updatedProfile }),
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
