import { vi, it, expect, describe, beforeEach } from 'vitest';
import { connectionFromMongoCursor } from '@woovi/graphql-mongoose-loader';

import { withConnectionCursor } from '../withConnectionCursor';

vi.mock('@woovi/graphql-mongoose-loader', () => ({
  connectionFromMongoCursor: vi.fn().mockResolvedValue({
    edges: [],
    count: null,
    pageInfo: { hasNextPage: false, hasPreviousPage: false },
  }),
}));

const mockModel = {
  find: vi.fn().mockReturnValue({
    sort: vi.fn().mockReturnThis(),
  }),
} as any;

const mockLoader = vi.fn();
const mockCondFn = vi.fn().mockReturnValue({ conditions: { removedAt: null }, sort: { createdAt: -1 } });
const context = { dataloaders: {} };
const args = { first: 10 };

beforeEach(() => {
  vi.clearAllMocks();
  mockCondFn.mockReturnValue({ conditions: { removedAt: null }, sort: { createdAt: -1 } });
});

describe('withConnectionCursor', () => {
  it('should pass shouldCount=false by default', async () => {
    const loadAll = withConnectionCursor(mockModel, mockLoader, mockCondFn);

    await loadAll(context, args);

    expect(connectionFromMongoCursor).toHaveBeenCalledWith(
      expect.objectContaining({
        shouldCount: false,
      }),
    );
  });

  it('should pass shouldCount=true when configured', async () => {
    const loadAll = withConnectionCursor(mockModel, mockLoader, mockCondFn, { shouldCount: true });

    await loadAll(context, args);

    expect(connectionFromMongoCursor).toHaveBeenCalledWith(
      expect.objectContaining({
        shouldCount: true,
      }),
    );
  });

  it('should forward context and args to connectionFromMongoCursor', async () => {
    const loadAll = withConnectionCursor(mockModel, mockLoader, mockCondFn);

    await loadAll(context, args);

    expect(connectionFromMongoCursor).toHaveBeenCalledWith(
      expect.objectContaining({
        context,
        args,
      }),
    );
  });
});
