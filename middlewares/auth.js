import { errorHandler } from "./error.js";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

export const isAuth = async (req, res, next) => {
    const {token} = req.cookies;
    //Validation
   if(!token){
    return res.status(401).send({
        success: false,
        message: "UnAuthorized User",
      });
   }
   const decodedData = jwt.verify(token, process.env.JWT_SECRET);
   req.user = await userModel.findById(decodedData._id);
   next();
  };

// // Admin Authorization
export const isAdmin = async(req,res,next)=>{
    if(req.user.role !== "admin"){
        return next(errorHandler(403, "Only admins can access this resource"));
    }
    next();
}

