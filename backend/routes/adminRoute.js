import express from "express";
const router = express.Router();

import {
  adminRegistration,
  adminLogin,
  changeAdminPassword,
  loggedAdmin,
  sendAdminPasswordRestEmail,
  adminPasswordReset,
  adminProfile,
} from "../controllers/adminController.js";
import { getAllProviders } from "../controllers/providerController.js";

import checkAdminAuth from "../middlewares/isAdminMiddleware.js";

// route level middleware
router.use("/change-password", checkAdminAuth);
router.use("/logged-admin", checkAdminAuth);

//Public Routes (can be accessed without login)
router.post("/register", adminRegistration);
router.post("/login", adminLogin);
router.get("/", getAllProviders);
router.get("/profile/admin/:id", adminProfile);
router.post("/send-admin-password-reset-email", sendAdminPasswordRestEmail);
router.post("/reset-password/:id/:token", adminPasswordReset);

router.post("/change-password", changeAdminPassword);
router.get("/logged-admin", loggedAdmin);

export default router;
