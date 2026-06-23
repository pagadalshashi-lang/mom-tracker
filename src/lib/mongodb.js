import mongoose from "mongoose";

// =====================================
// MONGODB URI
// =====================================

const MONGODB_URI =
  process.env.MONGODB_URI;

// =====================================
// CHECK URI
// =====================================

if (!MONGODB_URI) {

  throw new Error(
    "Please define MONGODB_URI"
  );

}

// =====================================
// GLOBAL CACHE
// =====================================

let cached =
  global.mongoose;

if (!cached) {

  cached =
    global.mongoose = {

      conn: null,

      promise: null,

    };

}

// =====================================
// CONNECT DB
// =====================================

async function connectDB() {

  if (cached.conn) {

    return cached.conn;

  }

  if (!cached.promise) {

  

   const opts = {
  dbName: "mom-tracker",
  serverSelectionTimeoutMS: 30000,
  family: 4,
};
     
    cached.promise =
      mongoose
        .connect(
          MONGODB_URI,
          opts
        )
        .then(
          (mongoose) => {

            console.log(
              "MongoDB Connected"
            );

            return mongoose;

          }
        );

  }

  cached.conn =
    await cached.promise;

  return cached.conn;

}

export default connectDB;