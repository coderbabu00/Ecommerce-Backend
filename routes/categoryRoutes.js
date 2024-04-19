import express from "express";
import { isAdmin, isAuth } from "./../middlewares/auth.js";
import { createCategory, deleteCategory, getAllCategories, updateCategory } from "../controllers/categoryController.js";

const router = express.Router();
// CREATE CATEGORY
router.post("/create", isAuth, isAdmin, createCategory);
// GET ALL CATEGORY
router.get("/get-all", getAllCategories);

// DELETE  CATEGORY
router.delete("/delete/:id", isAuth, isAdmin, deleteCategory);
// UPDATE ALL CATEGORY
router.put("/update/:id", isAuth, isAdmin, updateCategory);

export default router;
