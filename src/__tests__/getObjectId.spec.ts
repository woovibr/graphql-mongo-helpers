import { toGlobalId } from 'graphql-relay';
import { Types, model, Schema } from 'mongoose';

import { getObjectId } from '../getObjectId';

const PostSchema = new Schema(
  {
    content: { type: String },
  },
  { collection: 'Post' },
);

const PostModel = model('Post', PostSchema);

describe('getObjectId', () => {
  it('should return a valid ObjectId when target is ObjectId', async () => {
    const post = new PostModel({ content: 'test content' });

    const result = getObjectId(post._id);

    expect(result).toBeInstanceOf(Types.ObjectId);
    expect(result).toMatchObject(post._id);
  });

  it('should return a valid ObjectId when target is Document', async () => {
    const post = new PostModel({ content: 'test content' });

    const result = getObjectId(post);

    expect(result).toBeInstanceOf(Types.ObjectId);
    expect(result).toMatchObject(post._id);
  });

  it('should return a valid ObjectId when target is a GlobalId', async () => {
    const post = new PostModel({ content: 'test content' });
    const globalId = toGlobalId('Post', post._id);

    const result = getObjectId(globalId);

    expect(result).toBeInstanceOf(Types.ObjectId);
    expect(result).toMatchObject(post._id);
  });

  it('should return null when target is invalid', () => {
    const result = getObjectId('invalid');

    expect(result).toBeNull();
  });

  it('should return null when target is a invalid Object', () => {
    const invalidDoc = { name: 'invalid' };

    const result = getObjectId(invalidDoc);

    expect(result).toBeNull();
  });

  it('should return null on invalid GlobalId', () => {
    const globalId = toGlobalId('Post', 'invalid');

    const result = getObjectId(globalId);

    expect(result).toBeNull();
  });
});
