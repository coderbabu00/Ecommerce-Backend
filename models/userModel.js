import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
export const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "name is required"],
      },
      email: {
        type: String,
        required: [true, "email is required"],
        unique: [true, "email already taken"],
      },
      password: {
        type: String,
        required: [true, "password is required"],
        minLength: [6, "password length should be greadter then 6 character"],
      },
      address: {
        type: String,
        required: [true, "address is required"],
      },
      city: {
        type: String,
        required: [true, "city name is required"],
      },
      country: {
        type: String,
        required: [true, "country name is required"],
      },
      phone: {
        type: String,
        required: [true, "phone no is required"],
      },
      profilePic: {
        public_id: {
          type: String,
        },
        url: {
          type: String,
        },
      },
      answer: {
        type: String,
        required: [true, "answer is required"],
      },
      role: {
        type: String,
        default: "user",
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
      resetPasswordToken: String, // Add resetPasswordToken field
      resetPasswordExpires: Date // Add resetPasswordExpires field
},{timestamps:true});

// Hash password
userSchema.pre("save", async function (next) {
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
})

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
}


// Generate JWT token
userSchema.methods.getJwtToken = function (){
  return jwt.sign({_id:this._id},process.env.JWT_SECRET,{
    expiresIn: "7d",
    })
}

// Reset Password Token
userSchema.methods.getResetPasswordToken = async function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString("hex");
    // Set resetPasswordToken to hashed token
    this.resetPasswordToken = resetToken;
    this.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour

    // Save the document
    await this.save();
    return resetToken;
}

export default mongoose.model("User", userSchema)