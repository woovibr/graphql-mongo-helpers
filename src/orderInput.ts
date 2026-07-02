import type { GraphQLEnumType } from 'graphql';
import { GraphQLInputObjectType, GraphQLNonNull } from 'graphql';

import { DirectionEnumType } from './DirectionEnumType';

export const orderInput = (name: string, sort: GraphQLEnumType) =>
  new GraphQLInputObjectType({
    name,
    fields: () => ({
      sort: {
        type: new GraphQLNonNull(sort),
      },
      direction: {
        type: new GraphQLNonNull(DirectionEnumType),
      },
    }),
  });
