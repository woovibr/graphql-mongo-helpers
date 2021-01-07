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

const defaultViewerCanSee = <Value extends Document>(_context: BaseContext<string, Value>, data: Value): Value => data;

export interface BaseContext<LoaderName extends string, Value extends Document> {
  dataloaders: Record<LoaderName, DataLoader<string, Value>>;
}

type filtersConditionsOrSortFn<Context> = (context: Context, args: FilteredConnectionArguments) => object;

export type CreateLoaderArgs<
  Context extends BaseContext<LoaderName, Value>,
  LoaderName extends string,
  Value extends Document
> = {
  model: Model<Value>;
  viewerCanSee?: (context: Context, data: Value) => Value | Promise<Value>;
  loaderName: LoaderName;
  filterMapping?: object;
  isAggregate?: boolean;
  shouldValidateContextUser?: boolean;
  defaultFilters?: object | filtersConditionsOrSortFn<Context>;
  defaultConditions?: object | filtersConditionsOrSortFn<Context>;
  defaultSort?: object | filtersConditionsOrSortFn<Context>;
};

export interface FilteredConnectionArguments extends ConnectionArguments {
  filters: GraphQLFilter | null;
}

export const createLoader = <
  Context extends BaseContext<LoaderName, Value>,
  LoaderName extends string,
  Value extends Document
>({
  model,
  viewerCanSee = defaultViewerCanSee,
  loaderName,
  filterMapping = {},
  isAggregate = false,
  shouldValidateContextUser = false,
  defaultFilters = {},
  defaultConditions = {},
  defaultSort = { createdAt: -1 },
}: CreateLoaderArgs<Context, LoaderName, Value>) => {
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
      const data = await context.dataloaders[loaderName].load(id.toString());

      if (!data) {
        return null;
      }

      const filteredData = await viewerCanSee(context, data);

      return filteredData ? (new Wrapper(filteredData) as Value) : null;
    } catch (err) {
      return null;
    }
  };

  const clearCache = ({ dataloaders }: Context, id: string) => dataloaders[loaderName].clear(id.toString());

  const primeCache = ({ dataloaders }: Context, id: string, data: Value) =>
    dataloaders[loaderName].prime(id.toString(), data);

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
