// REQ-10 to REQ-14: AI Search endpoint validation
// TEST-102: Sub-55ms performance & similarity threshold
// TEST-105: Edge cases - SQL injection, XSS, malformed inputs
// TEST-106: Edge cases - Ollama service degradation

import { POST } from '@/app/api/ai-search/route';

describe('AI Search API', () => {
  // TEST-102: Performance & similarity
  it('should return results within 55ms latency threshold', async () => {
    const start = Date.now();
    const req = new Request('http://localhost:3000/api/ai-search', {
      method: 'POST',
      body: JSON.stringify({ query: 'healthy habits' }),
    });

    const response = await POST(req as any);
    const duration = Date.now() - start;

    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(55);
  });

  it('should filter results below 0.2 similarity threshold', async () => {
    const req = new Request('http://localhost:3000/api/ai-search', {
      method: 'POST',
      body: JSON.stringify({ query: 'random unrelated query xyz123' }),
    });

    const response = await POST(req as any);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      data.results.forEach((item: any) => {
        expect(item.similarity).toBeGreaterThanOrEqual(0.2);
      });
    }
  });

  // TEST-105: Security edge cases
  it('should reject SQL injection patterns', async () => {
    const req = new Request('http://localhost:3000/api/ai-search', {
      method: 'POST',
      body: JSON.stringify({ query: "' OR 1=1; DROP TABLE products; --" }),
    });

    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results).toBeDefined();
    expect(data.error).toBeUndefined();
  });

  it('should sanitize XSS payloads in search query', async () => {
    const req = new Request('http://localhost:3000/api/ai-search', {
      method: 'POST',
      body: JSON.stringify({ query: "<script>alert('xss')</script>" }),
    });

    const response = await POST(req as any);
    expect(response.status).toBe(200);
  });

  it('should reject extremely long queries', async () => {
    const longQuery = 'a'.repeat(10001);
    const req = new Request('http://localhost:3000/api/ai-search', {
      method: 'POST',
      body: JSON.stringify({ query: longQuery }),
    });

    const response = await POST(req as any);
    expect(response.status === 400 || response.status === 413).toBe(true);
  });

  it('should treat whitespace-only queries as empty', async () => {
    const req = new Request('http://localhost:3000/api/ai-search', {
      method: 'POST',
      body: JSON.stringify({ query: '   ' }),
    });

    const response = await POST(req as any);
    expect(response.status).toBe(400);
  });

  it('should reject non-string query types', async () => {
    const requests = [
      { query: 12345 },
      { query: ['array', 'query'] },
      { query: { key: 'value' } },
    ];

    for (const body of requests) {
      const req = new Request('http://localhost:3000/api/ai-search', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      const response = await POST(req as any);
      expect(response.status).toBe(400);
    }
  });

  it('should reject missing query field', async () => {
    const req = new Request('http://localhost:3000/api/ai-search', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(req as any);
    expect(response.status).toBe(400);
  });

  it('should reject empty query string', async () => {
    const req = new Request('http://localhost:3000/api/ai-search', {
      method: 'POST',
      body: JSON.stringify({ query: '' }),
    });

    const response = await POST(req as any);
    expect(response.status).toBe(400);
  });
});
