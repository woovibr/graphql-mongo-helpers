import buildSortFromArg from '../buildSortFromArg';
import { it, expect } from 'vitest';

it('should return correct sort', async () => {
  const sortArg = [
    {
      field: 'user',
      direction: -1,
    },
  ];

  expect(buildSortFromArg(sortArg)).toMatchInlineSnapshot(`
    {
      "user": -1,
    }
  `);
});
