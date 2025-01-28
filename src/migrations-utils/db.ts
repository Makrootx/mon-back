import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

export const getDb = async () => {
  await dotenv.config();
  const MONGO_URL = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@localhost:${process.env.MONGO_PORT}/`;
  const client: any = await MongoClient.connect(MONGO_URL, {});
  return client.db('nest');
};
