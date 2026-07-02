import { GraphQLInputObjectType, GraphQLString } from 'graphql';

export type DateFilterInputType = {
  begin: string;
  start: string;
  end: string;
};

export type NormalizedDateFilterInputType = {
  begin: string;
  end: string;
};

export const DateFilterInput = new GraphQLInputObjectType({
  name: 'DateFilter',
  fields: () => ({
    start: {
      type: GraphQLString,
      deprecationReason:
        'using begin field instead of start to normalize fields',
      description: 'start date',
    },
    begin: {
      type: GraphQLString,
      description: 'start date',
    },
    end: {
      type: GraphQLString,
      description: 'end date',
    },
  }),
});

export const getNormalizedDate = (
  date: DateFilterInputType,
): NormalizedDateFilterInputType => {
  const begin = date?.start ? date?.start : date?.begin;
  const end = date?.end;

  return {
    begin,
    end,
  };
};
