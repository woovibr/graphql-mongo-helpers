export type SortValues = 1 | -1;
export type SortObject = {
  [key: string]: 1 | -1;
};

export interface GraphqlSortArg<SortFieldT extends string> {
  field: SortFieldT;
  direction: SortValues;
}

export default function buildSortFromArg<DocumentField extends string>(
  orderByArg: GraphqlSortArg<DocumentField>[],
): Record<string, SortValues> {
  return orderByArg.reduce(
    (acc, item) => ({
      ...acc,
      [item.field]: item.direction,
    }),
    {},
  );
}
