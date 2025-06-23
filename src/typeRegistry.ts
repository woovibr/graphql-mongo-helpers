import { getTypeRegister } from './typeRegister.ts';
import { connectionDefinitions } from './connectionDefinitions.ts';

const {
  registerTypeLoader,
  nodeInterface,
  nodeField,
  nodesField,
  getType,
  getLoader,
  idFetcher,
  typeResolver,
} = getTypeRegister();

export const nodeConnection = connectionDefinitions({
  name: 'Node',
  // @ts-ignore
  nodeType: nodeInterface,
  resolveNode: async (obj, args, context) =>
    await idFetcher(obj.node.id, context),
});

export {
  getLoader,
  getType,
  idFetcher,
  nodeField,
  nodeInterface,
  nodesField,
  registerTypeLoader,
  typeResolver,
};
