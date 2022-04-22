import { Types } from 'mongoose';

export type DataLoaderKey = string | Types.ObjectId;

export type BuiltConditionSet = {
  conditions: any;
  pipeline: any[];
};

export type FilterMapping<TValue = any> = {
  [key: string]: FilterFieldMapping<TValue>;
};

export interface FilterFieldMappingMatch<ValueT = any> {
  type: 'MATCH_1_TO_1';
  key?: string;
  format?: (value: ValueT) => any;
}

export interface FilterFieldMappingCustom<ValueT = any> {
  type: 'CUSTOM_CONDITION';
  format: (value: ValueT) => Object;
}

export interface FilterFieldMappingPipeline<ValueT = any> {
  type: 'AGGREGATE_PIPELINE';
  pipeline: Object[] | ((arg: ValueT) => Object[]);
}

// See Discriminated Unions at http://www.typescriptlang.org/docs/handbook/advanced-types.html
export type FilterFieldMapping<ValueT> =
  | FilterFieldMappingMatch<ValueT>
  | FilterFieldMappingCustom<ValueT>
  | FilterFieldMappingPipeline<ValueT>
  | boolean;

export interface GraphQLFilterItem {
  [filterKey: string]: any;
}

export interface GraphQLFilter extends GraphQLFilterItem {
  OR?: GraphQLFilter[];
  AND?: GraphQLFilter[];
}

export interface GraphQLArgFilter {
  filter: GraphQLFilter;
}

// this should be 1 | -1, but it's going to be harder to use from client if that was the case.
export type SortDirection = number;

export interface GraphqlSortArg<SortFieldT extends string> {
  field: SortFieldT;
  direction: SortDirection;
}

export type LoaderFn<Context extends object> = (ctx: Context, id: DataLoaderKey) => any;
