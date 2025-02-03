import mongoose from "mongoose";
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
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: "",
    },
    scheduleTime: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);
const adminOrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Order",
    },
    user: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
      },
      name: String,
      phone: String,
      location: {
        // Add user location (latitude and longitude)
        lat: { type: Number, required: true },
        lon: { type: Number, required: true },
      },
    },
    provider: {
      providerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Provider",
      },
      name: String,
      phone: String,
      location: {
        // Add provider location (latitude and longitude)
        lat: { type: Number, required: true },
        lon: { type: Number, required: true },
      },
    },
    timeOrderPlaced: {
      type: Date,
      default: Date.now,
    },
    scheduleTime: {
      type: Date,
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
      type: Number,
      required: true,
    },
    providerEmail: {
      type: String,
      required: true,
    },
    reviews: [reviewSchema],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
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
    cartId: {
      type: mongoose.Schema.Types.ObjectId,
      // required: true,
      ref: "Cart",
    }, // Array of reviews associated with the order
  },
  { timestamps: true }
);
const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    password: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    tc: { type: Boolean, required: true },
    orders: { type: [adminOrderSchema], default: [] },
  },
  { timestamps: true }
);

const AdminModel = mongoose.model("Admin", adminSchema);
export default AdminModel;
