import mongoose from "mongoose";

// Defining Schema
const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    star: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      trim: true,
    },
    scheduleTime: {
      type: Date, // Time when the review is posted
      required: true,
    },
  },
  { timestamps: true }
);

// Defining Service Schema
const orderSchema = new mongoose.Schema(
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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    providerEmail: {
      type: String,
      required: true,
    },
    providerLocation: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
    scheduleTime: {
      type: Date, // Time when the service is scheduled
      required: true,
    },
    orderPlacedAt: {
      type: Date, // Time when the order is placed
      required: true,
      default: Date.now, // Automatically set to the current date/time when the order is created
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
    reviews: [reviewSchema], // Array of reviews for each order
    cartId: {
      type: mongoose.Schema.Types.ObjectId,
      // required: true,
      ref: "Cart",
    },
  },
  { timestamps: true }
);

// Main User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // ensures uniqueness
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
      address: {
        type: String,
        required: true,
        trim: true,
      },
    },
    orders: {
      type: [orderSchema], // This references each order placed by the user
      default: [],
    },
    tc: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

// Defining Model
const UserModel = mongoose.model("User", userSchema);

export default UserModel;
