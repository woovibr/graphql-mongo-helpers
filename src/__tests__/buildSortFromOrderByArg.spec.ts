import buildSortFromOrderByArg from '../buildSortFromOrderByArg';

it('should return correct sort', async () => {
  const orderByArg = [
    {
      sort: 'user',
      direction: -1,
    },
  ];

  expect(buildSortFromOrderByArg(orderByArg)).toMatchInlineSnapshot(`
Object {
  "user": -1,
}
`);
});
