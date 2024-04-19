import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";
import { stripe } from "../server.js";

// CREATE ORDERS
export const createOrderController = async (req, res, next) => {
    try {
      const {
        shippingInfo,
        orderItems,
        paymentMethod,
        paymentInfo,
        itemPrice,
        tax,
        shippingCharges,
        totalAmount,
      } = req.body;
      await userModel.create({
        user: req.user._id,
        shippingInfo,
        orderItems,
        paymentMethod,
        paymentInfo,
        itemPrice,
        tax,
        shippingCharges,
        totalAmount,
      })
      // Stock update
      for(let i = 0 ; i < orderItems.length ; i++){
        // Find Product
        const product = await productModel.findById(orderItems[i].product);
        product.stock = product.stock - orderItems[i].quantity;
        await product.save();
        res.status(201).send({
            success: true,
            message: "Order Placed Successfully",
          });
      }
    }catch(error){
        console.log(error);
        next(error);
    }
    }

    // My Orders
    export const myOrdersController = async (req, res, next) => {
        try{
            const orders = await orderModel.find({ user: req.user._id });
            if(!orders){
                next(errorHandler("No Orders Found", 404));
            }
            res.status(200).send({
                success: true,
                message: "your orders data",
                totalOrder: orders.length,
                orders,
              });
        }catch(error){
            console.log(error);
            next(error);
        }
    }

    // GET SINGLE ORDER INFO
    export const singleOrderDetrailsController = async(req,res,next)=>{
        try{
             // find orders
    const order = await orderModel.findById(req.params.id);
    //valdiation
    if (!order) {
       next(errorHandler("Order Not Found", 404));
      }
      res.status(200).send({
        success: true,
        message: "your order fetched",
        order,
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
    // ACCEPT PAYMENTS
export const paymetsController = async (req, res) => {
    try {
      // get ampunt
      const { totalAmount } = req.body;
      // validation
      if (!totalAmount) {
        return res.status(404).send({
          success: false,
          message: "Total Amount is require",
        });
      }
      const { client_secret } = await stripe.paymentIntents.create({
        amount: Number(totalAmount * 100),
        currency: "usd",
      });
      res.status(200).send({
        success: true,
        client_secret,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error In Get UPDATE Products API",
        error,
      });
    }
  };