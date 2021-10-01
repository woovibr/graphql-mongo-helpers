// eslint-disable-next-line
import { mongooseLoader } from '@entria/graphql-mongoose-loader';
import DataLoader from 'dataloader';
import { ConnectionArguments } from 'graphql-relay';
import { Model, Document } from 'mongoose';

import buildMongoConditionsFromFilters from './buildMongoConditionsFromFilters';
import { DataLoaderKey, GraphQLFilter } from './types';
import { validateContextUser } from './validateContextUser';
import { withConnectionAggregate } from './withConnectionAggregate';
import { withConnectionCursor } from './withConnectionCursor';

export interface BaseContext<LoaderName extends string, Value extends Document> {
  dataloaders: Record<LoaderName, DataLoader<string, Value>>;
}

type filtersConditionsOrSortFn<Context> = (context: Context, args: FilteredConnectionArguments) => object;

export type GetLoaderFunction<Context, Value extends Document> = (ctx: Context) => DataLoader<string, Value>;

export const defaultGetLoader = <
  LoaderName extends string,
  Value extends Document,
  Context extends BaseContext<LoaderName, Value>,
>(
  name: LoaderName,
) => {
  return (ctx: Context) => ctx.dataloaders[name];
};

export type ViewerCanSeeFn<Context, Value extends Document> = (context: Context, data: Value) => Value | Promise<Value>;

export type CreateLoaderArgs<Context, Value extends Document> = {
  model: Model<Value>;
  viewerCanSee?: ViewerCanSeeFn<Context, Value>;
  filterMapping?: object;
  isAggregate?: boolean;
  getLoaderByCtx: GetLoaderFunction<Context, Value>;
  shouldValidateContextUser?: boolean;
  defaultFilters?: object | filtersConditionsOrSortFn<Context>;
  defaultConditions?: object | filtersConditionsOrSortFn<Context>;
  defaultSort?: object | filtersConditionsOrSortFn<Context>;
};

export interface FilteredConnectionArguments extends ConnectionArguments {
  filters: GraphQLFilter | null;
}

export const createLoader = <Context, Value extends Document>({
  model,
  viewerCanSee = (_ctx, data) => data,
  filterMapping = {},
  isAggregate = false,
  shouldValidateContextUser = false,
  defaultFilters = {},
  defaultConditions = {},
  defaultSort = { createdAt: -1 },
  getLoaderByCtx,
}: CreateLoaderArgs<Context, Value>) => {
  class Loader {
    [key: string]: any;
    constructor(data: Value) {
      // TODO - improve this - get only model paths
      // eslint-disable-next-line
      Object.keys(data).map((key) => {
        this[key] = (data as any)[key];
      });
      this.id = data.id || data._id;
    }
  }

  const nameIt = (name: string, cls: typeof Loader): typeof Loader => ({ [name]: class extends cls {} }[name]);

  const Wrapper = nameIt(model.collection.collectionName, Loader);

  const getLoader = () => new DataLoader<string, Value>((ids) => mongooseLoader(model, ids));

  const load = async (context: Context, id: DataLoaderKey) => {
    if (!id) {
      return null;
    }

    try {
      const data = await getLoaderByCtx(context).load(id.toString());

      if (!data) {
        return null;
      }

      const filteredData = await viewerCanSee(context, data);

      return filteredData ? (new Wrapper(filteredData) as Value) : null;
    } catch (err) {
      return null;
    }
  };

  const clearCache = (ctx: Context, id: string) => getLoaderByCtx(ctx).clear(id.toString());

  const primeCache = (ctx: Context, id: string, data: Value) => getLoaderByCtx(ctx).prime(id.toString(), data);

  const clearAndPrimeCache = (context: Context, id: string, data: Value) =>
    clearCache(context, id) && primeCache(context, id, data);

  const buildFiltersConditionsAndSort = (context: Context, args: FilteredConnectionArguments) => {
    const mongoDefaultFilters = typeof defaultFilters === 'object' ? defaultFilters : defaultFilters(context, args);

    const builtMongoConditions = buildMongoConditionsFromFilters(
      context,
      { ...mongoDefaultFilters, ...(args.filters ? { ...args.filters } : {}) },
      filterMapping as any,
    );

    const mongoDefaultConditions =
      typeof defaultConditions === 'object' ? defaultConditions : defaultConditions(context, args);

    const mongoDefaultSort = typeof defaultSort === 'object' ? defaultSort : defaultSort(context, args);

    const conditions = {
      ...mongoDefaultConditions,
      ...builtMongoConditions.conditions,
    };

    return {
      builtMongoConditions,
      mongoDefaultConditions,
      conditions,
      mongoDefaultSort,
    };
  };

  const loadAll = isAggregate
    ? withConnectionAggregate(model, load, (context: Context, args: FilteredConnectionArguments) => {
        const { mongoDefaultConditions, builtMongoConditions } = buildFiltersConditionsAndSort(context, args);

        return {
          defaultConditions: mongoDefaultConditions,
          builtMongoConditions,
        };
      })
    : withConnectionCursor(model, load, (context: Context, args: FilteredConnectionArguments) => {
        const { conditions, mongoDefaultSort } = buildFiltersConditionsAndSort(context, args);

        return {
          conditions,
          sort: mongoDefaultSort,
        };
      });

  return {
    Wrapper: Wrapper as {
      new (value: Value): Value;
    },
    getLoader,
    clearCache,
    primeCache,
    clearAndPrimeCache,
    load,
    loadAll: shouldValidateContextUser ? validateContextUser(loadAll) : loadAll,
  };
};
