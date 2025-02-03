import express from "express";
const router = express.Router();

import {
  userRegistration,
  userLogin,
  changeUserPassword,
  loggedUser,
  sendUserPasswordRestEmail,
  userPasswordReset,
  userProfile,
  getAllProviders,
  getUserAddress,
  userOrders,
  providerDetails,
  placeOrder,
  addToCart,
  // getCartItems,
} from "../controllers/userController.js";

import checkUserAuth from "../middlewares/isUserMiddleware.js";

// route level middleware
router.use("/change-password", checkUserAuth);
router.use("/logged-user", checkUserAuth);

//Public Routes (can be accessed without login)
router.post("/register", userRegistration);
router.post("/login", userLogin);
//fetch all product from Database and show on homepage
router.get("/", getAllProviders);
router.get("/address/:latitude/:longitude", getUserAddress);

router.get("/profile/:id", userProfile);
router.get("/provider/:id", providerDetails);
router.get("/orders/user/:id", userOrders);
// Place an order
// router.post("/orders", placeOrder);
router.post("/cart", addToCart);
// router.get("/cart", getCartItems);

router.post("/send-user-password-reset-email", sendUserPasswordRestEmail);
router.post("/reset-password/:id/:token", userPasswordReset);

router.post("/change-password", changeUserPassword);
router.get("/logged-user", loggedUser);

export default router;
