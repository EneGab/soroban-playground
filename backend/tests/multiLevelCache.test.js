import { jest } from '@jest/globals';

jest.unstable_mockModule('../src/services/redisService.js', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    delete: jest.fn().mockResolvedValue(1),
    isFallbackMode: true,
    client: null,
  },
}));

const { default: redisService } =
  await import('../src/services/redisService.js');
const { MultiLevelCache } = await import('../src/services/multiLevelCache.js');

describe('MultiLevelCache', () => {
  let cache;

  beforeEach(() => {
    jest.clearAllMocks();
    redisService.get.mockResolvedValue(null);
    redisService.set.mockResolvedValue('OK');
    redisService.delete.mockResolvedValue(1);
    redisService.isFallbackMode = true;
    redisService.client = null;
    cache = new MultiLevelCache({ l1TtlMs: 5000, l2TtlS: 60 });
  });

  it('returns value from L1 cache on hit', async () => {
    const fetchFn = jest.fn().mockResolvedValue({ value: 42 });
    await cache.get('key1', fetchFn);

    // Second call — should hit L1, not call fetchFn again
    const result = await cache.get('key1', fetchFn);
    expect(result).toEqual({ value: 42 });
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('returns value from L2 cache on hit and populates L1', async () => {
    const stored = JSON.stringify({ msg: 'from-redis' });
    redisService.get.mockResolvedValueOnce(stored);
    const fetchFn = jest.fn();

    const result = await cache.get('key2', fetchFn);
    expect(result).toEqual({ msg: 'from-redis' });
    expect(fetchFn).not.toHaveBeenCalled();

    // L1 should now be populated
    const result2 = await cache.get('key2', fetchFn);
    expect(result2).toEqual({ msg: 'from-redis' });
    expect(fetchFn).not.toHaveBeenCalled();
    expect(redisService.get).toHaveBeenCalledTimes(1);
  });

  it('calls fetchFn on cache miss and populates both layers', async () => {
    const fetchFn = jest.fn().mockResolvedValue({ fresh: true });
    const result = await cache.get('key3', fetchFn);
    expect(result).toEqual({ fresh: true });
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(redisService.set).toHaveBeenCalledWith(
      'key3',
      JSON.stringify({ fresh: true }),
      60
    );
  });

  it('deduplicates concurrent fetches (stampede protection)', async () => {
    let resolveFetch;
    const fetchFn = jest.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = () => resolve({ deduped: true });
        })
    );

    const p1 = cache.get('stampede', fetchFn);
    const p2 = cache.get('stampede', fetchFn);

    // Allow the async get() calls to advance past their internal awaits so
    // fetchFn() gets called and resolveFetch is assigned before we invoke it.
    await new Promise((r) => setTimeout(r, 0));

    resolveFetch();
    const [r1, r2] = await Promise.all([p1, p2]);

    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(r1).toEqual({ deduped: true });
    expect(r2).toEqual({ deduped: true });
  });

  it('removes in-flight entry after fetchFn rejects', async () => {
    const fetchFn = jest
      .fn()
      .mockRejectedValueOnce(new Error('db error'))
      .mockResolvedValueOnce({ retry: true });

    await expect(cache.get('fail-key', fetchFn)).rejects.toThrow('db error');

    // After failure, inflight entry is cleared — retry should work
    const result = await cache.get('fail-key', fetchFn);
    expect(result).toEqual({ retry: true });
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('invalidate removes from L1 and calls redisService.delete', async () => {
    const fetchFn = jest.fn().mockResolvedValue({ v: 1 });
    await cache.get('inv-key', fetchFn);

    await cache.invalidate('inv-key');
    expect(redisService.delete).toHaveBeenCalledWith('inv-key');

    // L1 should be empty — fetchFn should be called again
    await cache.get('inv-key', fetchFn);
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('invalidatePattern uses SCAN when Redis client is available', async () => {
    const scanMock = jest.fn().mockResolvedValue(['0', []]);
    const delMock = jest.fn().mockResolvedValue(1);
    redisService.isFallbackMode = false;
    redisService.client = { scan: scanMock, del: delMock };

    await cache.invalidatePattern('prefix:');
    expect(scanMock).toHaveBeenCalledWith(
      '0',
      'MATCH',
      'prefix:*',
      'COUNT',
      100
    );
  });
});
