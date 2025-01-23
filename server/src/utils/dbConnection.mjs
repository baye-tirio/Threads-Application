import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();
export const connectDB = async () => {
  try {
    mongoose
      .connect(process.env.DB_REMOTE)
      .then((conn) => {
        console.log({
          message: "Successfully connected to the database",
          host:conn.connection.host
        });
      })
      .catch((error) => {
        console.log({
          error: error.message,
          response: "Failed to connect to the database!",
        });
      });
  } catch (error) {
    console.log(error);
  }
};
