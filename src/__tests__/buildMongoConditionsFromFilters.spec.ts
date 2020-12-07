import buildMongoConditionsFromFilters from '../buildMongoConditionsFromFilters';
import { FILTER_CONDITION_TYPE } from '../constants';

it('should return correct conditions for AND comparison', async () => {
  const context = {};

  const filters = {
    AND: [
      {
        status: 'DISABLED',
      },
      {
        name: 'Jon',
      },
    ],
  };

  expect(buildMongoConditionsFromFilters(context, filters)).toMatchSnapshot();
});

it('should return correct conditions for OR comparison', async () => {
  const context = {};

  const filters = {
    OR: [
      {
        status: 'DISABLED',
      },
      {
        name: 'Disabled User',
      },
    ],
  };

  expect(buildMongoConditionsFromFilters(context, filters)).toMatchSnapshot();
});

it('should return correct conditions for nested comparison', async () => {
  const context = {};

  const filters = {
    AND: [
      {
        OR: [
          {
            status: 'DISABLED',
          },
          {
            name: 'Disabled User',
          },
        ],
      },
      {
        OR: [
          {
            role: 'ADMIN',
          },
          {
            name: 'Admin',
          },
        ],
      },
    ],
  };

  expect(buildMongoConditionsFromFilters(context, filters)).toMatchSnapshot();
});

it('should throw an error for invalid operator', async () => {
  const context = {};

  const filters = {
    status_yay: 'nay',
  };

  expect(() => {
    buildMongoConditionsFromFilters(context, filters);
  }).toThrowError();
});

it('should throw an error for invalid _in and _nin comparison', async () => {
  const context = {};

  const filtersIn = {
    status_in: 'this should be an array',
  };

  expect(() => {
    buildMongoConditionsFromFilters(context, filtersIn);
  }).toThrowError();

  const filtersNin = {
    status_nin: 'this should be an array',
  };

  expect(() => {
    buildMongoConditionsFromFilters(context, filtersNin);
  }).toThrowError();
});

it('should return correct conditions for mapped key', async () => {
  const context = {};

  const filters = {
    tags_all: ['a', 'b'],
  };

  const mapping = {
    tags: {
      type: FILTER_CONDITION_TYPE.MATCH_1_TO_1,
      key: 'my.nested.tags',
    },
  };

  expect(buildMongoConditionsFromFilters(context, filters, mapping)).toMatchSnapshot();
});

it('should return correct conditions when blacklisting some filters on mapping', async () => {
  const context = {};

  const filters = {
    a: 'b',
    c: 'd',
  };

  const mapping = {
    c: false,
  };

  expect(buildMongoConditionsFromFilters(context, filters, mapping)).toMatchSnapshot();
});

it('should return correct aggregate pipeline', async () => {
  const context = {};

  const filters = {
    a: 'some-filter-on-a',
    c: 'this-is-from-another-collection',
  };

  const mapping = {
    c: {
      type: FILTER_CONDITION_TYPE.AGGREGATE_PIPELINE,
      pipeline: (value: string) => [
        {
          $match: {
            c: value,
          },
        },
      ],
    },
  };

  expect(buildMongoConditionsFromFilters(context, filters, mapping)).toMatchSnapshot();
});

it('should throw error if using invalid value for filters', async () => {
  const context = {};

  const filtersA = {
    AND: 'a',
  };
  expect(() => buildMongoConditionsFromFilters(context, filtersA)).toThrow('Invalid filter supplied to $and.');

  const filtersB = {
    OR: 'a',
  };
  expect(() => buildMongoConditionsFromFilters(context, filtersB)).toThrow('Invalid filter supplied to $or.');

  const filtersC = {
    a: 'a',
    AND: [],
  };
  const mappingC = {
    a: {
      type: FILTER_CONDITION_TYPE.AGGREGATE_PIPELINE,
      pipeline: (value: string) => [{ $match: { a: value } }],
    },
  };
  expect(() => buildMongoConditionsFromFilters(context, filtersC, mappingC)).toThrow(
    'Wrong filter usage, because filter "a" is a pipeline filter, which should disable AND and OR',
  );
});

it('should return correct conditions when using format function', async () => {
  const context = {};

  const filters = {
    a: 'something',
  };

  const mapping = {
    a: {
      type: FILTER_CONDITION_TYPE.MATCH_1_TO_1,
      format: (value: string) => `${value}-else`,
    },
  };

  expect(buildMongoConditionsFromFilters(context, filters, mapping)).toMatchSnapshot();
});

it('should work with null filter', async () => {
  const context = {};

  const filters = null;

  expect(buildMongoConditionsFromFilters(context, filters)).toEqual({
    conditions: {},
    pipeline: [],
  });
});

it('should work with null condition', async () => {
  const context = {};

  const filters = { a: null };

  expect(buildMongoConditionsFromFilters(context, filters)).toEqual({
    conditions: { a: null },
    pipeline: [],
  });
});

it('should work with two dates', async () => {
  const context = {};

  const filters = {
    createdAt_gte: '2018-06-18T17:01:00.000Z',
    createdAt_lte: '2018-07-18T17:01:00.000Z',
  };

  expect(buildMongoConditionsFromFilters(context, filters)).toEqual({
    conditions: {
      createdAt: {
        $gte: '2018-06-18T17:01:00.000Z',
        $lte: '2018-07-18T17:01:00.000Z',
      },
    },
    pipeline: [],
  });
});

it('should handle field mapping to a custom condition', async () => {
  const context = {};

  const filters = {
    search: 'something',
  };

  const mapping = {
    search: {
      type: FILTER_CONDITION_TYPE.CUSTOM_CONDITION,
      format: (search: string) => ({
        $or: [
          {
            name: search,
          },
          {
            email: search,
          },
        ],
      }),
    },
  };

  expect(buildMongoConditionsFromFilters(context, filters, mapping)).toEqual({
    conditions: {
      $or: [
        {
          name: 'something',
        },
        {
          email: 'something',
        },
      ],
    },
    pipeline: [],
  });
});
