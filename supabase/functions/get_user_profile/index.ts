import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "@shared/cors.ts";
import { executeSqlQuery } from "@shared/db.ts";
import {
  mapCategoryFromDB,
  mapProfileFromDB,
  mapWeightRecordFromDB,
} from "@shared/mappers.ts";

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

    // Check if profile exists
    const profileQuery = `
      SELECT * FROM profiles WHERE id = '${userId}';
    `;
    const profileResult = await executeSqlQuery(profileQuery);
    let profile = profileResult.data?.[0]
      ? mapProfileFromDB(profileResult.data[0])
      : null;

    // If no profile exists, create one
    if (!profile) {
      const createProfileQuery = `
        INSERT INTO profiles (id, name, theme)
        VALUES ('${userId}', 'User', 'light')
        RETURNING *;
      `;
      const createResult = await executeSqlQuery(createProfileQuery);
      profile = createResult.data?.[0]
        ? mapProfileFromDB(createResult.data[0])
        : null;

      // Create default categories
      const defaultCategories = [
        {
          id: crypto.randomUUID(),
          name: "Steps",
          unit: "steps",
          daily_target: 10000,
          color: "#3b82f6",
          exercise_type: "cardio",
          user_id: userId,
        },
        {
          id: crypto.randomUUID(),
          name: "Water",
          unit: "glasses",
          daily_target: 8,
          color: "#06b6d4",
          exercise_type: "other",
          user_id: userId,
        },
        {
          id: crypto.randomUUID(),
          name: "Workout",
          unit: "minutes",
          daily_target: 30,
          color: "#10b981",
          exercise_type: "strength",
          user_id: userId,
        },
      ];

      const categoriesValues = defaultCategories
        .map(
          (cat) =>
            `('${cat.id}', '${cat.name}', '${cat.unit}', ${cat.daily_target}, '${cat.color}', '${cat.exercise_type}', '${cat.user_id}')`,
        )
        .join(",");

      const createCategoriesQuery = `
        INSERT INTO categories (id, name, unit, daily_target, color, exercise_type, user_id)
        VALUES ${categoriesValues}
        RETURNING *;
      `;
      await executeSqlQuery(createCategoriesQuery);
    }

    // Get categories
    const categoriesQuery = `
      SELECT * FROM categories WHERE user_id = '${userId}';
    `;
    const categoriesResult = await executeSqlQuery(categoriesQuery);
    const categories = categoriesResult.data
      ? categoriesResult.data.map(mapCategoryFromDB)
      : [];

    // Get weight history
    const weightQuery = `
      SELECT * FROM weight_history 
      WHERE user_id = '${userId}' 
      ORDER BY date DESC;
    `;
    const weightResult = await executeSqlQuery(weightQuery);
    const weightHistory = weightResult.data
      ? weightResult.data.map(mapWeightRecordFromDB)
      : [];

    // Construct the full user profile
    const fullProfile = {
      ...profile,
      categories,
      weightHistory,
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
