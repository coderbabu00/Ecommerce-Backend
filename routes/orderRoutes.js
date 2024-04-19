import express from "express";
import { isAdmin, isAuth } from "./../middlewares/auth.js";
import { createOrderController, myOrdersController, paymetsController, singleOrderDetrailsController } from "../controllers/orderController.js";

const router = express.Router();
// CREATE ORDERS
router.post("/create", isAuth, createOrderController);

//  My Orders (User)
router.get("/my-orders", isAuth, myOrdersController);

//  GET SINGLE ORDER DETAILS
router.get("/my-orders/:id", isAuth, singleOrderDetrailsController);

// acceipt payments
router.post("/payments", isAuth, paymetsController);

export default router