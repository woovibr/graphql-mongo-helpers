import {
  FilterFieldMappingCustom,
  FilterFieldMappingMatch,
  FilterFieldMappingPipeline,
  FilterFieldMapping,
} from './types';
import { FILTER_CONDITION_TYPE } from './constants';

export const isPipelineFilterMapping = <ValueT = any>(
  filterMapping: FilterFieldMapping<ValueT> | undefined,
): filterMapping is FilterFieldMappingPipeline<ValueT> => {
  return (
    !!filterMapping &&
    typeof filterMapping !== 'boolean' &&
    filterMapping.type === FILTER_CONDITION_TYPE.AGGREGATE_PIPELINE
  );
};

export const isCustomFilterMapping = <ValueT = any>(
  filterMapping: FilterFieldMapping<ValueT> | undefined,
): filterMapping is FilterFieldMappingCustom<ValueT> => {
  return (
    !!filterMapping &&
    typeof filterMapping !== 'boolean' &&
    filterMapping.type === FILTER_CONDITION_TYPE.CUSTOM_CONDITION
  );
};

export const isMatchFilterMapping = <ValueT = any>(
  filterMapping: FilterFieldMapping<ValueT> | undefined,
): filterMapping is FilterFieldMappingMatch<ValueT> => {
  return (
    !!filterMapping && typeof filterMapping !== 'boolean' && filterMapping.type === FILTER_CONDITION_TYPE.MATCH_1_TO_1
  );
};
