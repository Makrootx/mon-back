import {
  MongooseModuleAsyncOptions,
  MongooseModuleFactoryOptions,
} from '@nestjs/mongoose';
import * as dotenv from 'dotenv';

dotenv.config();
export const MongooseConnection: MongooseModuleFactoryOptions = {
  uri: `mongodb://localhost:${process.env.MONGO_PORT}/`,
  auth: {
    username: process.env.MONGO_USER,
    password: process.env.MONGO_PASSWORD,
  },
  dbName: process.env.MONGO_DB,
};
console.log(process.env.MONGO_USER);
