import {
  buildSortFromOrderByArg,
  type OrderByArg,
} from './buildSortFromOrderByArg';
import { FILTER_CONDITION_TYPE } from './constants';

export const orderByFilterField = {
  orderBy: {
    type: FILTER_CONDITION_TYPE.AGGREGATE_PIPELINE,
    pipeline: (value: OrderByArg<string>[]) => [
      {
        $sort: buildSortFromOrderByArg(value),
      },
    ],
  },
};
