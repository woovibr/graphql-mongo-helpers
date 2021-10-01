import buildSortFromArg from '../buildSortFromArg';

it('should return correct sort', async () => {
  const sortArg = [
    {
      field: 'user',
      direction: -1,
    },
  ];

  expect(buildSortFromArg(sortArg)).toEqual({
    user: -1,
  });
});
