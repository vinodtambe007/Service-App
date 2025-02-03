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

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: { type: String, required: true },
    userPhone: { type: String, required: true },
    userEmail: { type: String, required: true },
    userLocation: {
      lat: { type: Number, required: true },
      lon: { type: Number, required: true },
    },
    scheduleTime: {
      type: Date,
      required: true,
    },
    orderPlacedAt: {
      type: Date,
      default: Date.now, // Automatically set to the current date/time when the order is created
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
      ],
      default: "placed",
    },
    price: {
      type: String,
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
    reviews: [reviewSchema],
    cartId: {
      type: mongoose.Schema.Types.ObjectId,
      // required: true,
      ref: "Cart",
    }, // Array of reviews associated with the order
  },
  { timestamps: true }
);

const providerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensures uniqueness
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
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    orders: {
      type: [orderSchema], // This references each order scheduled with the provider
      default: [],
    },
    totalRating: {
      average: { type: Number, default: 0 }, // Average rating
      count: { type: Number, default: 0 }, // Number of ratings
    },
    tc: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

// Defining Model
const ProviderModel = mongoose.model("Provider", providerSchema);
export default ProviderModel;
