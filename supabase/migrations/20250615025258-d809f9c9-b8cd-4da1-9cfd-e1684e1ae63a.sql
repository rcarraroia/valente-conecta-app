
-- Add ambassador_wallet_id column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ambassador_wallet_id TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.ambassador_wallet_id IS 'Wallet ID do Asaas para recebimento de comissões de embaixador';
