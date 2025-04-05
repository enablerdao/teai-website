import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@12.0.0';

// Helper function to verify Stripe signature (adapted for Deno)
async function verifyStripeSignature(req: Request, bodyText: string): Promise<boolean> {
    const signature = req.headers.get('stripe-signature');
    const timestamp = req.headers.get('stripe-timestamp');
    const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';

    if (!signature || !timestamp || !secret) {
        console.error('Missing Stripe signature, timestamp, or webhook secret.');
        return false;
    }

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
    );

    const signedPayload = `${timestamp}.${bodyText}`;
    const payloadData = encoder.encode(signedPayload);

    const sigParts = signature.split(',');
    const signatureData = sigParts.find(part => part.startsWith('v1='))?.substring(3);

    if (!signatureData) {
        console.error('Could not extract v1 signature from header.');
        return false;
    }

    // Convert hex signature to ArrayBuffer
    const sigBuffer = new Uint8Array(signatureData.length / 2);
    for (let i = 0; i < signatureData.length; i += 2) {
        sigBuffer[i / 2] = parseInt(signatureData.substring(i, i + 2), 16);
    }

    const verified = await crypto.subtle.verify(
        'HMAC',
        key,
        sigBuffer,
        payloadData
    );

    // Optional: Check timestamp to prevent replay attacks
    const receivedTimestamp = parseInt(timestamp, 10);
    const tolerance = 300; // 5 minutes tolerance
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (Math.abs(currentTimestamp - receivedTimestamp) > tolerance) {
        console.warn('Stripe webhook timestamp differs significantly from server time:', { receivedTimestamp, currentTimestamp });
        // Depending on policy, you might want to return false here
    }

    return verified;
}

serve(async (req) => {
  try {
    const bodyText = await req.text(); // Read body once

    // Verify signature manually
    const signatureVerified = await verifyStripeSignature(req, bodyText);
    if (!signatureVerified) {
        console.error('Stripe signature verification failed.');
        return new Response(JSON.stringify({ error: 'Signature verification failed' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    // Parse the event body AFTER verifying signature
    const event = JSON.parse(bodyText);

    // checkout.session.completed イベントを処理
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      const userId = session.metadata?.userId;
      const creditsStr = session.metadata?.credits;
      
      if (!userId || !creditsStr) {
          console.error('Missing metadata in Stripe session:', session.id, session.metadata);
          // Return 200 OK to Stripe to prevent retries for this specific issue,
          // but log the error for investigation.
          return new Response(JSON.stringify({ received: true, error: 'Missing metadata' }), {
             status: 200,
             headers: { 'Content-Type': 'application/json' }
          });
      }

      const credits = parseInt(creditsStr);
      if (isNaN(credits)) {
          console.error('Invalid credits value in metadata:', creditsStr);
           return new Response(JSON.stringify({ received: true, error: 'Invalid credits metadata' }), {
             status: 200,
             headers: { 'Content-Type': 'application/json' }
          });
      }

      // Supabaseクライアントの初期化 (Admin client for DB operations)
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { auth: { persistSession: false } }
      );

      // --- Database Operations --- 
      console.log(`Processing completed checkout session ${session.id} for user ${userId}, adding ${credits} credits.`);

      // 1. Add credits to user_credits table
      const { error: creditError } = await supabaseAdmin.rpc('add_credits', {
        p_user_id: userId,
        p_amount: credits // Assuming add_credits takes the number of CREDITS directly now?
                         // If it still takes YEN, use: credits / 5
      });

      if (creditError) {
        console.error(`Failed to add credits for user ${userId} (session ${session.id}):`, creditError);
        // Throw error to let Stripe retry
        throw new Error(`Failed to add credits: ${creditError.message}`);
      }
      console.log(`Successfully added credits for user ${userId}.`);

      // 2. Record purchase in credit_purchase_history
      const { error: historyError } = await supabaseAdmin
        .from('credit_purchase_history')
        .insert({
          user_id: userId,
          amount_yen: credits / CREDIT_RATE, // Store the Yen amount
          credits: credits,
          stripe_session_id: session.id,
          status: 'completed'
        });

      if (historyError) {
        // Log this error but don't throw, as credits were already added.
        // This indicates an issue with history logging, needs investigation.
        console.error(`Failed to record purchase history for user ${userId} (session ${session.id}):`, historyError);
      } else {
         console.log(`Successfully recorded purchase history for session ${session.id}.`);
      }

    } else {
        console.log(`Received unhandled Stripe event type: ${event.type}`);
    }

    // Acknowledge receipt of the event to Stripe
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    // Return 500 to signal an internal error, Stripe will retry
    return new Response(JSON.stringify({ error: 'Webhook handler failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// Define CREDIT_RATE if it's not globally available
const CREDIT_RATE = 5; // 1円 = 5 Credit 