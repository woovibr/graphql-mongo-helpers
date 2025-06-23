import type {
  GraphQLFieldConfig,
  GraphQLResolveInfo,
  GraphQLTypeResolver,
} from 'graphql';
import {
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';

type GraphQLNodeDefinitions<TContext> = {
  nodeInterface: GraphQLInterfaceType;
  nodeField: GraphQLFieldConfig<any, TContext>;
  nodesField: GraphQLFieldConfig<any, TContext>;
};

/**
 * Given a function to map from an ID to an underlying object, and a function
 * to map from an underlying object to the concrete GraphQLObjectType it
 * corresponds to, constructs a `Node` interface that objects can implement,
 * and a field config for a `node` root field.
 *
 * If the typeResolver is omitted, object resolution on the interface will be
 * handled with the `isTypeOf` method on object types, as with any GraphQL
 * interface without a provided `resolveType` method.
 */
export function nodeDefinitions<TContext>(
  idFetcher: (id: string, context: TContext, info: GraphQLResolveInfo) => any,
  typeResolver?: GraphQLTypeResolver<any, TContext> | undefined,
): GraphQLNodeDefinitions<TContext> {
  const nodeInterface = new GraphQLInterfaceType({
    name: 'Node',
    description: 'An object with an ID',
    fields: () => ({
      id: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The id of the object.',
      },
    }),
    resolveType: typeResolver,
  });

  const nodeField: GraphQLFieldConfig<any, TContext> = {
    description: 'Fetches an object given its ID',
    type: nodeInterface,
    args: {
      id: {
        type: GraphQLID,
        description: 'The ID of an object',
      },
    },
    resolve: (obj, { id }, context, info) => {
      if (!id) {
        return null;
      }

      return idFetcher(id, context, info);
    },
  };

  const nodesField: GraphQLFieldConfig<any, TContext> = {
    description: 'Fetches objects given their IDs',
    type: new GraphQLNonNull(new GraphQLList(nodeInterface)),
    args: {
      ids: {
        type: new GraphQLNonNull(
          new GraphQLList(new GraphQLNonNull(GraphQLID)),
        ),
        description: 'The IDs of objects',
      },
    },
    resolve: (obj, { ids }, context, info) =>
      Promise.all(
        ids.map((id: string) => Promise.resolve(idFetcher(id, context, info))),
      ),
  };

  return { nodeInterface, nodeField, nodesField };
}
