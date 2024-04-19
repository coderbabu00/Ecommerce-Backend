import productModel from "../models/productModel.js"
import cloudinary from "cloudinary";
import { getDataUri } from "./../utils/features.js";
import { errorHandler } from "../middlewares/error.js";
// Get all products controller
export const getAllProducts = async (req, res, next) => {
    try{
     const products = await productModel.find({});
     res.status(200).send({
      success: true,
      message: "All Products Fetched Successfully",
      products,
     })
    }catch(error){
    console.log(error);
    next(error);
    }
}

export const getSingleProduct = async(req,res,next)=>{
    try{
      const products = await productModel.findById(req.params.id);
    if(!products){
        return next(errorHandler("Product Not Found", 404));
    }
    res.status(200).send({
        success: true,
        message: "Single Product Fetched Successfully",
        products,
    })
    }catch(error){
        // cast error ||  OBJECT ID
    if (error.name === "CastError") {
        return res.status(500).send({
          success: false,
          message: "Invalid Id",
        });
      }
        console.log(error); 
        next(error);
    }
}

export const createProduct = async (req, res, next) => {
    try {
        const { name, description, price, category, stock } = req.body;

        // Check if file is provided
        if (!req.file) {
            return res.status(500).send({
                success: false,
                message: "Please provide product images",
            });
        }

        // Convert uploaded file to data URI format
        const file = getDataUri(req.file);
        const cdb = await cloudinary.v2.uploader.upload(file.content);

        // Create image object with public_id and URL
        const image = {
            public_id: cdb.public_id,
            url: cdb.secure_url,
        };

        // Create product in the database
        const product = await productModel.create({
            name,
            description,
            price,
            category,
            stock,
            images: [image],
        });

        res.status(201).send({
            success: true,
            message: "Product created successfully",
            product
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
};
// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
    try {
      // find product
      const product = await productModel.findById(req.params.id);
      //valdiatiuon
      if (!product) {
        return res.status(404).send({
          success: false,
          message: "Product not found",
        });
      }
      const { name, description, price, stock, category } = req.body;
      // validate and update
      if (name) product.name = name;
      if (description) product.description = description;
      if (price) product.price = price;
      if (stock) product.stock = stock;
      if (category) product.category = category;
  
      await product.save();
      res.status(200).send({
        success: true,
        message: "product details updated",
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
        message: "Error In Get UPDATE Products API",
        error,
      });
    }
  };

export const updateProductImage = async(req,res,next)=>{
    try{
      // find product
    const product = await productModel.findById(req.params.id);
    // valdiation
    if (!product) {
      return next(errorHandler("Product Not Found", 404));
    }
     // check file
     if (!req.file) {
        return next(errorHandler("Please provide an image", 400));
      }
      const file = getDataUri(req.file);
    const cdb = await cloudinary.v2.uploader.upload(file.content);
    const image = {
      public_id: cdb.public_id,
      url: cdb.secure_url,
    };
    // save
    product.images.push(image);
    await product.save();
    res.status(200).send({
      success: true,
      message: "product image updated",
    });
    }catch(error){
        console.log(error);
        // cast error ||  OBJECT ID
    if (error.name === "CastError") {
        return res.status(500).send({
          success: false,
          message: "Invalid Id",
        });
      }
        next(error);
    }
}

// DELETE PROEDUCT IMAGE
export const deleteProductImage = async(req,res,next)=>{
    try{
      // Find Product
      const product = await productModel.findById(req.params.id);
      // Validation
      if(!product){
        next(errorHandler("Product Not Found", 404));
      }
      // image id find
      const id = req.query.id;
      if(!id){
        next(errorHandler("Image Id Not Found", 404));
      }
       let isExist = -1;
       product.images.forEach((item,index)=>{
        if (item._id.toString() === id.toString()) isExist = index;
       })
       if(isExist<0){
        next(errorHandler("Image Id Not Found", 404));
       }
       // DELETE PRODUCT IMAGE
    await cloudinary.v2.uploader.destroy(product.images[isExist].public_id);
    product.images.splice(isExist, 1);
    await product.save();
    return res.status(200).send({
      success: true,
      message: "Product Image Dleteed Successfully",
    });
    }catch(error){
        console.log(error);
        // cast error ||  OBJECT ID
        if (error.name === "CastError") {
          return res.status(500).send({
            success: false,
            message: "Invalid Id",
          });
        }
        next(error);
    }
}

export const deleteProduct = async(req,res,next)=>{
    try{
     const product = await productModel.findById(req.params.id);
     if(!product){
        next(errorHandler("Product Not Found", 404));
     }
     // find and delete image cloudinary
     for(let index = 0 ; index < product.images.length ; index++){
        const image = await cloudinary.v2.uploader.destroy(product.images[index].public_id);
     }
     await product.deleteOne();
     res.status(200).send({
        success: true,
        message: "PRoduct Deleted Successfully",
      });
    }catch(error){
      console.log(error);
      next(error);
    }
}