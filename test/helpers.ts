/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import mongoose from 'mongoose';

import UserModel from './fixtures/UserModel';
import GroupModel from './fixtures/GroupModel';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      __MONGO_URI__: string;
      __MONGO_DB_NAME__: string;
    }
  }
}

export const connectDatabase = async (): Promise<void> => {
  // jest.setTimeout(30000);
  await mongoose.connect(
    global.__MONGO_URI__,
    {
      useNewUrlParser: true,
      // dbName: global.__MONGO_DB_NAME__,
      // useUnifiedTopology: true,
      useCreateIndex: true,
    },
    (err) => {
      if (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        process.exit(1);
      }
    },
  );
};

export const clearDatabase = async (): Promise<void> => {
  await mongoose.connection?.db?.dropDatabase();
};

export const closeDatabase = async (): Promise<void> => {
  await mongoose.connection?.close();
};

export const createUser = async (args: any = {}) => {
  return UserModel.create({
    name: `User`,
    ...args,
  });
};

export const createGroup = async (args: any = {}) => {
  return GroupModel.create({
    name: `Group`,
    ...args,
  });
};
