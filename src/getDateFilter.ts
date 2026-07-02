import { FILTER_CONDITION_TYPE } from './constants';
import { dateFilterCondition } from './dateFilterCondition';

type DateFilterPipeline = {
  filterName: string;
  fieldFilter: string;
  fieldProject?: string;
  projectFields?: Record<string, unknown>;
  useTimezone?: boolean;
  conditions?: Record<string, unknown>;
};

export const getDateFilter = ({
  fieldFilter,
  filterName,
  conditions = {},
}: DateFilterPipeline) => ({
  [filterName]: {
    type: FILTER_CONDITION_TYPE.CUSTOM_CONDITION,
    format: dateFilterCondition({
      fieldFilter,
      conditions,
    }),
  },
});
