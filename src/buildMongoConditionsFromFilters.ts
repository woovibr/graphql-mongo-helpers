import { BuiltConditionSet, FilterFieldMapping, FilterMapping, GraphQLFilter } from './types';
import { FILTER_CONDITION_TYPE } from './constants';
import { isPipelineFilterMapping, isCustomFilterMapping, isMatchFilterMapping } from './utils';

const validOperators = ['gt', 'gte', 'lt', 'lte', 'in', 'nin', 'ne', 'all'];

const arrayOperators = ['in', 'nin', 'all'];

const getFilterName = (filterName: string) => filterName.split('_')[0];

type Operators = 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'ne' | 'all' | '$and' | '$or';

const handleAndOr = (operator: Operators) => <TContext = any, TValue = any>(
  context: TContext,
  condition: GraphQLFilter[],
  mapping: FilterMapping<TValue>,
) => {
  if (!Array.isArray(condition)) {
    throw new Error(`Invalid filter supplied to ${operator}.`);
  }

  return {
    condition: condition.map((andCondition) => buildConditionsObject<TContext, TValue>(context, andCondition, mapping)),
    conditionName: operator,
  };
};

const handleAnd = handleAndOr('$and');
const handleOr = handleAndOr('$or');

const handleFieldOperator = <TContext = any, TValue = any>(
  _context: TContext,
  condition: any,
  conditionName: string,
  fieldMapping: FilterFieldMapping<TValue>,
  prev: { [key: string]: any },
) => {
  // { "myField_operator": "something" } becomes { "myField": { $operator: "something" } }
  // { "myField": "something" } remains the same
  const conditionNamePieces = conditionName.split('_');
  const operator = conditionNamePieces.length > 1 ? conditionNamePieces.pop() : '';
  // I don't think we support snake case for field names, should this be here?
  conditionName = conditionNamePieces.join('_');

  if (
    (isMatchFilterMapping(fieldMapping) || isCustomFilterMapping(fieldMapping)) &&
    typeof fieldMapping.format === 'function'
  ) {
    condition = fieldMapping.format(condition);
  }

  if (operator) {
    if (validOperators.indexOf(operator) === -1) {
      throw new Error(`"${operator}" is not a valid operator on field "${conditionName}".`);
    }

    if (arrayOperators.indexOf(operator) >= 0 && !Array.isArray(condition)) {
      throw new Error(`Field "${conditionName}" must have an array value.`);
    }

    // eslint-disable-next-line
    condition = {
      [`$${operator}`]: condition,
    };
  }

  // handle $gte and $let fields merge
  if (conditionName in prev) {
    // eslint-disable-next-line
    condition = {
      ...condition,
      ...prev[conditionName],
    };
  }

  return {
    condition,
    conditionName,
  };
};

function buildConditionsObject<TContext = any, TValue = any>(
  context: TContext,
  conditions: GraphQLFilter,
  mapping: FilterMapping<TValue>,
): Object {
  return Object.keys(conditions).reduce((prev, currentKey): Object => {
    let condition = conditions[currentKey];
    let conditionName = currentKey;

    const fieldMapping = mapping[getFilterName(currentKey)];

    if (fieldMapping === false) return prev;

    if (fieldMapping && !isCustomFilterMapping(fieldMapping) && !isMatchFilterMapping(fieldMapping)) {
      return prev;
    }

    if (conditionName === 'AND') {
      ({ condition, conditionName } = handleAnd<TContext, TValue>(context, condition, mapping));
    } else if (conditionName === 'OR') {
      ({ condition, conditionName } = handleOr<TContext, TValue>(context, condition, mapping));
    } else {
      if (isCustomFilterMapping(fieldMapping)) {
        if (fieldMapping.format && typeof fieldMapping.format === 'function') {
          const customCondition = fieldMapping.format(condition);

          return {
            ...prev,
            ...customCondition,
          };
        }
      }

      ({ condition, conditionName } = handleFieldOperator(context, condition, conditionName, fieldMapping, prev));
    }

    conditionName = isMatchFilterMapping<TValue>(fieldMapping) && fieldMapping.key ? fieldMapping.key : conditionName;

    return {
      ...prev,
      [conditionName]: condition,
    };
  }, {});
}

export default function buildMongoConditionsFromFilters<TContext = any, TValue = any>(
  context: TContext,
  filters: GraphQLFilter | null = {},
  mapping: { [key: string]: FilterFieldMapping<TValue> } = {},
): BuiltConditionSet {
  if (!filters) return { conditions: {}, pipeline: [] };

  const keys = Object.keys(filters);

  // first check if there are any pipeline mapped fields
  //  and if AND or OR are also passed, if that is the case, we must throw an error
  //  because we cannot use OR/AND while also using pipeline.
  const hasPipelineFilter = keys.find((key) => isPipelineFilterMapping(mapping[key]));

  if (hasPipelineFilter && (filters.AND || filters.OR)) {
    throw new Error(
      `Wrong filter usage, because filter "${hasPipelineFilter}" is a pipeline filter, which should disable AND and OR`,
    );
  }

  // separate filters by type
  const filtersKeysGrouped = Object.keys(filters).reduce(
    (prev, key) => {
      const filterName = getFilterName(key);

      // @ts-ignore
      const type = (mapping && !!mapping[filterName] && mapping[filterName].type) || FILTER_CONDITION_TYPE.MATCH_1_TO_1;

      return {
        ...prev,
        [type]: {
          ...prev[type],
          [key]: filters[key],
        },
      };
    },
    {
      // start with sane defaults
      [FILTER_CONDITION_TYPE.MATCH_1_TO_1]: {},
      [FILTER_CONDITION_TYPE.CUSTOM_CONDITION]: {},
      [FILTER_CONDITION_TYPE.AGGREGATE_PIPELINE]: {},
    },
  );

  // first build our conditions object.
  const conditions = buildConditionsObject<TContext, TValue>(
    context,
    {
      ...filtersKeysGrouped.MATCH_1_TO_1,
      ...filtersKeysGrouped.CUSTOM_CONDITION,
    },
    mapping,
  );

  // now build the pipeline, which is more straightforward
  const pipeline = Object.keys(filtersKeysGrouped.AGGREGATE_PIPELINE).reduce((prev: Object[], key): Object[] => {
    const mappedFilter = mapping[key];
    // should not really happen!
    if (!isPipelineFilterMapping(mappedFilter)) {
      return prev;
    }

    const fieldPipeline = Array.isArray(mappedFilter.pipeline)
      ? mappedFilter.pipeline
      : mappedFilter.pipeline(filters[key]);

    return [...prev, ...fieldPipeline];
  }, []);

  return {
    conditions,
    pipeline,
  };
}
