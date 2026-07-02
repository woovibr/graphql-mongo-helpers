import { GraphQLEnumType } from 'graphql';

type EnumObject = {
  [index: string]: string;
};

type EnumObjectResult = {
  [index: string]: {
    value: string;
  };
};
export const enumBuilderValues = <T extends EnumObject = EnumObject>(
  constants: T,
): EnumObjectResult =>
  Object.keys(constants).reduce(
    (prev, curr) => ({
      ...prev,
      [curr]: {
        value: constants[curr],
      },
    }),
    {},
  );
/*
export const GenderEnumType = new GraphQLEnumType({
  name: 'GenderEnumType',
  values: enumBuilderValues(GENDER),
});
*/
export const graphqlEnumBuilder = <T extends EnumObject = EnumObject>(
  name: string,
  values: T,
) =>
  new GraphQLEnumType({
    name,
    values: enumBuilderValues(values),
  });
