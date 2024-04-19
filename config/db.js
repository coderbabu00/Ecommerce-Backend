import mongoose from "mongoose";

const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.DB_URL, {
            useUnifiedTopology: true,
            useNewUrlParser: true
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
    }catch(error){
        console.log(error);
        process.exit(1);
    }
}
export default connectDB