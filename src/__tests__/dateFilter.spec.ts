import { it, expect } from 'vitest';

import { dateFilterCondition } from '../dateFilterCondition';
import { getDateFilter } from '../getDateFilter';
import { FILTER_CONDITION_TYPE } from '../constants';

it('should return an empty object when date is null', () => {
  const format = dateFilterCondition({ fieldFilter: 'createdAt' });
  expect(format(null)).toEqual({});
});

it('should return an empty array when neither begin/start nor end is provided', () => {
  const format = dateFilterCondition({ fieldFilter: 'createdAt' });
  expect(format({ begin: '', start: '', end: '' })).toEqual([]);
});

it('should build a $gte condition from the begin field', () => {
  const format = dateFilterCondition({ fieldFilter: 'createdAt' });
  expect(
    format({ begin: '2024-01-01T00:00:00.000Z', start: '', end: '' }),
  ).toEqual({
    createdAt: {
      $gte: new Date('2024-01-01T00:00:00.000Z'),
    },
  });
});

it('should prefer the start field over begin for the $gte condition', () => {
  const format = dateFilterCondition({ fieldFilter: 'createdAt' });
  expect(
    format({
      begin: '2024-01-01T00:00:00.000Z',
      start: '2024-02-01T00:00:00.000Z',
      end: '',
    }),
  ).toEqual({
    createdAt: {
      $gte: new Date('2024-02-01T00:00:00.000Z'),
    },
  });
});

it('should build a $lte condition from the end field', () => {
  const format = dateFilterCondition({ fieldFilter: 'createdAt' });
  expect(
    format({ begin: '', start: '', end: '2024-01-31T23:59:59.999Z' }),
  ).toEqual({
    createdAt: {
      $lte: new Date('2024-01-31T23:59:59.999Z'),
    },
  });
});

it('should build both $gte and $lte conditions', () => {
  const format = dateFilterCondition({ fieldFilter: 'createdAt' });
  expect(
    format({
      begin: '2024-01-01T00:00:00.000Z',
      start: '',
      end: '2024-01-31T23:59:59.999Z',
    }),
  ).toEqual({
    createdAt: {
      $gte: new Date('2024-01-01T00:00:00.000Z'),
      $lte: new Date('2024-01-31T23:59:59.999Z'),
    },
  });
});

it('should merge extra conditions into the built condition', () => {
  const format = dateFilterCondition({
    fieldFilter: 'createdAt',
    conditions: { status: 'ACTIVE' },
  });
  expect(
    format({ begin: '2024-01-01T00:00:00.000Z', start: '', end: '' }),
  ).toEqual({
    createdAt: {
      $gte: new Date('2024-01-01T00:00:00.000Z'),
    },
    status: 'ACTIVE',
  });
});

it('should wrap dateFilterCondition into a CUSTOM_CONDITION filter mapping', () => {
  const filter = getDateFilter({
    filterName: 'createdAtRange',
    fieldFilter: 'createdAt',
  });
  expect(filter.createdAtRange.type).toBe(
    FILTER_CONDITION_TYPE.CUSTOM_CONDITION,
  );
  expect(
    filter.createdAtRange.format({
      begin: '2024-01-01T00:00:00.000Z',
      start: '',
      end: '',
    }),
  ).toEqual({
    createdAt: {
      $gte: new Date('2024-01-01T00:00:00.000Z'),
    },
  });
});
