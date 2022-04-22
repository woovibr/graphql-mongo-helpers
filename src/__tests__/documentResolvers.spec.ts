import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

import { objectIdResolver, timestampResolver } from '../documentResolvers';

describe('documentResolvers', () => {
  it('should add mongo _id resolver to type', async () => {
    const PostType = new GraphQLObjectType({
      name: 'Post',
      fields: () => ({
        ...objectIdResolver,
        content: {
          type: GraphQLString,
          resolve: (post: any) => post.content,
        },
      }),
    });

    const postFields = PostType.getFields();

    expect(Object.keys(postFields)).toHaveLength(2);
    expect(postFields._id.name).toBe('_id');
    expect(postFields._id.type).toMatchObject(new GraphQLNonNull(GraphQLString));
    expect(postFields._id.resolve).toBeTruthy();
  });

  it('should add timestamps resolver to type', async () => {
    const PostType = new GraphQLObjectType({
      name: 'Post',
      fields: () => ({
        content: {
          type: GraphQLString,
          resolve: (post: any) => post.content,
        },
        ...timestampResolver,
      }),
    });

    const postFields = PostType.getFields();

    expect(Object.keys(postFields)).toHaveLength(3);
    expect(postFields.createdAt.name).toBe('createdAt');
    expect(postFields.createdAt.type).toMatchObject(GraphQLString);
    expect(postFields.createdAt.resolve).toBeTruthy();
    expect(postFields.updatedAt.name).toBe('updatedAt');
    expect(postFields.updatedAt.type).toMatchObject(GraphQLString);
    expect(postFields.updatedAt.resolve).toBeTruthy();
  });
});
