import { vi, it, expect, describe, beforeEach } from 'vitest';
import { connectionFromMongoAggregate } from '@woovi/graphql-mongoose-loader';

import { withConnectionAggregate } from '../withConnectionAggregate';

vi.mock('@woovi/graphql-mongoose-loader', () => ({
  connectionFromMongoAggregate: vi.fn().mockResolvedValue({
    edges: [],
    count: null,
    pageInfo: { hasNextPage: false, hasPreviousPage: false },
  }),
}));

const mockModel = {
  aggregate: vi.fn().mockReturnValue({
    pipeline: vi.fn().mockReturnValue([]),
  }),
} as any;

const mockLoader = vi.fn();
const mockCondFn = vi.fn().mockReturnValue({
  defaultConditions: { removedAt: null },
  builtMongoConditions: { conditions: {}, pipeline: [] },
});
const context = { dataloaders: {} };
const args = { first: 10 };

beforeEach(() => {
  vi.clearAllMocks();
  mockCondFn.mockReturnValue({
    defaultConditions: { removedAt: null },
    builtMongoConditions: { conditions: {}, pipeline: [] },
  });
});

describe('withConnectionAggregate', () => {
  it('should pass shouldCount=false by default', async () => {
    const loadAll = withConnectionAggregate(mockModel, mockLoader, mockCondFn);

    await loadAll(context, args);

    expect(connectionFromMongoAggregate).toHaveBeenCalledWith(
      expect.objectContaining({
        shouldCount: false,
      }),
    );
  });

  it('should pass shouldCount=true when configured', async () => {
    const loadAll = withConnectionAggregate(mockModel, mockLoader, mockCondFn, { shouldCount: true });

    await loadAll(context, args);

    expect(connectionFromMongoAggregate).toHaveBeenCalledWith(
      expect.objectContaining({
        shouldCount: true,
      }),
    );
  });

  it('should forward context and args to connectionFromMongoAggregate', async () => {
    const loadAll = withConnectionAggregate(mockModel, mockLoader, mockCondFn);

    await loadAll(context, args);

    expect(connectionFromMongoAggregate).toHaveBeenCalledWith(
      expect.objectContaining({
        context,
        args,
      }),
    );
  });
});
