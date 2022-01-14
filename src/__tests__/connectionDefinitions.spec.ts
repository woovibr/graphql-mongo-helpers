import { GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { globalIdField } from 'graphql-relay';

import { connectionDefinitions, PageInfoType, ConnectionInterface } from '../connectionDefinitions';

const NodeType = new GraphQLObjectType({
  name: 'Node',
  description: 'Node data',
  fields: () => ({
    id: globalIdField('Node'),
    body: {
      type: GraphQLString,
      resolve: () => 'test node',
    },
  }),
});

describe('connectionDefinitions', () => {
  it('should create a connection from a node type', () => {
    const description = 'A connection to a list of nodes.';
    const edgeDescription = 'A Node edge in a connection.';

    const NodeConnection = connectionDefinitions({
      name: 'Node',
      nodeType: NodeType,
      description,
      edgeDescription,
    });

    expect(NodeConnection.connectionType.name).toBe('NodeConnection');
    expect(NodeConnection.connectionType.description).toBe(description);
    expect(NodeConnection.edgeType.name).toBe('NodeEdge');
    expect(NodeConnection.edgeType.description).toBe(edgeDescription);

    const connectionFields = NodeConnection.connectionType.getFields();
    expect(connectionFields.count.type).toMatchObject(GraphQLInt);
    expect(connectionFields.totalCount.type).toMatchObject(GraphQLInt);
    expect(connectionFields.startCursorOffset.type).toMatchObject(new GraphQLNonNull(GraphQLInt));
    expect(connectionFields.endCursorOffset.type).toMatchObject(new GraphQLNonNull(GraphQLInt));
    expect(connectionFields.pageInfo.type).toMatchObject(new GraphQLNonNull(PageInfoType));

    const edgeFields = NodeConnection.edgeType.getFields();
    expect(edgeFields.node.type).toMatchObject(NodeType);
    expect(edgeFields.cursor.type).toMatchObject(new GraphQLNonNull(GraphQLString));
  });

  it('should create a connection and extend ConnectionInterface', () => {
    const NodeConnection = connectionDefinitions({
      name: 'Node',
      nodeType: NodeType,
    });

    const connectionInterfaces = NodeConnection.connectionType.getInterfaces();
    expect(connectionInterfaces.length).toBe(1);
    expect(connectionInterfaces[0]).toMatchObject(ConnectionInterface);
  });
});
