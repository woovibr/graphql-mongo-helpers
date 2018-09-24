import { GraphqlOrderByArg } from './types';

export type SortObject = {
  [key: string]: 1 | -1;
};

export default function buildSortFromOrderByArg<SortT extends string>(
  orderByArg: GraphqlOrderByArg<SortT>[],
): SortObject {
  return orderByArg.reduce(
    (acc, item) => ({
      ...acc,
      [item.sort]: item.direction,
    }),
    {},
  );
}
