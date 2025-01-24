import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectToDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );

    console.log("Successfully Connected To MongoDB!!");
    console.log(`DB HOST: ${connectionInstance.connection.host}`);
  } catch (err) {
    console.error("Error Connecting To MongoDB!!");
    console.error("ERROR:", err);

    process.exit(1); // closing the application
  }
};

export default connectToDB;
