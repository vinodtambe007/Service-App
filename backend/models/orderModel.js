import mongoose from "mongoose";

// Define the Rating Schema
const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    star: {
      type: Number,
      required: true,
      default: 0,
      min: 1, // Minimum rating is 1 star
      max: 5, // Maximum rating is 5 stars
    },
    comment: {
      type: String,
      required: false, // Comments can be optional
      default: "",
    },
    scheduleTime: {
      type: Date, // Time when the review is posted
      required: true,
    },
  },
  { timestamps: true }
);
// Define the Provider and Timeslot Schema (sub-schema within the order)
const providerOrderSchema = new mongoose.Schema(
  {
    provider: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Provider",
      },
      name: { type: String, required: true },
      description: { type: String, required: true },
      price: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      image: { type: String, required: true },
    },
    orderPlacedAt: {
      type: Date,
      default: Date.now,
    },
    scheduleTime: {
      type: Date, // Time when the service is scheduled
      required: true,
    },
    status: {
      type: String,
      enum: [
        "placed",
        "accepted",
        "onsite",
        "work-in-progress",
        "completed",
        "cancelled",
      ], // Order statuses
      default: "placed", // Default to 'placed'
      required: true,
    },
    providerEmail: {
      type: String, // Changed to String from ObjectId
      required: true,
    },
    cartId: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the cart
      ref: "Cart",
      // required: true, // Make this required if every order must have an associated cart
    },

    reviews: [reviewSchema], // Nested rating schema for reviews
  },
  { timestamps: true }
);
// Define the Order Schema
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the User placing the order
      ref: "User",
      required: true,
    },
    orders: [providerOrderSchema], // Array of services, each with its provider, timeslot, and status
    totalPrice: {
      type: Number,
      required: true, // Total price of the order
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["Unpaid", "Paid", "Refunded"], // Payment status options
      default: "Unpaid",
    },

    transactionId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);
// Order Model
const OrderModel = mongoose.model("Order", orderSchema);

export default OrderModel;
