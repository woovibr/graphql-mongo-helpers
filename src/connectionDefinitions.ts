import {
  GraphQLFieldConfigMap,
  GraphQLFieldResolver,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  Thunk,
} from 'graphql';
import { connectionDefinitions as connectionDefinitionsRelay } from 'graphql-relay';

interface ConnectionConfig {
  name?: string;
  nodeType: GraphQLObjectType;
  resolveNode?: GraphQLFieldResolver<any, any>;
  resolveCursor?: GraphQLFieldResolver<any, any>;
  edgeFields?: Thunk<GraphQLFieldConfigMap<any, any>>;
  connectionFields?: Thunk<GraphQLFieldConfigMap<any, any>>;
}

export const connectionDefinitions = (config: ConnectionConfig) => {
  return connectionDefinitionsRelay({
    ...config,
    connectionFields: {
      startCursorOffset: {
        type: GraphQLNonNull(GraphQLInt),
        description: 'Offset from start.',
      },
      endCursorOffset: {
        type: GraphQLNonNull(GraphQLInt),
        description: 'Offset till end.',
      },
    },
  });
};
