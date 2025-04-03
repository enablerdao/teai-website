-- Add new columns to aws_credentials table
alter table public.aws_credentials
add column if not exists organization_id text,
add column if not exists account_id text,
add column if not exists iam_username text;

-- Add indexes for better query performance
create index if not exists aws_credentials_organization_id_idx on public.aws_credentials(organization_id);
create index if not exists aws_credentials_account_id_idx on public.aws_credentials(account_id);
create index if not exists aws_credentials_iam_username_idx on public.aws_credentials(iam_username); 