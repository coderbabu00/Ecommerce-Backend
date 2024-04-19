import express from "express";
import colors from "colors";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cloudinary from "cloudinary";
import Stripe from "stripe";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";

import connectDB from "./config/db.js";
dotenv.config();

connectDB();

// Stripe Configuration
export const stripe = new Stripe(process.env.STRIPE_API_SECRET);

// Cloudinary Configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
})

const app = express();

//middlewares
app.use(helmet());
app.use(mongoSanitize());
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.get("/", (req, res) => {
    return res.status(200).send("<h1>Welcome To Node server </h1>");
  });

const port = process.env.PORT || 5000;

import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js"
import categoryRoutes from "./routes/categoryRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"
app.use("/api/v2",userRoutes);
app.use("/api/v2/products",productRoutes);
app.use("/api/v2/categories",categoryRoutes);
app.use("/api/v2/orders",orderRoutes);

// Listen
app.listen(port, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`.yellow.bold);
})

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
    });
  });