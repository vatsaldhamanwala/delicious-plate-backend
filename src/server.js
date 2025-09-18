import dotenv from "dotenv"
import connectDB from "./mongodb/database.js";


dotenv.config({path: '/.env'})


connectDB()