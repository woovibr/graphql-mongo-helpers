import { GraphQLEnumType, GraphQLInputObjectType, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { toGlobalId, globalIdField } from 'graphql-relay';

import { DirectionEnumType } from '../../src';

import { IGroup } from './GroupModel';

import { IUser } from './UserModel';

// eslint-disable-next-line @typescript-eslint/ban-types
type GraphqlContext = {};

export const UserType = new GraphQLObjectType<IUser, GraphqlContext>({
  name: 'User',
  fields: () => ({
    id: globalIdField('User'),
    name: { type: GraphQLString, resolve: (user) => user.name },
    userName: { type: GraphQLString, resolve: (user) => user.userName },
  }),
});

export const UserSortInputType = new GraphQLInputObjectType({
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

export const UserSortFieldEnumType = new GraphQLEnumType({
  name: 'UserSortFieldEnum',
  values: {
    NAME: {
      value: 'name',
    },
    CREATED_AT: {
      value: 'createdAt',
    },
  },
});

export const GroupType = new GraphQLObjectType<IGroup, GraphqlContext>({
  name: 'Group',
  fields: () => ({
    id: globalIdField('Group'),
    name: { type: GraphQLString, resolve: (group) => group.name },
    users: { type: GraphQLString, resolve: (group) => group.users.map((userID) => toGlobalId('User', String(userID))) },
  }),
});
