-- =============================================================
-- Reviews table for product ratings & reviews
-- =============================================================

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  rating smallint not null check (rating >= 1 and rating <= 5),
  review_text text default '',
  reviewer_name text not null default '',
  reviewer_city text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- One review per order
  constraint reviews_order_id_unique unique (order_id)
);

-- Index for fast product review lookups
create index if not exists idx_reviews_product_id on public.reviews(product_id);
create index if not exists idx_reviews_user_id on public.reviews(user_id);
create index if not exists idx_reviews_rating on public.reviews(rating);

-- Enable Row Level Security
alter table public.reviews enable row level security;

-- Everyone can read reviews (public product pages)
create policy "Anyone can read reviews"
  on public.reviews
  for select
  using (true);

-- Authenticated users can insert their own reviews
create policy "Users can insert own reviews"
  on public.reviews
  for insert
  with check (auth.uid() = user_id);

-- Users can update their own reviews
create policy "Users can update own reviews"
  on public.reviews
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Auto-update updated_at on changes
create or replace function public.handle_reviews_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_reviews_updated
  before update on public.reviews
  for each row
  execute function public.handle_reviews_updated_at();
