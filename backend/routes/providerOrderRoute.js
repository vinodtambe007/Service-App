import express from "express";
const router = express.Router();

import {
  cancelOrder,
  getOrder,
  updateStatus,
  // getPayment,
} from "../controllers/providerOrderController.js";

router.post("/getOrder", getOrder);
router.post("/updateStatus", updateStatus);
router.post("/cancelOrder", cancelOrder);
// router.post("/getPayment", getPayment);

export default router;
