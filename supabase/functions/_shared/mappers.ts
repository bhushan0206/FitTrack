export function mapCategoryFromDB(category: any) {
  return {
    id: category.id,
    name: category.name,
    unit: category.unit,
    dailyTarget: category.daily_target,
    color: category.color,
    exerciseType: category.exercise_type,
  };
}

export function mapProfileFromDB(profile: any) {
  return {
    id: profile.id,
    name: profile.name,
    age: profile.age,
    gender: profile.gender,
    weight: profile.weight,
    height: profile.height,
    fitnessGoal: profile.fitness_goal,
    theme: profile.theme || "light",
    accentColor: profile.accent_color || "#3b82f6",
  };
}

export function mapWeightRecordFromDB(record: any) {
  return {
    id: record.id,
    date: record.date,
    weight: record.weight,
  };
}
