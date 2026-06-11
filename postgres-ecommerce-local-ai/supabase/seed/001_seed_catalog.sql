-- Seed catalog data for testing
-- Categories
INSERT INTO public.categories (slug, name) VALUES
  ('t-shirts', 'T-Shirts'),
  ('hoodies', 'Hoodies'),
  ('mugs', 'Mugs')
ON CONFLICT (slug) DO NOTHING;

-- Products with variants
-- T-Shirts
WITH cat AS (SELECT id FROM public.categories WHERE slug = 't-shirts')
INSERT INTO public.products (name, description, price, category_id, image_url) VALUES
  ('Classic Cotton Tee', 'Soft, breathable cotton t-shirt perfect for everyday wear', 29.99, (SELECT id FROM cat), '/images/tshirt-1.jpg'),
  ('Premium Crew Neck', 'High-quality crew neck with reinforced stitching', 39.99, (SELECT id FROM cat), '/images/tshirt-2.jpg'),
  ('Athletic Fit Tee', 'Performance fabric with moisture-wicking technology', 34.99, (SELECT id FROM cat), '/images/tshirt-3.jpg')
ON CONFLICT DO NOTHING;

-- Hoodies
WITH cat AS (SELECT id FROM public.categories WHERE slug = 'hoodies')
INSERT INTO public.products (name, description, price, category_id, image_url) VALUES
  ('Essential Pullover Hoodie', 'Warm, comfortable pullover with kangaroo pocket', 59.99, (SELECT id FROM cat), '/images/hoodie-1.jpg'),
  ('Zip-Up Tech Hoodie', 'Lightweight zip-up with zippered pockets and thumbholes', 79.99, (SELECT id FROM cat), '/images/hoodie-2.jpg')
ON CONFLICT DO NOTHING;

-- Mugs
WITH cat AS (SELECT id FROM public.categories WHERE slug = 'mugs')
INSERT INTO public.products (name, description, price, category_id, image_url) VALUES
  ('Ceramic Travel Mug', 'Double-wall insulated ceramic mug with lid', 24.99, (SELECT id FROM cat), '/images/mug-1.jpg'),
  ('Enamel Camp Mug', 'Classic enamel mug for camp and everyday use', 19.99, (SELECT id FROM cat), '/images/mug-2.jpg'),
  ('Premium Glass Mug', 'Heat-resistant borosilicate glass with minimalist design', 29.99, (SELECT id FROM cat), '/images/mug-3.jpg')
ON CONFLICT DO NOTHING;

-- Variants for each product
INSERT INTO public.product_variants (product_id, size, color, stock)
SELECT p.id, s.size, c.color, floor(random() * 50 + 5)::int
FROM public.products p
CROSS JOIN (
  SELECT unnest(ARRAY['S', 'M', 'L', 'XL']) AS size
) s
CROSS JOIN (
  SELECT unnest(ARRAY['Black', 'White', 'Navy', 'Gray']) AS color
) c
WHERE p.category_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.product_variants pv
    WHERE pv.product_id = p.id AND pv.size = s.size AND pv.color = c.color
  );
