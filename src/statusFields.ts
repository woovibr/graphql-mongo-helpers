import { GraphQLString } from 'graphql';

type ErrorFieldParent = {
  error: string,
}
const errorField = {
  error: {
    type: GraphQLString,
    description: 'Default error field resolver.',
    resolve: ({ error }: ErrorFieldParent) => error,
  },
};

type SuccessFieldParent = {
  success: string,
}
const successField = {
  success: {
    type: GraphQLString,
    description: 'Default success field resolver.',
    resolve: ({ success }: SuccessFieldParent) => success,
  },
};

export { errorField, successField };
