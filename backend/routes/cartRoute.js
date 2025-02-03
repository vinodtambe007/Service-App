import express from "express";
const router = express.Router();

import {
  addToCart,
  getCartItems,
  removeItemFromCart,
  clearCart,
} from "../controllers/cartController.js";

router.post("/addToCart", addToCart);
router.post("/getCartItems", getCartItems);
router.post("/removeFromCart", removeItemFromCart);
router.post("/clearCart", clearCart);

export default router;
