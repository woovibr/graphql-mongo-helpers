import { GraphQLEnumType } from 'graphql';

export const DirectionEnumType = new GraphQLEnumType({
  name: 'DirectionEnum',
  values: {
    ASC: {
      value: 1,
    },
    DESC: {
      value: -1,
    },
  },
});

export const DirectionEnum = `
  enum DirectionEnum {
    ASC
    DESC
  }
`;
