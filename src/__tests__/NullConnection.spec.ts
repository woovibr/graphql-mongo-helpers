import { NullConnection } from '../NullConnection';

describe('NullConnection', () => {
  it('NullConnection', () => {
    expect(NullConnection.edges).toHaveLength(0);
    expect(NullConnection.count).toBe(0);
    expect(NullConnection).toMatchSnapshot();
  });
});
