import { NullConnection } from '../NullConnection';
import { it, expect, describe } from 'vitest';

describe('NullConnection', () => {
  it('NullConnection', () => {
    expect(NullConnection.edges).toHaveLength(0);
    expect(NullConnection.count).toBe(0);
    expect(NullConnection).toMatchSnapshot();
  });
});
