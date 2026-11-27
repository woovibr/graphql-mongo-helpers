import { vi, it, expect, describe, beforeEach } from 'vitest';
import { connectionFromMongoCursor, connectionFromMongoAggregate } from '@woovi/graphql-mongoose-loader';

import { GraphQLError } from 'graphql';

import { createLoader } from '../createLoader';
import { isForbiddenError } from '../isForbiddenError';

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

describe('createLoader load', () => {
  const doc = { _id: 'id1', name: 'ACME' };

  const forbidden = () =>
    new GraphQLError('Missing permission: COMPANY::VIEW', undefined, undefined, undefined, undefined, undefined, {
      code: 'FORBIDDEN',
      missingRoles: ['COMPANY::VIEW'],
    });

  const setup = (viewerCanSee: (context: any, data: any) => any) => {
    const context = createContext();
    context.dataloaders[loaderName].load.mockResolvedValue(doc);
    const { load } = createLoader({ model: mockModel, loaderName, viewerCanSee } as any);
    return { context, load };
  };

  it('should rethrow a FORBIDDEN error thrown by viewerCanSee', async () => {
    const error = forbidden();
    const { context, load } = setup(() => {
      throw error;
    });

    await expect(load(context as any, 'id1')).rejects.toBe(error);
  });

  it('should rethrow a FORBIDDEN error from an async viewerCanSee', async () => {
    const error = forbidden();
    const { context, load } = setup(async () => {
      throw error;
    });

    await expect(load(context as any, 'id1')).rejects.toBe(error);
  });

  it('should keep returning null for any other error thrown by viewerCanSee', async () => {
    const { context, load } = setup(() => {
      throw new Error('boom');
    });

    await expect(load(context as any, 'id1')).resolves.toBeNull();
  });

  it('should keep returning null for an error with another code', async () => {
    const { context, load } = setup(() => {
      throw new GraphQLError('nope', undefined, undefined, undefined, undefined, undefined, { code: 'UNAUTHENTICATED' });
    });

    await expect(load(context as any, 'id1')).resolves.toBeNull();
  });

  it('should keep returning null when the dataloader fails', async () => {
    const context = createContext();
    context.dataloaders[loaderName].load.mockRejectedValue(new Error('connection reset'));
    const { load } = createLoader({ model: mockModel, loaderName } as any);

    await expect(load(context as any, 'id1')).resolves.toBeNull();
  });

  it('should keep returning null when viewerCanSee returns null', async () => {
    const { context, load } = setup(() => null);

    await expect(load(context as any, 'id1')).resolves.toBeNull();
  });

  it('should not call viewerCanSee when bypassViewerCanSee is true', async () => {
    const viewerCanSee = vi.fn(() => {
      throw forbidden();
    });
    const { context, load } = setup(viewerCanSee);

    await expect(load(context as any, 'id1', true)).resolves.toMatchObject({ name: 'ACME' });
    expect(viewerCanSee).not.toHaveBeenCalled();
  });

  it('should return null for an empty id without calling viewerCanSee', async () => {
    const viewerCanSee = vi.fn();
    const { context, load } = setup(viewerCanSee);

    await expect(load(context as any, '')).resolves.toBeNull();
    expect(viewerCanSee).not.toHaveBeenCalled();
  });
});

describe('isForbiddenError', () => {
  it('should match only the FORBIDDEN code', () => {
    expect(isForbiddenError({ extensions: { code: 'FORBIDDEN' } })).toBe(true);
    expect(isForbiddenError({ extensions: { code: 'UNAUTHENTICATED' } })).toBe(false);
    expect(isForbiddenError({ extensions: null })).toBe(false);
    expect(isForbiddenError(new Error('FORBIDDEN'))).toBe(false);
    expect(isForbiddenError(null)).toBe(false);
    expect(isForbiddenError(undefined)).toBe(false);
  });
});
