import { GraphqlSortArg } from './types';

export type SortObject = {
  [key: string]: 1 | -1;
};

export default function buildSortFromArg<SortFieldT extends string>(
  orderByArg: GraphqlSortArg<SortFieldT>[],
): SortObject {
  return orderByArg.reduce(
    (acc, item) => ({
      ...acc,
      [item.field]: item.direction,
    }),
    {},
  );
}
