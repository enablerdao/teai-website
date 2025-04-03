create table if not exists public.aws_credentials (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  access_key_id text not null,
  secret_access_key text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Enable RLS
alter table public.aws_credentials enable row level security;

-- Create policies
create policy "Users can view their own AWS credentials"
  on public.aws_credentials for select
  using (auth.uid() = user_id);

create policy "Users can insert their own AWS credentials"
  on public.aws_credentials for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own AWS credentials"
  on public.aws_credentials for update
  using (auth.uid() = user_id);

create policy "Users can delete their own AWS credentials"
  on public.aws_credentials for delete
  using (auth.uid() = user_id);

-- Create function to update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger handle_aws_credentials_updated_at
  before update on public.aws_credentials
  for each row
  execute function public.handle_updated_at(); 