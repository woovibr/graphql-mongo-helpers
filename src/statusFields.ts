import { GraphQLBoolean, GraphQLString } from 'graphql';

const errorField = {
  error: {
    type: GraphQLString,
    description: 'Default error field resolver.',
    resolve: ({ error }) => error,
  },
};

const successField = {
  success: {
    type: GraphQLBoolean,
    description: 'Default success field resolver.',
    resolve: ({ success }) => success || false,
  },
};

export { errorField, successField };
