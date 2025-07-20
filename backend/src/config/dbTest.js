import mongoose from 'mongoose';
import { beforeAll, afterAll, afterEach } from 'vitest';
import { connectDB } from '../config/db.js';

export const connectDbTest = async () => {
  beforeAll(async () => {
    await connectDB();
    // mongoose.Schema.Types.String.cast(false); //esto desactiva la coerción de tipo string
  });
  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });
  afterAll(async () => {
    await mongoose.connection.close();
  });
}
