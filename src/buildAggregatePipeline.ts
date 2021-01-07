import { BuiltConditionSet } from './types';

interface IBuildAggregatePipeline {
  defaultConditions: Record<string, any>;
  builtMongoConditions: BuiltConditionSet;
}

export function buildAggregatePipeline({
  defaultConditions,
  builtMongoConditions,
}: IBuildAggregatePipeline): Record<string, any>[] {
  const conditions = {
    ...defaultConditions,
    ...builtMongoConditions.conditions,
  };

  const aggregatePipeline = [
    ...(Object.values(conditions).length ? [{ $match: conditions }] : []),
    ...builtMongoConditions.pipeline,
  ];

  return aggregatePipeline;
}
