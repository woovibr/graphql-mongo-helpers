import { GraphQLInputObjectType, GraphQLNonNull, GraphQLEnumType, GraphQLEnumValueConfigMap } from 'graphql';

import { DirectionEnumType } from './DirectionEnumType';

export const createSortFieldType = (name: string, values: GraphQLEnumValueConfigMap) => {
  const SortFieldEnumType = new GraphQLEnumType({
    name: `${name}SortFieldEnum`,
    values: values,
  });

  const SortInputType = new GraphQLInputObjectType({
    name: `${name}Sort`,
    fields: () => ({
      field: {
        type: GraphQLNonNull(SortFieldEnumType),
      },
      direction: {
        type: GraphQLNonNull(DirectionEnumType),
      },
    }),
  });

  return { SortFieldEnumType, SortInputType };
};
