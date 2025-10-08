import mongoose from 'mongoose';

export async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set');
    process.exit(1);
  }

  // optional: cleaner logs & fail-fast behavior
  mongoose.set('strictQuery', true);
  mongoose.set('bufferCommands', false); // don't buffer, surface errors

  // reduce “hangs”; fail selection in 10s if cannot connect
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 20000,
    // No need for deprecated options in Mongoose 6+
  });

  console.log('✅ MongoDB connected');
}
