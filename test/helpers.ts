/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import mongoose from 'mongoose';

import UserModel from './fixtures/UserModel';
import GroupModel from './fixtures/GroupModel';

export interface TestGlobal extends NodeJS.Global {
  __COUNTERS__: object;
  __MONGO_URI__: string;
  __MONGO_DB_NAME__: string;
}

declare const global: TestGlobal;

export const getCounter = (key: string) => {
  if (key in global.__COUNTERS__) {
    // @ts-ignore
    const currentValue = global.__COUNTERS__[key];

    // @ts-ignore
    global.__COUNTERS__[key]++;

    return currentValue;
  }

  // @ts-ignore
  global.__COUNTERS__[key] = 0;
  return 0;
};

export const restartCounters = () => {
  global.__COUNTERS__ = {};
};

export async function connectMongoose() {
  jest.setTimeout(20000);
  return mongoose.connect(global.__MONGO_URI__, {
    useNewUrlParser: true,
    dbName: global.__MONGO_DB_NAME__,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
}

export async function connectMongooseAndPopulate() {
  await connectMongoose();
}

export async function clearDatabase() {
  await mongoose.connection.db.dropDatabase();
}

export async function disconnectMongoose() {
  //await mongoose.connection.close();
  return mongoose.disconnect();
}

export async function clearDbAndRestartCounters() {
  await clearDatabase();
  restartCounters();
}

export const createUser = async (args: any = {}) => {
  const n = getCounter('user');

  return new UserModel({
    name: `User ${n}`,
    ...args,
  }).save();
};

export const createGroup = async (args: any = {}) => {
  const n = getCounter('group');

  return new GroupModel({
    name: `Group ${n}`,
    ...args,
  }).save();
};
