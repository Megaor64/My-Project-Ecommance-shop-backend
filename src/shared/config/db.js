import mongoose from "mongoose";
import { env } from "./env.js";

const mongoConnect = async () => {
  try {
    await mongoose.connect(env.mongoUri);
    console.log("Mongodb is connected");
  } catch (error) {
    console.error("failed connecting to mongodb:", error);
    process.exit(1);
  }
};

export default mongoConnect;
