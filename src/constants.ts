// Need to specify Readonly otherwise the type will be infered to be mutable
//  which causes the properties to have type string
// see:
// https://github.com/Microsoft/TypeScript/issues/2214
// https://github.com/Microsoft/TypeScript/issues/10195
// https://github.com/Microsoft/TypeScript/pull/10676
// https://github.com/Microsoft/TypeScript/pull/11126
export const FILTER_CONDITION_TYPE: Readonly<{
  MATCH_1_TO_1: 'MATCH_1_TO_1';
  CUSTOM_CONDITION: 'CUSTOM_CONDITION';
  AGGREGATE_PIPELINE: 'AGGREGATE_PIPELINE';
}> = {
  // something that could be used on find() or $match
  MATCH_1_TO_1: 'MATCH_1_TO_1',
  // create a custom condition based on value
  CUSTOM_CONDITION: 'CUSTOM_CONDITION',
  AGGREGATE_PIPELINE: 'AGGREGATE_PIPELINE',
};
