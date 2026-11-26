import {
  graphql,
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import { toGlobalId } from 'graphql-relay';
import { expect, it } from 'vitest';

import { getTypeRegister } from '../index';

const buildSchema = (source: string) => {
  const { nodeField, nodesField, nodeInterface, registerTypeLoader } =
    getTypeRegister();

  const UserType = new GraphQLObjectType({
    name: 'User',
    interfaces: () => [nodeInterface],
    fields: () => ({
      id: { type: new GraphQLNonNull(GraphQLID) },
      source: { type: GraphQLString },
    }),
  });

  registerTypeLoader(UserType, (_context: unknown, id: string) => ({
    __typename: 'User',
    id,
    source,
  }));

  return new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: () => ({ node: nodeField, nodes: nodesField }),
    }),
    types: [UserType],
  });
};

const query = `
  query Node($id: ID, $ids: [ID!]!) {
    node(id: $id) { ... on User { source } }
    nodes(ids: $ids) { ... on User { source } }
  }
`;

it('keeps type loaders isolated between registers', async () => {
  const first = buildSchema('first');
  const second = buildSchema('second');
  const id = toGlobalId('User', '1');

  const firstResult = await graphql({
    schema: first,
    source: query,
    variableValues: { id, ids: [id] },
  });
  const secondResult = await graphql({
    schema: second,
    source: query,
    variableValues: { id, ids: [id] },
  });

  expect(firstResult).toEqual({
    data: { node: { source: 'first' }, nodes: [{ source: 'first' }] },
  });
  expect(secondResult).toEqual({
    data: { node: { source: 'second' }, nodes: [{ source: 'second' }] },
  });
});
