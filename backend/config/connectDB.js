import mongoose from "mongoose";

// Connect to MongoDB
const connectDb = async (DATABASE_URL) => {
  try {
    const DB_OPTIONS = {
      dbName: "urbanClamp",
    };
    await mongoose.connect(DATABASE_URL, DB_OPTIONS);
    console.log("connected Successfully!!");
  } catch (error) {
    console.error(error);
  }
};
export default connectDb;
