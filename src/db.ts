import { MG_str } from "./config"
import mongoose from "mongoose"

const connectDB = async function() {
    try {
        await mongoose.connect(MG_str)
    } catch (error) {
        console.log(error)
        throw error
    }
}



export default connectDB