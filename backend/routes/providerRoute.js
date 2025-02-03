import express from "express";
const router = express.Router();

import {
  providerRegistration,
  providerLogin,
  changeProviderPassword,
  loggedProvider,
  sendProviderPasswordRestEmail,
  providerPasswordReset,
  getAllProviders,
  providerProfile,
  getProviderAddress,
} from "../controllers/providerController.js";

import checkProviderAuth from "../middlewares/isProviderMiddleware.js";

// route level middleware
router.use("/change-password", checkProviderAuth);
router.use("/logged-provider", checkProviderAuth);

//Public Routes (can be accessed without login)
router.post("/register", providerRegistration);
router.post("/login", providerLogin);
router.get("/address/:latitude/:longitude", getProviderAddress);
router.get("/profile/provider/:id", providerProfile);
router.post(
  "/send-provider-password-reset-email",
  sendProviderPasswordRestEmail
);
router.get("/", getAllProviders);
router.post("/reset-password/:id/:token", providerPasswordReset);
router.post("/change-password", changeProviderPassword);
router.get("/logged-provider", loggedProvider);

export default router;
