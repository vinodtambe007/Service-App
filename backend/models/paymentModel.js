import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    providerName: {
      type: String,
      required: true,
      trim: true,
    },
    providerEmail: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "placed",
        "accepted",
        "onsite",
        "work-in-progress",
        "completed",
        "cancelled",
      ], // Restrict to specific statuses
      default: "Pending",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId, // Assuming users are stored in another collection
      ref: "User",
      required: true,
    },
    scheduleTime: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0, // Ensure price is not negative
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["Unpaid", "Paid", "Refunded"], // Payment status options
      default: "Unpaid",
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      // required: true,
      ref: "Cart",
    },
    transactionId: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Defining Cart Model
const PaymentModel = mongoose.model("Payment", paymentSchema);

export default PaymentModel;
