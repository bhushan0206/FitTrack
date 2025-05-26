import { supabase } from "@/lib/supabase";
import {
  AIConversation,
  AIMessage,
  AISuggestion,
  AIModelConfig,
} from "@/types/ai";

export const aiStorage = {
  // Conversations
  async getConversations(): Promise<AIConversation[]> {
    const { data, error } = await supabase
      .from("ai_conversations")
      .select(
        `
        *,
        ai_messages (
          id,
          role,
          content,
          message_type,
          created_at
        )
      `
      )
      .eq("is_active", true)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return (
      data?.map((conv) => ({
        ...conv,
        messages: conv.ai_messages || [],
        last_message: conv.ai_messages?.[conv.ai_messages.length - 1] || null,
      })) || []
    );
  },

  async createConversation(title?: string): Promise<AIConversation> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("ai_conversations")
      .insert({
        user_id: user.id,
        title: title || "New Conversation",
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return { ...data, messages: [] };
  },

  async updateConversation(
    id: string,
    updates: Partial<AIConversation>
  ): Promise<void> {
    const { error } = await supabase
      .from("ai_conversations")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  },

  async deleteConversation(id: string): Promise<void> {
    const { error } = await supabase
      .from("ai_conversations")
      .update({ is_active: false })
      .eq("id", id);

    if (error) throw error;
  },

  // Messages
  async getMessages(conversationId: string): Promise<AIMessage[]> {
    const { data, error } = await supabase
      .from("ai_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async addMessage(
    message: Omit<AIMessage, "id" | "created_at">
  ): Promise<AIMessage> {
    const { data, error } = await supabase
      .from("ai_messages")
      .insert(message)
      .select()
      .single();

    if (error) throw error;

    // Update conversation timestamp
    await this.updateConversation(message.conversation_id, {
      updated_at: new Date().toISOString(),
    });

    return data;
  },

  // Model Configurations
  async getModelConfigs(): Promise<AIModelConfig[]> {
    const { data, error } = await supabase
      .from("ai_model_configs")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) throw error;
    return data || [];
  },

  // Usage tracking
  async trackUsage(
    modelConfigId: string,
    requestType: string,
    tokensUsed: number,
    responseTimeMs: number,
    success: boolean,
    errorMessage?: string
  ): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("ai_usage").insert({
      user_id: user.id,
      model_config_id: modelConfigId,
      request_type: requestType,
      tokens_used: tokensUsed,
      response_time_ms: responseTimeMs,
      success,
      error_message: errorMessage,
    });

    if (error) console.error("Failed to track AI usage:", error);
  },
};
