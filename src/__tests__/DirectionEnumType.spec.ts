import {
  graphql,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
} from 'graphql';

import { closeDatabase, clearDatabase, connectDatabase, createUser } from '../../test/helpers';
import { UserSortFieldEnumType, UserType } from '../../test/fixtures/Schema';
import UserModel from '../../test/fixtures/UserModel';

import { buildSortFromArg, DirectionEnumType } from '..';

beforeAll(async () => await connectDatabase());
beforeEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('should return the order of users by createdAt ', () => {
  const UserSortInputType = new GraphQLInputObjectType({
    name: 'UserSort',
    fields: () => ({
      field: {
        type: GraphQLNonNull(UserSortFieldEnumType),
      },
      direction: {
        type: GraphQLNonNull(DirectionEnumType),
      },
    }),
  });

  const queryType = new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      users: {
        args: {
          sort: { type: UserSortInputType },
        },
        type: GraphQLList(UserType),
        resolve: (_source, args) => {
          return UserModel.find().sort(buildSortFromArg(args.sort));
        },
      },
    }),
  });

  const schema = new GraphQLSchema({ query: queryType });

  const source = `
    query($direction: DirectionEnum!) {
      users(sort: { field: CREATED_AT, direction: $direction }) {
        id
        createdAt
      }
    }
  `;

  it('should return users sorted by createdAt in ascending order', async () => {
    await createUser();
    await createUser();

    const result = await graphql({ schema, source, variableValues: { direction: 'ASC' } });

    expect(result.data.users.length).toBe(2);
    expect(result.data.users[0].createdAt).toBeLessThan(result.data.users[1].createdAt);
  });

  it('should return users sorted by createdAt in descending order', async () => {
    await createUser();
    await createUser();

    const result = await graphql({ schema, source, variableValues: { direction: 'DESC' } });

    expect(result.data.users.length).toBe(2);
    expect(result.data.users[1].createdAt).toBeGreaterThan(result.data.users[2].createdAt);
  });
});
