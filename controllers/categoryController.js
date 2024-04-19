import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";

// Create Category Controller
export const createCategory = async (req, res, next) => {
    try{
        const { category } = req.body;
         // validation
    if (!category) {
        next(errorHandler(400, "Category is required"));
      }
      await categoryModel.create({ category });
      res.status(201).send({
        success: true,
        message: `${category} category creted successfully`,
      });
    }catch(error){
    console.log(error);
    next(error);
    }
}

// Get all categories controller
export const getAllCategories = async (req, res, next) => {
    try{
        const categories = await categoryModel.find({});
        if (!categories) {
            return res.status(404).send({
                success: false,
                message: "No Categories Found",
            });
        }
        res.status(200).send({
            success: true,
            message: "Categories Fetch Successfully",
            totalCat: categories.length,
            categories,
        });
    }catch(err){
        console.log(err);
        next(err);
    }
}

// DELETE CATEGORY
export const deleteCategory = async (req, res, next) => {
    try{
        const category = await categoryModel.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).send({
                success: false,
                message: "Category Not Found",
            });
        }
        // Find product with this category
        const products = await productModel.find({ category: req.params.id });
        // Upadte Product Category
        for(let i = 0 ; i < products.length ; i++){
            const product = products[i];
            product.category = undefined;
            await product.save();
        }
        await category.deleteOne();
        res.status(200).send({
            success: true,
            message: "Category Deleted Successfully",
        });
    }catch(error){
        console.log(error);
        next(error);
    }
}

// UDPATE CATEGORY
export const updateCategory = async (req, res) => {
    try {
      // find category
      const category = await categoryModel.findById(req.params.id);
      //validation
      if (!category) {
        return res.status(404).send({
          success: false,
          message: "Category not found",
        });
      }
      // get new category
      const { updatedCategory } = req.body;
      // find product with this category id
      const products = await productModel.find({ category: req.params.id });
      // update product category
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        product.category = updatedCategory;
        await product.save();
      }
      if (updatedCategory) category.category = updatedCategory;
  
      // save
      await category.save();
      res.status(200).send({
        success: true,
        message: "Catgeory Updated Successfully",
      });
    } catch (error) {
      console.log(error);
      // cast error ||  OBJECT ID
      if (error.name === "CastError") {
        return res.status(500).send({
          success: false,
          message: "Invalid Id",
        });
      }
      res.status(500).send({
        success: false,
        message: "Error In UPDATE CATEGPORY API",
        error,
      });
    }
  };