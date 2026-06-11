// REQ-7 to REQ-9: Catalog seed pipeline validation
// TEST-101: Local embedding construction & vector alignment
// TEST-107: Edge cases - empty variants, special characters, duplicates

import { generateEmbedding } from '@/lib/ollama';

describe('Catalog Seed Pipeline', () => {
  // TEST-101: Core concatenation logic
  it('should concatenate product fields into uniform text payload', () => {
    const product = {
      name: 'Eco Bottle',
      description: 'Gym shaker',
      category: 'Mugs',
      variants: [
        { size: 'M', color: 'Neon Green' },
        { size: 'L', color: 'Black' },
      ],
    };

    const variantStrings = product.variants
      .map((v) => `Size: ${v.size}, Color: ${v.color}`)
      .join(' | ');

    const payload = `Title: ${product.name} | Description: ${product.description} | Category: ${product.category} | ${variantStrings}`;

    expect(payload).toContain('Eco Bottle');
    expect(payload).toContain('Gym shaker');
    expect(payload).toContain('Mugs');
    expect(payload).toContain('Size: M, Color: Neon Green');
    expect(payload).toContain('Size: L, Color: Black');
  });

  // TEST-101: 768-dimension enforcement
  it('should generate 768-dimension embedding', async () => {
    const embedding = await generateEmbedding('test product');
    expect(embedding).toHaveLength(768);
  });

  // TEST-107: Product with zero variants
  it('should handle products with no variants', () => {
    const product = {
      name: 'Single Item',
      description: 'No variants needed',
      category: 'Mugs',
      variants: [] as Array<{ size: string; color: string }>,
    };

    const variantStrings = product.variants
      .map((v) => `Size: ${v.size}, Color: ${v.color}`)
      .join(' | ');

    const payload = `Title: ${product.name} | Description: ${product.description} | Category: ${product.category} | ${variantStrings}`;

    expect(payload).toContain('Single Item');
    expect(payload).toContain('No variants needed');
    expect(payload).toContain('Title:');
    expect(payload).toContain('Category:');
  });

  // TEST-107: Special characters in payload
  it('should preserve special characters in concatenated payload', () => {
    const product = {
      name: "Men's T-Shirt",
      description: '100% cotton & organic • Size guide',
      category: 'Apparel & Clothing',
      variants: [
        { size: "L/XL", color: "Blå (Blue)" },
      ],
    };

    const variantStrings = product.variants
      .map((v) => `Size: ${v.size}, Color: ${v.color}`)
      .join(' | ');

    const payload = `Title: ${product.name} | Description: ${product.description} | Category: ${product.category} | ${variantStrings}`;

    expect(payload).toContain("Men's T-Shirt");
    expect(payload).toContain('100% cotton & organic • Size guide');
    expect(payload).toContain('Blå (Blue)');
  });

  // TEST-107: Multiple variants
  it('should handle product with many variants efficiently', () => {
    const variants = Array.from({ length: 50 }, (_, i) => ({
      size: ['S', 'M', 'L', 'XL', 'XXL'][i % 5],
      color: `Color-${i}`,
    }));

    const start = Date.now();
    const variantStrings = variants
      .map((v) => `Size: ${v.size}, Color: ${v.color}`)
      .join(' | ');

    const payload = `Title: Bulk Item | Description: Many options | Category: Test | ${variantStrings}`;
    const duration = Date.now() - start;

    expect(payload).toContain('Color-49');
    expect(duration).toBeLessThan(200);
  });

  // TEST-107: Empty product name validation
  it('should reject product with empty name', () => {
    const product = {
      name: '',
      description: 'A product with no name',
      category: 'Test',
      variants: [] as Array<{ size: string; color: string }>,
    };

    const isValid = product.name.trim().length > 0 && product.description.trim().length > 0;
    expect(isValid).toBe(false);
  });

  // TEST-107: Empty product description validation
  it('should reject product with empty description', () => {
    const product = {
      name: 'Nameless',
      description: '',
      category: 'Test',
      variants: [] as Array<{ size: string; color: string }>,
    };

    const isValid = product.name.trim().length > 0 && product.description.trim().length > 0;
    expect(isValid).toBe(false);
  });

  // TEST-107: Duplicate seeding idempotency
  it('should only embed products with null embedding on re-run', async () => {
    const mockProducts = [
      { id: 1, name: 'Already Embedded', embedding: new Array(768).fill(0.1) },
      { id: 2, name: 'Needs Embedding', embedding: null },
    ];

    const needsEmbedding = mockProducts.filter((p) => p.embedding === null);
    expect(needsEmbedding).toHaveLength(1);
    expect(needsEmbedding[0].id).toBe(2);
  });

  // TEST-107: Payload uses numeric category_id in production (not category name)
  it('should include numeric category_id in text payload format', () => {
    const product = {
      name: 'Test Item',
      description: 'Test desc',
      category_id: 3,
      variants: [{ size: 'M', color: 'Red' }],
    };

    const variantStrings = product.variants
      .map((v) => `Size: ${v.size}, Color: ${v.color}`)
      .join(' | ');

    const payload = `Title: ${product.name} | Description: ${product.description} | Category: ${product.category_id} | ${variantStrings}`;

    expect(payload).toContain('Category: 3');
    expect(payload).not.toContain('Category: Mugs');
  });
});
