import { it, expect } from 'vitest';
import { GraphQLEnumType } from 'graphql';

import { conditionId } from '../conditionId';
import { buildSortFromOrderByArg } from '../buildSortFromOrderByArg';
import { orderByFilterField } from '../orderByFilterField';
import { orderInput } from '../orderInput';
import { FILTER_CONDITION_TYPE } from '../constants';

it('should return an empty array for an invalid ObjectId', () => {
  expect(conditionId('not-a-valid-id')).toEqual([]);
  expect(conditionId(null)).toEqual([]);
});

it('should return an _id condition for a valid ObjectId', () => {
  const id = '507f1f77bcf86cd799439011';
  const condition = conditionId(id);
  expect(condition).toHaveLength(1);
  expect(condition[0]._id.toString()).toBe(id);
});

it('should build a sort object from the orderBy arg', () => {
  const sort = buildSortFromOrderByArg([
    { sort: 'createdAt', direction: -1 },
    { sort: 'name', direction: 1 },
  ]);
  expect(sort).toEqual({
    createdAt: -1,
    name: 1,
  });
});

it('should expose an AGGREGATE_PIPELINE orderBy filter that emits a $sort stage', () => {
  expect(orderByFilterField.orderBy.type).toBe(
    FILTER_CONDITION_TYPE.AGGREGATE_PIPELINE,
  );
  const pipeline = orderByFilterField.orderBy.pipeline([
    { sort: 'createdAt', direction: -1 },
  ]);
  expect(pipeline).toEqual([
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);
});

it('should build an input object type with sort and direction fields', () => {
  const sortEnum = new GraphQLEnumType({
    name: 'ExampleSortEnum',
    values: {
      createdAt: { value: 'createdAt' },
    },
  });
  const input = orderInput('ExampleOrderInput', sortEnum);
  expect(input.name).toBe('ExampleOrderInput');
  const fields = input.getFields();
  expect(Object.keys(fields).sort()).toEqual(['direction', 'sort']);
  expect(fields.sort.type.toString()).toBe('ExampleSortEnum!');
  expect(fields.direction.type.toString()).toBe('DirectionEnum!');
});
