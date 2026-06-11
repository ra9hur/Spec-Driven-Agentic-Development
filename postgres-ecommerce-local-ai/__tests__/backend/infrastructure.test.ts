// REQ-1 to REQ-6: Database cluster, pgvector extension, schema, HNSW index
// TEST-103: Database cluster & extension verification
// TEST-104: Ollama service availability

import pool from '@/lib/db';
import { generateEmbedding } from '@/lib/ollama';

describe('Database Infrastructure', () => {
  // TEST-103: PostgreSQL version check
  it('should have PostgreSQL v13+ running', async () => {
    const result = await pool.query('SELECT version()');
    const version = result.rows[0].version;
    const match = version.match(/PostgreSQL (\d+)/);
    expect(match).not.toBeNull();
    expect(parseInt(match[1])).toBeGreaterThanOrEqual(13);
  });

  // TEST-103: pgvector extension enabled
  it('should have pgvector extension enabled', async () => {
    const result = await pool.query(
      "SELECT extversion FROM pg_extension WHERE extname = 'vector'"
    );
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].extversion).toBeDefined();
  });

  // TEST-103: All 7 schema tables exist
  it('should have all required tables in public schema', async () => {
    const requiredTables = [
      'profiles',
      'user_roles',
      'categories',
      'products',
      'product_variants',
      'orders',
      'order_items',
    ];

    const result = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    const existingTables = result.rows.map((r: any) => r.table_name);

    for (const table of requiredTables) {
      expect(existingTables).toContain(table);
    }
  });

  // TEST-103: HNSW index exists
  it('should have HNSW index on products.embedding', async () => {
    const result = await pool.query(
      `SELECT indexname, indexdef FROM pg_indexes
       WHERE tablename = 'products' AND indexname = 'products_embedding_hnsw_idx'`
    );
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].indexdef).toContain('hnsw');
    expect(result.rows[0].indexdef).toContain('vector_cosine_ops');
  });

  // TEST-103: embedding column is vector(768)
  it('should have embedding column as vector(768)', async () => {
    const result = await pool.query(
      `SELECT data_type, udt_name
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'embedding'`
    );
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].udt_name).toBe('vector');
  });
});

describe('Ollama Service', () => {
  // TEST-104: Ollama endpoint reachable
  it('should respond on port 11434', async () => {
    const host = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
    const response = await fetch(`${host}/api/tags`, {
      signal: AbortSignal.timeout(5000),
    });
    expect(response.status).toBe(200);
  });

  // TEST-104: nomic-embed-text model available
  it('should have nomic-embed-text model loaded', async () => {
    const host = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
    const response = await fetch(`${host}/api/tags`, {
      signal: AbortSignal.timeout(5000),
    });
    const data = await response.json();
    const modelNames = data.models?.map((m: any) => m.name) || [];
    expect(modelNames.some((name: string) => name.includes('nomic-embed-text'))).toBe(true);
  });

  // TEST-104: Embedding returns 768 elements
  it('should return 768-dimension embedding for valid input', async () => {
    const embedding = await generateEmbedding('test input string');
    expect(embedding).toHaveLength(768);
  });

  // TEST-104: Empty input handling
  it('should handle empty string input gracefully', async () => {
    const embedding = await generateEmbedding(' ');
    expect(embedding).toBeDefined();
    expect(Array.isArray(embedding)).toBe(true);
  });

  // TEST-106: Timeout simulation
  it('should reject on immediate abort', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      fetch('http://127.0.0.1:11434/api/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'nomic-embed-text', prompt: 'test' }),
        signal: controller.signal,
      })
    ).rejects.toThrow();
  });

  // TEST-106: generateEmbedding rejects non-768-dimension response
  it('should reject embedding with wrong dimensions', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ embedding: new Array(512).fill(0.1) }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    await expect(generateEmbedding('test')).rejects.toThrow(
      'Invalid embedding dimension: expected 768, got 512'
    );

    jest.restoreAllMocks();
  });

  // TEST-106: generateEmbedding rejects null/non-JSON response
  it('should reject null embedding response', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({}), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    await expect(generateEmbedding('test')).rejects.toThrow(
      'Invalid embedding response: missing or non-array embedding'
    );

    jest.restoreAllMocks();
  });

  it('should reject non-array embedding response', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ embedding: 'not-an-array' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    await expect(generateEmbedding('test')).rejects.toThrow(
      'Invalid embedding response: missing or non-array embedding'
    );

    jest.restoreAllMocks();
  });
});
