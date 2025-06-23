import type { GraphQLObjectType } from 'graphql';
import { fromGlobalId } from 'graphql-relay';

import { nodeDefinitions } from './nodeDefinitions.ts';

type GraphQLContext = any;

type Load = (context: any, id: string) => any;
type TypeLoaders = {
  [key: string]: {
    type: GraphQLObjectType;
    load: Load;
  };
};

export const getTypeRegister = () => {
  const typesLoaders: TypeLoaders = {};

  const getTypesLoaders = () => typesLoaders;

  const registerTypeLoader = (type: GraphQLObjectType, load: Load) => {
    typesLoaders[type.name] = {
      type,
      load,
    };

    return type;
  };

  const getType = (typename: string) => typesLoaders[typename]?.type;

  // @ts-ignore
  const getLoader = (typename: string) => typesLoaders[typename]?.loader;

  const idFetcher = (globalId: string, context: GraphQLContext) => {
    const { type, id } = fromGlobalId(globalId);

    const { load } = typesLoaders[type] || { load: null };

    return (load && load(context, id)) || null;
  };

  const typeResolver = (obj: any) => {
    // prefer __typename
    const objType = obj.__typename || obj.constructor.name;

    const { type } = typesLoaders[objType] || { type: null };

    return type?.name;
  };

  const { nodeField, nodesField, nodeInterface } = nodeDefinitions(
    idFetcher,
    typeResolver,
  );

  return {
    registerTypeLoader,
    getTypesLoaders,
    getType,
    getLoader,
    nodeField,
    nodesField,
    nodeInterface,
    idFetcher,
    typeResolver,
  };
};
