import { connectionFromMongoAggregate } from '@entria/graphql-mongoose-loader';
import { Model } from 'mongoose';

import { LoaderFn, BuiltConditionSet } from './types';

import { buildAggregatePipeline } from './buildAggregatePipeline';

type WithConnectionAggregateConditions = { defaultConditions?: object; builtMongoConditions: BuiltConditionSet };

export const withConnectionAggregate =
  <Context extends object>(
    model: Model<any>,
    loader: LoaderFn<Context>,
    condFn: (...p: any[]) => WithConnectionAggregateConditions,
  ) =>
  (...params: any[]) => {
    const { defaultConditions = {}, builtMongoConditions } = condFn(...params);

    const [context, args] = params;

    const aggregatePipeline = buildAggregatePipeline({ defaultConditions, builtMongoConditions });

    const aggregate = model.aggregate(aggregatePipeline);

    return connectionFromMongoAggregate({
      aggregate,
      context,
      args,
      loader: loader as any,
    });
  };
