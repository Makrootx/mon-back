import { MongoClient } from 'mongodb';

const MONGO_URL = 'mongodb://test_user:superSecretKey@localhost:28081/';

export const getDb = async () => {
  const client: any = await MongoClient.connect(MONGO_URL, {});
  return client.db('nest');
};
