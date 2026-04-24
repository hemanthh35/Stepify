import { describe, it, expect } from 'vitest';

describe('frontend smoke', () => {
  it('loads test environment', () => {
    expect(import.meta.env.MODE).toBe('test');
  });
});
