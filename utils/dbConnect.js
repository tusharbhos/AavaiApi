import { configDotenv } from "dotenv";
import mongoose from "mongoose";
configDotenv()

const DB_URI = process.env.MONGO_DB_URI
export const dbConnect = mongoose.connect(DB_URI).then((data) => {
    if (data) {
        console.log(`Database is connected to ${data.connection.host}`)
    } else {
        console.log(`Database failed to connect.`)
        setTimeout(dbConnect, 5000)
    }
})