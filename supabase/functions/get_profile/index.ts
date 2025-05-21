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
    const { userId } = await req.json();

    // Validate input
    if (!userId) {
      return new Response(JSON.stringify({ error: "userId is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Prepare SQL query to get user profile
    const profileQuery = `
      SELECT * FROM profiles WHERE id = '${userId}';
    `;

    // Execute the query using Pica passthrough
    const PICA_SECRET_KEY = Deno.env.get("PICA_SECRET_KEY");
    const PICA_SUPABASE_CONNECTION_KEY = Deno.env.get(
      "PICA_SUPABASE_CONNECTION_KEY",
    );
    const PROJECT_REF = Deno.env.get("SUPABASE_PROJECT_ID");
    const ACTION_ID = "conn_mod_def::GC40SckOddE::NFFu2-49QLyGsPBdfweitg";

    const profileResponse = await fetch(
      `https://api.picaos.com/v1/passthrough/v1/projects/${PROJECT_REF}/database/query`,
      {
        method: "POST",
        headers: {
          "x-pica-secret": PICA_SECRET_KEY,
          "x-pica-connection-key": PICA_SUPABASE_CONNECTION_KEY,
          "x-pica-action-id": ACTION_ID,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: profileQuery }),
      },
    );

    if (profileResponse.status !== 201) {
      const error = await profileResponse.text();
      return new Response(
        JSON.stringify({ error: `Database error: ${error}` }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    const profileData = await profileResponse.json();
    const profile = profileData.data?.[0] || null;

    // If no profile found, return null
    if (!profile) {
      return new Response(JSON.stringify({ success: true, profile: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Get categories
    const categoriesQuery = `
      SELECT * FROM categories WHERE user_id = '${userId}';
    `;

    const categoriesResponse = await fetch(
      `https://api.picaos.com/v1/passthrough/v1/projects/${PROJECT_REF}/database/query`,
      {
        method: "POST",
        headers: {
          "x-pica-secret": PICA_SECRET_KEY,
          "x-pica-connection-key": PICA_SUPABASE_CONNECTION_KEY,
          "x-pica-action-id": ACTION_ID,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: categoriesQuery }),
      },
    );

    const categoriesData = await categoriesResponse.json();
    const categories = categoriesData.data || [];

    // Get weight history
    const weightQuery = `
      SELECT * FROM weight_history 
      WHERE user_id = '${userId}' 
      ORDER BY date DESC;
    `;

    const weightResponse = await fetch(
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

    const weightData = await weightResponse.json();
    const weightHistory = weightData.data || [];

    // Map database objects to app objects
    const mappedCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      unit: category.unit,
      dailyTarget: category.daily_target,
      color: category.color,
      exerciseType: category.exercise_type,
    }));

    const mappedWeightHistory = weightHistory.map((record) => ({
      id: record.id,
      date: record.date,
      weight: record.weight,
    }));

    // Construct the full user profile
    const fullProfile = {
      id: profile.id,
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      weight: profile.weight,
      height: profile.height,
      fitnessGoal: profile.fitness_goal,
      theme: profile.theme || "light",
      accentColor: profile.accent_color || "#3b82f6",
      categories: mappedCategories,
      weightHistory: mappedWeightHistory,
      logs: [],
      streaks: [],
      badges: [],
      goals: [],
      habits: [],
      friends: [],
      reminders: [],
    };

    return new Response(
      JSON.stringify({ success: true, profile: fullProfile }),
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
