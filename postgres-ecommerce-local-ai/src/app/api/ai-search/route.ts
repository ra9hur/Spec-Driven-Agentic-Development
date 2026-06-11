import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateEmbedding } from '@/lib/ollama';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
    }

    if (query.length > 1000) {
      return NextResponse.json({ error: 'Query too long' }, { status: 413 });
    }

    const queryEmbedding = await generateEmbedding(query, 'search_query: ');
    const embeddingStr = `[${queryEmbedding.join(',')}]`;

    const result = await pool.query(
      `WITH words AS (
         SELECT string_to_array(lower($2::text), ' ') AS arr
       ),
       query_words AS (
         SELECT unnest((SELECT arr FROM words)) AS word
       ),
       word_count AS (
         SELECT cardinality((SELECT arr FROM words)) AS cnt
       ),
       product_text AS (
         SELECT p.id, p.name, p.description, p.price, p.image_url,
                lower(p.name || ' ' || p.description || ' ' || c.name || ' ' || COALESCE(p.search_phrases, '')) AS phrase_text,
                lower(p.name || ' ' || p.description || ' ' || c.name || ' ' || COALESCE(p.search_keywords, '')) AS word_text,
                1 - (p.embedding <=> $1::vector) AS similarity
         FROM products p
         JOIN categories c ON c.id = p.category_id
       ),
       product_scores AS (
         SELECT pt.id, pt.name, pt.description, pt.price, pt.image_url, pt.similarity,
                CASE WHEN (SELECT cnt FROM word_count) > 1
                  THEN pt.phrase_text LIKE '%' || lower($2::text) || '%'
                  ELSE FALSE
                END AS phrase_match,
                (SELECT COUNT(*) FROM query_words qw
                 WHERE pt.word_text LIKE '%' || qw.word || '%') AS word_match_count
         FROM product_text pt
       ),
       stats AS (
         SELECT MAX(word_match_count) AS max_match,
                bool_or(phrase_match) AS any_phrase
         FROM product_scores
       )
       SELECT ps.id, ps.name, ps.description, ps.price, ps.image_url, ps.similarity
       FROM product_scores ps, stats
       WHERE ps.similarity >= 0.2
         AND CASE
           WHEN stats.any_phrase THEN ps.phrase_match
           ELSE ps.word_match_count = stats.max_match
         END
         AND stats.max_match > 0
       ORDER BY ps.phrase_match DESC, ps.similarity DESC
       LIMIT 20`,
      [embeddingStr, query]
    );

    return NextResponse.json({ results: result.rows });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
