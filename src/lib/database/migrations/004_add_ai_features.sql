-- AI Features Migration - Independent of existing schema
-- This migration adds AI-related tables without modifying existing structure

-- Create AI conversations table for storing chat history
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT DEFAULT 'New Conversation',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create AI messages table for storing individual messages
CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'suggestion', 'workout_plan', 'nutrition_advice')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE
);

-- Create AI suggestions table for personalized recommendations
CREATE TABLE IF NOT EXISTS ai_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('workout', 'nutrition', 'goal', 'habit', 'recovery')),
    title TEXT NOT NULL,
    description TEXT,
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'dismissed', 'completed')),
    data JSONB DEFAULT '{}',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create AI model configurations table for different AI providers
-- Updated to include 'groq' in the provider constraint
CREATE TABLE IF NOT EXISTS ai_model_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    provider TEXT NOT NULL CHECK (provider IN ('ollama', 'openai', 'anthropic', 'huggingface', 'groq', 'replicate', 'custom')),
    model_name TEXT NOT NULL,
    endpoint_url TEXT,
    api_key_required BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- If the table already exists, we need to update the constraint
-- Drop the existing constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'ai_model_configs_provider_check' 
               AND table_name = 'ai_model_configs') THEN
        ALTER TABLE ai_model_configs DROP CONSTRAINT ai_model_configs_provider_check;
    END IF;
END $$;

-- Add the updated constraint that includes 'groq' and 'replicate'
ALTER TABLE ai_model_configs ADD CONSTRAINT ai_model_configs_provider_check 
CHECK (provider IN ('ollama', 'openai', 'anthropic', 'huggingface', 'groq', 'replicate', 'custom'));

-- Create AI usage tracking table for analytics and rate limiting
CREATE TABLE IF NOT EXISTS ai_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    model_config_id UUID NOT NULL,
    request_type TEXT NOT NULL CHECK (request_type IN ('chat', 'suggestion', 'analysis')),
    tokens_used INTEGER DEFAULT 0,
    response_time_ms INTEGER,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    FOREIGN KEY (model_config_id) REFERENCES ai_model_configs(id) ON DELETE RESTRICT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_active ON ai_conversations(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON ai_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_user_id ON ai_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_status ON ai_suggestions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_type ON ai_suggestions(user_id, suggestion_type);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id ON ai_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created_at ON ai_usage(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_conversations
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_conversations' AND policyname = 'ai_conversations_select_policy') THEN
        CREATE POLICY "ai_conversations_select_policy" ON ai_conversations FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_conversations' AND policyname = 'ai_conversations_insert_policy') THEN
        CREATE POLICY "ai_conversations_insert_policy" ON ai_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_conversations' AND policyname = 'ai_conversations_update_policy') THEN
        CREATE POLICY "ai_conversations_update_policy" ON ai_conversations FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_conversations' AND policyname = 'ai_conversations_delete_policy') THEN
        CREATE POLICY "ai_conversations_delete_policy" ON ai_conversations FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- RLS Policies for ai_messages
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_messages' AND policyname = 'ai_messages_select_policy') THEN
        CREATE POLICY "ai_messages_select_policy" ON ai_messages FOR SELECT USING (
            conversation_id IN (SELECT id FROM ai_conversations WHERE user_id = auth.uid())
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_messages' AND policyname = 'ai_messages_insert_policy') THEN
        CREATE POLICY "ai_messages_insert_policy" ON ai_messages FOR INSERT WITH CHECK (
            conversation_id IN (SELECT id FROM ai_conversations WHERE user_id = auth.uid())
        );
    END IF;
END $$;

-- RLS Policies for ai_suggestions
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_suggestions' AND policyname = 'ai_suggestions_select_policy') THEN
        CREATE POLICY "ai_suggestions_select_policy" ON ai_suggestions FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_suggestions' AND policyname = 'ai_suggestions_insert_policy') THEN
        CREATE POLICY "ai_suggestions_insert_policy" ON ai_suggestions FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_suggestions' AND policyname = 'ai_suggestions_update_policy') THEN
        CREATE POLICY "ai_suggestions_update_policy" ON ai_suggestions FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_suggestions' AND policyname = 'ai_suggestions_delete_policy') THEN
        CREATE POLICY "ai_suggestions_delete_policy" ON ai_suggestions FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- RLS Policies for ai_usage (users can only see their own usage)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_usage' AND policyname = 'ai_usage_select_policy') THEN
        CREATE POLICY "ai_usage_select_policy" ON ai_usage FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_usage' AND policyname = 'ai_usage_insert_policy') THEN
        CREATE POLICY "ai_usage_insert_policy" ON ai_usage FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE ai_conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE ai_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE ai_suggestions TO authenticated;
GRANT SELECT, INSERT ON TABLE ai_usage TO authenticated;
GRANT SELECT ON TABLE ai_model_configs TO authenticated, anon;

-- Clear existing configs safely
DELETE FROM ai_model_configs WHERE provider IN ('groq', 'replicate');

-- Insert default AI model configurations for cloud deployment
INSERT INTO ai_model_configs (name, provider, model_name, endpoint_url, api_key_required, configuration) VALUES
('Groq Llama 3 (Free)', 'groq', 'llama3-8b-8192', 'https://api.groq.com/openai/v1', true, '{"temperature": 0.7, "max_tokens": 1000, "description": "Fast, free inference with Groq"}'),
('Groq Mixtral (Free)', 'groq', 'mixtral-8x7b-32768', 'https://api.groq.com/openai/v1', true, '{"temperature": 0.7, "max_tokens": 1000, "description": "Larger context window"}'),
('HuggingFace DialoGPT (Free)', 'huggingface', 'microsoft/DialoGPT-medium', 'https://api-inference.huggingface.co', false, '{"temperature": 0.7, "max_tokens": 1000, "description": "Free tier with rate limits"}'),
('HuggingFace Llama 2 (Free)', 'huggingface', 'meta-llama/Llama-2-7b-chat-hf', 'https://api-inference.huggingface.co', false, '{"temperature": 0.7, "max_tokens": 1000, "description": "Free Llama 2 model"}'),
('OpenAI GPT-3.5 (Paid)', 'openai', 'gpt-3.5-turbo', 'https://api.openai.com/v1', true, '{"temperature": 0.7, "max_tokens": 1000, "description": "Reliable paid option"}'),
('Replicate Llama 2 (Pay-per-use)', 'replicate', 'meta/llama-2-70b-chat', 'https://api.replicate.com/v1', true, '{"temperature": 0.7, "max_tokens": 1000, "description": "Pay only for what you use"}')
ON CONFLICT (name) DO UPDATE SET
    provider = EXCLUDED.provider,
    model_name = EXCLUDED.model_name,
    endpoint_url = EXCLUDED.endpoint_url,
    api_key_required = EXCLUDED.api_key_required,
    configuration = EXCLUDED.configuration,
    updated_at = NOW();

-- Create a function to automatically clean up old conversations (optional)
CREATE OR REPLACE FUNCTION cleanup_old_ai_conversations()
RETURNS void AS $$
BEGIN
    -- Delete conversations older than 90 days that are not active
    DELETE FROM ai_conversations 
    WHERE created_at < NOW() - INTERVAL '90 days' 
    AND is_active = false;
    
    -- Delete orphaned messages (shouldn't happen with foreign keys, but safety measure)
    DELETE FROM ai_messages 
    WHERE conversation_id NOT IN (SELECT id FROM ai_conversations);
END;
$$ LANGUAGE plpgsql;

-- Log successful migration
DO $$
BEGIN
    RAISE LOG 'AI features migration completed successfully';
END $$;
