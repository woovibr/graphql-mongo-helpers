import { GraphQLString } from 'graphql';

const errorField = {
  error: {
    type: GraphQLString,
    description: 'Default error field resolver.',
    resolve: ({ error }) => error,
  },
};

const successField = {
  success: {
    type: GraphQLString,
    description: 'Default success field resolver.',
    resolve: ({ success }) => success,
  },
};

export { errorField, successField };
