#!/bin/bash
set -e

PSQL="psql -h 127.0.0.1 -p 5433 -U raghu -d postgres_ecom"
IMGDIR="/home/raghu/Vibe-Coding/postgres-ecommerce-local-ai/public/images"

echo "=== Adding 20 categories and 60 products ==="

# ─── Categories (skip existing via ON CONFLICT) ───
$PSQL <<'SQL'
INSERT INTO public.categories (slug, name) VALUES
  ('electronics',    'Electronics'),
  ('books',          'Books'),
  ('home-garden',    'Home & Garden'),
  ('sports',         'Sports & Outdoors'),
  ('toys',           'Toys & Games'),
  ('beauty',         'Beauty & Health'),
  ('automotive',     'Automotive'),
  ('music',          'Music'),
  ('office',         'Office Supplies'),
  ('pets',           'Pet Supplies'),
  ('gourmet-food',   'Gourmet Food'),
  ('baby',           'Baby Products'),
  ('jewelry',        'Jewelry'),
  ('shoes',          'Shoes'),
  ('crafts',         'Art & Crafts'),
  ('tools',          'Tools & Hardware'),
  ('camping',        'Camping & Hiking'),
  ('fitness',        'Fitness'),
  ('kitchen',        'Kitchen & Dining'),
  ('garden',         'Garden')
ON CONFLICT (slug) DO NOTHING;
SQL

echo "✓ Categories inserted"

# ─── Helper: insert 3 products per category ───
LOCK_COUNTER=9
insert_products() {
  local slug="$1"
  shift
  local name1="$1" desc1="$2" price1="$3"
  local name2="$4" desc2="$5" price2="$6"
  local name3="$7" desc3="$8" price3="$9"

  local tag1=$(echo "$name1" | tr '[:upper:]' '[:lower:]' | sed 's/ /,/g' | sed 's/[^a-z0-9,]//g')
  local tag2=$(echo "$name2" | tr '[:upper:]' '[:lower:]' | sed 's/ /,/g' | sed 's/[^a-z0-9,]//g')
  local tag3=$(echo "$name3" | tr '[:upper:]' '[:lower:]' | sed 's/ /,/g' | sed 's/[^a-z0-9,]//g')

  local url1="https://loremflickr.com/400/400/${tag1}?lock=${LOCK_COUNTER}"
  local url2="https://loremflickr.com/400/400/${tag2}?lock=$((LOCK_COUNTER + 1))"
  local url3="https://loremflickr.com/400/400/${tag3}?lock=$((LOCK_COUNTER + 2))"
  LOCK_COUNTER=$((LOCK_COUNTER + 3))

  $PSQL <<SQL
WITH cat AS (SELECT id FROM public.categories WHERE slug = '$slug')
INSERT INTO public.products (name, description, price, category_id, image_url) VALUES
  ('$name1', '$desc1', $price1, (SELECT id FROM cat), '${url1}'),
  ('$name2', '$desc2', $price2, (SELECT id FROM cat), '${url2}'),
  ('$name3', '$desc3', $price3, (SELECT id FROM cat), '${url3}')
ON CONFLICT DO NOTHING;
SQL
}

insert_products "electronics" \
  "Wireless Headphones" "Noise-cancelling Bluetooth headphones with 30hr battery" 89.99 \
  "USB-C Hub" "7-in-1 USB-C hub with HDMI, USB-A, SD card reader" 34.99 \
  "Portable Speaker" "Waterproof Bluetooth speaker with deep bass" 49.99

insert_products "books" \
  "Mystery Novel" "A gripping whodunit set in Victorian London" 14.99 \
  "Cookbook" "500 easy recipes for busy weeknights" 24.99 \
  "Sci-Fi Trilogy" "Award-winning space opera box set" 39.99

insert_products "home-garden" \
  "Indoor Plant Pot" "Ceramic self-watering planter with bamboo stand" 29.99 \
  "Scented Candle Set" "Set of 3 soy wax candles: lavender, vanilla, eucalyptus" 19.99 \
  "Throw Blanket" "Ultra-soft microfiber blanket 50x70 inches" 34.99

insert_products "sports" \
  "Yoga Mat" "Non-slip eco-friendly TPE mat 6mm thick" 39.99 \
  "Resistance Bands" "Set of 5 bands with different tension levels" 19.99 \
  "Insulated Water Bottle" "Stainless steel 32oz keeps cold 24hrs" 29.99

insert_products "toys" \
  "Building Blocks Set" "500-piece STEM building kit for ages 6+" 44.99 \
  "Board Game" "Strategic family board game 2-6 players" 34.99 \
  "Plush Dinosaur" "Soft velvety T-Rex plush 18 inches" 24.99

insert_products "beauty" \
  "Face Moisturizer" "Hydrating hyaluronic acid cream for all skin types" 22.99 \
  "Essential Oil Set" "Set of 6 pure therapeutic-grade essential oils" 28.99 \
  "Hair Dryer" "Ionic professional hair dryer with diffuser" 59.99

insert_products "automotive" \
  "Car Phone Mount" "Magnetic air vent mount universal fit" 14.99 \
  "Dash Camera" "1080p wide-angle dash cam with night vision" 79.99 \
  "Microfiber Towels" "Pack of 12 premium detailing towels" 19.99

insert_products "music" \
  "Acoustic Guitar" "Full-size dreadnought with spruce top" 199.99 \
  "Ukulele" "Soprano ukulele with mahogany body and gig bag" 49.99 \
  "Keyboard Stand" "Foldable X-style stand adjustable height" 39.99

insert_products "office" \
  "Standing Desk" "Electric height-adjustable desk 48x30 inches" 399.99 \
  "Ergonomic Chair" "Mesh back lumbar support office chair" 299.99 \
  "Desk Organizer" "Bamboo monitor stand with drawer and shelf" 34.99

insert_products "pets" \
  "Cat Tree Tower" "Multi-level scratching post with hammock" 69.99 \
  "Dog Bed" "Orthopedic memory foam bed large breed" 59.99 \
  "Interactive Treat Toy" "Puzzle feeder for mental stimulation" 19.99

insert_products "gourmet-food" \
  "Artisan Coffee Beans" "Single-origin Ethiopian medium roast 12oz" 18.99 \
  "Dark Chocolate Gift Box" "Assorted Belgian truffles 24 pieces" 29.99 \
  "Organic Honey" "Raw wildflower honey 16oz jar" 12.99

insert_products "baby" \
  "Baby Monitor" "Video monitor with night vision and two-way audio" 89.99 \
  "Diaper Bag" "Waterproof backpack with changing station" 49.99 \
  "Teething Set" "Silicone teether ring and rattle set BPA-free" 14.99

insert_products "jewelry" \
  "Silver Hoop Earrings" "Sterling silver hoop earrings 1.5 inch" 34.99 \
  "Leather Bracelet" "Genuine leather braided bracelet with gold clasp" 24.99 \
  "Gold Chain Necklace" "14k gold plated cable chain 18 inch" 44.99

insert_products "shoes" \
  "Running Sneakers" "Lightweight mesh running shoes with arch support" 89.99 \
  "Canvas Slip-ons" "Classic canvas sneakers with memory foam insole" 49.99 \
  "Hiking Boots" "Waterproof leather hiking boots ankle height" 129.99

insert_products "crafts" \
  "Watercolor Paint Set" "24 vibrant colors with brush set" 24.99 \
  "Knitting Kit" "Beginner knitting set with yarn needles and guide" 29.99 \
  "Sketchbook Bundle" "Set of 3 hardcover sketchbooks 8.5x11" 19.99

insert_products "tools" \
  "Cordless Drill" "20V lithium-ion drill driver with 20-piece bit set" 79.99 \
  "Tool Set" "56-piece household tool kit with storage case" 49.99 \
  "Work Light" "LED rechargeable magnetic work light 1000 lumens" 34.99

insert_products "camping" \
  "Tent" "3-person waterproof dome tent with rainfly" 149.99 \
  "Sleeping Bag" "30F rated mummy sleeping bag compressible" 69.99 \
  "Camp Stove" "Portable propane camp stove 2-burner" 54.99

insert_products "fitness" \
  "Adjustable Dumbbells" "Pair of 5-25lb adjustable dumbbells" 199.99 \
  "Jump Rope" "Speed jump rope with ball bearings and foam handles" 14.99 \
  "Foam Roller" "High-density foam roller for muscle recovery" 24.99

insert_products "kitchen" \
  "Chef Knife" "8-inch stainless steel chef knife with ergonomic handle" 44.99 \
  "Nonstick Pan Set" "Set of 3 nonstick frying pans with lids" 69.99 \
  "Food Processor" "10-cup food processor with multiple attachments" 89.99

insert_products "garden" \
  "Pruning Shears" "Professional bypass pruners with ergonomic grip" 24.99 \
  "Garden Hose" "50ft expandable garden hose with spray nozzle" 34.99 \
  "Plant Starter Kit" "Seed tray with 36 cells humidity dome and heat mat" 29.99

echo "✓ 60 products inserted"

# ─── Generate SVG placeholder images ───
echo "=== Generating SVG placeholders ==="
mkdir -p "$IMGDIR"

declare -A ICONS
ICONS["electronics"]="M12 2l10 6v8l-10 6-10-6V8zM12 2v20M4 8l8 6 8-6"
ICONS["books"]="M4 6h16v14H4zM4 6l8 4 8-4M8 2v4M16 2v4"
ICONS["home-garden"]="M3 12l9-9 9 9M9 21V9h6v12"
ICONS["sports"]="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
ICONS["toys"]="M12 2l4 8 8 4-8 4-4 8-4-8-8-4 8-4z"
ICONS["beauty"]="M12 2l2 7h7l-6 5 2 8-7-4-7 4 2-8-6-5h7z"
ICONS["automotive"]="M5 16h14l2-8H3l2 8zM7 16a2 2 0 100 4 2 2 0 000-4zM17 16a2 2 0 100 4 2 2 0 000-4z"
ICONS["music"]="M12 3v13.5a4.5 4.5 0 10-3 4.5M12 3l8 2v4l-8-2"
ICONS["office"]="M4 4h16v4H4zM4 12h16v8H4zM4 8h16v4H4zM8 16h8"
ICONS["pets"]="M10 12a4 4 0 100-8 4 4 0 000 8zM14 12a4 4 0 100-8 4 4 0 000 8zM12 14l-4 6h8l-4-6z"
ICONS["gourmet-food"]="M12 2l2 7h7l-6 4 2 8-7-5-7 5 2-8-6-4h7z"
ICONS["baby"]="M12 2a5 5 0 00-5 5v2a5 5 0 0010 0V7a5 5 0 00-5-5zM4 16h16M8 20h8"
ICONS["jewelry"]="M12 2l2 7h7l-6 4 2 8-7-4-7 4 2-8-6-4h7z"
ICONS["shoes"]="M4 16h16l-2-8H6l-2 8zM6 16a2 2 0 004 0M14 16a2 2 0 004 0"
ICONS["crafts"]="M12 2v20M2 12h20M6 6l12 12M18 6L6 18"
ICONS["tools"]="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.8-3.8a1 1 0 000-1.4L4.9 2.5 2.5 4.9l4.7 4.7"
ICONS["camping"]="M3 18h18l-9-15-9 15zM5 18v4M19 18v4M7 18h4"
ICONS["fitness"]="M6.5 6.5l11 11M6.5 17.5l11-11M12 2v20M2 12h20"
ICONS["kitchen"]="M6 2l2 4M10 2l2 4M14 2l2 4M4 8h16l-2 14H6L4 8z"
ICONS["garden"]="M12 4v12M8 8h8M4 12h16M12 16l-6 6M12 16l6 6"

generate_svg() {
  local slug="$1" index="$2" name="$3" color="$4"
  local icon="${ICONS[$slug]}"
  local file="$IMGDIR/$slug-$index.svg"
  cat > "$file" <<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="#1e293b"/>
  <rect x="40" y="40" width="320" height="320" rx="16" fill="${color}" opacity="0.15"/>
  <path d="${icon}" fill="${color}" opacity="0.8" transform="translate(100,80) scale(8)"/>
  <text x="200" y="370" text-anchor="middle" font-family="monospace" font-size="14" fill="#94a3b8">${name}</text>
</svg>
SVG
}

# Color palette for categories
COLORS=(
  "#10b981" "#6366f1" "#f59e0b" "#ef4444" "#ec4899"
  "#8b5cf6" "#14b8a6" "#f97316" "#06b6d4" "#84cc16"
  "#d946ef" "#0ea5e9" "#eab308" "#22c55e" "#a855f7"
  "#fb923c" "#38bdf8" "#f472b6" "#34d399" "#fbbf24"
)

slug_list=($($PSQL -t -A -c "SELECT slug FROM public.categories WHERE slug NOT IN ('t-shirts','hoodies','mugs') ORDER BY slug;"))

echo "=== Generating SVGs ==="
for slug in "${slug_list[@]}"; do
  idx=0
  $PSQL -t -A -F $'\t' -c "SELECT name FROM products p JOIN categories c ON c.id=p.category_id WHERE c.slug='$slug' ORDER BY p.id;" | while IFS=$'\t' read name; do
    idx=$((idx + 1))
    generate_svg "$slug" "$idx" "$name" "${COLORS[$((idx-1))]}"
  done
done

# Actually do it properly with a loop
echo "Generating SVG files..."
slug_idx=0
for slug in "${slug_list[@]}"; do
  color="${COLORS[$slug_idx]}"
  prod_idx=0
  while IFS=$'\t' read -r name; do
    if [ -z "$name" ]; then continue; fi
    prod_idx=$((prod_idx + 1))
    generate_svg "$slug" "$prod_idx" "$name" "$color"
  done < <($PSQL -t -A -F $'\t' -c "SELECT p.name FROM products p JOIN categories c ON c.id=p.category_id WHERE c.slug='$slug' ORDER BY p.id;")
  slug_idx=$((slug_idx + 1))
done

echo "✓ SVG images generated"

# ─── Insert product variants ───
echo "=== Inserting product variants ==="
$PSQL <<SQL
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
SQL

echo "✓ Product variants inserted"

# ─── Generate embeddings ───
echo "=== Generating embeddings via Ollama ==="
$PSQL -t -A -F $'\t' -c "SELECT p.id, p.name, p.description, c.name FROM products p JOIN categories c ON c.id = p.category_id WHERE p.embedding IS NULL ORDER BY p.id;" | while IFS=$'\t' read id name desc cat_name; do
  if [ -z "$id" ]; then continue; fi
  text="search_document: Title: $name | Description: $desc | Category: $cat_name"
  echo "  Embedding product $id: $name..."
  embedding=$(curl -s http://127.0.0.1:11434/api/embeddings \
    -d "{\"model\":\"nomic-embed-text\",\"prompt\":$(printf '%s' "$text" | jq -Rs -c .)}" \
    | jq -r '.embedding | map(tostring) | join(",")')
  $PSQL -c "UPDATE products SET embedding = '[$embedding]'::vector WHERE id = $id;" 2>/dev/null
done

echo "✓ Embeddings generated"

# ─── Summary ───
echo ""
echo "=== Summary ==="
$PSQL -c "
SELECT c.name AS category, COUNT(p.id) AS products
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
GROUP BY c.id, c.name
ORDER BY c.id;
"

echo ""
$PSQL -c "SELECT COUNT(*) AS total_products FROM products;"
$PSQL -c "SELECT COUNT(*) AS total_variants FROM product_variants;"
$PSQL -c "SELECT COUNT(*) AS products_with_embeddings FROM products WHERE embedding IS NOT NULL;"

echo ""
echo "Done! Visit /shop to see all categories."
