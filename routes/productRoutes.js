import express from "express"
import {isAuth,isAdmin} from "../middlewares/auth.js"
import { createProduct, deleteProduct, deleteProductImage, getAllProducts, getSingleProduct, updateProduct, updateProductImage } from "../controllers/productController.js";
import { singleUpload } from "../middlewares/multer.js";
const router = express.Router();
// GET ALL PRODUCTS
router.get("/get-all", getAllProducts);
// GET SINGLE PRODUCTS
router.get("/:id", getSingleProduct);
// CREATE PRODUCT
router.post("/create", isAuth, isAdmin, singleUpload, createProduct);
// UPDATE PRODUCT
router.put("/:id", isAuth, isAdmin, updateProduct);
// UPDATE PRODUCT IMAGE
router.put("/image/:id",isAuth,isAdmin,singleUpload,updateProductImage);
// delete product image
router.delete(
    "/delete-image/:id",
    isAuth,
    isAdmin,
    deleteProductImage
  );
  // delete product
router.delete("/delete/:id", isAuth, isAdmin, deleteProduct);

export default router;