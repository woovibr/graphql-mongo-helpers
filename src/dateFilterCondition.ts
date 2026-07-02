import type { DateFilterInputType } from './DateFilterInputType';
import { getNormalizedDate } from './DateFilterInputType';

type DateFilterPipeline = {
  fieldFilter: string;
  conditions?: Record<string, any>;
};

export const dateFilterCondition =
  ({ fieldFilter, conditions = {} }: DateFilterPipeline) =>
  (date: DateFilterInputType | null) => {
    if (date != null) {
      const { begin } = getNormalizedDate(date);

      if (!begin && !date.end) {
        return [];
      }

      const beginCondition = begin ? { $gte: new Date(begin) } : {};

      const endCondition = date.end ? { $lte: new Date(date.end) } : {};

      const condition = {
        [fieldFilter]: {
          ...beginCondition,
          ...endCondition,
        },
        ...conditions,
      };

      return condition;
    }

    return {};
  };
