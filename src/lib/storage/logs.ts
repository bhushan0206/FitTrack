import { supabaseAdmin } from '../supabaseAdmin';
import { DailyLog, UserProfile } from "@/types/fitness";

// Add or update a log entry
export const addLogEntry = async (
  log: DailyLog,
  userId: string,
  getProfile: (uid: string) => Promise<UserProfile | null>
): Promise<UserProfile | null> => {
  try {
    if (!userId) throw new Error("User not authenticated");
    
    // Check if log exists for same category on the same day
    const { data: existingLogs } = await supabaseAdmin
      .from("logs")
      .select("*")
      .eq("user_id", userId)
      .eq("category_id", log.categoryId)
      .eq("date", log.date);
    
    if (existingLogs && existingLogs.length > 0) {
      // Update existing log instead of creating a new one
      const { data, error } = await supabaseAdmin
        .from("logs")
        .update({
          value: log.value,
          notes: log.notes,
        })
        .eq("id", existingLogs[0].id)
        .select()
        .single();
      
      if (error) throw error;
    } else {
      // Insert new log if no existing log found
      const { data, error } = await supabaseAdmin
        .from("logs")
        .insert({
          id: log.id,
          category_id: log.categoryId,
          user_id: userId,
          date: log.date,
          value: log.value,
          notes: log.notes,
        })
        .select()
        .single();

      if (error) throw error;
    }

    return await getProfile(userId);
  } catch (error) {
    // Remove sensitive log data from console
    console.error("Error adding log entry");
    return null;
  }
};

// Update an existing log entry
export const updateLogEntry = async (
  log: DailyLog,
  userId: string,
  getProfile: (uid: string) => Promise<UserProfile | null>
): Promise<UserProfile | null> => {
  try {
    if (!userId) throw new Error("User not authenticated");

    const { data, error } = await supabaseAdmin
      .from("logs")
      .update({
        category_id: log.categoryId,
        date: log.date,
        value: log.value,
        notes: log.notes,
      })
      .eq("id", log.id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return await getProfile(userId);
  } catch (error) {
    console.error("Error updating log entry:", error);
    return null;
  }
};

// Delete a log entry
export const deleteLogEntry = async (
  logId: string,
  userId: string,
  getProfile: (uid: string) => Promise<UserProfile | null>
): Promise<UserProfile | null> => {
  try {
    if (!userId) throw new Error("User not authenticated");

    const { error } = await supabaseAdmin
      .from("logs")
      .delete()
      .eq("id", logId)
      .eq("user_id", userId);

    if (error) throw error;
    return await getProfile(userId);
  } catch (error) {
    console.error("Error deleting log entry:", error);
    return null;
  }
};
