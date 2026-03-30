import { connectionFromMongoCursor } from '@woovi/graphql-mongoose-loader';
import { Model } from 'mongoose';

import { LoaderFn } from './types';

export const withConnectionCursor = <Context extends object>(
  model: Model<any>,
  loader: LoaderFn<Context>,
  condFn: (...p: any[]) => { conditions?: object; sort?: object },
  { shouldCount = false }: { shouldCount?: boolean } = {},
) => (...params: any[]) => {
  const { conditions = {}, sort = {} } = condFn(...params);

  const [context, args] = params;

  // @ts-ignore
  const cursor = model.find(conditions).sort(sort);

  return connectionFromMongoCursor({
    cursor,
    context,
    args,
    loader: loader as any,
    shouldCount,
  });
};
