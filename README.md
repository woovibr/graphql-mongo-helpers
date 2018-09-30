## GraphQL Mongo Helpers

[![npm](https://img.shields.io/npm/v/@entria/graphql-mongo-helpers.svg)](https://www.npmjs.com/package/@entria/graphql-mongo-helpers)
[![CircleCI (all branches)](https://img.shields.io/circleci/project/github/entria/graphql-mongo-helpers.svg)](https://circleci.com/gh/entria/graphql-mongo-helpers)

1. [What is this?](#what-is-this)
1. [Install](#install)
1. [Usage](#usage)

### What is this?

It's a package with some (currently one to be exact) tools to use when building a [GraphQL][graphql] API and using MongoDB.

### Install

```
yarn add @entria/graphql-mongo-helpers
```

### Usage

The most updated source of documentation are the test files, check the files in `src/__tests__/`.


I've written a post about some of those helpers:

#### buildMongoConditionsFromFilters`(filterArgs, mapping, context)
> This helper transforms given object, which is going to be a argument supplied to some
>  resolver, and returns a matching object to be consumed by `MongoDB`.
> The object will have a `conditions` and `pipeline` property.

```graphql
input MyResolverFilter {
  # filter field name, can add a suffix which is going to act as a modifier
  # in this case using all
  tags_all: [String!]!
  title: String
}
```

```js
// some mapping, mappins are optional, the default behavior
// is the filter be a MATCH_1_TO_1 with key identical to the one supplied
const filterMapping = {
  tags: {
    type: FILTER_CONDITION_TYPE.MATCH_1_TO_1,
    key: 'my.nested.tags',
  },
  title: {
    type: FILTER_CONDITION_TYPE.MATCH_1_TO_1,
    // format function can be used to transform the value before creatig the condition
    format: (val) => new RegExp(`^${escapeRegex(val)}`),
  }
}
```

Then inside the resolver:
```js
const filterResult = buildMongoConditionsFromFilters(args.filter, filterMapping);
```

if client supplied something like:
```js
{
  tags_all: ['a', 'b'],
  title: 'Blah',
};
```

the `filterResult` value will be:
```js
{
  conditions: {
    'my.nested.tags': { $all: ['a', 'b'] },
    title: /^Blah/,
  },
  pipeline: [],
}
```

##### Available comparison operators

```js
'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'ne', 'all'
```

where `in`, `nin` and `all` expect the value of the respective filter to be an array.

[graphql]: https://github.com/graphql/graphql-js
