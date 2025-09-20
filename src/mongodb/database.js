import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.DATABASE_CONNECTION_URL_DEV}`);
    // console.log("🚀 ~ connectDB ~ connectionInstance:", connectionInstance)
    console.log(`👍🏼 Database Connected Successfully !! DB HOST: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log('👎🏻 Database Connection Failed');
    process.exit(1);
  }
};

export default connectDB;
