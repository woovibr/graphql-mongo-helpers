import { vi, it, expect, describe, beforeEach } from 'vitest';
import { connectionFromMongoCursor, connectionFromMongoAggregate } from '@woovi/graphql-mongoose-loader';

import { createLoader } from '../createLoader';

vi.mock('@woovi/graphql-mongoose-loader', () => ({
  mongooseLoader: vi.fn().mockResolvedValue([]),
  connectionFromMongoCursor: vi.fn().mockResolvedValue({
    edges: [],
    count: null,
    pageInfo: { hasNextPage: false, hasPreviousPage: false },
  }),
  connectionFromMongoAggregate: vi.fn().mockResolvedValue({
    edges: [],
    count: null,
    pageInfo: { hasNextPage: false, hasPreviousPage: false },
  }),
}));

const mockModel = {
  find: vi.fn().mockReturnValue({
    sort: vi.fn().mockReturnThis(),
  }),
  aggregate: vi.fn().mockReturnValue({
    pipeline: vi.fn().mockReturnValue([]),
  }),
  collection: { collectionName: 'test' },
} as any;

const loaderName = 'TestLoader' as const;

const createContext = () => ({
  dataloaders: {
    [loaderName]: {
      load: vi.fn(),
      clear: vi.fn(),
      prime: vi.fn(),
    },
  },
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createLoader typename', () => {
  it('should not access model.collection.collectionName when typename is provided', () => {
    const collectionSpy = vi.fn(() => 'fromCollection');
    const lazyModel = {
      find: vi.fn().mockReturnValue({ sort: vi.fn().mockReturnThis() }),
      aggregate: vi.fn().mockReturnValue({ pipeline: vi.fn().mockReturnValue([]) }),
      get collection() {
        return { get collectionName() { return collectionSpy(); } };
      },
    } as any;

    const { Wrapper } = createLoader({
      model: lazyModel,
      loaderName,
      typename: 'Explicit',
    });

    expect(collectionSpy).not.toHaveBeenCalled();
    expect(Wrapper.name).toBe('Explicit');

    const instance = new Wrapper({ _id: '1', id: '1' } as any);
    expect(instance.id).toBe('1');
    expect(collectionSpy).not.toHaveBeenCalled();
  });

  it('should fall back to model.collection.collectionName when typename is absent', () => {
    const { Wrapper } = createLoader({
      model: mockModel,
      loaderName,
    });

    expect(Wrapper.name).toBe('test');
  });
});

describe('createLoader shouldCount', () => {
  it('should default shouldCount to false for cursor-based loader', async () => {
    const { loadAll } = createLoader({
      model: mockModel,
      loaderName,
    });

    const context = createContext();
    await loadAll(context, { first: 10, filters: null });

    expect(connectionFromMongoCursor).toHaveBeenCalledWith(
      expect.objectContaining({
        shouldCount: false,
      }),
    );
  });

  it('should pass shouldCount=true for cursor-based loader when configured', async () => {
    const { loadAll } = createLoader({
      model: mockModel,
      loaderName,
      shouldCount: true,
    });

    const context = createContext();
    await loadAll(context, { first: 10, filters: null });

    expect(connectionFromMongoCursor).toHaveBeenCalledWith(
      expect.objectContaining({
        shouldCount: true,
      }),
    );
  });

  it('should default shouldCount to false for aggregate-based loader', async () => {
    const { loadAll } = createLoader({
      model: mockModel,
      loaderName,
      isAggregate: true,
    });

    const context = createContext();
    await loadAll(context, { first: 10, filters: null });

    expect(connectionFromMongoAggregate).toHaveBeenCalledWith(
      expect.objectContaining({
        shouldCount: false,
      }),
    );
  });

  it('should pass shouldCount=true for aggregate-based loader when configured', async () => {
    const { loadAll } = createLoader({
      model: mockModel,
      loaderName,
      isAggregate: true,
      shouldCount: true,
    });

    const context = createContext();
    await loadAll(context, { first: 10, filters: null });

    expect(connectionFromMongoAggregate).toHaveBeenCalledWith(
      expect.objectContaining({
        shouldCount: true,
      }),
    );
  });
});
