export type DIRECTION = 1 | -1;

export type OrderByArg<SortT> = {
  sort: SortT;
  direction: DIRECTION;
};

export function buildSortFromOrderByArg<TSort extends string>(
  orderByArg: OrderByArg<TSort>[],
): { [key: string]: 1 | -1 } {
  return orderByArg.reduce(
    (acc, item) => ({
      ...acc,
      [item.sort]: item.direction,
    }),
    {},
  );
}
