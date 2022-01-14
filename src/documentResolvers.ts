import { GraphQLNonNull, GraphQLString } from 'graphql';
import { Types } from 'mongoose';

interface ModelObj {
  _id: Types.ObjectId;
}

export const objectIdResolver = {
  _id: {
    type: new GraphQLNonNull(GraphQLString),
    description: 'mongoose _id',
    resolve: ({ _id }: ModelObj) => _id.toString(),
  },
};

interface TimestampedObj {
  updatedAt?: Date | null;
  createdAt?: Date | null;
}

export const timestampResolver = {
  createdAt: {
    type: GraphQLString,
    resolve: (obj: TimestampedObj) => (obj.createdAt ? obj.createdAt.toISOString() : null),
  },
  updatedAt: {
    type: GraphQLString,
    resolve: (obj: TimestampedObj) => (obj.updatedAt ? obj.updatedAt.toISOString() : null),
  },
};
