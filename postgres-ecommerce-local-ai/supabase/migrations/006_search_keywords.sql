-- Add search_keywords and search_phrases columns to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS search_keywords text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS search_phrases text;
