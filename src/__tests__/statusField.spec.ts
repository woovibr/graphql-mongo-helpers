import { GraphQLObjectType, GraphQLString } from 'graphql';

import { errorField, successField } from '../statusFields';

describe('statusField', () => {
  it('should add error field to mutation payload', async () => {
    const TestMutationPayload = new GraphQLObjectType({
      name: 'TestMutationPayload',
      fields: () => ({
        anotherField: { type: GraphQLString },
        ...errorField,
      }),
    });

    const mutation = new GraphQLObjectType({
      name: 'Mutation',
      fields: () => ({
        TestMutation: {
          name: 'TestMutation',
          type: TestMutationPayload,
          args: {},
          resolve: () => null,
        },
      }),
    });

    const mutationFields = mutation.getFields()['TestMutation'];

    expect(mutationFields.type).toMatchObject(TestMutationPayload);

    const payloadFields = TestMutationPayload.getFields();

    expect(Object.keys(payloadFields)).toHaveLength(2);
    expect(payloadFields.error.name).toBe('error');
    expect(payloadFields.error.description).toBe('Default error field resolver.');
    expect(payloadFields.error.resolve).toBeTruthy();
  });

  it('should add success field to mutation payload', async () => {
    const TestMutationPayload = new GraphQLObjectType({
      name: 'TestMutationPayload',
      fields: () => ({
        anotherField: { type: GraphQLString },
        ...successField,
      }),
    });

    const mutation = new GraphQLObjectType({
      name: 'Mutation',
      fields: () => ({
        TestMutation: {
          name: 'TestMutation',
          type: TestMutationPayload,
          args: {},
          resolve: () => null,
        },
      }),
    });

    const mutationFields = mutation.getFields()['TestMutation'];

    expect(mutationFields.type).toMatchObject(TestMutationPayload);

    const payloadFields = TestMutationPayload.getFields();

    expect(Object.keys(payloadFields)).toHaveLength(2);
    expect(payloadFields.success.name).toBe('success');
    expect(payloadFields.success.description).toBe('Default success field resolver.');
    expect(payloadFields.success.resolve).toBeTruthy();
  });
});
