import express from "express";
const router = express.Router();

import {
  addOrder,
  getOrder,
  cancelOrder,
  feedbackForm,
} from "../controllers/orderController.js";

router.post("/addOrder", addOrder);
router.post("/getOrder", getOrder);
router.post("/cancelOrder", cancelOrder);
router.post("/feedbackForm", feedbackForm);

export default router;
