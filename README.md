## GraphQL Mongo Helpers

[![npm](https://img.shields.io/npm/v/@entria/graphql-mongo-helpers.svg)](https://www.npmjs.com/package/@entria/graphql-mongo-helpers)
[![CircleCI (all branches)](https://img.shields.io/circleci/project/github/entria/graphql-mongo-helpers.svg)](https://circleci.com/gh/entria/graphql-mongo-helpers)

1. [What is this?](#what-is-this)
1. [Install](#install)
1. [Usage](#usage)

### What is this?

It's a package with some (currently two to be exact) tools to use when building a [GraphQL][graphql] API and using MongoDB.

### Install

```
yarn add @entria/graphql-mongo-helpers

or

npm i @entria/graphql-mongo-helpers
```

### Usage

#### MATCH_1_TO_1
The example below includes use with or without regex, e sub field.
```
const stringToRegexQuery = val => ({ $regex: new RegExp(val) })

const mapping = {
  code: {
    type: FILTER_CONDITION_TYPE.MATCH_1_TO_1,
  },
  city: {
    type: FILTER_CONDITION_TYPE.MATCH_1_TO_1,
    format: stringToRegexQuery
  },
  stateuf: {
    type: FILTER_CONDITION_TYPE.MATCH_1_TO_1,
    key: 'state.uf'
  },
  statename: {
    type: FILTER_CONDITION_TYPE.MATCH_1_TO_1,
    key: 'state.name'
  },
}
```

#### CUSTOM_CONDITION
The custom condition can be used to filter posts that include a list of tag as in the example below:

```
const mapping = {
  tags: {
      type: FILTER_CONDITION_TYPE.CUSTOM_CONDITION,
      format: tags => {
        if (!tags) return []
        return { tags: { $in: tags } };
      },
    },
 };
```

#### AGGREGATE_PIPELINE
Soon documentation will be included, As a complement to the documentation see all the tests, in `src/__tests__/`.

### Posts:
The following posts are going to have more info about use of this library:

[Introduction to GraphQL Mongo Helpers][post-a]
[Client-Supplied Custom Sorting Using GraphQL][post-b]

[graphql]: https://github.com/graphql/graphql-js
[post-a]: https://medium.com/@jonathancardoso/introduction-to-graphql-mongo-helpers-a457944d4c8a
[post-b]: https://medium.com/@jonathancardoso/client-supplied-custom-sorting-using-graphql-54e4b87f6011
