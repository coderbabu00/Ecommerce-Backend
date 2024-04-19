import express from "express";
import { isAuth } from "../middlewares/auth.js";
import { forgotPassword, loginUser, registerUser, resendActivation, resetPassword, updateProfilePicController, uploadPic, verifyEmail } from "../controllers/userController.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

router.post("/sign-up",registerUser)
router.post("/verify",verifyEmail)
router.post("/resendLink",resendActivation)
router.post("/forgot-password",forgotPassword)
router.post("/reset-password",resetPassword)
router.post("/login",loginUser)
router.put("/update-picture", isAuth, singleUpload, updateProfilePicController);

export default router