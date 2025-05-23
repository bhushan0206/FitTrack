import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/backend';
import { supabase } from '../lib/supabase';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

// Type definition for Clerk webhook event data
type WebhookPayload = {
  data: {
    id: string;
    first_name?: string;
    username?: string;
    email_addresses: Array<{ email_address: string }>;
    created_at: string;
  };
  type: string;
};

export async function POST(req: Request) {
  const headerPayload = req.headers;
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify webhook signature
  const wh = new Webhook(webhookSecret || '');
  let evt: WebhookPayload;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookPayload;
  } catch (err) {
    return new Response('Invalid signature', { status: 400 });
  }

  switch (evt.type) {
    case 'user.created':
    case 'user.updated':
      await supabase
        .from('profiles')
        .upsert({
          id: evt.data.id,
          name: evt.data.first_name || evt.data.username,
          email: evt.data.email_addresses[0]?.email_address,
          created_at: evt.data.created_at,
          updated_at: new Date().toISOString(),
        });
      break;
      
    case 'user.deleted':
      await supabase
        .from('profiles')
        .delete()
        .eq('id', evt.data.id);
      break;
  }
  
  return new Response('Webhook processed', { status: 200 });
}
