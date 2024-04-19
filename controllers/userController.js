import userModel from "../models/userModel.js";
import { errorHandler } from "../middlewares/error.js";
import sendToken from "../utils/jwtToken.js";
import sendEmail from "../utils/sendMail.js";
import jwt from "jsonwebtoken"
import { getDataUri } from "../utils/features.js";
import cloudinary from "cloudinary"
export const registerUser = async (req, res, next) => {
    try{
        const { name, email, password, address, city, country, phone, answer } =
        req.body;
        // validation
        if (
            !name ||
            !email ||
            !password ||
            !city ||
            !address ||
            !country ||
            !phone ||
            !answer
          ){
            next(errorHandler(400, "Please fill all fields"));
          }
          // Check existing user
          const exisitingUSer = await userModel.findOne({ email });
           //validation
          if (exisitingUSer) {
            next(errorHandler(400, "User already exists"));
          }
          const userI ={
            name,
            email,
            password,
            address,
            city,
            country,
            phone,
            answer,
          }
          const activationToken = createActivationToken(userI);
          const activationUrl = `localhost:3000/api/v1/user/activate/${activationToken}`;
          try{
            sendEmail({
              email: userI.email,
              subject: "Activate your account",
              message: `Hello ${userI.name}, please click here to activate your account: ${activationUrl}`,
            });
            const user = await userModel.create({
              name,
              email,
              password,
              address,
              city,
              country,
              phone,
              answer,
            })
            res.status(201).json({
                success: true,
                message: `please check your email:- ${userI.email} to activate your account!`,
              });
          }catch(error){
            next(error);
          }

          res.status(201).send({
            success: true,
            message: "Registeration Success, please login",
          })
    }catch(error){
        console.log(error);
        next(error);
    }
}

// Verify User
export const verifyEmail = async(req, res, next) => {
  try{
   const {activationToken} = req.body;
   const user = jwt.verify(activationToken, process.env.ACTIVATION_SECRET);
   const {email} = user;
   const updatedUser = await userModel.findOneAndUpdate({email}, {isVerified: true});
   await sendEmail({
     email: updatedUser.email,
     subject: "Account verification",
     message: "Your account has been verified",
   })
   res.status(200).send({
    success: true,
    message: "Email verified, you can now login",
   })
  }catch(error){
    console.log(error);
    next(error);
  }
}

// Resend Activation Link
export const resendActivation = async(req, res, next) => {
  try{
    const {email} = req.body;
    const user = await userModel.findOne({email});
    if(!user){
      return next(errorHandler(404, "User not found"));
    }
    const activationToken = createActivationToken(user);
    const activationUrl = `localhost:3000/api/v1/user/activate/${activationToken}`;
    await sendEmail({
      email: user.email,
      subject: "Activate your account",
      message: `Hello ${user.name}, please click here to activate your account: ${activationUrl}`,
    })
  }catch(error){
    console.log(error);
    next(error);
  }
}

// createActivationToken
const createActivationToken = (user)=>{
    return jwt.sign(user, process.env.ACTIVATION_SECRET, {
        expiresIn: "5m"
    })
}

// Forgot Password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    const resetToken = createResetToken(user); // Call the createResetToken function
    const resetUrl = `localhost:3000/api/v1/user/reset?resetToken=${resetToken}&_id=${user._id}`; // Corrected URL format
    await sendEmail({
      email: user.email,
      subject: "Reset your password",
      message: `Hello ${user.name}, please click here to reset your password: ${resetUrl}&_id=${user._id}`,
    });
    res.status(200).send({
      success: true,
      message: "Password reset email sent",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Reset Password
export const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, _id } = req.query;
    if (!resetToken || !_id) { // Changed && to || for proper validation
      return next(errorHandler("Invalid reset token or user ID", 400)); // Return an error for missing resetToken or _id
    }
    const user = await userModel.findById(_id);
    if (!user) {
      return next(errorHandler("User Not Found", 404));
    }
    const verifyUser = jwt.verify(resetToken, process.env.JWT_SECRET); 
    if (!verifyUser || verifyUser.id !== user._id.toString()) { // Verify if the token matches the user
      return next(errorHandler("Invalid or expired reset token", 400)); // Return an error for invalid or expired token
    }
    // Implement the password update logic here
    user.password = req.body.newPassword;
    // Save the user object
    await user.save();
    
    res.status(200).send({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const createResetToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "5m",
  });
};



// Login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // validation
    if (!email || !password) {
      return next(errorHandler(400, "Please provide email and password")); // Added return statement
    }
    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return next(errorHandler(404, "Invalid email or password")); // Added return statement
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(errorHandler(400, "Invalid email or password")); // Added return statement
    }
    sendToken(user, 200, res);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Upload profile pic
export const uploadPic = async(req,res,next)=>{
  try{
    const user = await userModel.findById(req.user._id);
    // file get from client photo
    const file = getDataUri(req.file);
    // Upload
    const cdb = await cloudinary.v2.uploader.upload(file.content);
    user.profilePic = {
      public_id: cdb.public_id,
      url: cdb.secure_url,
    };
    // save func
    await user.save();
    
  }catch(error){
    console.log(error);
    next(error);
  }
}

/// Update user profile photo
export const updateProfilePicController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    // Check if the user has a profile picture
    if (user.profilePic && user.profilePic.public_id) {
      // Delete previous image
      await cloudinary.v2.uploader.destroy(user.profilePic.public_id);
    }

    // File received from the client (assuming getDataUri returns the correct data)
    const file = getDataUri(req.file);

    // Upload the new image to Cloudinary
    const cloudinaryResponse = await cloudinary.v2.uploader.upload(file.content);

    // Update user profile picture information
    user.profilePic = {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    };

    // Save the updated user
    await user.save();

    res.status(200).send({
      success: true,
      message: "Profile picture updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in update profile pic API",
      error: error.message,
    });
  }
};