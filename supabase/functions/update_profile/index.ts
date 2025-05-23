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
    const params = [];

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

      // If weight is updated, add to weight history
      if (profileData.weight !== undefined) {
        const weightId = crypto.randomUUID();
        const today = new Date().toISOString().split("T")[0];

        const weightQuery = `
          INSERT INTO weight_history (id, date, weight, user_id)
          VALUES ('${weightId}', '${today}', ${profileData.weight}, '${userId}');
        `;

        await fetch(
          `https://api.picaos.com/v1/passthrough/v1/projects/${PROJECT_REF}/database/query`,
          {
            method: "POST",
            headers: {
              "x-pica-secret": PICA_SECRET_KEY,
              "x-pica-connection-key": PICA_SUPABASE_CONNECTION_KEY,
              "x-pica-action-id": ACTION_ID,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query: weightQuery }),
          },
        );
      }

      return new Response(
        JSON.stringify({ success: true, profile: data.data?.[0] || null }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
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
