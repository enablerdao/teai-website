CREATE TABLE IF NOT EXISTS public.credit_purchase_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    amount INT NOT NULL,
    credits INT NOT NULL,
    stripe_session_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.credit_purchase_history ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own purchase history
CREATE POLICY "Users can view their own purchase history"
    ON public.credit_purchase_history
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Create policy to allow stripe webhook to insert records
CREATE POLICY "Stripe webhook can insert records"
    ON public.credit_purchase_history
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create policy to allow stripe webhook to update records
CREATE POLICY "Stripe webhook can update records"
    ON public.credit_purchase_history
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Add indexes
CREATE INDEX IF NOT EXISTS credit_purchase_history_user_id_idx ON public.credit_purchase_history(user_id);
CREATE INDEX IF NOT EXISTS credit_purchase_history_stripe_session_id_idx ON public.credit_purchase_history(stripe_session_id); 