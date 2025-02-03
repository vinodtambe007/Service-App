import mongoose from "mongoose";
const orderSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    userLocation: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
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
  },
  { timestamps: true }
);
// Define Cart Item Schema
const cartItemSchema = new mongoose.Schema(
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
      address: { type: String, required: true },
      image: { type: String, required: true },
      orders: {
        type: [orderSchema], // This references each order scheduled with the provider
        default: [],
      },
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt timestamps
);

// Define Cart Schema
const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, // Reference to User Model
      required: true,
      ref: "User",
    },
    items: [cartItemSchema], // List of cart items storing complete provider info
  },
  { timestamps: true } // Automatically add createdAt and updatedAt timestamps
);

// Defining Cart Model
const CartModel = mongoose.model("Cart", cartSchema);

export default CartModel;
