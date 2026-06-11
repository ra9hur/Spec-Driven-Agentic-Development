import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateEmbedding } from '@/lib/ollama';

export async function POST() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const products = await client.query('SELECT p.*, c.name as category_name FROM products p JOIN categories c ON c.id = p.category_id WHERE p.embedding IS NULL');

    for (const product of products.rows) {
      const textPayload = `Title: ${product.name} | Description: ${product.description} | Category: ${product.category_name}`;

      const embedding = await generateEmbedding(textPayload, 'search_document: ');
      const embeddingStr = `[${embedding.join(',')}]`;

      await client.query(
        'UPDATE products SET embedding = $1::vector WHERE id = $2',
        [embeddingStr, product.id]
      );
    }

    await client.query('COMMIT');
    return NextResponse.json({ success: true, count: products.rows.length });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Seeding failed' }, { status: 500 });
  } finally {
    client.release();
  }
}
