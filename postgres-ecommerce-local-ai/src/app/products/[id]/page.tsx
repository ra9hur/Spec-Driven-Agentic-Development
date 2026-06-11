import { notFound } from 'next/navigation';
import pool from '@/lib/db';
import { ProductInteractions } from '@/components/products/product-interactions';

interface ProductPageProps {
  params: { id: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const productId = parseInt(params.id, 10);
  if (isNaN(productId)) notFound();

  const productResult = await pool.query(
    'SELECT id, name, description, price, image_url FROM products WHERE id = $1',
    [productId]
  );

  if (productResult.rows.length === 0) notFound();

  const product = productResult.rows[0];

  const variantsResult = await pool.query(
    'SELECT id, size, color, stock FROM product_variants WHERE product_id = $1 ORDER BY size, color',
    [productId]
  );

  const variants = variantsResult.rows;
  const sizes = [...new Set(variants.map((v: any) => v.size))];
  const colors = [...new Set(variants.map((v: any) => v.color))];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div data-testid="pdp-layout" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="aspect-square bg-canvas rounded-lg flex items-center justify-center">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <span className="text-text/20 text-6xl">◻</span>
          )}
        </div>

        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-text">{product.name}</h1>
          <p className="text-2xl font-bold text-accent-primary">${parseFloat(product.price).toFixed(2)}</p>
          <p className="text-text/60 leading-relaxed">{product.description}</p>

          <ProductInteractions
            productId={product.id}
            productName={product.name}
            productPrice={parseFloat(product.price)}
            imageUrl={product.image_url || undefined}
            variants={variants.map((v: any) => ({
              id: v.id,
              size: v.size,
              color: v.color,
              stock: v.stock,
            }))}
            sizes={sizes}
            colors={colors}
          />
        </div>
      </div>
    </div>
  );
}
